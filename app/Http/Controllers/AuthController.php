<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\InviteUserMail;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Facades\JWTAuthAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        return $this->respondWithToken($token);
    }

    public function me(Request $request)
{
    $user = Auth::user();

    if ($user->avatar) {
        $mime = finfo_buffer(finfo_open(), $user->avatar, FILEINFO_MIME_TYPE);
        $user->avatar = 'data:' . $mime . ';base64,' . base64_encode($user->avatar);
    }

    return response()->json($user);
}

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => auth('api')->user()
        ]);
    }

    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }
}
