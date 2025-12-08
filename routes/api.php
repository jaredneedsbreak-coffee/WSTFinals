<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PaperController;
use App\Http\Controllers\Api\V1\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// CSRF cookie endpoint for session init
Route::get('/csrf-token', function (Request $request) {
    return response()->json(['csrf_token' => csrf_token()]);
});

// View paper file inline (public route - auth handled in controller via query token)
Route::get('/papers/{id}/view', [PaperController::class, 'viewPaper']);

// Authenticated user endpoint
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Paper submission and retrieval (authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    // User paper submission
    Route::post('/papers/submit', [PaperController::class, 'submitPaper']);
    
    // Get user's own papers
    Route::get('/papers/my-papers', [PaperController::class, 'getUserPapers']);
    
    // Get single paper details
    Route::get('/papers/{paperId}', [PaperController::class, 'getPaper']);
    
    // Reviewer submit feedback
    Route::post('/papers/{paperId}/feedback', [PaperController::class, 'submitFeedback']);

    // User resubmit revised paper
    Route::post('/papers/{paperId}/resubmit', [PaperController::class, 'resubmitPaper']);
    Route::get('/papers/{paperId}/editor-content', [PaperController::class, 'getEditableContent']);
    Route::post('/papers/{paperId}/save-edited', [PaperController::class, 'saveEditedContent']);

    // Download paper file (authorized users)
    Route::get('/papers/{id}/download', [PaperController::class, 'downloadPaper']);

    // Delete paper (users can delete their own papers)
    Route::delete('/papers/{paperId}', [PaperController::class, 'deletePaper']);

    // Get announcements
    Route::get('/announcements', [\App\Http\Controllers\Api\V1\AnnouncementController::class, 'index']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'getUserNotifications']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/{notificationId}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notificationId}', [NotificationController::class, 'deleteNotification']);
});

// Admin only routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Get all papers
    Route::get('/admin/papers', [PaperController::class, 'getAllPapers']);
    
    // Assign reviewer to paper
    Route::post('/admin/papers/{paperId}/assign-reviewer', [PaperController::class, 'assignReviewer']);
    
    // Update paper status
    Route::patch('/admin/papers/{paperId}/status', [PaperController::class, 'updatePaperStatus']);
    
    // Get available reviewers
    Route::get('/admin/reviewers', [PaperController::class, 'getReviewers']);
    // Get all users
    Route::get('/admin/users', [PaperController::class, 'getUsers']);
    
    // Get analytics data (monthly submissions, approvals, rejections)
    Route::get('/admin/analytics', [PaperController::class, 'getAnalytics']);

    // Admin announcements
    Route::post('/admin/announcements', [\App\Http\Controllers\Api\V1\AnnouncementController::class, 'store']);
});

// Reviewer only routes
Route::middleware(['auth:sanctum', 'role:reviewer'])->group(function () {
    // Get papers assigned to reviewer
    Route::get('/reviewer/papers', [PaperController::class, 'getReviewerPapers']);
});

// Role-based protected routes (examples)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return response()->json(['message' => 'Admin Dashboard']);
    });
});

Route::middleware(['auth:sanctum', 'role:reviewer'])->group(function () {
    Route::get('/reviewer/dashboard', function () {
        return response()->json(['message' => 'Reviewer Dashboard']);
    });
});

Route::middleware(['auth:sanctum', 'role:user'])->group(function () {
    Route::get('/user/dashboard', function () {
        return response()->json(['message' => 'User Dashboard']);
    });
});

