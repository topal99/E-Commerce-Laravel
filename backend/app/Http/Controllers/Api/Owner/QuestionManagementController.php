<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionManagementController extends Controller
{
    /**
     * Mengambil semua pertanyaan untuk produk milik owner.
     */
    public function index(Request $request)
    {
        $owner = $request->user();
        $ownerProductIds = $owner->products()->pluck('id');

        $questions = Question::whereIn('product_id', $ownerProductIds)
                             ->with(['product:id,name', 'user:id,name', 'answer']) // Ambil data relevan
                             ->latest()
                             ->get();
        
        return response()->json(['data' => $questions]);
    }

    /**
     * Menyimpan jawaban untuk sebuah pertanyaan.
     */
    public function storeAnswer(Request $request, Question $question)
    {
        // 1. Otorisasi: Pastikan hanya pemilik produk yang bisa menjawab.
        if ($request->user()->id !== $question->product->user_id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // 2. Validasi
        $validated = $request->validate([
            'answer_text' => 'required|string|min:3|max:1000',
        ]);

        // 3. Simpan atau perbarui jawaban
        $answer = $question->answer()->updateOrCreate(
            ['question_id' => $question->id], // Kunci untuk mencari
            [
                'user_id' => $request->user()->id, // ID owner yang menjawab
                'answer_text' => $validated['answer_text'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Jawaban berhasil dikirim!',
            'data' => $answer->load('user'),
        ], 201);
    }
}
