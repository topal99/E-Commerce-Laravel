'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function VerifySuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Verifikasi Berhasil!</h1>
        
        <p className="text-muted-foreground mb-8">
          Terima kasih! Akun Anda telah berhasil diaktifkan. Anda sekarang dapat login dan mulai berbelanja.
        </p>
        
        <Button asChild size="lg" className="w-full bg-black text-white">
          <Link href="/login">Lanjutkan ke Halaman Login</Link>
        </Button>
      </div>
    </div>
  );
}