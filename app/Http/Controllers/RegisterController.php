<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\InviteUserMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,solicitante'
        ]);

        $token = Str::random(64);

        $user = User::create([
            'email' => $request->email,
            'role' => $request->role,
            'email_token' => $token,
            'invitation_expires_at' => now()->addDays(2),
        ]);

        $url = "http://192.168.25.221:8000/register?token={$token}";

        Mail::to($user->email)->send(new InviteUserMail($url));

        return response()->json(['message' => 'Convite enviado com sucesso.']);
    }

    public function validateToken(Request $request)
{
    $token = $request->query('token');

    $user = User::where('email_token', $token)
                ->where('invitation_expires_at', '>', now())
                ->where('is_registered', false)
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


    public function completeRegistration(Request $request, $token)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|confirmed|min:6'
        ]);

        $user = User::where('invitation_token', $token)
            ->where('invitation_expires_at', '>=', now())
            ->firstOrFail();

        $user->name = $request->name;
        $user->password = Hash::make($request->password);
        $user->invitation_token = null;
        $user->invitation_expires_at = null;
        $user->has_completed_registration = true;
        $user->save();

        return response()->json(['message' => 'Cadastro concluído com sucesso.']);
    }
}
