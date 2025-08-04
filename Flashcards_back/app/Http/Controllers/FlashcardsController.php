<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FlashcardsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Auth::user()->flashcards()->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
       //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'category_id' => 'nullable|exists:categories,id', // Ensure category exists if provided
        ]);

        $flashcard = $user->flashcards()->create([
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'category_id' => $validated['category_id'] ?? null,
            'difficulty' => 'medium',
            'repetition' => 0,
            'last_reviewed_at' => null,
            'next_review_at' => null,
            'user_id' => $user->id,
        ]);

        return response()->json($flashcard, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $flashcard = $user->flashcards()->find($id);
        if (!$flashcard) {
            return response()->json(['message' => 'Flashcard not found'], 404);
        }

        return response()->json($flashcard, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $flashcard = $user->flashcards()->find($id);
        if (!$flashcard) {
            return response()->json(['message' => 'Flashcard not found'], 404);
        }

        $flashcard->delete();
        return response()->json(['message' => 'Flashcard deleted successfully'], 200);
    }
}
