import { create } from "zustand";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { auth } from "../../utils/auth"; // Função de fetch

const useUserStore = create((set) => ({
    user: {
        name: Cookies.get("user_name"),
        avatar: null,  // Inicializando avatar como null
        email: null
    },
    loading: false,
    error: null,

    // Função para buscar os dados do usuário
    fetchUser: async () => {
        set({ loading: true, error: null });  // Inicia o carregamento
        try {
            const response = await auth.getAuthUserData();
            // Atualiza o estado do usuário
            set({
                user: {
                    name: response.name,
                    avatar: response.avatar,
                    email: response.email
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
            const response = await auth.updateAvatar(formData); // API para atualização de avatar
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
