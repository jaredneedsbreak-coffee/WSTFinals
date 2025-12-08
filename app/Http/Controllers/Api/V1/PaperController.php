<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ResearchPaper;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html as PhpWordHtml;

class PaperController extends Controller
{
    /**
     * Submit a new research paper
     */
    public function submitPaper(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'paper' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // Store uploaded file with original filename in the public disk under 'papers'
        $originalFileName = $request->file('paper')->getClientOriginalName();
        $path = $request->file('paper')->storeAs('papers', $originalFileName, 'public');
        // Public URL (for convenience) - assumes `php artisan storage:link` was run
        $publicUrl = asset('storage/' . $path);

        $paper = ResearchPaper::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            // some installations have NOT nullable abstract column; save empty string to avoid integrity errors
            'abstract' => $request->input('abstract', ''),
            'description' => $request->input('description', ''),
            // Save relative storage path so we can serve/download securely later
            'file_path' => $path,
            'status' => 'submitted',
        ]);

        return response()->json([
            'message' => 'Paper submitted successfully',
            'paper' => $paper,
            'public_url' => $publicUrl,
        ], 201);
    }

    /**
     * View a paper file inline (authorized users only)
     */
    public function viewPaper(Request $request, $paperId)
    {
        $paper = ResearchPaper::findOrFail($paperId);

        // Authorization: allow owner, assigned reviewer, or admins
        $user = $request->user();
        if (!$user) {
            // Try to authenticate via query token (for iframe usage)
            $token = $request->query('token');
            if ($token) {
                $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($personalAccessToken) {
                    $user = $personalAccessToken->tokenable;
                }
            }
        }
        
        if (!$user || ($user->role !== 'admin' && $paper->user_id !== $user->id && $paper->reviewer_id !== $user->id)) {
            return response()->json(['message' => 'Unauthorized to view this file'], 403);
        }

        $stored = $paper->file_path;
        // Normalize stored path: if a full public URL was stored previously, extract the storage path
        if (strpos($stored, 'http') === 0) {
            $pos = strpos($stored, '/storage/');
            if ($pos !== false) {
                $rel = substr($stored, $pos + strlen('/storage/'));
            } else {
                $rel = 'papers/' . basename($stored);
            }
        } else {
            $rel = $stored;
        }

        if (!\Storage::disk('public')->exists($rel)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $full = \Storage::disk('public')->path($rel);
        $ext = pathinfo($full, PATHINFO_EXTENSION);
        
        // Determine mime type based on extension
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain',
        ];
        $mime = $mimeTypes[$ext] ?? 'application/octet-stream';

        // Add CORS headers for iframe access
        return response()->file($full, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($full) . '"',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Download a paper file (authorized users only)
     */
    public function downloadPaper(Request $request, $paperId)
    {
        $paper = ResearchPaper::findOrFail($paperId);

        // Authorization: allow owner, assigned reviewer, or admins
        $user = $request->user();
        if ($user->role !== 'admin' && $paper->user_id !== $user->id && $paper->reviewer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to download this file'], 403);
        }

        $stored = $paper->file_path;
        // Normalize stored path: if a full public URL was stored previously, extract the storage path
        if (strpos($stored, 'http') === 0) {
            $pos = strpos($stored, '/storage/');
            if ($pos !== false) {
                $rel = substr($stored, $pos + strlen('/storage/'));
            } else {
                $rel = 'papers/' . basename($stored);
            }
        } else {
            $rel = $stored;
        }

        if (!\Storage::disk('public')->exists($rel)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $full = \Storage::disk('public')->path($rel);
        $name = $paper->title . '.' . pathinfo($full, PATHINFO_EXTENSION);

        return response()->download($full, $name);
    }

    /**
     * Get all papers submitted by the current user
     */
    public function getUserPapers(Request $request)
    {
        $papers = ResearchPaper::where('user_id', $request->user()->id)
            ->with('reviewer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'papers' => $papers,
        ]);
    }

    /**
     * Get all papers (admin view)
     */
    public function getAllPapers()
    {
        $papers = ResearchPaper::with('user', 'reviewer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'papers' => $papers,
        ]);
    }

    /**
     * Get papers assigned to current reviewer
     */
    public function getReviewerPapers(Request $request)
    {
        $papers = ResearchPaper::where('reviewer_id', $request->user()->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'papers' => $papers,
        ]);
    }

    /**
     * Admin assigns a reviewer to a paper
     */
    public function assignReviewer(Request $request, $paperId)
    {
        $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'admin_notes' => 'nullable|string',
        ]);

        $paper = ResearchPaper::findOrFail($paperId);

        // Verify reviewer exists and has reviewer role
        $reviewer = User::findOrFail($request->reviewer_id);
        if ($reviewer->role !== 'reviewer') {
            return response()->json(['message' => 'Selected user is not a reviewer'], 400);
        }

        $paper->update([
            'reviewer_id' => $request->reviewer_id,
            'status' => 'under_review',
            'admin_notes' => $request->admin_notes,
        ]);

        // Create notification for paper owner
        Notification::create([
            'user_id' => $paper->user_id,
            'paper_id' => $paper->id,
            'type' => 'reviewer_assigned',
            'title' => 'Reviewer Assigned',
            'message' => "Admin has assigned {$reviewer->name} to review your paper: {$paper->title}",
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Reviewer assigned successfully',
            'paper' => $paper,
        ]);
    }

    /**
     * Update paper status (admin)
     */
    public function updatePaperStatus(Request $request, $paperId)
    {
        $request->validate([
            'status' => 'required|in:submitted,under_review,approved,rejected,revision_needed',
            'admin_notes' => 'nullable|string',
        ]);

        $paper = ResearchPaper::findOrFail($paperId);
        $paper->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
        ]);

        return response()->json([
            'message' => 'Paper status updated',
            'paper' => $paper,
        ]);
    }

    /**
     * Reviewer submits feedback
     */
    public function submitFeedback(Request $request, $paperId)
    {
        $request->validate([
            'feedback' => 'required|string',
            'status' => 'required|in:approved,rejected,revision_needed',
        ]);

        $paper = ResearchPaper::findOrFail($paperId);

        // Verify current user is the assigned reviewer
        if ($paper->reviewer_id !== $request->user()->id) {
            return response()->json(['message' => 'You are not assigned to this paper'], 403);
        }

        $paper->update([
            'feedback' => $request->feedback,
            'status' => $request->status,
        ]);

        // Create notification for paper owner
        $reviewer = $request->user();
        Notification::create([
            'user_id' => $paper->user_id,
            'paper_id' => $paper->id,
            'type' => 'feedback_sent',
            'title' => 'Feedback Received',
            'message' => "{$reviewer->name} has sent feedback on your paper: {$paper->title}",
            'is_read' => false,
        ]);

        // Include edited file_path (from autosave) in response so frontend knows it's available
        return response()->json([
            'message' => 'Feedback submitted successfully',
            'paper' => $paper,
            'edited_file_path' => $paper->file_path,
        ]);
    }

    /**
     * Get a single paper with full details
     */
    public function getPaper($paperId)
    {
        $paper = ResearchPaper::with('user', 'reviewer')->findOrFail($paperId);

        return response()->json([
            'paper' => $paper,
        ]);
    }

    /**
     * Get all available reviewers
     */
    public function getReviewers()
    {
        $reviewers = User::where('role', 'reviewer')->select('id', 'name', 'email')->get();

        return response()->json([
            'reviewers' => $reviewers,
        ]);
    }

    /**
     * Get all users (admin view)
     */
    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Return editable HTML content for a paper (doc/docx) for the reviewer
     */
    public function getEditableContent(Request $request, $paperId)
    {
        $paper = ResearchPaper::findOrFail($paperId);

        // Authorization: allow owner, assigned reviewer, or admins
        $user = $request->user();
        $isOwner = $paper->user_id === $user->id;
        $isReviewer = $paper->reviewer_id === $user->id;
        $isAdmin = $user->role === 'admin';
        
        if (!$isOwner && !$isReviewer && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized to edit this file'], 403);
        }

        $rel = $paper->file_path;
        if (!\Storage::disk('public')->exists($rel)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $full = \Storage::disk('public')->path($rel);
        $ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));

        // Only support docx/doc for editable output
        if (!in_array($ext, ['docx', 'doc'])) {
            return response()->json(['message' => 'File type not supported for editing'], 400);
        }

        try {
            $phpWord = IOFactory::load($full);
            // Create HTML writer and capture output
            $writer = IOFactory::createWriter($phpWord, 'HTML');
            ob_start();
            $writer->save('php://output');
            $html = ob_get_clean();

            return response()->json(['html' => $html]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to parse document', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Save edited HTML content back to a new docx and attach to the paper
     */
    public function saveEditedContent(Request $request, $paperId)
    {
        $paper = ResearchPaper::findOrFail($paperId);

        // Authorization: allow admin, paper owner, or assigned reviewer
        $user = $request->user();
        $isOwner = $paper->user_id === $user->id;
        $isReviewer = $paper->reviewer_id === $user->id;
        $isAdmin = $user->role === 'admin';
        
        if (!$isOwner && !$isReviewer && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized to save this file'], 403);
        }

        $request->validate([
            'edited_html' => 'required|string',
        ]);

        $html = $request->input('edited_html');
        
        \Log::debug('saveEditedContent called', ['paperId' => $paperId, 'user_id' => $user->id, 'html_length' => strlen($html)]);

        try {
            // Normalize HTML to be proper XHTML for DOMDocument
            // Replace self-closing tags with XHTML versions
            $cleanHtml = preg_replace('/<br>/', '<br/>', $html);
            $cleanHtml = preg_replace('/<hr>/', '<hr/>', $cleanHtml);
            $cleanHtml = preg_replace('/<img([^>]*)>/', '<img$1/>', $cleanHtml);
            
            // Wrap in a root element for parsing
            $cleanHtml = '<div>' . $cleanHtml . '</div>';
            
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();
            PhpWordHtml::addHtml($section, $cleanHtml, false, false);

            // Get original filename from paper
            $originalFileName = basename($paper->file_path);
            // Generate filename with original name in edited_papers folder
            $filename = 'edited_papers/' . pathinfo($originalFileName, PATHINFO_FILENAME) . '_reviewed.' . pathinfo($originalFileName, PATHINFO_EXTENSION);
            $tempPath = sys_get_temp_dir() . '/' . basename($filename);

            $writer = IOFactory::createWriter($phpWord, 'Word2007');
            $writer->save($tempPath);

            // store in public disk with original-based filename
            $stored = \Storage::disk('public')->putFileAs('edited_papers', new \Illuminate\Http\File($tempPath), basename($filename));

            // update paper file_path to point to edited file (optional: keep history)
            $paper->file_path = $stored;
            $paper->save();

            // Create notification for paper owner (first edit notification only)
            if (!Notification::where('paper_id', $paper->id)
                ->where('type', 'being_reviewed')
                ->exists()) {
                $reviewer = User::find($paper->reviewer_id);
                if ($reviewer) {
                    Notification::create([
                        'user_id' => $paper->user_id,
                        'paper_id' => $paper->id,
                        'type' => 'being_reviewed',
                        'title' => 'Paper Under Review',
                        'message' => "Your paper is being reviewed by {$reviewer->name}",
                        'is_read' => false,
                    ]);
                }
            }

            // cleanup temp file
            @unlink($tempPath);

            return response()->json(['message' => 'Saved edited document', 'file_path' => $stored]);
        } catch (\Exception $e) {
            \Log::error('saveEditedContent error', ['paperId' => $paperId, 'error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
            return response()->json(['message' => 'Failed to save edited document', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get analytics data: monthly submissions, approvals, and rejections
     */
    public function getAnalytics()
    {
        // Get data for the last 12 months
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subMonths($i);
            $months[$date->format('Y-m')] = [
                'month' => $date->format('M Y'),
                'submitted' => 0,
                'approved' => 0,
                'rejected' => 0,
                'revision' => 0,
                'under_review' => 0,
            ];
        }

        // Get submitted papers (by created_at)
        $submitted = ResearchPaper::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        // Get approved papers (by updated_at when status changed to approved)
        $approved = ResearchPaper::where('status', 'approved')
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        // Get rejected papers (by updated_at when status changed to rejected)
        $rejected = ResearchPaper::where('status', 'rejected')
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        // Get revision papers (by updated_at when status changed to revision)
        $revision = ResearchPaper::where('status', 'revision')
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        // Get under_review papers (by updated_at when status changed to under_review)
        $under_review = ResearchPaper::where('status', 'under_review')
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->pluck('count', 'month');

        // Populate the months array with actual data
        foreach ($months as $key => &$data) {
            $data['submitted'] = $submitted[$key] ?? 0;
            $data['approved'] = $approved[$key] ?? 0;
            $data['rejected'] = $rejected[$key] ?? 0;
            $data['revision'] = $revision[$key] ?? 0;
            $data['under_review'] = $under_review[$key] ?? 0;
        }

        return response()->json([
            'analytics' => array_values($months),
        ]);
    }

    /**
     * Delete a paper (user can delete their own papers)
     */
    public function deletePaper(Request $request, $paperId)
    {
        $paper = ResearchPaper::findOrFail($paperId);

        // Authorization: allow owner or admins only
        $user = $request->user();
        if ($user->role !== 'admin' && $paper->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this paper'], 403);
        }

        // Delete associated files if they exist
        $filePath = $paper->file_path;
        if ($filePath && \Storage::disk('public')->exists($filePath)) {
            \Storage::disk('public')->delete($filePath);
        }

        // Delete the paper record
        $paper->delete();

        return response()->json([
            'message' => 'Paper deleted successfully',
        ]);
    }

    /**
     * Resubmit a revised paper
     */
    public function resubmitPaper(Request $request, $paperId)
    {
        $request->validate([
            'paper' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $paper = ResearchPaper::findOrFail($paperId);

        // Authorization: only the paper owner can resubmit
        if ($paper->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to resubmit this paper'], 403);
        }

        // Only allow resubmission if status is revision_needed
        if ($paper->status !== 'revision_needed') {
            return response()->json(['message' => 'This paper cannot be resubmitted'], 400);
        }

        // Delete old file if it exists
        if ($paper->file_path && \Storage::disk('public')->exists($paper->file_path)) {
            \Storage::disk('public')->delete($paper->file_path);
        }

        // Store new file
        $originalFileName = $request->file('paper')->getClientOriginalName();
        $path = $request->file('paper')->storeAs('papers', $originalFileName, 'public');
        $publicUrl = asset('storage/' . $path);

        // Update paper with new file and reset status to submitted
        $paper->update([
            'file_path' => $path,
            'status' => 'submitted',
            'feedback' => null, // Clear previous feedback
        ]);

        // Create notification for the reviewer if assigned
        if ($paper->reviewer_id) {
            Notification::create([
                'user_id' => $paper->reviewer_id,
                'title' => 'Paper Resubmitted',
                'message' => "A revised paper '{$paper->title}' has been resubmitted for review.",
                'type' => 'paper_resubmitted',
                'related_id' => $paper->id,
            ]);
        }

        // Create notification for admin (if an admin exists)
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'Paper Resubmitted',
                'message' => "Paper '{$paper->title}' by {$request->user()->name} has been resubmitted.",
                'type' => 'paper_resubmitted',
                'related_id' => $paper->id,
            ]);
        }

        return response()->json([
            'message' => 'Paper resubmitted successfully',
            'paper' => $paper->load('user', 'reviewer'),
            'public_url' => $publicUrl,
        ], 200);
    }
}
