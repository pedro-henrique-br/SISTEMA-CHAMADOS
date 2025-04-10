<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Foundation\Auth\SessionGuard;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    protected $fillable = [
        'name',
        'avatar',
        'role',
        'email',
        'password',
        'email_token',
        'is_registered',
        "invitation_expires_at",
        "reset_token",
        "reset_token_expires_at"
    ];

    protected $hidden = [
        'password',
        'reset_token',
        'email_token',
    ];

    protected $casts = [
        'is_registered' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    // Hash automático da senha
    public function setPasswordAttribute($value)
    {
        if (!Hash::needsRehash($value)) {
            $this->attributes['password'] = $value;
        } else {
            $this->attributes['password'] = Hash::make($value);
        }
    }


    // Verifica se o link de registro ainda é válido (considerando 2 dias de validade)
    public function isEmailTokenValid()
    {
        if (!$this->email_token || !$this->created_at) {
            return false;
        }

        return $this->created_at->addDays(2)->isFuture();
    }
}
