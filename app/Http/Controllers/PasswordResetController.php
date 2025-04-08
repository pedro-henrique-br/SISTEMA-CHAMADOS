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
        $user->reset_token_expires_at = now()->addHours(2);
        $user->save();

        $url = URL::temporarySignedRoute(
            'password.reset.form',
            now()->addHours(2),
            ['token' => $token]
        );

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

        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->reset_token_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Senha redefinida com sucesso.']);
    }
}
