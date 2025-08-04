<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatbotController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/chatbot', function () {
    return view('chat');
});

Route::post('/chat', [ChatbotController::class, 'chat'])->name('chat.send');
Route::get('/chat/models', [ChatbotController::class, 'listModels'])->name('chat.models');


require __DIR__.'/auth.php';
