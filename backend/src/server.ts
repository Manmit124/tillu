import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config';
import { testConnection, generateResponse } from './services/ollama';
import dataRoutes from './routes/data';
import searchRoutes from './routes/search';
import smartRagRoutes from './routes/smartRag';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow Chrome extension origins and localhost
    if (!origin || origin.startsWith('chrome-extension://') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Buddy Backend',
    version: '1.0.0',
  });
});

// Test Ollama connection endpoint
app.get('/api/test', async (_req: Request, res: Response) => {
  try {
    const result = await testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Ollama connection successful',
        response: result.message,
        model: result.model,
      });
    } else {
      res.status(503).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error('Error testing Ollama connection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Ollama connection',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Simple chat endpoint for testing
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, systemPrompt } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message is required',
      });
      return;
    }

    const response = await generateResponse(message, systemPrompt);

    res.json({
      success: true,
      response,
      model: config.ollama.model,
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mount route handlers
app.use('/api/data', dataRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/rag', smartRagRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log('');
  console.log('🚀 Buddy Backend Server Started!');
  console.log('================================');
  console.log(`📍 Server: http://localhost:${config.port}`);
  console.log(`🤖 Ollama: ${config.ollama.host}`);
  console.log(`🧠 Model: ${config.ollama.model}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log('================================');
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /health               - Health check`);
  console.log(`  GET  /api/test             - Test Ollama connection`);
  console.log(`  POST /api/chat             - Simple chat`);
  console.log(``);
  console.log(`  POST /api/data/ingest      - Ingest personal data`);
  console.log(`  GET  /api/data/stats       - Get database stats`);
  console.log(``);
  console.log(`  POST /api/search           - Semantic search`);
  console.log(``);
  console.log(`  🧠 SMART RAG ENDPOINTS (NEW!):`);
  console.log(`  POST /api/rag              - Smart RAG (handles everything!)`);
  console.log(`  POST /api/rag/extract      - Extract field value`);
  console.log(`  POST /api/rag/ask          - Ask a question`);
  console.log(`  POST /api/rag/generate     - Generate content`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;

