import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

/**
 * Redis-backed sliding window rate limiter.
 * Uses Lua script for atomic increment + TTL to ensure
 * rate limits persist across process restarts (multi-instance safe).
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis;

try {
    redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
} catch (err) {
    console.error('[WAF] Failed to connect to Redis for rate limiting:', err);
}

// Lua script for atomic sliding window rate limiting
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local window_ms = tonumber(ARGV[1])
local max_requests = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local window_start = now - window_ms

redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)
local count = redis.call('ZCARD', key)

if count >= max_requests then
    return -1
end

redis.call('ZADD', key, now, now .. ':' .. math.random(1000000))
redis.call('PEXPIRE', key, window_ms)
return max_requests - count - 1
`;

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyPrefix: string;
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
    webhook: { windowMs: 60_000, maxRequests: 100, keyPrefix: 'rl:webhook:' },
    auth: { windowMs: 60_000, maxRequests: 10, keyPrefix: 'rl:auth:' },
    default: { windowMs: 60_000, maxRequests: 60, keyPrefix: 'rl:default:' },
};

function getEndpointCategory(path: string): string {
    if (path.includes('/webhooks/') || path.includes('/webhook')) return 'webhook';
    if (path.includes('/auth/')) return 'auth';
    return 'default';
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const category = getEndpointCategory(req.path);
    const config = ENDPOINT_LIMITS[category];

    if (!redis) {
        console.warn('[WAF] Redis not available — rate limiting disabled');
        next();
        return;
    }

    const key = config.keyPrefix + ip;
    const now = Date.now();

    redis.eval(SLIDING_WINDOW_LUA, 1, key, config.windowMs, config.maxRequests, now)
        .then((remaining) => {
            const rem = remaining as number;
            if (rem < 0) {
                console.warn(`[WAF] Rate limit exceeded for ${ip} on ${category}: ${config.maxRequests}/${config.windowMs}ms`);
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    retry_after_seconds: Math.ceil(config.windowMs / 1000),
                });
                return;
            }

            res.setHeader('X-RateLimit-Remaining', Math.max(0, rem).toString());
            res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
            next();
        })
        .catch((err) => {
            console.error('[WAF] Redis rate limit error:', err);
            // Fail open — don't block requests if Redis is down
            next();
        });
}

/**
 * Request size limiter — prevents oversized payloads.
 */
export function bodySizeLimiter(maxBytes: number = 1024 * 1024) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);
        if (contentLength > maxBytes) {
            res.status(413).json({ error: 'Payload too large' });
            return;
        }
        next();
    };
}

/**
 * Security headers middleware — sets standard security headers.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
}
