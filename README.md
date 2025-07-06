# **Platform E-Commerce "Phoenix" (Studi Kasus)**
Ini adalah studi kasus pengembangan platform e-commerce modern yang dibangun dari awal dengan arsitektur *headless*. Aplikasi ini dirancang untuk melayani tiga jenis pengguna yang berbeda (Pelanggan, Pemilik Toko, dan Admin), masing-masing dengan dashboard dan fungsionalitas yang spesifik dan aman.

- **Frontend:** Next.js (React) dengan Tailwind CSS & shadcn/ui
- **Backend:** Laravel 11
- **Arsitektur:** Headless (API-driven)
## **Struktur Proyek**
Proyek ini dikelola dalam satu repository (*monorepo*) untuk kemudahan manajemen, dengan pemisahan yang jelas antara frontend dan backend:

- /frontend: Berisi aplikasi Next.js yang menangani semua antarmuka pengguna (UI) dan interaksi di sisi klien.
- /backend: Berisi API RESTful yang dibangun dengan Laravel, menangani semua logika bisnis, interaksi database, dan otentikasi.
## **Fitur Utama yang Telah Diimplementasikan**
### **1. Fitur Umum & Publik**
- **Homepage Dinamis:** Menampilkan berbagai sezione seperti banner slider dengan progress bar, kategori produk dengan ikon, produk terlaris (carousel), dan daftar produk terbaru (grid).
- **Katalog Produk dengan Filter & Paginasi:** Halaman /products yang menampilkan semua produk dengan kemampuan untuk:
  - Mengurutkan berdasarkan harga (termurah/termahal), produk terbaru, dan rating tertinggi.
  - Memfilter berdasarkan rentang harga maksimal.
  - Navigasi halaman (paginasi) untuk menangani katalog produk dalam jumlah besar.
- **Pencarian Produk:** Fungsionalitas search bar di header yang mengarahkan ke halaman hasil pencarian dinamis.
- **SEO Dinamis:** Halaman detail produk secara otomatis menghasilkan tag <title> dan <meta name="description"> yang unik untuk setiap produk, meningkatkan visibilitas di mesin pencari.
- **Desain Responsif:** Tampilan dioptimalkan untuk semua perangkat, dari desktop hingga mobile, menggunakan Tailwind CSS.
### **2. Fungsionalitas Pelanggan (Customer)**
- **Otentikasi Aman & Modern:**
  - **Registrasi dengan Verifikasi Email:** Pengguna baru harus memverifikasi email mereka melalui link yang dikirim (ditangkap dengan **Mailpit** saat development) sebelum bisa login. Alur verifikasi sepenuhnya berbasis API.
  - **Login dengan Google:** Integrasi dengan **Laravel Socialite** untuk memungkinkan pendaftaran dan login satu klik menggunakan akun Google.
- **Manajemen Akun Lengkap:**
  - Halaman profil untuk memperbarui nama dan email.
  - Fitur ganti password yang aman (meminta password saat ini).
  - Buku alamat dengan fungsionalitas CRUD penuh (Tambah, Lihat, Hapus Alamat) melalui antarmuka modal.
- **Alur Belanja Lengkap:**
  - **Wishlist:** Kemampuan untuk menambah/menghapus produk dari daftar keinginan yang tersimpan di database.
  - **Keranjang Belanja (Database-driven):** Keranjang belanja yang konsisten di berbagai perangkat, dengan validasi stok di backend untuk mencegah pemesanan melebihi stok.
  - **Proses Checkout Multi-Langkah:** Alur checkout yang jelas di satu halaman, mencakup pemilihan alamat, kalkulasi ongkos kirim (simulasi), dan penerapan kupon diskon.
- **Pengalaman Pasca-Pembelian:**
  - **Riwayat & Detail Pesanan:** Pelanggan dapat melihat daftar semua pesanannya. Setiap pesanan dapat diklik untuk melihat halaman detail yang menampilkan:
    - Alamat pengiriman.
    - Rincian biaya (subtotal, ongkir, diskon, total).
    - **Progress bar status pengiriman** yang visual.
    - Nomor resi.
  - **Sistem Ulasan & Rating:** Pelanggan hanya bisa memberikan ulasan (satu kali per produk) untuk produk yang status pesanannya sudah delivered.
  - **Notifikasi Stok Kembali:** Kemampuan untuk mendaftar notifikasi email untuk produk yang stoknya habis.
### **3. Fungsionalitas Pemilik Toko (Store Owner)**
- **Dashboard Analitik:** Halaman utama (/owner/dashboard) yang menampilkan statistik kunci untuk membantu pengambilan keputusan:
  - Total Pendapatan.
  - Jumlah Produk Terjual.
  - Jumlah Pesanan Baru.
  - Daftar Produk Terlaris miliknya.
  - **Widget "Stok Segera Habis"** untuk manajemen inventaris proaktif.
- **Manajemen Produk Penuh (CRUD):** Antarmuka lengkap di /owner/my-products untuk membuat, melihat, mengedit, dan menghapus produk **miliknya sendiri** melalui modal yang dinamis, termasuk **upload gambar produk**.
- **Manajemen Pesanan Efisien:**
  - Dashboard terpusat (/owner/orders) untuk melihat semua pesanan yang berisi produknya.
  - Kemampuan untuk memperbarui status dan nomor resi untuk **semua produknya dalam satu pesanan secara bersamaan**, bukan lagi per item.
### **4. Fungsionalitas Admin (Super Admin)**
- **Manajemen Pengguna:** Dashboard terpusat (/admin/users) untuk melihat daftar semua pengguna dengan peran store\_owner dan customer.
- **Pengawasan Produk:** Kemampuan untuk melihat detail produk dari semua pemilik toko dan hak akses untuk menghapus produk jika diperlukan.
### **5. Detail Teknis & Arsitektur Unggulan**
- **Role-Based Access Control (RBAC):** Diimplementasikan secara ketat di backend menggunakan **Laravel Middleware** dan di frontend menggunakan **Next.js Middleware** untuk melindungi rute dan API berdasarkan peran pengguna (admin, store\_owner, customer).
- **Sistem Event & Listener Laravel:** Digunakan untuk menangani tugas-tugas di latar belakang secara asinkron, seperti mengirim email notifikasi stok kembali menggunakan **Laravel Queues** (antrian), sehingga tidak mengganggu pengalaman pengguna.
- **Optimisasi Performa:**
  - Menggunakan komponen <Image> dari Next.js di seluruh aplikasi untuk optimisasi gambar otomatis.
  - Menerapkan **Eager Loading** (with, load) di Laravel untuk meminimalkan query ke database dan mencegah masalah N+1.
- **Manajemen State Frontend:** Menggunakan **Zustand** untuk manajemen state global yang sederhana dan efisien (otentikasi, keranjang, wishlist).

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