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
      },
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
}

module.exports = ReportRepository;
