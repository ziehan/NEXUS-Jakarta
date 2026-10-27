const { AiServiceUnavailableError } = require("./aiIntegration.service");

class ReportService {
  constructor(repository, mapsService, aiService) {
    this.repository = repository;
    this.mapsService = mapsService;
    this.aiService = aiService;
  }

  async createReport(input = {}) {
    const candidateReports =
      await this.repository.findDeduplicationCandidates(input);
    const locationAddress =
      input.locationAddress ||
      (await this.mapsService.reverseGeocode(input.latitude, input.longitude));
    const report = await this.repository.create({
      ...input,
      locationAddress,
      status: "Pending",
      isDuplicate: false,
      aiProcessed: false,
    });

    try {
      const reportData = report;
      const validation = await this.aiService.validate(
        reportData,
        candidateReports,
      );
      const validationData = validation?.data?.data ?? validation?.data ?? {};
      const isValid =
        validationData.valid !== false && validationData.isValid !== false;
      const validationConfidence = this.extractValidationConfidence(
        validationData,
      );
      await this.repository.addAuditLog(
        report.id,
        "AI_VALIDATED",
        this.buildAiAuditDetails(validation, {
          validityConfidence: validationConfidence.validityConfidence,
          deduplicationConfidence:
            validationConfidence.deduplicationConfidence,
        }),
      );
      const validationReview = this.getHumanReviewReasons({
        validityConfidence: validationConfidence.validityConfidence,
        deduplicationConfidence:
          validationConfidence.deduplicationConfidence,
      });
      if (!isValid) {
        return this.repository.update(report.id, { status: "Rejected" });
      }

      const parentReportId =
        validationData.primaryReportId ||
        validationData.parentReportId ||
        validationData.duplicateOfReportId ||
        candidateReports[0]?.id;
      const isKnownPrimary = candidateReports.some(
        (candidate) => candidate.id === parentReportId,
      );
      if (validationData.isDuplicate === true && isKnownPrimary) {
        const duplicate = await this.repository.markAsDuplicate(
          report.id,
          parentReportId,
        );
        if (validationReview.requiresHumanReview) {
          await this.markForHumanReview(report.id, validationReview.reasons);
        }
        await this.repository.addAuditLog(report.id, "REPORT_DUPLICATE", {
          parentReportId,
        });
        return {
          report: {
            ...duplicate,
            requiresHumanReview: validationReview.requiresHumanReview,
          },
          notice:
            "Laporan Anda dicatat sebagai duplikat dan memperkuat urgensi penanganan masalah ini.",
        };
      }

      const aiPlanResponse = await this.aiService.plan(reportData);
      const actionPlan = this.normalizePlan(aiPlanResponse);
      await this.repository.upsertActionPlan(report.id, actionPlan);
      await this.repository.addAuditLog(
        report.id,
        "AI_PLANNED",
        this.buildAiAuditDetails(aiPlanResponse, {
          validityConfidence: validationConfidence.validityConfidence,
          deduplicationConfidence:
            validationConfidence.deduplicationConfidence,
          agencyConfidence: actionPlan.confidenceMetadata.agencyConfidence,
          planConfidence: actionPlan.confidenceMetadata.planConfidence,
        }),
      );
      const planReview = this.getHumanReviewReasons({
        validityConfidence: validationConfidence.validityConfidence,
        deduplicationConfidence:
          validationConfidence.deduplicationConfidence,
        confidenceScore: actionPlan.confidenceScore,
      });
      await this.repository.update(report.id, { aiProcessed: true });
      if (planReview.requiresHumanReview) {
        await this.markForHumanReview(report.id, planReview.reasons);
      }
      return {
        report: {
          ...(await this.repository.findById(report.id)),
          requiresHumanReview: planReview.requiresHumanReview,
        },
      };
    } catch (error) {
      await this.repository.addAuditLog(report.id, "AI_PIPELINE_FAILED", {
        message: error.message,
      });
      if (error instanceof AiServiceUnavailableError) {
        console.warn(
          "[Backend Warning] AI Service Offline/Failed. Report saved for manual/batch processing.",
        );
        return {
          report: await this.repository.findById(report.id),
          notice: "Report saved, AI processing queued",
        };
      }
      throw error;
    }
  }

  async listReports(query) {
    const filters = {};
    if (query.status) filters.status = query.status;
    if (query.category) filters.category = query.category;
    if (query.priority) filters.priority = query.priority;
    return this.repository.findMany(filters);
  }

  async getReport(id) {
    const report = await this.repository.findById(id);
    if (!report) {
      const error = new Error("Report not found");
      error.statusCode = 404;
      throw error;
    }
    return report;
  }

  async deleteReport(id) {
    const report = await this.repository.findById(id);
    if (!report) {
      const error = new Error("Report not found");
      error.statusCode = 404;
      throw error;
    }
    await this.repository.deleteById(id);
    return { success: true, message: "Report deleted" };
  }

  async deleteDuplicate(duplicateId) {
    const deleted = await this.repository.deleteDuplicateById(duplicateId);
    if (!deleted) {
      const error = new Error("Report not found");
      error.statusCode = 404;
      throw error;
    }
    return { success: true, message: "Duplicate report deleted" };
  }

  async approveReport(id, approvedBy) {
    await this.getReport(id);
    const updated = await this.repository.update(id, { status: "Approved" });
    if (approvedBy) {
      await this.repository.updateActionPlan(id, {
        approvedBy,
        approvedAt: new Date(),
      });
    }
    await this.repository.addAuditLog(id, "CRM_APPROVED", {
      approvedBy: approvedBy || "system",
    });
    return this.getReport(updated.id);
  }

  async verifyReport(id, proof) {
    const report = await this.getReport(id);
    const verification = await this.aiService.verify(report, proof);
    await this.repository.addAuditLog(id, "AI_FIELD_VERIFIED", verification);
    if (verification.verified === false || verification.valid === false) {
      const error = new Error("Field verification was not accepted");
      error.statusCode = 422;
      throw error;
    }
    await this.repository.update(id, { status: "Resolved" });
    await this.repository.addAuditLog(id, "FIELD_VERIFIED", proof);
    return this.getReport(id);
  }

  normalizePlan(aiPlanResponse = {}) {
    const planData = aiPlanResponse?.data?.data ?? aiPlanResponse?.data ?? {};
    const estimatedDays = parseInt(
      String(planData.estimatedDays).replace(/\D/g, ""),
      10,
    );
    const confidenceScore = parseFloat(planData.confidenceScore) || 0.85;
    const agencyConfidence = this.toConfidence(
      planData.agencyConfidence,
      confidenceScore,
    );
    const planConfidence = this.toConfidence(
      planData.planConfidence,
      confidenceScore,
    );

    return {
      targetAgency: String(planData.targetAgency || "Dinas Terkait"),
      estimatedDays: Number.isFinite(estimatedDays) ? estimatedDays : 3,
      actionSteps: Array.isArray(planData.actionSteps)
        ? planData.actionSteps
        : [],
      confidenceScore,
      confidenceMetadata: {
        agencyConfidence,
        planConfidence,
        reasoning: planData.reasoning || null,
        usedProvider: aiPlanResponse?.usedProvider || null,
        executionTimeMs: aiPlanResponse?.executionTimeMs || null,
      },
    };
  }

  extractValidationConfidence(validationData = {}) {
    const confidence = validationData.confidence || {};
    return {
      validityConfidence: this.toConfidence(
        validationData.validityConfidence ?? confidence.validityConfidence,
        0,
      ),
      deduplicationConfidence: this.toConfidence(
        validationData.deduplicationConfidence ??
          confidence.deduplicationConfidence,
        0,
      ),
    };
  }

  toConfidence(value, fallback) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  getHumanReviewReasons(scores) {
    const reasons = [];
    if (scores.validityConfidence < 0.7) {
      reasons.push("validityConfidence is below 0.70");
    }
    if (scores.deduplicationConfidence < 0.7) {
      reasons.push("deduplicationConfidence is below 0.70");
    }
    if (
      scores.confidenceScore !== undefined &&
      scores.confidenceScore < 0.7
    ) {
      reasons.push("confidenceScore is below 0.70");
    }
    return { requiresHumanReview: reasons.length > 0, reasons };
  }

  buildAiAuditDetails(response, scores) {
    const data = response?.data?.data ?? response?.data ?? {};
    return {
      usedProvider: response?.usedProvider || null,
      executionTimeMs: response?.executionTimeMs || null,
      reasoning: data.reasoning || null,
      ...scores,
    };
  }

  async markForHumanReview(reportId, reasons) {
    await this.repository.update(reportId, { requiresHumanReview: true });
    await this.repository.addAuditLog(reportId, "NEEDS_HUMAN_REVIEW", {
      reasons,
    });
  }
}

module.exports = ReportService;
