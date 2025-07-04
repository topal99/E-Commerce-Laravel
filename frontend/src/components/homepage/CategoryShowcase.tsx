// src/components/homepage/CategoryShowcase.tsx
'use client';

import Link from "next/link";
import {
    Armchair, Bike, Briefcase, Lamp, Shirt, ShoppingBasket, Smartphone, Watch,
    type LucideIcon, HelpCircle // HelpCircle sebagai ikon default
} from "lucide-react";

// Definisikan tipe data untuk kategori agar lebih aman
interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string; // Backend mengirim string nama ikon
}

// Buat objek pemetaan dari string nama ikon ke Komponen Ikon React
const iconMap: { [key: string]: LucideIcon } = {
    shirt: Shirt,
    smartphone: Smartphone,
    watch: Watch,
    armchair: Armchair,
    bike: Bike,
    'shopping-basket': ShoppingBasket, // Gunakan string untuk nama dengan tanda hubung
    lamp: Lamp,
    briefcase: Briefcase,
};

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
    return (
        <section className="w-full py-12 md:py-10 bg-gray-50">
            <div className="container mx-auto px-8">
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
                    {categories.map((category) => {
                        // Ambil komponen ikon dari map, atau gunakan ikon default jika tidak ditemukan
                        const IconComponent = iconMap[category.icon] || HelpCircle;

                        return (
                            <Link
                                href={`/categories/${category.slug}`}
                                key={category.id}
                                className="group flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-300"
                            >
                                <div className="bg-white border p-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white shadow-sm">
                                    <IconComponent className="h-8 w-8 text-blue-500 transition-colors duration-300 group-hover:text-white" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{category.name}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}