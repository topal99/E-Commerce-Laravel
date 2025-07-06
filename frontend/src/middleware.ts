import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil informasi otentikasi dari cookie
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('auth_role')?.value;
  const { pathname } = request.nextUrl;

  // URL tujuan jika terjadi redirect
  const loginUrl = new URL('/login', request.url);
  const unauthorizedUrl = new URL('/unauthorized', request.url); // Pastikan halaman ini ada

  // ==========================================================
  // LOGIKA UNTUK TAMU (TIDAK LOGIN)
  // ==========================================================
  // Karena 'matcher' di bawah sudah memastikan middleware ini hanya berjalan
  // di rute yang dilindungi, maka jika tidak ada token, kita bisa langsung
  // me-redirect ke halaman login.
  if (!token) {
    // Simpan halaman yang ingin dituju agar bisa kembali setelah login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ==========================================================
  // LOGIKA UNTUK PENGGUNA YANG SUDAH LOGIN
  // ==========================================================
  // Jika kode sampai di sini, artinya 'token' pasti ada.

  // Aturan untuk halaman Admin
  if (pathname.startsWith('/admin') && role !== 'admin') {
    // Jika mencoba akses /admin tapi bukan admin, tolak.
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Aturan untuk halaman Pemilik Toko
  if (pathname.startsWith('/owner') && role !== 'store_owner') {
    // Jika mencoba akses /owner tapi bukan pemilik toko, tolak.
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Aturan untuk halaman Customer
  const customerRoutes = ['/cart', '/my-orders', '/wishlist', '/my-account'];
  if (customerRoutes.some(route => pathname.startsWith(route)) && role !== 'customer') {
    // Jika mencoba akses halaman customer tapi bukan customer, tolak.
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Jika semua pengecekan di atas lolos, berarti pengguna memiliki hak akses.
  // Izinkan mereka melanjutkan.
  return NextResponse.next();
}

// Konfigurasi "Matcher"
// Middleware ini HANYA akan berjalan pada path yang tercantum di bawah ini.
export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/cart/:path*',
    '/my-orders/:path*',
    '/wishlist/:path*',
    '/my-account/:path*',
  ],
};
