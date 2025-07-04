// src/lib/types.ts
// Tipe data untuk ulasan produk
export interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    // Setiap ulasan memiliki data pengguna yang membuatnya
    user: {
        id: number;
        name: string;
    };
}

export interface ProductVariant {
    id: number;
    product_id: number;
    color_name: string;
    color_value: string;
    size: string;
    stock: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number; // Stok utama produk
    image_url: string; 
    
    // PERBAIKAN DI SINI: Tambahkan 'id' ke dalam tipe kategori
    category?: {
        id: number; // <-- Tambahkan ini
        name: string;
    };
    
    // PERBAIKAN DI SINI: Tambahkan properti 'reviews'
    reviews?: Review[]; // <-- Ini adalah array dari objek Review
    
    reviews_avg_rating?: number;
    reviews_count?: number;
    
    // Properti ini bisa dihapus jika Anda tidak lagi menggunakan varian
    variants?: ProductVariant[]; 
    
    originalPrice?: number;
}
