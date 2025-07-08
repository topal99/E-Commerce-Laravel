'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import toast from 'react-hot-toast';
import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/authStore";
import Link from 'next/link';

interface QuestionFormProps {
    productId: number;
    onQuestionSubmitted: () => void;
}

export default function QuestionForm({ productId, onQuestionSubmitted }: QuestionFormProps) {
    const { user } = useAuthStore();
    const [question, setQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!question.trim()) {
            toast.error("Pertanyaan tidak boleh kosong.");
            return;
        }
        setIsSubmitting(true);
        const token = Cookies.get('auth_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/api/products/${productId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ question_text: question }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            toast.success("Pertanyaan Anda berhasil dikirim!");
            onQuestionSubmitted();
            setQuestion("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!user || user.role !== 'customer') {
        return (
            <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <p className="text-sm text-muted-foreground">
                    Hanya pelanggan yang dapat bertanya. Silakan <Link href="/login" className="underline text-primary">login</Link> terlebih dahulu.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Textarea 
                placeholder="Punya pertanyaan? Tanyakan di sini..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Pertanyaan"}
            </Button>
        </div>
    );
}
