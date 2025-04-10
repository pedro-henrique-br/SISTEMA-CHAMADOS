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

class UserController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|confirmed|min:6',
            'role' => ['sometimes', 'in:administrador,solicitante'],
            'avatar' => 'nullable|string' // ou file/image se for upload
        ]);

        if ($request->filled('name'))
            $user->name = $request->name;
        if ($request->filled('email'))
            $user->email = $request->email;
        if ($request->filled('role'))
            $user->role = $request->role;
        if ($request->filled('avatar'))
            $user->avatar = $request->avatar;
        if ($request->filled('password'))
            $user->password = Hash::make($request->password);

        $user->save();

        return response()->json(['message' => 'Dados atualizados com sucesso']);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'avatar' => 'nullable|file|mimes:jpg,jpeg,png|max:2048' // até 2MB
        ]);

        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar')->get(); // conteúdo binário
            $user->avatar = $avatar;
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'user' => $user
        ]);
    }

}
