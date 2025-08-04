<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use OpenAI\Laravel\Facades\OpenAI;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;
use App\Services\DeepSeekService;
use App\Services\GeminiService;

class AiController extends Controller
{
   
    

    public function generateCardsWithAi(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf',
            //'categoryName' => 'required|string',
        ]);

        

        if (!$request->hasFile('file')) {
            return response()->json(['message' => 'No file uploaded'], 422);
        }

        // Get authenticated user
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            // Parse PDF
            $file = $request->file('file')->store('files', 'public'); 
            $pdfText = (new Parser())->parseFile(storage_path("app/public/{$file}"))->getText();

            // Limit text length for API limits (Gemini has token limits)
            $textChunk = substr($pdfText, 0, 4000);
            
            // Enhanced prompt for better structured output
            $prompt = "Analysez ce texte et générez exactement 10 flashcards au format suivant. Chaque flashcard doit être numérotée et suivre ce format strict :

            FLASHCARD 1:
            Q: [Question claire et précise]
            A: [Réponse complète et détaillée]

            FLASHCARD 2:
            Q: [Question claire et précise]
            A: [Réponse complète et détaillée]

            ... et ainsi de suite jusqu'à FLASHCARD 20.

            Règles importantes :
            - Les questions doivent être variées (définitions, concepts, applications, etc.)
            - Les réponses doivent être complètes mais concises
            - Couvrez les points les plus importants du texte
            - Utilisez un langage clair and accessible

            Texte à analyser :
            " . $textChunk;

            // Generate content with Gemini
            $response = $gemini->generateContent($prompt, 'gemini-1.5-flash');
            
            // Check if response contains error
            if (str_contains($response, 'Error:')) {
                return response()->json([
                    'error' => 'Failed to generate content: ' . $response
                ], 500);
            }

            // Enhanced parsing with multiple patterns
            $flashcards = [];
            
            // Pattern 1: FLASHCARD X: format
            preg_match_all('/FLASHCARD\s+\d+:\s*\n\s*Q:\s*(.*?)\n\s*A:\s*(.*?)(?=FLASHCARD\s+\d+:|\z)/s', $response, $matches1, PREG_SET_ORDER);
            
            // Pattern 2: Simple Q: A: format
            if (empty($matches1)) {
                preg_match_all('/Q:\s*(.*?)\n\s*A:\s*(.*?)(?=\nQ:|\z)/s', $response, $matches2, PREG_SET_ORDER);
                $matches1 = $matches2;
            }
            
            // Pattern 3: Numbered format (1. Q: ... A: ...)
            if (empty($matches1)) {
                preg_match_all('/\d+\.\s*Q:\s*(.*?)\n\s*A:\s*(.*?)(?=\d+\.\s*Q:|\z)/s', $response, $matches3, PREG_SET_ORDER);
                $matches1 = $matches3;
            }

            $isNewCategory = filter_var($request->input('isNewCategory'), FILTER_VALIDATE_BOOLEAN);

            if ($isNewCategory) {
                $category = auth()->user()->categories()->create([
                    'name' => $request->categoryName,
                    'user_id' => auth()->id(),
                ]);
            } else {
                $category = auth()->user()->categories()->where('name', $request->categoryName)->firstOrFail();
            }


            // Process matches
            foreach ($matches1 as $match) {
                $question = trim($match[1]);
                $answer = trim($match[2]);
                
                // Skip empty or very short questions/answers
                if (strlen($question) < 10 || strlen($answer) < 5) {
                    continue;
                }
                
                $flashcards[] = [
                    'question' => $question,
                    'answer' => $answer,
                    'category_id' => $category->id,
                    'difficulty' => 'medium',
                    'repetition' => 0,
                    'last_reviewed_at' => null,
                    'next_review_at' => null,
                    'user_id' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // If no flashcards were parsed, try alternative parsing
            if (empty($flashcards)) {
                // Try to parse any question-answer pattern
                $lines = explode("\n", $response);
                $currentQuestion = null;
                $currentAnswer = null;
                
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;
                    
                    if (preg_match('/^(?:Q:|Question:|Que)/i', $line)) {
                        if ($currentQuestion && $currentAnswer) {
                            $flashcards[] = [
                                'question' => $currentQuestion,
                                'answer' => $currentAnswer,
                                'category_id' => 1,
                                'difficulty' => 'medium',
                                'repetition' => 0,
                                'last_reviewed_at' => null,
                                'next_review_at' => null,
                                'user_id' => $user->id,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        }
                        $currentQuestion = preg_replace('/^(?:Q:|Question:|Que)\s*/i', '', $line);
                        $currentAnswer = null;
                    } elseif (preg_match('/^(?:A:|Answer:|Réponse)/i', $line)) {
                        $currentAnswer = preg_replace('/^(?:A:|Answer:|Réponse)\s*/i', '', $line);
                    } elseif ($currentAnswer !== null) {
                        $currentAnswer .= ' ' . $line;
                    }
                }
                
                // Don't forget the last Q&A pair
                if ($currentQuestion && $currentAnswer) {
                    $flashcards[] = [
                        'question' => $currentQuestion,
                        'answer' => $currentAnswer,
                        'category_id' => 1,
                        'difficulty' => 'medium',
                        'repetition' => 0,
                        'last_reviewed_at' => null,
                        'next_review_at' => null,
                        'user_id' => $user->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // Insert flashcards in batch for better performance
            if (!empty($flashcards)) {
                // Limit to maximum 20 flashcards
                $flashcards = array_slice($flashcards, 0, 20);
                
                $user->flashcards()->insert($flashcards);
                
                // Clean up uploaded file
                if (file_exists(storage_path("app/public/{$file}"))) {
                    unlink(storage_path("app/public/{$file}"));
                }
                
                return response()->json([
                    'message' => 'Flashcards created successfully',
                    'count' => count($flashcards)
                ], 201);
            } else {
                return response()->json([
                    'error' => 'Could not parse flashcards from AI response',
                    'raw_response' => substr($response, 0, 500) . '...',
                    'debug_info' => 'Try adjusting the PDF content or contact support'
                ], 500);
            }

        } catch (\Exception $e) {
            // Clean up file on error
            if (isset($file) && file_exists(storage_path("app/public/{$file}"))) {
                unlink(storage_path("app/public/{$file}"));
            }
            
            return response()->json([
                'error' => 'Failed to generate flashcards: ' . $e->getMessage()
            ], 500);
        }
    }
}