# Platform E-Commerce

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

## Fitur

### Pelanggan (Customer):

1. Sistem Wishlist Fungsional:
- Backend: Membuat API untuk menambah, menghapus, dan melihat item wishlist.
- Frontend: Tombol hati (<Heart />) pada kartu produk sekarang berfungsi penuh, dengan status yang tersimpan di database dan tersinkronisasi di seluruh aplikasi.
- Halaman Wishlist: Membuat halaman baru (/wishlist) di mana pelanggan bisa melihat semua produk yang mereka sukai.
2. Sistem Ulasan & Rating Produk:
- Backend: Membuat API untuk menyimpan ulasan. Menerapkan logika bisnis yang ketat: hanya pelanggan yang sudah membeli produk yang bisa memberi ulasan, dan hanya bisa sekali.
- Frontend: Mengaktifkan form ulasan di halaman detail produk. Setelah ulasan berhasil dikirim, komentar akan langsung muncul dan form akan disembunyikan tanpa perlu me-refresh halaman.
3. Penyempurnaan Detail Pesanan:
- Backend: API detail pesanan (/api/orders/{id}) sekarang juga mengirimkan rincian lengkap alamat pengiriman, biaya ongkir, dan diskon yang digunakan.
- Frontend: Halaman /my-orders/[id] dirombak untuk menampilkan rincian biaya yang transparan (subtotal, ongkir, diskon, total) dan alamat pengiriman yang jelas.

### Pemilik Toko (Store Owner):

1. Manajemen Pesanan yang Efisien:
- Backend: Merombak total API /api/owner/orders. Sekarang API mengirim data per-pesanan, bukan per-item.
- Frontend: Halaman /owner/orders dirombak total. Tampilan sekarang berbasis "kartu pesanan". Pemilik toko bisa mengupdate status dan nomor resi untuk semua produknya dalam satu pesanan hanya dengan satu kali aksi melalui modal, tidak lagi per item.
- Tampilan Finansial: Halaman manajemen pesanan owner sekarang juga menampilkan rincian total pembayaran pelanggan, ongkir, dan diskon untuk setiap pesanan.  

### Fitur Baru Lainnya:

1. Sistem Kupon/Diskon:
- Backend: Membangun fondasi penuh untuk kupon, termasuk tabel coupons, seeder, dan API untuk validasi.
- Frontend: Menambahkan field input kupon di halaman checkout yang berfungsi untuk menerapkan diskon dan menghitung ulang total pembayaran secara dinamis.

