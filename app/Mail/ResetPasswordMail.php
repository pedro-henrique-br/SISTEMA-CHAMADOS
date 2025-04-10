<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $url;

    public function __construct($url)
    {
        $this->url = $url;
    }

    public function build()
    {
        return $this->subject('Redefinição de Senha')
                    ->view('emails.forgot-password') // Crie essa view em resources/views/emails/reset-password.blade.php
                    ->with(['url' => $this->url]);
    }
}
