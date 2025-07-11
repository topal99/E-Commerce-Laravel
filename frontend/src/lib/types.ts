// src/lib/types.ts
// Tipe data untuk ulasan produk
export interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface ProductSummary {
    id: number;
    name: string;
}

export interface Answer {
    id: number;
    answer_text: string;
    user: { name: string; }; 
}

export interface Question {
    id: number;
    question_text: string;
    user: { name: string; }; 
    answer: Answer | null;
    product: ProductSummary; 
}

export interface ProductVariant {
    id: number;
    product_id: number;
    color_name: string;
    color_value: string;
    size: string;
    stock: number;
}

export interface ProductImage {
    id: number;
    image_url: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image_url: string; // Gambar utama/cover
    images?: ProductImage[];   

    category?: {
        id: number;
        name: string;
    };
    
    reviews?: Review[];
    reviews_avg_rating?: number;
    reviews_count?: number;
    
    // PERBAIKAN UTAMA: Tambahkan properti 'user' (pemilik toko) di sini
    user?: {
        id: number;
        name: string;
        slug: string;
    };

    originalPrice?: number;
}
