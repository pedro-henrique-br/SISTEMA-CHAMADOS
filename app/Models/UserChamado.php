<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserChamado extends Model
{
    use HasFactory;

    protected $connection = 'mysql_secondary';

    protected $table = 'users_chamados'; // Especifica o schema e tabela
    protected $primaryKey = 'user_name'; // Se for a chave primária
    public $timestamps = false; // Desativa timestamps se não tiver created_at/updated_at

    protected $fillable = [
        'user_name',
        'avatar_path',
    ];
}

