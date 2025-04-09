<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Chamado;

class TicketUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chamado;
    public $tipo; // Indica se é novo, atualizado, etc.

    public function __construct(Chamado $chamado, string $tipo)
    {
        $this->chamado = $chamado;
        $this->tipo = $tipo; // Define o tipo do evento
    }

    public function broadcastOn()
    {
        return new Channel('chamados'); // Certifique-se que está igual no frontend
    }

    public function broadcastAs()
    {
        return 'chamado'; // Esse nome deve ser o mesmo que será escutado no frontend
    }
}

