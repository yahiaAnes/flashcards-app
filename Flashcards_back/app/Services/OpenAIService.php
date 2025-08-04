<?php 


namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenAIService
{
    public function chat($messages)
    {
        $response = Http::withToken(config('services.openai.key'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => $messages,
                'temperature' => 0.7,
            ]);

        return $response->json();
    }
}
