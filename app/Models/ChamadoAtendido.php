<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChamadoAtendido extends Model
{
    use HasFactory;

    /**
     * Especifica a conexão secundária.
     *
     * @var string
     */
    public $timestamps = false;
    protected $connection = 'mysql_secondary';

    /**
     * Nome da tabela associada ao model.
     *
     * @var string
     */
    protected $table = 'chamados_atendidos';

    /**
     * Chave primária da tabela.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Define se a chave primária é autoincrementada.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * Define o tipo da chave primária.
     *
     * @var string
     */
    protected $keyType = 'int';

    /**
     * Define os atributos protegidos contra preenchimento em massa.
     *
     * @var array
     */
    protected $guarded = ['id'];

    /**
     * Define a conversão automática de tipos de dados.
     *
     * @var array
     */
    protected $casts = [
        'tempo_de_conclusao' => 'string', // Se for um número de minutos. Se for datetime, use 'datetime'.
    ];

    /**
     * Define a relação com o usuário.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
