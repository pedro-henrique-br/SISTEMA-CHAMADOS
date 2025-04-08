<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'avatar',
        'role',
        'email',
        'password',
        'email_token',
        'is_registered',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_token',
    ];

    protected $casts = [
        'is_registered' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    // Hash automático da senha
    public function setPasswordAttribute($value)
    {
        if ($value) {
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
