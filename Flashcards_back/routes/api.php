<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\FlashcardsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AiController;
use OpenAI\Laravel\Facades\OpenAI;

use App\Services\GeminiService;

Route::get('/test-gemini', function (GeminiService $gemini) {
    try {
        // Test basic text generation
        $prompt = "Hello! Please introduce yourself and tell me what you can help with.";
        $response = $gemini->generateContent($prompt);
        
        // Test token counting
        $tokenCount = $gemini->countTokens($prompt);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Gemini API is working!',
            'prompt' => $prompt,
            'response' => $response,
            'token_count' => $tokenCount,
            'timestamp' => now()->toDateTimeString()
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gemini API test failed',
            'error' => $e->getMessage(),
            'timestamp' => now()->toDateTimeString()
        ], 500);
    }
});

// Updated test route with correct model names
Route::get('/test-gemini-fixed', function (GeminiService $gemini) {
    $results = [];
    
    // Test with different model names
    $models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    foreach ($models as $model) {
        try {
            $prompt = "what is laravel?";
            $response = $gemini->generateContent($prompt, $model);
            
            $results[$model] = [
                'status' => 'success',
                'response' => $response,
                'length' => strlen($response)
            ];
            
            // If one works, break
            if (!str_contains($response, 'Error:')) {
                break;
            }
            
        } catch (\Exception $e) {
            $results[$model] = [
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }
    
    return response()->json([
        'results' => $results,
        'api_key_configured' => config('services.gemini.api_key') ? 'yes' : 'no',
        'recommendation' => 'Check logs for detailed error messages'
    ]);
});

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully'], 200);
    });

});

// Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
//     return $request->user();
// });


Route::post("/login",function(Request $request) {
    
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string|min:8',
        'device_name' => 'required|string|max:255',
    ]);

    $user = User::where('email', $request->email)->first();
    if (!$user || !Hash::check($request->password, $user->password)) {
        throw  ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ])->status(422);
        
    }

    return response()->json([
        'token' => $user->createToken($request->device_name)->plainTextToken,
        'user' => $user,
    ], 200);
});

Route::post('/register', function (Request $request) {
    // Validate the request data
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed', // expects password_confirmation field
        'device_name' => 'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    // Create the user
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    // Create a token for the device
    $token = $user->createToken($request->device_name)->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user,
    ], 201);
});

// Flashcards routes
Route::resource('flashcards', FlashcardsController::class)->middleware('auth:sanctum');

// Categories routes
Route::prefix('categories')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [App\Http\Controllers\CategoryController::class, 'index']);
    Route::post('/', [App\Http\Controllers\CategoryController::class, 'store']);
    Route::delete('/{id}', [App\Http\Controllers\CategoryController::class, 'deleteCategory']); 
    Route::get('/show/{id}', [App\Http\Controllers\CategoryController::class, 'showCategory']); 
});

Route::post('/ai/generate-flashcards',[ AiController::class, 'generateCardsWithAi'])->middleware('auth:sanctum');

