# Platform E-Commerce "Phoenix"

Ini adalah repository untuk proyek e-commerce full-stack yang dibangun dengan arsitektur headless.

## Struktur Proyek

-   **/backend**: Berisi API backend yang dibangun dengan Laravel.
-   **/frontend**: Berisi aplikasi frontend yang dibangun dengan Next.js.

## Cara Menjalankan (Development)

### Backend (Laravel)

1.  Masuk ke direktori backend: `cd backend`
2.  Install dependensi: `composer install`
3.  Salin file `.env.example` menjadi `.env`
4.  Generate key: `php artisan key:generate`
5.  Jalankan migrasi & seeder: `php artisan migrate:fresh --seed`
6.  Jalankan server (jika menggunakan Laragon, cukup nyalakan servernya).

### Frontend (Next.js)

1.  Masuk ke direktori frontend: `cd frontend`
2.  Install dependensi: `npm install`
3.  Jalankan server development: `npm run dev`