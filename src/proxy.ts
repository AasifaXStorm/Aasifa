import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gate all paths starting with /stormy, excluding the login page itself
  if (pathname.startsWith('/stormy') && pathname !== '/stormy/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;

    if (sessionCookie !== 'authenticated') {
      const loginUrl = new URL('/stormy/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Match all administrative subpaths
export const config = {
  matcher: ['/stormy/:path*'],
};
