'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerificationHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Memverifikasi email Anda...');

    useEffect(() => {
        const url = window.location.href;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // Ganti domain frontend dengan domain API backend
        const verificationApiUrl = url.replace(window.location.origin + '/auth', apiUrl + '/api');

        const verifyEmail = async () => {
            try {
                // Panggil API backend dengan URL yang sudah dikonstruksi
                const res = await fetch(verificationApiUrl);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Verifikasi gagal.');
                
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => router.push('/login'), 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message);
            }
        };

        verifyEmail();
    }, [router]);

    return (
        <div className="text-center p-8 max-w-md">
            {status === 'loading' && <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />}
            {status === 'success' && <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />}
            {status === 'error' && <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
            <p className="text-lg">{message}</p>
            {status !== 'loading' && (
                <Button asChild className="mt-6"><Link href="/login">Kembali ke Login</Link></Button>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin" />}>
                <VerificationHandler />
            </Suspense>
        </div>
    );
}
