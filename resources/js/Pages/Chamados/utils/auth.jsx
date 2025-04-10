import axios from "axios";
import { Bounce, toast } from "react-toastify";
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

const login = async (email, password) => {
    try {
        const response = await axios.post(`/login`, {
            email: email,
            password: password,
        });

        const user = response.data.user;
        if (user) {
            Cookies.set("user_name", user.name, { expires: 1 }); // expira em 1 dia
            Cookies.set("user_role", user.role, { expires: 1 }); // opcional
            toast.success("Login bem-sucedido");
        } else {
            toast.error("Erro ao autenticar");
        }
    } catch (error) {
        if (error.response?.status === 401) {
            toast.error("Credenciais inválidas");
        } else {
            toast.error("Erro ao tentar logar");
        }

        throw error.response ? error.response.data : { error: "Erro desconhecido" };
    }
};

const sendInvite = async () => {
    try {
        const response = await axios.post(`/login`, {
            email: email,
        });

        const user = response.data.user;
        if (user) {
            Cookies.set("user_name", user.name, { expires: 1 }); // expira em 1 dia
            Cookies.set("user_role", user.role, { expires: 1 }); // opcional
            toast.success("Login bem-sucedido");
        } else {
            toast.error("Erro ao autenticar");
        }
    } catch (error) {
        if (error.response?.status === 401) {
            toast.error("Credenciais inválidas");
        } else {
            toast.error("Erro ao tentar logar");
        }

        throw error.response ? error.response.data : { error: "Erro desconhecido" };
    }

}

const updateAvatar = async (formData) => {
    try {
        const response = await axios.post('/user/update-profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true, // se estiver usando cookies
        });

        toast.success(response.data.message);
    } catch (error) {
        toast.error("Erro ao atualizar perfil");
        console.error(error);
    }
}

const getAuthUserData = () => {
    try {
        const response = axios.get("/me") // `withCredentials` caso use cookies/sessão
        return response.data;
    } catch (error) {
        console.error(error)
    }

}

const recoverPasswordInvite = () => {

}
const resetPassword = () => {

}

export const auth = {
    login,
    updateAvatar,
    getAuthUserData,
    sendInvite,
    recoverPasswordInvite,
    resetPassword
};
