// src/app/layout.tsx

import type { Metadata } from "next";
// LANGKAH 1: Ubah import font dari Geist menjadi Inter
import { Inter } from "next/font/google"; 
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// LANGKAH 2: Inisialisasi font Inter, bukan Geist
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toko Online Saya",
  description: "Platform e-commerce modern yang dibuat dengan Next.js dan Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* LANGKAH 3: Gunakan className dari variabel 'inter' */}
      <body className={inter.className}>
        
        <Header />
        
        <main className="min-h-screen bg-black-500">
          {children}
        </main>
        
        {/* Bagian Script Midtrans sudah dinonaktifkan dengan benar */}
        {/*
        <Script
          id="midtrans-snap"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={...}
          strategy="beforeInteractive"
        />
        */}
      <Footer />
      </body>
    </html>
  );
}