import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import crypto from 'crypto';
import webhookRoutes from './routes/webhook';
import kycRoutes from './routes/kyc';
import { register } from './utils/metrics';
import './workers/kafkaProducer'; // Initialize the BullMQ background worker

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Metrics Endpoint
app.get('/metrics', async (req: Request, res: Response) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

// Correlation ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
    (req as any).correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
});

const redisHealthClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
    lazyConnect: true,
});

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Basic rate limiting to protect webhook ingress
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || '600'), // defaults: 600 req/min
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests' },
});
app.use(limiter);

// Raw body parser needed for HMAC verification of webhooks
app.use(express.json({
    limit: process.env.BODY_LIMIT || '1mb',
    verify: (req, res, buf) => {
        (req as any).rawBody = buf;
    }
}));

app.use('/webhooks', webhookRoutes);
app.use('/api/v1/kyc', kycRoutes);

app.get('/health', async (req, res) => {
    let redisStatus = 'disabled';
    try {
        await redisHealthClient.connect();
        await redisHealthClient.ping();
        redisStatus = 'ok';
    } catch (err) {
        redisStatus = 'error';
    }
    res.status(200).json({ status: 'ok', redis: redisStatus });
});

app.listen(port, () => {
    console.log(`[edge-node] Webhook receiver listening on port ${port}`);
});
