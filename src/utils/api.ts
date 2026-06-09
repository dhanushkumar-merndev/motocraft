import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const RATE_LIMIT = 10;
const RATE_WINDOW_S = 60;

export async function checkRateLimit(request: Request): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, RATE_WINDOW_S);
  return count <= RATE_LIMIT;
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status },
  );
}

export function error(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export function validateApiKey(request: Request): boolean {
  // Only validate if x-api-key header is present (external callers)
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return true;
  return apiKey === process.env.WEBSITE_API_KEY;
}
