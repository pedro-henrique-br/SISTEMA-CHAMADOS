<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChamadoController;

Route::prefix('tickets')->group(function () {
    Route::get('/', [ChamadoController::class, 'index'])->name('tickets.index'); // Listar chamados
    Route::post('/', [ChamadoController::class, 'store'])->name('tickets.store'); // Criar chamado
    Route::get('/{id}', [ChamadoController::class, 'show'])->name('tickets.show'); // Exibir chamado
    Route::put('/{id}', [ChamadoController::class, 'update'])->name('tickets.update'); // Atualizar chamado
    Route::delete('/{id}', [ChamadoController::class, 'destroy'])->name('tickets.destroy'); // Deletar chamado
    Route::post('/{id}/atender', [ChamadoController::class, 'atenderChamado'])->name('tickets.atender'); // Mover para atendidos
    Route::post('/mensagem', [ChamadoController::class, 'enviarMensagem'])->name('tickets.enviarMensagem'); // Mover para atendidos
    Route::post('/{id}/addObservation', [ChamadoController::class, 'addObservation'])->name('tickets.addObservation'); // add observação
});
Route::get('/tickets-atendidos', [ChamadoController::class, 'chamadosAtendidos'])->name('tickets.atendidos'); // Listar chamados atendidos

// ==================== AUTHENTICAÇÃO ====================
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

// ==================== REGISTRO DE USUÁRIO (ADMIN -> envia link) ====================
Route::post('/register/invite', [RegisterController::class, 'invite'])->name('register.invite'); // ADMIN envia o convite
Route::get('/register/validate/{token}', [RegisterController::class, 'validateToken'])->name('register.validate'); // valida token do link
Route::post('/register/complete', [RegisterController::class, 'completeRegistration'])->name('register.complete'); // usuário completa cadastro
use Illuminate\Support\Facades\Mail;
use App\Mail\InviteUserMail; // Ou o seu Mailable

Route::get('/teste-email', function () {
    $url = 'http://localhost:3000/register/abc123';

    Mail::to('seuteste@email.com')->send(new InviteUserMail($url));

    return 'E-mail enviado!';
});

// ==================== RESET DE SENHA ====================
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink'])->name('password.forgot'); // envia link de reset
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword'])->name('password.reset'); // redefine a senha com token

// (Opcional) LOGOUT
Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');


// Rota catch-all para React
Route::get('/{any}', function () {
    return view('app'); // Arquivo Blade que chamará o React
})->where('any', '.*');

// Autenticação padrão do Laravel
require __DIR__ . '/auth.php';


