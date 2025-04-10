<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();

        if ($user->role !== 'administrador') {
            return response()->json(['error' => 'Acesso não autorizado'], 403);
        }

        return $next($request);
    }
}
