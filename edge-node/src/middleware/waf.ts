import { Request, Response, NextFunction } from 'express';

/**
 * WAF-style rate limiting middleware.
 * Tracks request counts per IP in a sliding window.
 * Blocks IPs that exceed the threshold.
 * 
 * In production: use a distributed store (Redis) for multi-instance deployments.
 */

interface RateEntry {
    count: number;
    windowStart: number;
}

const ipMap = new Map<string, RateEntry>();
const WINDOW_MS = 60 * 1000;        // 1 minute window
const MAX_REQUESTS = 100;            // Max requests per window per IP
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minute block on threshold breach

const blockedIPs = new Map<string, number>(); // IP -> unblock timestamp

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Check if IP is currently blocked
    const unblockAt = blockedIPs.get(ip);
    if (unblockAt && now < unblockAt) {
        console.warn(`[WAF] Blocked request from ${ip}. Unblocks at ${new Date(unblockAt).toISOString()}`);
        res.status(429).json({
            error: 'Too many requests. You have been temporarily blocked.',
            retry_after_seconds: Math.ceil((unblockAt - now) / 1000)
        });
        return;
    } else if (unblockAt) {
        blockedIPs.delete(ip);
    }

    // Sliding window rate check
    const entry = ipMap.get(ip);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        ipMap.set(ip, { count: 1, windowStart: now });
        next();
        return;
    }

    entry.count++;

    if (entry.count > MAX_REQUESTS) {
        console.warn(`[WAF] Rate limit exceeded for ${ip}: ${entry.count} requests in window`);
        blockedIPs.set(ip, now + BLOCK_DURATION_MS);
        res.status(429).json({
            error: 'Rate limit exceeded',
            retry_after_seconds: Math.ceil(BLOCK_DURATION_MS / 1000)
        });
        return;
    }

    next();
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
