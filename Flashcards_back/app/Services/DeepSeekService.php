<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class DeepSeekService
{
    protected $client;
    protected $apiKey;
    protected $apiUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.deepseek.api_key');
        $this->apiUrl = config('services.deepseek.api_url');
    }

    /**
     * Send a prompt to DeepSeek API and get the response.
     *
     * @param string $prompt
     * @param string $model (e.g., 'deepseek-chat')
     * @return array
     * @throws GuzzleException
     */
    public function generateResponse(string $prompt, string $model = 'deepseek-chat')
    {
        $response = $this->client->post($this->apiUrl, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ],
        ]);

        return json_decode($response->getBody(), true);
    }
}