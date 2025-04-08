import axios from "axios";
import { Bounce, toast } from "react-toastify";
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom";

const getAllTickets = async (pages) => {
    try {
        const response = await axios.get(
            `http://127.0.0.1:8000/tickets?page=${pages}`
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

const getUserAvatar = async (tecnico) => {
    try {
        const response = await getUser(tecnico)
        const avatar_url = response.avatar_path ? `http://127.0.0.1:8000/${response.avatar_path}` : null
        return avatar_url
    }
    catch (error) {
        return error
    }
}

const getClosedTickets = async (start_date, end_date, pages) => {
    try {
        const response = await axios.get(
            `http://127.0.0.1:8000/tickets-atendidos`, {
            params: {
                page: pages,
                start_date: start_date,
                end_date: end_date
            }
        }
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

const createTicket = async (type, user_email, department, message, file) => {
    try {
        const username = user_email ? user_email.split("@")[0] : null; // Pega a parte antes do @
        const usernameFormated = username.split(".")[0] ?? null; // Separa pelo ponto e pega a primeira parte
        const response = await axios.post("http://127.0.0.1:8000/tickets", {
            user_name: usernameFormated || "N/A",
            mensagem: message || "Sem Mensagem",
            prioridade: "Baixa",
            tipo_do_chamado: type || "Não informado",
            email: user_email || "Não informado",
            image_do_chamado: file || "",
            departamento: department || "Não informado",
        });
        toast.success("Chamado criado com sucesso!");
        return response.data;
    } catch (error) {
        toast.error("Erro ao criar chamado.");
    }
};

const sendMessage = async (id, mensage, tecnico, email) => {
    try {
        await axios.post(`http://127.0.0.1:8000/tickets/mensagem`, {
            id: id,
            mensagem: mensage,
            tecnico: tecnico,
            email: email,
        });
        toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
        toast.error("Erro ao enviar mensagem");
    }
};

const updatePriorityTicket = async (id, priority) => {
    try {
        await axios.put(`http://127.0.0.1:8000/tickets/${id}`, {
            prioridade: priority,
        });
        toast.success("Ticket atualizado com sucesso!");
    } catch (error) {
        toast.error("Erro ao atualizar chamado.");
    }
};

const getTicketById = async (id) => { };

const answerTicket = async (id, tecnico) => {
    try {
        await axios.put(`http://127.0.0.1:8000/tickets/${id}`, {
            tecnico: tecnico,
        });
        toast.success("Atendendo o Chamado!");
    } catch (error) {
        toast.error("Erro ao atender chamado.");
    }
};

const deleteTicket = async (id) => {
    try {
        await axios.delete(`http://127.0.0.1:8000/tickets/${id}`);
        toast.success("Ticket excluído com sucesso!");
    } catch (error) {
        toast.error("Erro ao excluir chamado.");
    }
};

const closeTicket = async (id) => {
    try {
        await axios.post(`http://127.0.0.1:8000/tickets/${id}/atender`);
        toast.success("Ticket Finalizado com sucesso!");
    } catch (error) {
        toast.error("Erro ao finalizar chamado.");
    }
};

const addObservation = async (id, tecnico, message) => {
    try {
        await axios.post(`http://127.0.0.1:8000/tickets/${id}/addObservation`, {
            tecnico: tecnico,
            mensagem: message,
        });
        toast.success("Observação adicionada com sucesso!");
    } catch (error) {
        toast.error(`Erro: ${error}`);
        return error;
    }
};

// auth function (no need to use useNavigate here)
const auth = async (username, password) => {
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

const getUser = async (username) => {
    try {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        const response = await axios.get(
            `http://127.0.0.1:8000/tickets/users/${username}`,
            {
                headers: { 'X-CSRF-TOKEN': token },
            }
        );
        return response.data; // Retorna os dados do usuário
    } catch (error) {
        toast.error("Erro ao buscar usuário: " + error.message);
        throw error.response ? error.response.data : { error: "Erro desconhecido" };
    }
};

const updateAvatar = async (formData) => {
    try {
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
        // Envia o FormData diretamente para a API
        const response = await axios.post(
            `http://127.0.0.1:8000/tickets/users/${Cookies.get("user_name")}/avatar`, // Substitua pelo endpoint correto
            formData, // Passe o FormData diretamente
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': token
                }
            }
        );

        console.log("Avatar atualizado:", response.data);
        return response.data; // Retorna os dados do usuário atualizado
    } catch (error) {
        console.error("Erro ao atualizar avatar:", error.response || error);
        throw error; // Lança o erro para o frontend lidar
    }
};


export const api = {
    getAllTickets,
    createTicket,
    getTicketById,
    answerTicket,
    deleteTicket,
    closeTicket,
    getClosedTickets,
    updatePriorityTicket,
    sendMessage,
    addObservation,
    auth,
    getUser,
    updateAvatar,
    getUserAvatar
};



// API CHAMADOS ANTIGO


// import axios from "axios";
// import { Bounce, toast } from "react-toastify";
// import Cookies from 'js-cookie'
// import { useNavigate } from "react-router-dom";

// const getAllTickets = async (pages) => {
//     try {
//         const response = await axios.get(
//             `http://127.0.0.1:8000/tickets?page=${pages}`
//         );
//         return response.data;
//     } catch (error) {
//         console.log(error);
//     }
// };

// const getClosedTickets = async (pages) => {
//     try {
//         const response = await axios.get(
//             `http://127.0.0.1:8000/tickets-atendidos?page=${pages}`
//         );
//         return response.data;
//     } catch (error) {
//         console.log(error);
//     }
// };

// const createTicket = async (type, user_email, department, message, file) => {
//     try {
//         const token = document
//             .querySelector('meta[name="csrf-token"]')
//             .getAttribute("content");

//         const username = user_email ? user_email.split("@")[0] : null; // Pega a parte antes do @
//         const usernameFormated = username.split(".")[0] ?? null; // Separa pelo ponto e pega a primeira parte
//         const response = await axios.post("http://127.0.0.1:8000/tickets", {
//             user_name: usernameFormated || "N/A",
//             mensagem: message || "Sem Mensagem",
//             prioridade: "Baixa",
//             tipo_do_chamado: type || "Não informado",
//             email: user_email || "Não informado",
//             image_do_chamado: file,
//             departamento: department || "Não informado",
//         },
//             {
//                 headers: {
//                     'X-CSRF-TOKEN': token,
//                     'Content-Type': 'multipart/form-data', // Indica envio de arquivo
//                 }
//                 ,
//             });
//         toast.success("Chamado criado com sucesso!");
//         return response.data;
//     } catch (error) {
//         toast.error("Erro ao criar chamado.");
//     }
// };

// const sendMessage = async (id, mensage, tecnico, email) => {
//     try {
//         await axios.post(`http://127.0.0.1:8000/tickets/mensagem`, {
//             id: id,
//             mensagem: mensage,
//             tecnico: tecnico,
//             email: email,
//         });
//         toast.success("Mensagem enviada com sucesso!");
//     } catch (error) {
//         toast.error("Erro ao enviar mensagem");
//     }
// };

// const updatePriorityTicket = async (id, priority) => {
//     try {
//         await axios.put(`http://127.0.0.1:8000/tickets/${id}`, {
//             prioridade: priority,
//         });
//         toast.success("Ticket atualizado com sucesso!");
//     } catch (error) {
//         toast.error("Erro ao atualizar chamado.");
//     }
// };

// const getTicketById = async (id) => { };

// const answerTicket = async (id, tecnico) => {
//     try {
//         await axios.put(`http://127.0.0.1:8000/tickets/${id}`, {
//             tecnico: tecnico,
//         });
//         toast.success("Atendendo o Chamado!");
//     } catch (error) {
//         toast.error("Erro ao atender chamado.");
//     }
// };

// const deleteTicket = async (id) => {
//     try {
//         await axios.delete(`http://127.0.0.1:8000/tickets/${id}`);
//         toast.success("Ticket excluído com sucesso!");
//     } catch (error) {
//         toast.error("Erro ao excluir chamado.");
//     }
// };

// const closeTicket = async (id) => {
//     try {
//         await axios.post(`http://127.0.0.1:8000/tickets/${id}/atender`);
//         toast.success("Ticket Finalizado com sucesso!");
//     } catch (error) {
//         toast.error("Erro ao finalizar chamado.");
//     }
// };

// const addObservation = async (id, tecnico, message) => {
//     try {
//         await axios.post(`http://127.0.0.1:8000/tickets/${id}/addObservation`, {
//             tecnico: tecnico,
//             mensagem: message,
//         });
//         toast.success("Observação adicionada com sucesso!");
//     } catch (error) {
//         toast.error(`Erro: ${error}`);
//         return error;
//     }
// };

// // auth function (no need to use useNavigate here)
// const auth = async (username, password) => {
//     try {
//         const token = document
//             .querySelector('meta[name="csrf-token"]')
//             .getAttribute("content");

//         const response = await axios.post(
//             `http://127.0.0.1:8000/tickets/login`,
//             {
//                 username,
//                 password,
//             },
//             {
//                 headers: { 'X-CSRF-TOKEN': token },
//             }
//         );

//         if (response.data.user && response.data.user.admincount[0] == 1) {
//             const user_name = response.data.user.samaccountname[0];
//             await getUser(user_name); // Tenta pegar o usuário no DB
//             Cookies.set("user_name", user_name, { expires: 7 });
//             toast.success("Login bem-sucedido");
//         } else if (response.data.user && response.data.user.admincount[0] === 0) {
//             toast.info("Usuário sem permissão");
//         } else {
//             toast.info("Erro: Contate um administrador ");
//         }
//     } catch (error) {
//         if (error.response?.status === 404) {
//             toast.error("Usuário não encontrado");
//         } else if (error.response?.status === 401) {
//             toast.error("Credenciais inválidas");
//         }
//         throw error.response ? error.response.data : { error: "Erro desconhecido" };
//     }
// };

// const getUser = async (username) => {
//     try {
//         const token = document
//             .querySelector('meta[name="csrf-token"]')
//             .getAttribute("content");

//         const response = await axios.get(
//             `http://127.0.0.1:8000/tickets/users/${username}`,
//             {
//                 headers: { 'X-CSRF-TOKEN': token },
//             }
//         );
//         return response.data; // Retorna os dados do usuário
//     } catch (error) {
//         toast.error("Erro ao buscar usuário: " + error.message);
//         throw error.response ? error.response.data : { error: "Erro desconhecido" };
//     }
// };


// export const api = {
//     getAllTickets,
//     createTicket,
//     getTicketById,
//     answerTicket,
//     deleteTicket,
//     closeTicket,
//     getClosedTickets,
//     updatePriorityTicket,
//     sendMessage,
//     addObservation,
//     auth,
//     getUser,
// };
