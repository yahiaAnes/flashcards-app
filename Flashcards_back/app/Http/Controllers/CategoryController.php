<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index()
    {
        return auth()->user()->categories()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name', 
        ]);

        $category = auth()->user()->categories()->create([
            'name' => $validated['name'],
            'user_id' => auth()->id(), 
        ]);
        
        return response()->json($category, 201);
    }

    public function showCategory($id){

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $category = $user->categories()->with('flashcards')->find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json($category, 200);
    }

    public function deleteCategory($id){
        $user = auth()->user();
        $category = $user->categories()->find($id);

        if (!$category) {
            return response()->json(['message' => 'ERR Category not found'], 404);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

}
