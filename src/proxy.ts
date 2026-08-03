import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySignedToken } from '@/lib/sessionToken';

// In-memory rate limiting map for Edge/Proxy layer (IP -> { count, resetAt })
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(ip: string, maxAttempts: number = 10, windowMs: number = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';

  // Security Hardening: Gate all administrative paths (/stormy/*)
  if (pathname.startsWith('/stormy')) {
    // 1. Allow login route, but enforce rate limiting per IP
    if (pathname === '/stormy/login') {
      const rateLimit = checkIpRateLimit(`login_${ip}`, 15, 15 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
      }
      return NextResponse.next();
    }

    // 2. Validate signed session token for all other admin routes
    const sessionCookie = request.cookies.get('admin_session')?.value;
    const verifiedPayload = await verifySignedToken(sessionCookie);

    if (!verifiedPayload || verifiedPayload.role !== 'admin') {
      return NextResponse.redirect(new URL('/stormy/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/stormy/:path*'],
};
