// src/app/layout.tsx

import type { Metadata } from "next";
// LANGKAH 1: Ubah import font dari Geist menjadi Inter
import { Inter } from "next/font/google"; 
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script"; 

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

              {/* BAGIAN BARU: Integrasi Live Chat
          Letakkan kode Tawk.to di sini menggunakan komponen Script.
          Ganti isi di dalam backtick (`) dengan kode yang Anda salin dari dashboard Tawk.to.
        */}
        {/* <Script id="tawk-to-script" strategy="lazyOnload">
          {`
           var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/686ca823a9b0111910eceab5/1ivk71j06';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script> */}

      </body>
    </html>
  );
}