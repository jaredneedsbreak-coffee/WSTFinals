<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'paper_id',
        'type',
        'title',
        'message',
        'is_read',
    ];

    /**
     * Get the user that this notification belongs to
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the paper associated with this notification
     */
    public function paper()
    {
        return $this->belongsTo(ResearchPaper::class);
    }
}
