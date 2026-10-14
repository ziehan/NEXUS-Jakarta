const axios = require("axios");
const env = require("../config/env.config");

class AiIntegrationService {
  constructor(httpClient = axios) {
    this.httpClient = httpClient;
  }

  async request(endpoint, payload) {
    try {
      const response = await this.httpClient.post(
        `${env.aiServiceUrl}/api/v1/ai/${endpoint}`,
        payload,
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    } catch (error) {
      const detail =
        error.response && error.response.data
          ? JSON.stringify(error.response.data)
          : error.message;
      throw new Error(`AI service ${endpoint} request failed: ${detail}`);
    }
  }

  validate(report) {
    const payload = {
      title: report.title,
      description: report.description,
      location: report.locationAddress || report.location,
      category: report.category,
    };
    return this.request("validate", payload);
  }

  plan(report) {
    const payload = {
      reportId: report.id || report.reportId || `REP-${Date.now()}`,
      title: report.title,
      description: report.description,
      location: report.locationAddress || report.location,
      category: report.category,
    };
    return this.request("plan", payload);
  }

  verify(report, proof) {
    return this.request("verify", { report, proof });
  }
}

module.exports = AiIntegrationService;
