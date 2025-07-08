'use client';

import { type Product, type Question } from "@/lib/types";
import QuestionForm from "./QuestionForm";

interface QnaSectionProps {
    product: Product;
    onQuestionSubmitted: () => void;
}

export default function QnaSection({ product, onQuestionSubmitted }: QnaSectionProps) {
    const questions = product.questions || [];

    return (
        <div className="py-6">
            <h3 className="text-xl font-semibold mb-4">Pertanyaan Mengenai Produk Ini</h3>
            <div className="mb-8">
                <QuestionForm productId={product.id} onQuestionSubmitted={onQuestionSubmitted} />
            </div>
            <div className="space-y-6">
                {questions.length > 0 ? questions.map((qna: Question) => (
                    <div key={qna.id} className="border-t pt-4">
                        <p className="font-semibold">P: {qna.question_text}</p>
                        <p className="text-xs text-muted-foreground mb-2">Ditanyakan oleh {qna.user.name}</p>
                        {qna.answer ? (
                            <div className="ml-6 mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="font-semibold text-blue-600">J: {qna.answer.answer_text}</p>
                                <p className="text-xs text-muted-foreground">Dijawab oleh {qna.answer.user.name}</p>
                            </div>
                        ) : (
                            <p className="ml-6 text-sm text-gray-400 italic">Belum ada jawaban.</p>
                        )}
                    </div>
                )) : <p>Belum ada pertanyaan untuk produk ini.</p>}
            </div>
        </div>
    );
}
