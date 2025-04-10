<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\InviteUserMail;
use Illuminate\Http\Request;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->firstOrFail();
        $token = Str::random(64);

        $user->reset_token = $token;
        $user->reset_token_expires_at = now()->addDays(1);
        $user->save();


        $url = "http://192.168.25.221/reset-password?token={$token}";


        Mail::to($user->email)->send(new ResetPasswordMail($url));

        return response()->json(['message' => 'Link de redefinição de senha enviado.']);
    }

    public function resetPassword(Request $request, $token)
    {
        $request->validate([
            'password' => 'required|confirmed|min:6'
        ]);

        $user = User::where('reset_token', $token)
            ->where('reset_token_expires_at', '>=', now())
            ->firstOrFail();

            if (Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'A nova senha não pode ser igual as anteriores. Escolha uma senha diferente.'
                ], 422);
            }

        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->reset_token_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Senha redefinida com sucesso.']);
    }

    public function validateToken($token)
    {
        $user = User::where('reset_token', $token)
                    ->where('reset_token_expires_at', '>', now())
                    ->where('is_registered', true)
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'Token inválido, expirado ou já utilizado.'], 400);
        }

        return response()->json([
            'message' => 'Token válido.',
            'user' => [
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
