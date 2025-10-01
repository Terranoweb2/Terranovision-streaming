import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { pinoHttp } from 'pino-http';
import pino, { Logger } from 'pino';
import dotenv from 'dotenv';
import { transcodeRouter } from './routes/transcode';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || process.env.PORT_GATEWAY || 4001;

// Logger
const logger: Logger = pino({
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  level: process.env.LOG_LEVEL || 'info',
});

app.use(pinoHttp({ logger }));

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HLS files
const hlsDir = path.join(__dirname, '../hls');
app.use('/hls', express.static(hlsDir, {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=2');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
  },
}));

// Routes
app.use('/health', healthRouter);
app.use('/transcode', rateLimiter, transcodeRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`🎬 Stream Gateway running on http://localhost:${port}`);
  logger.info(`📺 HLS output directory: ${hlsDir}`);
});

export { app, logger };
