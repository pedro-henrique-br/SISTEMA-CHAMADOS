import { create } from "zustand";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { api } from "../../utils/api"; // Função de fetch

const useUserStore = create((set) => ({
    user: {
        name: Cookies.get("user_name"),
        avatar: null,  // Inicializando avatar como null
    },
    loading: false,
    error: null,

    // Função para buscar os dados do usuário
    fetchUser: async () => {
        set({ loading: true, error: null });  // Inicia o carregamento
        try {
            const response = await api.getUser(Cookies.get("user_name"));
            // Atualiza o estado do usuário
            set({
                user: {
                    name: response.user_name,
                    avatar: `http://127.0.0.1:8000/${response?.avatar_path.replace(/\\/g, '/')}`,
                },
                loading: false,  // Finaliza o carregamento
            });
        } catch (error) {
            set({
                error: "Erro ao carregar os dados do usuário",  // Mensagem de erro
                loading: false,  // Finaliza o carregamento mesmo em caso de erro
            });
        }
    },

    // Função para atualizar o usuário
    updateUser: (updatedUser) => {
        set({
            user: { ...updatedUser }
        });
    },

    // Função para atualizar o avatar (ou qualquer outra informação)
    updateAvatar: async (formData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.updateAvatar(formData); // API para atualização de avatar
            set({
                user: {
                    ...response.user,  // Supondo que a resposta da API tenha os dados do usuário atualizados
                },
                loading: false,
            });
            toast.success("Avatar atualizado com sucesso");
        } catch (error) {
            set({
                error: "Erro ao atualizar o avatar",
                loading: false,
            });
            toast.error("Erro ao atualizar avatar");
        }
    }
}));

export default useUserStore;
