<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Redefinição de Senha - Grupo Sabedoria</title>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 30px;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        <tr>
            <td style="padding: 30px; text-align: center;">
                <img src="public/assets/images/logos/logo_sabedoria.jpg" alt="Grupo Sabedoria" style="margin-bottom: 20px; height: 50px;">
                <h2 style="color: #333333; font-weight: 600;">🔒 Redefinição de Senha</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                    Recebemos um pedido para redefinir a senha da sua conta no <strong>Grupo Sabedoria - Chamados</strong>.
                </p>
                <p style="color: #555555; font-size: 16px;">
                    Para continuar com a redefinição, clique no botão abaixo. O link é válido por <strong>2 dias</strong>.
                </p>

                <a href="{{ $url }}" style="
                    display: inline-block;
                    margin-top: 30px;
                    padding: 14px 28px;
                    background-color: #ada333;
                    color: white;
                    text-decoration: none;
                    border-radius: 30px;
                    font-size: 16px;
                    font-weight: 500;
                ">Redefinir Senha</a>

                <p style="margin-top: 40px; font-size: 12px; color: #999999;">
                    Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
