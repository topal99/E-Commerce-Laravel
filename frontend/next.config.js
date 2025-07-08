/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      // PERBAIKAN: Ganti 'localhost' dengan hostname Laragon Anda
      // agar lebih sesuai dengan setup yang kita gunakan.
      {
        protocol: 'http',
        hostname: 'ecomm-backend.test', // <-- Gunakan ini
        port: '', // Dikosongkan karena Laragon tidak pakai port di URL
        pathname: '/storage/**',
      },
    ],
  },
};

module.exports = nextConfig;