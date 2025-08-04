<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatbotController extends Controller
{
    private $ollamaBaseUrl = 'http://localhost:11434';
    private $client;
    private $defaultModel = 'llama3.1:8b';

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => $this->ollamaBaseUrl,
            'timeout'  => 120.0, // Increased timeout for streaming
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ]
        ]);
    }

    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'model' => 'sometimes|string|max:50',
            'context' => 'sometimes|array'
        ]);

        try {
            $model = $validated['model'] ?? $this->defaultModel;
            $context = $validated['context'] ?? [];

            return $this->streamResponse(
                model: $model,
                prompt: $validated['message'],
                context: $context
            );
        } catch (\Exception $e) {
            Log::error('Ollama API Error: ' . $e->getMessage());
           
            return response()->json([
                'error' => 'Chatbot service unavailable',
                'details' => config('app.debug') ? $e->getMessage() : null,
                'success' => false
            ], 503);
        }
    }

    private function streamResponse(string $model, string $prompt, array $context = [])
    {
        return new StreamedResponse(function () use ($model, $prompt, $context) {
            $payload = [
                'model' => $model,
                'prompt' => $prompt,
                'stream' => true, // Enable streaming
                'options' => [
                    'temperature' => 0.7,
                    'top_p' => 0.9,
                    'num_ctx' => 4096
                ]
            ];

            if (!empty($context)) {
                $payload['context'] = $context;
            }

            try {
                $response = $this->client->post('/api/generate', [
                    'json' => $payload,
                    'stream' => true
                ]);

                $body = $response->getBody();
                $fullResponse = '';
                $finalContext = [];

                while (!$body->eof()) {
                    $line = $body->read(1024);
                    
                    if (empty(trim($line))) {
                        continue;
                    }

                    // Split by newlines in case multiple JSON objects are in one read
                    $jsonLines = explode("\n", trim($line));
                    
                    foreach ($jsonLines as $jsonLine) {
                        if (empty(trim($jsonLine))) {
                            continue;
                        }

                        $data = json_decode(trim($jsonLine), true);
                        
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            continue;
                        }

                        if (isset($data['response'])) {
                            $fullResponse .= $data['response'];
                            
                            // Send the chunk to the client
                            echo "data: " . json_encode([
                                'type' => 'chunk',
                                'content' => $data['response'],
                                'done' => $data['done'] ?? false
                            ]) . "\n\n";
                            
                            if (ob_get_level()) {
                                ob_flush();
                            }
                            flush();
                        }

                        // Store final context when done
                        if (isset($data['done']) && $data['done'] && isset($data['context'])) {
                            $finalContext = $data['context'];
                        }

                        // Break if done
                        if (isset($data['done']) && $data['done']) {
                            break 2;
                        }
                    }
                }

                // Send final message with context
                echo "data: " . json_encode([
                    'type' => 'complete',
                    'full_response' => $fullResponse,
                    'context' => $finalContext,
                    'model' => $model
                ]) . "\n\n";

                if (ob_get_level()) {
                    ob_flush();
                }
                flush();

            } catch (\Exception $e) {
                Log::error('Streaming Error: ' . $e->getMessage());
                
                echo "data: " . json_encode([
                    'type' => 'error',
                    'error' => 'Streaming failed: ' . $e->getMessage()
                ]) . "\n\n";
                
                if (ob_get_level()) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    public function listModels()
    {
        try {
            $response = $this->client->get('/api/tags');
            $data = json_decode($response->getBody(), true);

            return response()->json([
                'models' => $data['models'] ?? [],
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Ollama Models Error: ' . $e->getMessage());
           
            return response()->json([
                'error' => 'Failed to fetch models',
                'success' => false
            ], 503);
        }
    }
}