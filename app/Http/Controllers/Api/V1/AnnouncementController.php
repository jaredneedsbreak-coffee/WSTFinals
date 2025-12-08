<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    // List announcements visible to the current user
    public function index(Request $request)
    {
        $role = $request->user()->role ?? 'user';

        $announcements = Announcement::where(function($q) use ($role) {
            $q->where('visible_to', 'all')
              ->orWhere('visible_to', $role);
        })->orderBy('created_at', 'desc')->get();

        return response()->json(['announcements' => $announcements]);
    }

    // Admin creates an announcement or event
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'visible_to' => 'nullable|in:all,user,reviewer',
            'type' => 'required|in:announcement,event',
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'body' => $request->body,
            'created_by' => $request->user()->id,
            'visible_to' => $request->visible_to ?? 'all',
            'type' => $request->type,
        ]);

        return response()->json(['message' => 'Post created', 'announcement' => $announcement]);
    }
}
