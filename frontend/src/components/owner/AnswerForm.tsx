'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import toast from 'react-hot-toast';
import Cookies from "js-cookie";

interface AnswerFormProps {
    questionId: number;
    onAnswerSubmitted: () => void;
}

export default function AnswerForm({ questionId, onAnswerSubmitted }: AnswerFormProps) {
    const [answerText, setAnswerText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answerText.trim()) {
            toast.error("Jawaban tidak boleh kosong.");
            return;
        }
        setIsSubmitting(true);
        const token = Cookies.get('auth_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/api/owner/questions/${questionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ answer_text: answerText }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            toast.success("Jawaban berhasil dikirim!");
            onAnswerSubmitted();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
                <Label htmlFor="answer">Jawaban Anda</Label>
                <Textarea 
                    id="answer"
                    placeholder="Tulis jawaban Anda di sini..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="mt-1"
                    rows={5}
                />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
            </Button>
        </form>
    );
}
