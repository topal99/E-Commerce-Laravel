'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingCart, User, X, LogOut, LayoutDashboard, Package, History, ListCheck, Heart, GitGraph, SatelliteDishIcon, ChartBar } from "lucide-react";
import { useWishlistStore } from '@/stores/wishlistStore';
import { useRouter } from 'next/navigation'; // <-- Import useRouter

// Asumsi komponen-komponen ini ada dari shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Beranda" },
];

export default function Header() {
  const { user, token, logout } = useAuthStore();
  const { items, fetchCart, clearCartOnLogout } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { fetchWishlist, clearWishlistOnLogout } = useWishlistStore();
  
  // === LOGIKA BARU UNTUK PENCARIAN ===
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Mencegah reload halaman
    if (!searchTerm.trim()) return; // Jangan cari jika input kosong
    
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    // Tutup menu mobile jika pencarian dilakukan dari sana
    if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    }
  }, [token, fetchCart, fetchWishlist]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const handleLogout = () => {
    logout();
    clearCartOnLogout();
    clearWishlistOnLogout();
  };

  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 h-16">
        <div className="container mx-auto flex h-16 items-center px-4">
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Grup Kiri: Logo Desktop & Menu Mobile Trigger */}
        <div className="flex items-center gap-4">
          {/* Logo untuk Desktop */}
          <Link href="/" className="hidden md:flex items-center gap-1">
            <Image src="/mylogo.png" alt="E-Comm Logo" width={50} height={50} className="h-10 w-10" />
            <span className="font-bold text-sm">E-Comm</span>
          </Link>
          
          {/* Tombol Menu Mobile */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="flex flex-col h-full">
               
                {/* Search Bar dipindahkan ke dalam menu mobile */}
                <div className="p-4 border-b">
                   <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Input type="search" placeholder="Cari produk..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                   </form>
                </div>
                
                <nav className="flex-1 flex flex-col gap-4 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo untuk Mobile (ditampilkan di tengah saat menu desktop disembunyikan) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mylogo.png" alt="E-Comm Logo" width={40} height={40} className="h-8 w-8" />
            <span className="font-bold text-sm">E-Comm</span>
          </Link>
        </div>
        
        {/* Navigasi Desktop (di kiri) */}
        <nav className="hidden ml-6 md:flex flex-1 items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Grup Kanan: Ikon & Aksi */}
        <div className="flex items-center justify-end gap-2">

           <form onSubmit={handleSearch} className="relative w-full max-w-xs hidden md:block">
            <Input type="search" placeholder="Cari produk..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </form>

          {/* Ikon Aksi untuk Customer */}
          {user && user.role === 'customer' && (
            <div className="flex items-center">

              <Link href="/my-orders">
                <Button variant="ghost-dark" size="icon" className="rounded-full transition-colors">
                <ListCheck className="h-5 w-5" /><span className="sr-only">Pesanan Saya</span></Button></Link>

              <Link href="/wishlist">
                <Button variant="ghost-dark" size="icon" className="rounded-full transition-colors">
                <Heart className="h-5 w-5" /><span className="sr-only">Wishlist</span></Button>
                </Link>

              <Link href="/cart">
                <Button variant="ghost-dark" size="icon" className=" relative rounded-full transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {items.length > 0 && (<span className="absolute top-1 right-2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{items.length}</span>)}
                  <span className="sr-only">Keranjang Belanja</span>
                </Button>
              </Link>

            </div>
          )}

          {/* Menu Akun Pengguna */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center">
                <Button variant="ghost-dark" size="icon" className="rounded-full transition-colors">
                  <User className="h-5 w-5 " /></Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {token && user ? (
                <>
                  <DropdownMenuLabel>Hi, {user.name}!</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'store_owner' && (
                    <>
                      <Link href="/owner/dashboard"><DropdownMenuItem>
                        <ChartBar className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem></Link>
                      <Link href="/owner/my-products"><DropdownMenuItem>
                        <Package className="mr-2 h-4 w-4" />Produk</DropdownMenuItem></Link>
                      <Link href="/owner/orders"><DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />Pesanan</DropdownMenuItem></Link>
                    </>
                  )}
    
                  {user.role === 'admin' && (<Link href="/admin/users">
                  <DropdownMenuItem><LayoutDashboard className="mr-2 h-4 w-4" /> Panel Admin</DropdownMenuItem></Link>)}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <Link href="/login"><DropdownMenuItem>Login</DropdownMenuItem></Link>
                  <Link href="/register"><DropdownMenuItem>Register</DropdownMenuItem></Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
