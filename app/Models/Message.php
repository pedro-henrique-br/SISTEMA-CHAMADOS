<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chamado extends Model
{
    use HasFactory;

    protected $connection = 'mysql_secondary';
    public $timestamps = false;
    protected $table = 'chamados';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'user_name',
        'prioridade',
        'mensagem',
        'tipo_do_chamado',
        'tecnico',
        'email',
        'ramal',
        'image_do_chamado',
        'departamento',
        'mensagens', // Agora aceita o campo JSON
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'mensagens' => 'array', // Converte automaticamente para array no PHP
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Adiciona uma nova mensagem ao chamado sem sobrescrever as anteriores.
     */
    public function adicionarMensagem($email, $mensagem)
    {
        $novaMensagem = [
            'email' => $email,
            'mensagem' => $mensagem,
            'data' => now()->format('Y-m-d H:i:s'),
        ];

        $mensagens = $this->mensagens ?? []; // Pega mensagens antigas ou um array vazio
        $mensagens[] = $novaMensagem; // Adiciona a nova mensagem

        $this->update(['mensagens' => $mensagens]); // Salva no banco
    }
}
