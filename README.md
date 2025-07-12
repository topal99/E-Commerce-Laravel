# Proyek E-Commerce 

## 1. Project Overview📜

Proyek ini adalah sebuah platform E-Commerce modern yang dibangun dengan
arsitektur headless, memisahkan antara backend (API) dan frontend
(Client). Tujuannya adalah untuk menyediakan solusi pasar digital yang
skalabel, aman, dan kaya fitur, yang melayani tiga peran utama:
Pelanggan (Customer), Pemilik Toko (Owner), dan Admin.

Dengan backend yang kokoh menggunakan Laravel dan frontend yang
interaktif serta cepat menggunakan Next.js, platform ini dirancang untuk
memberikan pengalaman pengguna yang mulus, sekaligus memudahkan
manajemen bagi penjual dan pengawasan bagi administrator. Arsitektur ini
juga memungkinkan fleksibilitas untuk pengembangan di masa depan,
seperti ekspansi ke aplikasi mobile tanpa perlu membangun ulang logika
bisnis inti.

## 2. Arsitektur & Teknologi 🛠️

-   **Backend (API): Laravel 11**

    -   Bahasa: PHP 8.2+

    -   Database: MySQL

    -   Manajemen Paket: Composer

    -   Fitur Utama: API RESTful, otentikasi via Sanctum, manajemen peran, integrasi layanan pihak ketiga.


-   **Frontend (Client): Next.js 14**

    -   Bahasa: TypeScript

    -   Framework: React

    -   Manajemen Paket: npm / yarn

    -   Fitur Utama: Server-Side Rendering (SSR) & Static Site Generation (SSG) untuk performa optimal, routing berbasis App Router, desain responsif dengan Tailwind CSS.


-   **Arsitektur: Headless/Decoupled**

    -   Backend hanya berfungsi sebagai penyedia data melalui API.

    -   Frontend berfungsi sebagai \"kepala\" yang mengonsumsi API untuk menampilkan data kepada pengguna.

## 3. Rincian Fitur Berdasarkan Peran

### a. Customer (Pelanggan)

Fokus pada pengalaman belanja yang intuitif dan lengkap.

-   **Otentikasi & Akun:**

    -   Registrasi akun dengan verifikasi email.

    -   Login standar (email & password) dan Login via Google (OAuth 2.0).

    -   Manajemen profil, alamat pengiriman, dan perubahan password.


-   **Alur Belanja:**

    -   Katalog produk dengan pencarian, filter kategori, dan paginasi.

    -   Halaman detail produk dengan galeri gambar, deskripsi, stok, ulasan, dan sesi Tanya Jawab.

    -   Sistem Wishlist untuk menyimpan produk idaman.

-   **Transaksi:**

    -   Keranjang belanja dinamis (tambah, hapus, update kuantitas).

    -   Proses Checkout multi-langkah:

        1.  Pilih alamat.

        2.  Pilih kurir & cek ongkos kirim (Integrasi RajaOngkir API).

        3.  Pilih metode pembayaran (Integrasi Midtrans Payment Gateway).

        4.  Ringkasan pesanan & konfirmasi.

-   **Pasca-Transaksi:**

    -   Halaman \"Pesanan Saya\" dengan riwayat dan status real-time.

    -   Kemampuan untuk memberikan ulasan dan rating pada produk yang telah dibeli.

    -   Sistem Poin Loyalitas yang didapat dari setiap transaksi selesai.

### b. Owner (Pemilik Toko)

Menyediakan semua perangkat yang dibutuhkan untuk mengelola toko online
secara mandiri.

-   **Dashboard Analitik:**

    -   Ringkasan performa toko: Total Pendapatan, Produk Terjual, Pesanan Baru.

    -   Grafik Penjualan dinamis untuk 7 hari terakhir.

    -   Widget untuk produk terlaris, stok menipis, dan ulasan terbaru.

-   **Manajemen Inventaris:**

    -   Operasi CRUD (Create, Read, Update, Delete) penuh untuk produk di tokonya.

    -   Upload gambar produk dan manajemen kategori.

-   **Manajemen Penjualan:**  

    -   Melihat daftar pesanan yang masuk khusus untuk produknya.

    -   Memproses pesanan dengan memperbarui status (misal: \"Paid\", \"Shipped\") dan menginput nomor resi pengiriman.

-   **Interaksi Pelanggan:**

    -   Menjawab pertanyaan yang diajukan pelanggan pada halaman produknya.

### c. Admin

Memiliki hak akses tertinggi untuk pengawasan dan manajemen platform
secara keseluruhan.

-   **Manajemen Pengguna:**

    -   Melihat seluruh pengguna terdaftar di platform.

    -   Mengubah peran pengguna (misalnya, mempromosikan Customer menjadi Owner).

-   **Pengawasan Platform:**

    -   (Potensi Pengembangan) Manajemen kategori global, persetujuan produk, manajemen kupon, dll.

## 4. Panduan Instalasi & Konfigurasi Detail

Panduan ini ditujukan bagi developer yang akan melanjutkan pengembangan
proyek ini.

**Prasyarat (Prerequisites)**

-   PHP \>= 8.2

-   Composer

-   Node.js \>= 18.0

-   NPM / Yarn

-   Server Database (MySQL direkomendasikan)

-   Git

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