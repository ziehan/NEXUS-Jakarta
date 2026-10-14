const express = require('express');
const cors = require('cors');
const ReportRepository = require('./repositories/report.repository');
const MapsService = require('./services/maps.service');
const AiIntegrationService = require('./services/aiIntegration.service');
const ReportService = require('./services/report.service');
const ReportController = require('./controllers/report.controller');
const MapsController = require('./controllers/maps.controller');
const reportRoutes = require('./routes/report.routes');
const mapsRoutes = require('./routes/maps.routes');
const { validateReportPayload } = require('./middlewares/validate.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const mapsService = new MapsService();
const reportService = new ReportService(new ReportRepository(), mapsService, new AiIntegrationService());

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'nexus-jakarta-backend' }));
app.use('/api/v1/reports', reportRoutes(new ReportController(reportService), validateReportPayload));
app.use('/api/v1/maps', mapsRoutes(new MapsController(mapsService)));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorMiddleware);

module.exports = app;
