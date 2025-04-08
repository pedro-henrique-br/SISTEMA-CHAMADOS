<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use DateTime;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;


require '../vendor/autoload.php';

class EmailSender
{
    /** @var PHPMailer */
    public $mail;

    public function __construct()
    {
        $this->mail = new PHPMailer(true);

        $this->mail->isSMTP();
        $this->mail->IsHTML(true);
        $this->mail->Host       = 'smtp.iphotel.com.br';
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = 'chamados@caprichoveiculos.com.br';
        $this->mail->Password   = 'cpdcapriemail7';
        $this->mail->Port = 587;
        $this->mail->SMTPSecure = "tls";
        $this->mail->CharSet = 'utf-8';
    }

    public function sendMessage($email, $message, $tecnico, $idChamado, $dataAbertura = null)
    {
        $dataAbertura = Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s');

        try {
            $this->mail->setFrom('chamados@caprichoveiculos.com.br', 'Chamados - Capricho Veículos');
            $this->mail->addAddress($email);
            $this->mail->addCC("cpd@caprichoveiculos.com.br");
            $this->mail->Subject = "Chamado: " . $idChamado;
            $this->mail->Body = '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Chamado: ' . $idChamado . ' - Capricho Veículos</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .header {
                background: #003366;
                color: white;
                padding: 15px;
                font-size: 20px;
                font-weight: bold;
                border-radius: 8px 8px 0 0;
            }
            .logo {
                margin-top: 10px;
            }
            .content {
                text-align: left;
                padding: 20px;
                color: #333;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                color: white;
                background: #003366;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <p><strong>' . $tecnico . ' </strong> - ' . $dataAbertura  . '</p>
                <p>' . $message . '</p>
            </div>
            <div class="footer">
              <br>
                Ramal: 3036, 5036, 5007 | Email: cpd@caprichoveiculos.com.br</div>
        </div>
    </body>
    </html>


    ';
            $this->mail->send();
            $this->mail->clearAllRecipients();
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $this->mail->ErrorInfo);
        }
    }
    public function closeTicket($email, $criado_em, $tempo_de_conclusao, $tipo_do_chamado, $tecnico, $idChamado, $user_name)
    {
        try {
            $dataAberturaObj = strtotime($criado_em);
            $dataAberturaObj = date('d/m/Y H:i:s', $dataAberturaObj);
            $tempo_de_conclusao = Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s');
            $this->mail->setFrom('chamados@caprichoveiculos.com.br', 'Chamados - Capricho Veículos');
            $this->mail->addAddress($email);
            $this->mail->addCC("cpd@caprichoveiculos.com.br");
            $this->mail->Subject = "Chamado: " . $idChamado;
            $this->mail->Body = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Fechamento de Chamado - Capricho Veículos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background: #003366;
            color: white;
            padding: 15px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            margin-top: 10px;
        }
        .content {
            text-align: left;
            padding: 20px;
            color: #333;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            color: white;
            background: #003366;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>


<body>
    <div class="container">
        <div class="header">Capricho Veículos - Fechamento de Chamado</div>
        <div class="content">
            <p>Prezado(a) ' . ucfirst($user_name)  .'</p><p>O chamado abaixo foi concluído com sucesso:</p>
            <p>ID do Chamado: <strong>'. $idChamado .'</strong></p>
            <p><strong>Tecnico: </strong>'. $tecnico .'</p>
            <p><strong>Data de Abertura:</strong> ' . $dataAberturaObj .'</p>
            <p><strong>Data de Conclusão:</strong> ' . $tempo_de_conclusao .'</p>
            <p><strong>Descrição:</strong> ' .  $tipo_do_chamado  .'</p>
            <p>Caso tenha alguma dúvida ou precise de mais informações, entre em contato com a equipe de TI.</p>
            <a href="mailto:cpd@caprichoveiculos.com.br" class="button">Enviar E-mail</a>
        </div>
        <div class="footer">
            Ramal: 3036, 5036, 5007 | Email: cpd@caprichoveiculos.com.br</div>
        </div>
    </div>
</body>
</html>
    ';
            $this->mail->send();
            $this->mail->clearAllRecipients();
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $this->mail->ErrorInfo);
        }
    }

    public function SendEmail($email, $subject, $body, $data, $idChamado = null, $dataAbertura)
    {
        try {
            $dataAberturaObj = Carbon::createFromFormat('d/m/Y H:i:s', $dataAbertura, 'America/Sao_Paulo');

            if (!$dataAberturaObj) {
                throw new Exception("Formato de data inválido: " . $dataAbertura);
            }

            // Criar a data de expiração adicionando 1 dia
            $dataExpiracao = $dataAberturaObj->copy()->addDay();

            // Formatar as datas
            $dataFormatada = $dataAberturaObj->format('d/m/Y H:i:s');
            $expiracaoFormatada = $dataExpiracao->format('d/m/Y H:i:s');
            $this->mail->setFrom('chamados@caprichoveiculos.com.br', 'Solicitação de Atendimento');
            $this->mail->addAddress($email);
            $this->mail->Subject = "Solicitação de Atendimento - Capricho Veículos";

            $this->mail->Body = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Solicitação de Atendimento - Capricho Veículos</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    .header {
                        background: #003366;
                        color: white;
                        padding: 15px;
                        font-size: 20px;
                        font-weight: bold;
                        border-radius: 8px 8px 0 0;
                    }
                    .content {
                        text-align: left;
                        padding: 20px;
                        color: #333;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #777;
                    }
                    h1 {
                        font-size: 22px;
                        color: #003366;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">Capricho Veículos - Solicitação de Atendimento</div>
                    <div class="content">
                        <h1>Solicitação de Atendimento</h1>
                        <p>Olá ' . ucfirst($data->user_name) . ', recebemos sua solicitação de atendimento.</p>
                        <p><strong>ID do Chamado:</strong> ' . $idChamado . '</p>
                        <p><strong>Tipo do Chamado:</strong> ' . htmlspecialchars($data->tipo_do_chamado) . '</p>
                        <p><strong>Data/Hora de Abertura:</strong> ' . $dataFormatada . '</p>
                        <p><strong>Data/Hora de Expiração:</strong> ' . $expiracaoFormatada . '</p>
                        <p><strong>Descrição:</strong> ' . htmlspecialchars($data->mensagem) . '</p>
                    </div>
                    <div class="footer">
                        Nossa equipe está trabalhando para atender sua solicitação o mais rápido possível.
                        <br><br>
                        <strong>Contato:</strong> Ramal: 3036, 5036, 5007 | Email: chamados@caprichoveiculos.com.br
                    </div>
                </div>
            </body>
            </html>
            ';

            $this->mail->send();
            $this->mail->clearAllRecipients();
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $this->mail->ErrorInfo);
        }
    }
    public function SendEmailReply($email, $subject, $body, $data, $idChamado = null, $dataAbertura)
    {
        try {
            $dataExpiracao = $dataAbertura;
            $dataFormatada = $dataAbertura;
            $this->mail->setFrom('chamados@caprichoveiculos.com.br', 'Capricho Veiculos TI');
            $this->mail->addAddress($email);
            $this->mail->Subject = "Chamado: " . $idChamado;

            $this->mail->Body = '
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chamado - Capricho Veículos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background: #003366;
            color: white;
            padding: 15px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            margin-top: 10px;
        }
        .content {
            display: flex;
            flex-direction: column;
            gap: 10px;
            text-align: left;
            padding: 20px;
            color: #333;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            color: white;
            background: #003366;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>Olá<strong> ' . ucfirst($data->user_name) . '</strong></p>
            <p>Gostaríamos de informar que um técnico já está verificando seu ticket.</p>
            <p>Chamado: ' . $idChamado . ' - ' . $dataFormatada . '</p>
        </div>
        <div class="footer">
          Atenciosamente.
          <br>
           Equipe de T.I - Capricho Veiculos</div>
    </div>
</body>
</html>


';
            $this->mail->send();
            $this->mail->clearAllRecipients();
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $this->mail->ErrorInfo);
        }
    }
    public function changeTecnico($email, $subject, $body, $data, $idChamado = null, $dataAbertura)
    {
        try {
            $dataExpiracao = $dataAbertura;
            $dataFormatada = $dataAbertura;
            $this->mail->setFrom('chamados@caprichoveiculos.com.br', 'Capricho Veiculos TI');
            $this->mail->addAddress($email);
            $this->mail->Subject = "Chamado: " . $idChamado;

            $this->mail->Body = '
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chamado - Capricho Veículos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background: #003366;
            color: white;
            padding: 15px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            margin-top: 10px;
        }
        .content {
            display: flex;
            flex-direction: column;
            gap: 10px;
            text-align: left;
            padding: 20px;
            color: #333;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            color: white;
            background: #003366;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>Olá<strong> ' . ucfirst($data->user_name) . '</strong></p>
            <p>Gostaríamos de informar que houve uma alteração no técnico do seu chamado.</p>
            <p>Tecnico responsável: <strong>'. $data->tecnico .'</strong> - Chamado: ' . $idChamado . ' - ' . $dataFormatada . '</p>
        </div>
        <div class="footer">
          Atenciosamente.
          <br>
           Equipe de T.I - Capricho Veiculos</div>
    </div>
</body>
</html>


';
            $this->mail->send();
            $this->mail->clearAllRecipients();
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $this->mail->ErrorInfo);
        }
    }
}
