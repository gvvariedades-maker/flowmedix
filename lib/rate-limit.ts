/**
 * Rate Limiting para APIs
 *
 * Upstash Redis quando configurado; fallback in-memory em dev/CI (warn em produção).
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { logger } from './logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

let redisClient: Redis | null | undefined;
let upstashFallbackWarned = false;
const distributedLimiterCache = new Map<string, Ratelimit>();

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000);
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

function resolveUpstashRestCredentials(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

function getUpstashRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const creds = resolveUpstashRestCredentials();
  if (!creds) {
    redisClient = null;
    return null;
  }
  redisClient = new Redis(creds);
  return redisClient;
}

function getDistributedLimiter(endpointKey: string, limit: number, windowMs: number): Ratelimit | null {
  const redis = getUpstashRedis();
  if (!redis) return null;

  const cacheKey = `${endpointKey}:${limit}:${windowMs}`;
  let limiter = distributedLimiterCache.get(cacheKey);
  if (!limiter) {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `@avant/rl/${endpointKey}`,
    });
    distributedLimiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

function warnInMemoryFallback(endpointKey: string): void {
  if (process.env.NODE_ENV !== 'production' || upstashFallbackWarned) return;
  upstashFallbackWarned = true;
  logger.warn('Rate limit in-memory (Upstash ausente) — não distribuído em serverless', {
    endpoint: endpointKey,
  });
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
}

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 10000,
): boolean {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return true;
  }

  store[key].count++;

  return store[key].count <= limit;
}

export function apiRateLimit(
  req: Request,
  limit: number = 10,
  windowMs: number = 10000,
): boolean {
  return rateLimit(getClientIp(req), limit, windowMs);
}

export async function distributedRateLimit(
  req: Request,
  options: { key: string; limit: number; windowMs: number; identifier?: string },
): Promise<boolean> {
  const identifier = options.identifier ?? getClientIp(req);
  const limiter = getDistributedLimiter(options.key, options.limit, options.windowMs);

  if (limiter) {
    const { success } = await limiter.limit(identifier);
    return success;
  }

  warnInMemoryFallback(options.key);
  return rateLimit(`${options.key}:${identifier}`, options.limit, options.windowMs);
}

export function rateLimitWithInfo(
  identifier: string,
  limit: number = 10,
  windowMs: number = 10000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: store[key].resetAt,
    };
  }

  store[key].count++;

  const remaining = Math.max(0, limit - store[key].count);
  const allowed = store[key].count <= limit;

  return {
    allowed,
    remaining,
    resetAt: store[key].resetAt,
  };
}

export async function distributedRateLimitWithInfo(
  req: Request,
  options: { key: string; limit: number; windowMs: number; identifier?: string },
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const identifier = options.identifier ?? getClientIp(req);
  const limiter = getDistributedLimiter(options.key, options.limit, options.windowMs);

  if (limiter) {
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  }

  warnInMemoryFallback(options.key);
  return rateLimitWithInfo(`${options.key}:${identifier}`, options.limit, options.windowMs);
}
