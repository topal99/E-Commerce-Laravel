<?php

namespace App\Http\Controllers\Api;

 use App\Http\Controllers\Controller;
    use App\Models\Product;
    use Illuminate\Http\Request;

    class QuestionController extends Controller
    {
        public function store(Request $request, Product $product)
        {
            $validated = $request->validate(['question_text' => 'required|string|min:10|max:1000']);
            
            $question = $product->questions()->create([
                'user_id' => $request->user()->id,
                'question_text' => $validated['question_text'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pertanyaan Anda berhasil dikirim!',
                'data' => $question->load('user'), // Kirim kembali dengan data user
            ], 201);
        }
    }
    