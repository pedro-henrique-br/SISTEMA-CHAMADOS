<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chamados', function ($user) {
    return true; // Autenticação do canal pode ser feita aqui
});
