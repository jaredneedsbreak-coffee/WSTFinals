<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticateWithSessionToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Check for Bearer token in Authorization header
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            
            // Check if this token exists in session data (validate against stored tokens)
            // For now, we'll use the session directly if token matches session's auth_token
            if ($request->session()->has('auth_token') && $request->session()->get('auth_token') === $token) {
                $userId = $request->session()->get('user_id');
                if ($userId) {
                    Auth::loginUsingId($userId, false);
                }
            }
        }

        // Ensure web guard is used
        Auth::shouldUse('web');

        return $next($request);
    }
}
