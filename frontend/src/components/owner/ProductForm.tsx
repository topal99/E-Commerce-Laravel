'use client';

import { useState, useEffect } from "react";
import { type Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Definisikan tipe data yang diterima oleh form ini
interface Category { id: number; name: string; }
interface ProductFormProps {
  onSave: (formData: FormData) => Promise<void>;
  isSaving: boolean;
  initialData?: Product | null;
  categories: Category[]; // <-- Pastikan prop 'categories' didefinisikan di sini
}

export default function ProductForm({ onSave, isSaving, initialData, categories }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  
  // Mengisi form dengan data awal jika dalam mode edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price.toString());
      setStock(initialData.stock.toString());
      setCategoryId(initialData.category?.id.toString() || '');
    } else {
      // Reset form jika mode create
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category_id', categoryId);
    if (image) {
      formData.append('image', image);
    }
    if (initialData) {
        formData.append('_method', 'PUT');
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Produk</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="image">Gambar Produk {initialData ? '(Opsional)' : ''}</Label>
        <Input id="image" type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
        {initialData?.image_url && !image && <p className="text-sm mt-2">Gambar saat ini: {initialData.image_url.split('/')[1]}</p>}
      </div>
      <div>
        <Label htmlFor="category_id">Kategori</Label>
        <select id="category_id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white mt-1" required>
            <option value="" disabled>Pilih Kategori</option>
            {/* Dropdown sekarang menggunakan data dari prop 'categories' */}
            {categories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option> ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="price">Harga</Label><Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
        <div><Label htmlFor="stock">Stok</Label><Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
      </div>
      <Button type="submit" disabled={isSaving} className="w-full bg-black text-white">
        {isSaving ? 'Menyimpan...' : 'Simpan Produk'}
      </Button>
    </form>
  );
}
