import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/error';
import authRoutes from './routes/auth.routes';
import scenesRoutes from './routes/scenes.routes';
import analysesRoutes from './routes/analyses.routes';
import analyzeRoutes from './routes/analyze.routes';
import presetsRoutes from './routes/presets.routes';
import shareRoutes from './routes/share.routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/presets', presetsRoutes);
  app.use('/api/analyze', analyzeRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/scenes', scenesRoutes);
  app.use('/api/scenes', analysesRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
