const axios = require("axios");
const env = require("../config/env.config");

class AiServiceUnavailableError extends Error {
  constructor(message = "AI Service Timeout or Unavailable") {
    super(message);
    this.name = "AiServiceUnavailableError";
    this.statusCode = 503;
    this.code = "AI_SERVICE_DOWN";
    this.isAiServiceUnavailable = true;
  }
}

class AiIntegrationService {
  constructor(httpClient = axios, options = {}) {
    this.httpClient = httpClient;
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownMs = options.cooldownMs || 30000;
    this.failureCount = 0;
    this.circuitOpenedAt = null;
  }

  async request(endpoint, payload) {
    if (this.isCircuitOpen()) {
      const error = new AiServiceUnavailableError();
      console.error("[Backend] AI Service Error:", error.message);
      throw error;
    }

    try {
      const startedAt = Date.now();
      const response = await this.httpClient.post(
        `${env.aiServiceUrl}/api/v1/ai/${endpoint}`,
        payload,
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        },
      );
      this.resetCircuit();
      return {
        data: response.data,
        executionTimeMs: Date.now() - startedAt,
        usedProvider: env.aiServiceUrl,
      };
    } catch (error) {
      console.error(
        "[Backend] AI Service Error:",
        error.response?.data || error.message,
      );

      if (this.isUnavailableError(error)) {
        this.recordFailure();
        throw new AiServiceUnavailableError();
      }

      throw error;
    }
  }

  isUnavailableError(error) {
    const status = error.response?.status;
    return (
      status === 500 ||
      status === 503 ||
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    );
  }

  isCircuitOpen() {
    if (!this.circuitOpenedAt) return false;
    if (Date.now() - this.circuitOpenedAt >= this.cooldownMs) {
      this.circuitOpenedAt = null;
      this.failureCount = 0;
      return false;
    }
    return true;
  }

  recordFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.circuitOpenedAt = Date.now();
    }
  }

  resetCircuit() {
    this.failureCount = 0;
    this.circuitOpenedAt = null;
  }

  validate(reportData, candidateReports = []) {
    const payload = {
      title: String(reportData?.title || ""),
      description: String(reportData?.description || ""),
      category: String(reportData?.category || ""),
      locationAddress: String(
        reportData?.locationAddress || reportData?.location || "",
      ),
      latitude: Number(reportData?.latitude),
      longitude: Number(reportData?.longitude),
      photoUrl: reportData?.photoUrl || null,
      existingReports: Array.isArray(candidateReports) ? candidateReports : [],
    };
    return this.request("validate", payload);
  }

  plan(reportData) {
    const payload = {
      reportId: reportData?.id,
      title: reportData?.title,
      description: reportData?.description,
      category: reportData?.category,
      locationAddress: reportData?.locationAddress,
      duplicateCount: reportData?.duplicateCount || 0,
    };
    return this.request("plan", payload);
  }

  verify(report, proof) {
    return this.request("verify", { report, proof });
  }
}

module.exports = AiIntegrationService;
module.exports.AiServiceUnavailableError = AiServiceUnavailableError;
