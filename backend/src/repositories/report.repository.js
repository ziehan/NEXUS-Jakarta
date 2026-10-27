const prisma = require("../config/prisma.config");

/**
 * Repository pattern: all persistence concerns are isolated from services.
 */
class ReportRepository {
  async create(data) {
    return prisma.report.create({ data });
  }

  async findMany(filters = {}) {
    return prisma.report.findMany({
      where: filters,
      include: { actionPlan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        actionPlan: true,
        auditLogs: { orderBy: { timestamp: "desc" } },
        duplicates: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async findDeduplicationCandidates(report) {
    const latitudeDelta = 0.01;
    const longitudeDelta = 0.01;
    return prisma.report.findMany({
      where: {
        isDuplicate: false,
        status: { in: ["Pending", "Approved"] },
        OR: [
          { category: report.category },
          {
            latitude: {
              gte: report.latitude - latitudeDelta,
              lte: report.latitude + latitudeDelta,
            },
            longitude: {
              gte: report.longitude - longitudeDelta,
              lte: report.longitude + longitudeDelta,
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  async update(id, data) {
    return prisma.report.update({ where: { id }, data });
  }

  async upsertActionPlan(reportId, data) {
    return prisma.actionPlan.upsert({
      where: { reportId },
      create: { reportId, ...data },
      update: data,
    });
  }

  async updateActionPlan(reportId, data) {
    return prisma.actionPlan.update({ where: { reportId }, data });
  }

  async addAuditLog(reportId, action, details) {
    return prisma.auditLog.create({
      data: {
        reportId,
        action,
        details:
          typeof details === "string" ? details : JSON.stringify(details),
      },
    });
  }

  async markAsDuplicate(reportId, parentReportId) {
    return prisma.$transaction(async (transaction) => {
      const duplicate = await transaction.report.update({
        where: { id: reportId },
        data: {
          isDuplicate: true,
          parentReportId,
          aiProcessed: true,
        },
      });
      await transaction.report.update({
        where: { id: parentReportId },
        data: {
          duplicateCount: { increment: 1 },
          priority: "High",
        },
      });
      return duplicate;
    });
  }

  async deleteById(id) {
    return prisma.report.delete({ where: { id } });
  }

  async deleteDuplicateById(id) {
    return prisma.$transaction(async (transaction) => {
      const duplicate = await transaction.report.findUnique({
        where: { id },
        select: { id: true, isDuplicate: true, parentReportId: true },
      });
      if (!duplicate) return null;
      if (!duplicate.isDuplicate || !duplicate.parentReportId) {
        const error = new Error("Report is not a duplicate");
        error.statusCode = 400;
        throw error;
      }

      await transaction.report.delete({ where: { id } });
      await transaction.report.updateMany({
        where: { id: duplicate.parentReportId, duplicateCount: { gt: 0 } },
        data: { duplicateCount: { decrement: 1 } },
      });
      return duplicate;
    });
  }
}

module.exports = ReportRepository;
