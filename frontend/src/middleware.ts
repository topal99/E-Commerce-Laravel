import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil informasi otentikasi dari cookie
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('auth_role')?.value;
  const { pathname } = request.nextUrl;

  // URL tujuan jika terjadi redirect
  const homeUrl = new URL('/', request.url);
  const loginUrl = new URL('/login', request.url);
  const unauthorizedUrl = new URL('/unauthorized', request.url);

  // === PERBAIKAN UTAMA: LOGIKA UNTUK PENGGUNA YANG SUDAH LOGIN ===
  // Jika token ADA dan mencoba akses halaman login/register...
  if (token && (pathname === '/login' || pathname === '/register')) {
    // ...langsung arahkan ke halaman utama.
    return NextResponse.redirect(homeUrl);
  }

  // === LOGIKA UNTUK TAMU (TIDAK LOGIN) ===
  // Jika token TIDAK ADA dan mencoba akses halaman yang dilindungi...
  if (!token && pathname !== '/login' && pathname !== '/register') {
    // ...arahkan ke halaman login.
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // === LOGIKA UNTUK HAK AKSES ROLE (JIKA SUDAH LOGIN) ===
  if (token) {
    // Aturan untuk halaman Admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Aturan untuk halaman Pemilik Toko
    if (pathname.startsWith('/owner') && role !== 'store_owner') {
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Aturan untuk halaman Customer
    const customerRoutes = ['/cart', '/my-orders', '/wishlist', '/my-account'];
    if (customerRoutes.some(route => pathname.startsWith(route)) && role !== 'customer') {
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Jika semua pengecekan lolos, izinkan pengguna melanjutkan
  return NextResponse.next();
}

// Konfigurasi "Matcher"
// Sekarang kita tambahkan /login dan /register ke dalam daftar yang dijaga.
export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/cart/:path*',
    '/my-orders/:path*',
    '/wishlist/:path*',
    '/my-account/:path*',
    '/login',
    '/register',
    '/checkout'
  ],
};