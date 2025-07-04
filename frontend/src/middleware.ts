import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Jika tidak ada token dan mencoba akses rute yang dilindungi
  if (!token && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/owner'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Konfigurasi Matcher untuk melindungi SEMUA rute di bawah /admin dan /owner
export const config = {
  matcher: ['/admin/:path*', '/owner/:path*'],
};
