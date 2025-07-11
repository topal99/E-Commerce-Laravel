'use client';

import { useState, useEffect } from "react";
import { type Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Category { id: number; name: string; }
interface ProductFormProps {
  onSave: (formData: FormData) => Promise<void>;
  isSaving: boolean;
  initialData?: Product | null;
  categories: Category[];
}

export default function ProductForm({ onSave, isSaving, initialData, categories }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // State terpisah untuk setiap jenis gambar
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Ubah FileList menjadi Array dan simpan ke state
      setGalleryImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: Gambar utama wajib ada saat membuat produk baru
    if (!initialData && !mainImage) {
        alert("Gambar utama wajib diisi.");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category_id', categoryId);
    
    // Lampirkan gambar utama jika ada
    if (mainImage) {
      formData.append('image', mainImage);
    }
    
    // Lampirkan setiap gambar galeri jika ada
    if (galleryImages.length > 0) {
      galleryImages.forEach((file) => {
        formData.append('gallery_images[]', file); // '[]' penting untuk PHP
      });
    }
    
    if (initialData) {
        formData.append('_method', 'PUT');
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <Separator />

      <div>
        <Label htmlFor="image" className="font-semibold">Gambar Utama (Wajib)</Label>
        <p className="text-xs text-muted-foreground mb-2">Ini akan menjadi gambar sampul produk Anda.</p>
        <Input id="image" type="file" onChange={(e) => setMainImage(e.target.files ? e.target.files[0] : null)} />
        {initialData?.image_url && !mainImage && <p className="text-sm mt-2">Gambar saat ini: {initialData.image_url.split('/')[1]}</p>}
      </div>

      <div>
        <Label htmlFor="gallery_images" className="font-semibold">Gambar Galeri (Opsional)</Label>
        <p className="text-xs text-muted-foreground mb-2">Pilih beberapa gambar untuk menampilkan produk dari berbagai sudut.</p>
        <Input id="gallery_images" type="file" multiple onChange={handleGalleryChange} />
        {/* Tampilkan preview nama file yang dipilih */}
        {galleryImages.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
                {galleryImages.length} gambar dipilih: {galleryImages.map(f => f.name).join(', ')}
            </div>
        )}
      </div>

      <Separator />
      <div>
        <Label htmlFor="name">Nama Produk</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
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
