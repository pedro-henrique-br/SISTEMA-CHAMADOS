<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class TicketDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticketId;

    public function __construct($ticketId)
    {
        $this->ticketId = $ticketId;
    }

    public function broadcastOn()
    {
        return new Channel('chamados'); // Certifique-se de que está igual no frontend
    }

    public function broadcastAs()
    {
        return 'chamado-deletado'; // Deve ser o mesmo nome escutado no frontend
    }
}
