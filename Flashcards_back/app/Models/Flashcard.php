<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Flashcard extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'answer',
        'category_id',
        'user_id',
        'difficulty',
        'repetition',
        'last_reviewed_at',
        'next_review_at',
    ];
    protected $casts = [
        'last_reviewed_at' => 'datetime',
        'next_review_at' => 'datetime',
    ];
    protected $attributes = [
        'difficulty' => 'medium', // Default difficulty
        'repetition' => 0, // Default repetition count
    ];
    /**
     * Get the user that owns the flashcard.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
