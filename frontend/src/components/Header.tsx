'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useEffect, useState, useRef} from 'react';
import { Menu, Search, ShoppingCart, User, X, LogOut, LayoutDashboard, Package, History, ChartBar, HistoryIcon, HeartIcon, Settings, CircleQuestionMark, SendToBack, Coins } from "lucide-react";
import { useWishlistStore } from '@/stores/wishlistStore';
import { useRouter } from 'next/navigation'; 
import Cookies from 'js-cookie';
import SearchSuggestions from './SearchSuggestions';
import { useNotificationStore } from '@/stores/notificationStore';

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
import NotificationDropdown from './NotificationDropdown';

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Cari Produk" },
];

// Komponen baru untuk Search Bar agar bisa digunakan kembali
const SearchBar = ({ onSearchSubmit, searchTerm, setSearchTerm, onFocus }: {
    onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    onFocus: () => void;
}) => (
    <form onSubmit={onSearchSubmit}>
        <div className="relative">
            <Input 
                type="search" 
                placeholder="Cari produk..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={onFocus}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
    </form>
);


export default function Header() {
  const { user, token, logout } = useAuthStore();
  const { items, fetchCart, clearCartOnLogout } = useCartStore();
  const { fetchWishlist, clearWishlistOnLogout } = useWishlistStore();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Efek untuk fetch autocomplete dengan debouncing
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    setIsSearching(true);
    const handler = setTimeout(async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${apiUrl}/api/products/autocomplete?q=${searchTerm}`);
        const data = await res.json();
        setSuggestions(data.data || []);
      } catch (error) { console.error("Gagal fetch autocomplete:", error); setSuggestions([]); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Efek untuk menutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  // Satu fungsi untuk menangani submit pencarian
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };
  
  const handleSuggestionClick = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const { fetchNotifications } = useNotificationStore();

  // EFEK INI SUDAH BENAR: Mengambil data saat user login (ada token)
  useEffect(() => { 
    if (token) {
      fetchCart();
      fetchWishlist();
      fetchNotifications();
    } 
  }, [token, fetchCart, fetchWishlist, fetchNotifications]);

  useEffect(() => { setIsClient(true); }, []);

  const handleLogout = () => {
    logout();
    clearCartOnLogout();
    clearWishlistOnLogout();
    router.push('/');
    Cookies.remove('auth_role');
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
          <Link href="/" className="hidden md:flex items-center gap-2 ">
            <Image src="/mylogo.png" 
              alt="E-Comm Logo"
              width={40}  
              height={40}
              priority={false} />
            <span className="font-bold text-sm">E-Comm</span>
          </Link>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              {/* Konten Sheet di sini */}
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo untuk Mobile */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mylogo.png" alt="E-Comm Logo" width={40} height={40} className="h-8 w-8" />
            <span className="font-bold text-sm">E-Comm</span>
          </Link>
        </div>
        
        {/* Navigasi Desktop */}
        <nav className="hidden ml-6 md:flex flex-1 items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Grup Kanan: Ikon & Aksi */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative w-full max-w-xs md:block ml-2" ref={searchContainerRef}>
            <SearchBar 
                onSearchSubmit={handleSearchSubmit} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onFocus={() => { if (searchTerm.length > 1) setShowSuggestions(true) }}
            />
            {showSuggestions && (
              <SearchSuggestions 
                suggestions={suggestions} 
                isLoading={isSearching}
                onSuggestionClick={handleSuggestionClick} 
              />
            )}
          </div>

          {/* PERBAIKAN DI SINI */}
          {/* Ikon Keranjang (HANYA untuk customer) */}
          {user && user.role === 'customer' && (
            <Link href="/cart">
              <Button size="icon" variant="ghost" className=" relative rounded-full transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (<span className="absolute top-1 right-2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{items.length}</span>)}
              </Button>
            </Link>
          )}

          {/* Ikon Notifikasi (untuk SEMUA user yang login) */}
          {user && (
            <Button size="icon" variant="ghost" className=" relative rounded-full transition-colors">
              <NotificationDropdown />
            </Button>
          )}
          
          {/* Menu Akun Pengguna */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center">
                <Button variant="default" size="icon" className="rounded-full transition-colors bg-black">
                  <User />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {token && user ? (
                <>
                  <DropdownMenuLabel>Hi, {user.name}!</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'customer' && (
                  <>
                    <Link href="/my-orders"><DropdownMenuItem><HistoryIcon className="mr-2 h-4 w-4" />Riwayat Pesanan</DropdownMenuItem></Link>
                    <Link href="/my-account/points"><DropdownMenuItem><Coins className="mr-2 h-4 w-4" />Poin</DropdownMenuItem></Link>
                    <Link href="/wishlist"><DropdownMenuItem><HeartIcon className="mr-2 h-4 w-4" />Disukai</DropdownMenuItem></Link>
                    <Link href="/my-account/profile"><DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Pengaturan Akun</DropdownMenuItem></Link>
                  </>
                  )}
                  {/* Pastikan nama role 'store_owner' sudah benar */}
                  {user.role === 'store_owner' && (
                    <>
                      <Link href="/owner/dashboard"><DropdownMenuItem>
                        <ChartBar className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem></Link>
                      <Link href="/owner/my-products"><DropdownMenuItem>
                        <Package className="mr-2 h-4 w-4" />Produk</DropdownMenuItem></Link>
                      <Link href="/owner/orders"><DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />Pesanan</DropdownMenuItem></Link>
                      <Link href="/owner/qna"><DropdownMenuItem>
                        <CircleQuestionMark className="mr-2 h-4 w-4" />Tanya Jawab</DropdownMenuItem></Link>
                      <Link href="/owner/returns"><DropdownMenuItem>
                        <SendToBack className="mr-2 h-4 w-4" />Pengembalian Barang</DropdownMenuItem></Link>
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
