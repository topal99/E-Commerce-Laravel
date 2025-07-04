/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TAMBAHKAN BLOK KONFIGURASI INI
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      // Ini untuk jaga-jaga jika Anda kembali menggunakan URL Laragon
      
    ],
  },
};

module.exports = nextConfig;