require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { port } = require('./src/config/llm.config');
const aiRoutes = require('./src/routes/ai.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/ai', aiRoutes);
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(port, () => console.log(`AI service listening on port ${port}`));
}

module.exports = app;
