<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserChamado;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
class UserChamadoController extends Controller
{
    // 🟢 GET - Buscar usuário pelo nome
    public function getUserByName(Request $request, $user_name)
    {
        // Tente encontrar o usuário existente
        $user = UserChamado::where('user_name', 'LIKE', "%{$user_name}%")->first();
        if (!$user) {
            // Se o usuário não existir, crie um novo
            $user = UserChamado::create([
                'user_name' => $user_name,
                'avatar_path' => null, // Inicialmente sem avatar
            ]);
            return response()->json($user, 201); // Retorna o usuário recém-criado
        }
        // Retorna o usuário encontrado
        return response()->json($user, 200); // 200 OK, pois o usuário existe
    }

    // 🔵 POST - Criar um novo usuário na primeira autenticação
    public function store(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string|unique:users_chamados,user_name',
        ]);

        $user = UserChamado::create([
            'user_name' => $request->user_name,
            'avatar_path' => null, // Inicialmente sem avatar
        ]);

        return response()->json($user, 201);
    }

    // 🟡 PUT - Atualizar o avatar do usuário
    public function updateAvatar(Request $request, $name)
    {
        // Localiza o usuário no banco de dados
        $user = UserChamado::where('user_name', $name)->first();

        // Verifica se o usuário existe
        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado'], 404);
        }

        // Verifica se o arquivo foi enviado
        if (!$request->hasFile('avatar')) {
            return response()->json(['message' => 'Nenhuma imagem foi enviada'], 422);
        }

        $image = $request->file('avatar');

        // Verifica se o arquivo é uma imagem válida
        if (!$image->isValid()) {
            return response()->json(['message' => 'Erro no arquivo de imagem'], 400);
        }

        // Define o diretório do usuário
        $directory = public_path('assets/images/avatars/' . $name);

        // Se a pasta não existir, cria
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0777, true, true);
        }

        // Deleta a imagem antiga, se existir
        if ($user->avatar_path && File::exists(public_path($user->avatar_path))) {
            File::delete(public_path($user->avatar_path));
        }

        // Define o nome do novo arquivo com timestamp para evitar conflitos
        $imageName = time() . '.' . $image->getClientOriginalExtension();

        // Move a nova imagem para a pasta
        $image->move($directory, $imageName);

        // Atualiza o caminho do avatar no banco de dados
        $user->avatar_path = 'assets/images/avatars/' . $name . '/' . $imageName;
        $user->save();

        return response()->json([
            'message' => 'Avatar atualizado com sucesso',
            'user' => [
                'name' => $user->name,
                'avatar' => asset($user->avatar_path)
            ]
        ]);
    }
}

