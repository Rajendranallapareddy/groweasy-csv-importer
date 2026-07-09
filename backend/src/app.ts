import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimiter } from './middlewares/rate-limit';
import { errorHandler } from './middlewares/error.middleware';
import uploadRoutes from './routes/upload.routes';
import { env } from './config/env';

const app = express();

// Enable trust proxy for correct IP detection behind Render's proxy
app.set('trust proxy', 1);

// Security & performance
app.use(helmet());
app.use(compression());

// ============================================================
// CORS Configuration (with debugging)
// ============================================================
const allowedOrigins = [
  'http://localhost:3000',
  'https://groweasy-csv-importer-topaz.vercel.app',
  env.CORS_ORIGIN, // Add env var to array
].filter(Boolean); // Remove undefined/null values

console.log('✅ CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Origin: none (allowed)');
      return callback(null, true);
    }

    console.log('🔍 Origin received:', origin);
    console.log('🔍 CORS_ORIGIN env:', env.CORS_ORIGIN);

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================
// Body parsers
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// Rate limiting
// ============================================================
app.use(rateLimiter);

// ============================================================
// Routes
// ============================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to verify CORS is working
app.get('/test', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    allowedOrigins: allowedOrigins,
    receivedOrigin: req.headers.origin || 'none'
  });
});

// Upload routes
app.use('/api/upload', uploadRoutes);

// ============================================================
// Global error handler (must be last)
// ============================================================
app.use(errorHandler);

export default app;