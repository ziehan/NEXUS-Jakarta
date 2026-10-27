class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.get = this.get.bind(this);
    this.approve = this.approve.bind(this);
    this.verify = this.verify.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteDuplicate = this.deleteDuplicate.bind(this);
  }

  async create(req, res, next) {
    try {
      res
        .status(201)
        .json({ data: await this.reportService.createReport(req.body ?? {}) });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      res.json({ data: await this.reportService.listReports(req.query) });
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      res.json({ data: await this.reportService.getReport(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const approvedBy = req.body?.approvedBy || "Petugas CRM Jakarta";

      const updatedReport = await this.reportService.approveReport(
        id,
        approvedBy,
      );
      return res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      res.json({
        data: await this.reportService.verifyReport(
          req.params.id,
          req.body ?? {},
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      res.json(await this.reportService.deleteReport(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async deleteDuplicate(req, res, next) {
    try {
      res.json(
        await this.reportService.deleteDuplicate(req.params.duplicateId),
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
