import axios from "axios";
import { Bounce, toast } from "react-toastify";
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom";

const login = async (username, password) => {
    try {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        const response = await axios.post(
            `http://127.0.0.1:8000/tickets/login`,
            {
                username,
                password,
            },
            {
                headers: { 'X-CSRF-TOKEN': token },
            }
        );

        if (response.data.user && response.data.user.admincount[0] == 1) {
            const user_name = response.data.user.samaccountname[0];
            await getUser(user_name); // Tenta pegar o usuário no DB
            Cookies.set("user_name", user_name, { expires: 7 });
            toast.success("Login bem-sucedido");
        } else if (response.data.user && response.data.user.admincount[0] === 0) {
            toast.info("Usuário sem permissão");
        } else {
            toast.info("Erro: Contate um administrador ");
        }
    } catch (error) {
        if (error.response?.status === 404) {
            toast.error("Usuário não encontrado");
        } else if (error.response?.status === 401) {
            toast.error("Credenciais inválidas");
        }
        throw error.response ? error.response.data : { error: "Erro desconhecido" };
    }
};

const newUser = () => {
}

const sendInvite = () => {
    axios.post('/register/invite')

}

const recoverPasswordInvite = () => {

}
const resetPassword = () => {

}

export const auth = {
    login,
    newUser,
    sendInvite,
    recoverPasswordInvite,
    resetPassword
};
