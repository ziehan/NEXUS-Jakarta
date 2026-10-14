class ReportService {
  constructor(repository, mapsService, aiService) {
    this.repository = repository;
    this.mapsService = mapsService;
    this.aiService = aiService;
  }

  async createReport(input = {}) {
    const locationAddress =
      input.locationAddress ||
      (await this.mapsService.reverseGeocode(input.latitude, input.longitude));
    const report = await this.repository.create({
      ...input,
      locationAddress,
      status: "Pending",
    });

    try {
      const validation = await this.aiService.validate(report);
      const isValid =
        validation?.valid !== false && validation?.isValid !== false;
      await this.repository.addAuditLog(report.id, "AI_VALIDATED", validation);
      if (!isValid) {
        return this.repository.update(report.id, { status: "Rejected" });
      }

      const aiPlanResponse = await this.aiService.plan(report);
      const actionPlan = this.normalizePlan(aiPlanResponse);
      await this.repository.upsertActionPlan(report.id, actionPlan);
      await this.repository.addAuditLog(
        report.id,
        "AI_PLANNED",
        aiPlanResponse,
      );
      return this.repository.findById(report.id);
    } catch (error) {
      await this.repository.addAuditLog(report.id, "AI_PIPELINE_FAILED", {
        message: error.message,
      });
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
    const planData = aiPlanResponse?.data ?? {};
    const estimatedDays = parseInt(
      String(planData.estimatedDays).replace(/\D/g, ""),
      10,
    );
    const confidenceScore = parseFloat(planData.confidenceScore);

    return {
      targetAgency: String(planData.targetAgency || "Dinas Terkait"),
      estimatedDays: Number.isFinite(estimatedDays) ? estimatedDays : 3,
      actionSteps: Array.isArray(planData.actionSteps)
        ? planData.actionSteps
        : [],
      confidenceScore: Number.isFinite(confidenceScore)
        ? confidenceScore
        : 0.85,
    };
  }
}

module.exports = ReportService;
