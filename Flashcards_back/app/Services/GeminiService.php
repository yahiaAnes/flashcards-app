<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    }

    /**
     * Generate content using Gemini Pro
     */
    public function generateContent($prompt, $model = 'gemini-pro')
    {
        try {
            $url = $this->baseUrl . $model . ':generateContent?key=' . $this->apiKey;
            
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 1024,
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Debug: Log the full response
                Log::info('Gemini API Response: ' . json_encode($data));
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    return $data['candidates'][0]['content']['parts'][0]['text'];
                }
                
                // Check for safety ratings or other issues
                if (isset($data['candidates'][0]['finishReason'])) {
                    return 'Content blocked due to: ' . $data['candidates'][0]['finishReason'];
                }
                
                return 'No response generated - check logs for details';
            }

            Log::error('Gemini API Error - Status: ' . $response->status() . ' - Body: ' . $response->body());
            return 'Error: API request failed - ' . $response->status();

        } catch (\Exception $e) {
            Log::error('Gemini API Exception: ' . $e->getMessage());
            return 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Generate content with images using Gemini Pro Vision
     */
    public function generateContentWithImage($prompt, $imageData, $mimeType = 'image/jpeg')
    {
        try {
            $response = Http::timeout(30)->post($this->baseUrl . 'gemini-pro-vision:generateContent', [
                'key' => $this->apiKey,
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => base64_encode($imageData)
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response generated';
            }

            Log::error('Gemini Vision API Error: ' . $response->body());
            return 'Error: Unable to process image';

        } catch (\Exception $e) {
            Log::error('Gemini Vision API Exception: ' . $e->getMessage());
            return 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Stream content generation (for real-time responses)
     */
    public function streamContent($prompt, $model = 'gemini-pro')
    {
        try {
            $response = Http::timeout(30)->post($this->baseUrl . $model . ':streamGenerateContent', [
                'key' => $this->apiKey,
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            return $response->body();

        } catch (\Exception $e) {
            Log::error('Gemini Stream API Exception: ' . $e->getMessage());
            return 'Error: ' . $e->getMessage();
        }
    }

    /**
     * Count tokens in a prompt
     */
    public function countTokens($prompt, $model = 'gemini-pro')
    {
        try {
            $url = $this->baseUrl . $model . ':countTokens?key=' . $this->apiKey;
            
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Token count response: ' . json_encode($data));
                return $data['totalTokens'] ?? 0;
            }

            Log::error('Token count error: ' . $response->body());
            return 0;

        } catch (\Exception $e) {
            Log::error('Gemini Token Count Exception: ' . $e->getMessage());
            return 0;
        }
    }
}