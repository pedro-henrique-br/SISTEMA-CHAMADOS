<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use App\Events\TicketUpdated;
use App\Events\TicketDeleted;
use Illuminate\Http\Request;
use App\Models\Chamado;
use App\Models\ChamadoAtendido;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Carbon\Carbon;
use DateTime;
use Illuminate\Support\Facades\DB;

use function PHPUnit\Framework\isEmpty;

class ChamadoController extends Controller
{
    /**
     * Retorna todos os chamados abertos com paginação.
     */
    public function index()
    {
        return response()->json(Chamado::paginate(10), 200); // Retorna 10 registros por página
    }

    /**
     * Cria um novo chamado.
     */
    public $timestamps = false;

    public function store(Request $request)
    {
        try {
            // Validar os campos antes de criar o chamado
            $request->validate([
                'user_name' => 'nullable|string|max:255',
                'mensagem' => 'required|string', // Agora obrigatório
                'prioridade' => 'nullable|in:Baixa,Média,Alta,Crítica',
                'tipo_do_chamado' => 'nullable|string|max:100',
                'tecnico' => 'nullable|string|max:255',
                'email' => 'required|email|max:255',
                'ramal' => 'nullable|string|max:20',
                'departamento' => 'required|string|max:100',
                'image_do_chamado' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048' // Verifica se é uma imagem válida
            ]);

            // Criar o JSON inicial de mensagens
            $mensagens = [
                [
                    "data" => Carbon::now('America/Sao_Paulo')->format('Y-m-d H:i:s'),
                    "mensagem" => $request->mensagem,
                    "id_chamado" => null, // Ainda será definido após a criação
                    "email" => $request->email
                ]
            ];

            // Criar o chamado inicialmente sem a imagem
            $chamado = Chamado::create([
                'user_name' => $request->user_name,
                'mensagem' => $request->mensagem,
                'image_path' => "", // Definido temporariamente
                'prioridade' => $request->prioridade,
                'tipo_do_chamado' => $request->tipo_do_chamado,
                'tecnico' => $request->tecnico,
                'email' => $request->email,
                'mensagens' => json_encode($mensagens),
                'ramal' => $request->ramal,
                'departamento' => $request->departamento,
            ]);

            // Atualizar o ID do chamado na mensagem inicial
            $mensagens[0]['id_chamado'] = $chamado->id;
            $chamado->mensagens = json_encode($mensagens);
            $chamado->save();

            // Se houver uma imagem, salvar dentro da pasta com ID do chamado
            if ($request->hasFile('image_do_chamado')) {
                $image = $request->file('image_do_chamado');
                $image_path = 'assets/images/tickets/' . $chamado->id;

                // Criar a pasta se não existir
                if (!file_exists(public_path($image_path))) {
                    mkdir(public_path($image_path), 0777, true);
                }

                // Salvar a imagem com um nome único
                $image_name = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path($image_path), $image_name);

                // Atualizar o caminho da imagem no banco de dados
                $chamado->image_path = $image_path . '/' . $image_name;
                $chamado->save();
            }

            // Definir datas formatadas para o e-mail
            $dataFormatada = Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s');
            $expiracaoFormatada = Carbon::now('America/Sao_Paulo')->addDays(3)->format('d/m/Y H:i:s');

            // Criar corpo do e-mail com HTML dinâmico
            $emailBody = '
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
                        <p>Olá ' . htmlspecialchars($request->user_name) . ', recebemos sua solicitação de atendimento.</p>
                        <p><strong>ID do Chamado:</strong> ' . $chamado->id . '</p>
                        <p><strong>Tipo do Chamado:</strong> ' . htmlspecialchars($request->tipo_do_chamado) . '</p>
                        <p><strong>Data/Hora de Abertura:</strong> ' . $dataFormatada . '</p>
                        <p><strong>Data/Hora de Expiração:</strong> ' . $expiracaoFormatada . '</p>
                        <p><strong>Descrição:</strong> ' . nl2br(htmlspecialchars($request->mensagem)) . '</p>
                    </div>
                    <div class="footer">
                        Nossa equipe está trabalhando para atender sua solicitação o mais rápido possível.
                        <br><br>
                        <strong>Contato:</strong> Ramal: 3036, 5036, 5007 | Email: chamados@caprichoveiculos.com.br
                    </div>
                </div>
            </body>
            </html>';

            // Enviar e-mail
            (new EmailSender)->SendEmail(
                $request->email,
                "Solicitação de Atendimento",
                $emailBody,
                $request,
                $chamado->id,
                $dataFormatada
            );
            broadcast(new TicketUpdated($chamado, 'novo'));
            return response()->json($chamado, 201);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro ao criar chamado', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Retorna um chamado específico.
     */
    public function show($id)
    {
        try {
            $chamado = Chamado::findOrFail($id);
            return response()->json($chamado, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Chamado não encontrado'], 404);
        }
    }

    public function enviarMensagem(Request $request)
    {
        try {
            $request->validate([
                'id' => 'sometimes|integer',
                'mensagem' => 'nullable|string',
                'tecnico' => 'nullable|string|max:255',
                'email' => 'required|email|max:255',
            ]);
            (new EmailSender)->sendMessage($request->email, $request->mensagem, $request->tecnico, $request->id);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro ao enviar mensagem', 'message' => $e->getMessage()], 500);
        }
    }

    public function addObservation(Request $request, $id)
    {
        try {
            $chamado = Chamado::findOrFail($id);
            $request->validate([
                'mensagem' => 'required|string',
                'tecnico' => 'required|string',
            ]);
            // Converte JSON existente ou inicia um novo array
            $chat = $chamado->chat ? json_decode($chamado->chat, true) : [];

            // Adiciona nova mensagem
            $chat[] = [
                'mensagem' => $request->mensagem,
                'tecnico' => $request->tecnico,
                'dataDoEnvio' => Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s'),
            ];

            // Atualiza a coluna no banco
            $chamado->chat = json_encode($chat);
            $chamado->save();
            $chamadoUpdate = Chamado::where('id', $id); // Isso retorna uma Collection!
            broadcast(new TicketUpdated($chamadoUpdate, 'atualizado'));
            return response()->json($chamado, 200);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro ao enviar mensagem', 'message' => $e->getMessage()], 500);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Chamado não encontrado'], 404);
    }
    }

    /**
     * Atualiza um chamado.
     */
    public function update(Request $request, $id)
    {
        try {
            $chamado = Chamado::findOrFail($id);

            $request->validate([
                'user_id' => 'sometimes|integer',
                'user_name' => 'sometimes|string|max:255',
                'mensagem' => 'sometimes|string',
                'prioridade' => 'sometimes|in:Baixa,Média,Alta,Crítica',
                'tipo_do_chamado' => 'sometimes|string|max:100',
                'tecnico' => 'nullable|string|max:255',
                'email' => 'sometimes|email|max:255',
                'ramal' => 'nullable|string|max:20',
                'image_do_chamado' => 'nullable|string|max:255',
                'departamento' => 'sometimes|string|max:100',
            ]);

            if ($chamado->tecnico === null && !($chamado->tecnico !== null)) {
                (new EmailSender)->SendEmailReply($chamado->email, "Solicitação de atendimento", "", $chamado, $chamado->id, Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s'));
            }
            if ($chamado->tecnico !== null && $chamado->tecnico !== $request->tecnico) {
                (new EmailSender)->changeTecnico($chamado->email, "Alteração de tecnico", "", $request, $chamado->id, Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s'));
            }
            $chamado->update($request->all());
            $chamado->refresh(); // Garante que o objeto foi atualizado no banco

            // Transmite o evento com um único chamado, não uma Collection
            broadcast(new TicketUpdated($chamado, 'atualizado'));
            return response()->json($chamado, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Chamado não encontrado'], 404);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro ao atualizar chamado', 'message' => $e->getMessage()], 500);
        }
    }

    private function formatarTempoConclusao($segundos)
    {
        $dias = floor($segundos / 86400);
        $horas = floor(($segundos % 86400) / 3600);
        $minutos = floor(($segundos % 3600) / 60);
        $segundosRestantes = $segundos % 60; // Segundos restantes

        $resultado = [];

        if ($dias > 0) {
            $resultado[] = $dias . ' dia' . ($dias > 1 ? 's' : '');
        }
        if ($horas > 0) {
            $resultado[] = $horas . ' hora' . ($horas > 1 ? 's' : '');
        }
        if ($minutos > 0) {
            $resultado[] = $minutos . ' minuto' . ($minutos > 1 ? 's' : '');
        }
        if ($minutos == 0 && empty($resultado)) {
            // Se não houver minutos e nenhum tempo foi registrado ainda, mostrar os segundos
            $resultado[] = $segundosRestantes . ' segundo' . ($segundosRestantes > 1 ? 's' : '');
        }

        return implode(' e ', $resultado);
    }

    /**
     * Move um chamado para "Chamados Atendidos" e remove dos chamados abertos.
     */
    public function atenderChamado($id)
    {
        try {
            DB::beginTransaction(); // Inicia uma transação

            $chamado = Chamado::findOrFail($id);

            $tempo_de_conclusao1 = Carbon::now('America/Sao_Paulo')->format('d/m/Y H:i:s');
            $tempo_de_conclusao = Carbon::now('America/Sao_Paulo')->toIso8601String();

            // Calcula a diferença de tempo em segundos
            $tempoConclusao = Carbon::parse($chamado->criado_em, 'America/Sao_Paulo')
                ->diffInSeconds(Carbon::parse($tempo_de_conclusao, 'America/Sao_Paulo'));

            // Exibe em horas:minutos:segundos
            echo gmdate("H:i:s", $tempoConclusao);

            // Formata para exibição legível (ex: "2 horas, 30 minutos")
            $tempoConclusaoFormatado = $this->formatarTempoConclusao($tempoConclusao);


            $chamadoAtendido = ChamadoAtendido::create([
                'user_id' => $chamado->user_id,
                'id_chamado' => $chamado->id,
                'user_name' => $chamado->user_name,
                'mensagem' => $chamado->mensagem,
                'prioridade' => $chamado->prioridade,
                'tipo_do_chamado' => $chamado->tipo_do_chamado,
                'tecnico' => $chamado->tecnico,
                'email' => $chamado->email,
                'ramal' => $chamado->ramal,
                'image_do_chamado' => $chamado->image_do_chamado,
                'departamento' => $chamado->departamento,
                'tempo_de_conclusao' => $tempoConclusaoFormatado, // Formata corretamente
            ]);

            $chamado->delete(); // Remove o chamado original

            DB::commit(); // Confirma a transação
            (new EmailSender)->closeTicket($chamadoAtendido->email, $chamado->criado_em, $tempo_de_conclusao1, $chamadoAtendido->tipo_do_chamado, $chamadoAtendido->tecnico, $chamado->id, $chamadoAtendido->user_name);
            $chamadoUpdate = Chamado::where('id', $id); // Isso retorna uma Collection!
            broadcast(new TicketUpdated($chamadoUpdate, 'atualizado'));
            return response()->json($chamadoAtendido, 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Chamado não encontrado'], 404);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao atender chamado', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Exclui um chamado.
     */
    public function destroy($id)
    {
        try {
            $chamado = Chamado::findOrFail($id);

            $chamadoUpdate = Chamado::where('id', $id); // Isso retorna uma Collection!
            broadcast(new TicketDeleted($id));
            $chamado->delete();
            return response()->json(['message' => 'Chamado excluído com sucesso'], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Chamado não encontrado'], 404);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro ao excluir chamado', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Retorna os chamados atendidos com paginação.
     */
    public function chamadosAtendidos(Request $request)
    {
        $query = ChamadoAtendido::query();

        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->start_date)->format('Y-m-d H:i:s');
            $endDate = Carbon::parse($request->end_date)->format('Y-m-d H:i:s');

            $query->whereBetween('criado_em', [$startDate, $endDate]);
        }


        return response()->json($query->paginate(10), 200);
    }

}
