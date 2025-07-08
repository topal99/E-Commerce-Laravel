'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AnswerForm from '@/components/owner/AnswerForm'; // Form yang akan kita buat
import { type Question } from '@/lib/types'; // Import tipe Question

export default function OwnerQnaPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    const token = Cookies.get('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/api/owner/questions`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error("Gagal memuat pertanyaan.");
      const data = await res.json();
      setQuestions(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleOpenAnswerModal = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center">Memuat pertanyaan...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Manajemen Tanya Jawab</h1>
      
      <div className="space-y-6">
        {questions.length > 0 ? questions.map((qna) => (
          <div key={qna.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="border-b pb-4 mb-4">
              <p className="text-sm text-gray-500">Produk: <span className="font-semibold">{qna.product.name}</span></p>
              <p className="mt-2"><strong>Pertanyaan:</strong> "{qna.question_text}"</p>
              <p className="text-xs text-muted-foreground">Ditanyakan oleh {qna.user.name}</p>
            </div>
            {qna.answer ? (
              <div>
                <p className="font-semibold text-blue-600">Jawaban Anda:</p>
                <p className="text-gray-700 italic">"{qna.answer.answer_text}"</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-600">Belum dijawab</p>
                <Button size="sm" onClick={() => handleOpenAnswerModal(qna)}>Jawab Pertanyaan</Button>
              </div>
            )}
          </div>
        )) : <p>Belum ada pertanyaan yang masuk.</p>}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jawab Pertanyaan</DialogTitle>
            <DialogDescription>
              {selectedQuestion?.question_text}
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <AnswerForm
              questionId={selectedQuestion.id}
              onAnswerSubmitted={() => {
                setIsModalOpen(false);
                fetchQuestions(); // Muat ulang data setelah menjawab
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
