<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTER + return token
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|in:admin,user,reviewer',
        ]);

        // Determine role based on email domain
        $role = $this->determineRoleByEmail($request->email);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);

        // Create Sanctum token
        $token = $user->createToken('app-token')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully',
            'user' => $user,
            'role' => $user->role,
            'token' => $token,
        ], 201);
    }

    // LOGIN + return token
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create Sanctum token
        $token = $user->createToken('app-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'role' => $user->role,
            'token' => $token,
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Determine role based on email domain ONLY
     * Email patterns:
     * - admin@minsu.edu.ph or admin.*@minsu.edu.ph -> admin
     * - *@reviewer.minsu.edu.ph or contains reviewer -> reviewer
     * - Any other email -> user role
     */
    private function determineRoleByEmail($email)
    {
        $emailDomain = explode('@', $email)[1] ?? '';

        // Admin email domain check
        if ($email === 'admin@minsu.edu.ph' || (strpos($email, 'admin') === 0 && strpos($email, '@minsu.edu.ph') !== false)) {
            return 'admin';
        }

        // Reviewer email domain check
        if (strpos($emailDomain, 'reviewer.minsu.edu.ph') !== false || strpos($emailDomain, 'reviewer') !== false || strpos($email, 'reviewer') !== false) {
            return 'reviewer';
        }

        // Default to user
        return 'user';
    }
}
