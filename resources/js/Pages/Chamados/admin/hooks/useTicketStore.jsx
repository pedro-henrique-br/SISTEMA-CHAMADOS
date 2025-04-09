import { create } from "zustand";
import { api } from "../../utils/api";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";

const useTicketStore = create((set, get) => ({
    tickets: [],
    ticketsUnassignedArray: [],
    ticketsAssignedArray: [],
    loading: false,
    error: null,
    openTickets: 0,
    ticketsUnassigned: 0,
    ticketsWaiting: 0,
    pusherInitialized: false,

    fetchTickets: async () => {
        set({ loading: true, error: null });
        try {
            const firstResponse = await api.getAllTickets();
            const totalPages = firstResponse?.last_page || 1;

            let allTickets = [];
            let ticketsUnassignedArr = [];
            let ticketsAssignedArr = [];
            let unassignedCount = 0;
            let waitingCount = 0;
            let ticketsAttendByMeArr = []
            let ticketsAttendByMe = 0

            const requests = Array.from({ length: totalPages }, (_, i) => api.getAllTickets(i + 1));
            const responses = await Promise.all(requests);
            const userName = Cookies.get("user_name")?.toLowerCase() || "pedrohenrique.admin";

            responses.forEach(response => {
                response?.data.forEach(ticket => {
                    allTickets.push(ticket);
                    if (!ticket.tecnico) {
                        ticketsUnassignedArr.push(ticket);
                        unassignedCount++;
                    } else if (!userName.includes(ticket.tecnico.toLowerCase())) {
                        ticketsAssignedArr.push(ticket);
                        waitingCount++;
                    } else {
                        ticketsAttendByMeArr.push(ticket)
                        ticketsAttendByMe++
                    }
                });
            });

            set({
                tickets: allTickets,
                ticketsUnassigned: unassignedCount,
                ticketsUnassignedArray: ticketsUnassignedArr,
                ticketsAssignedArray: ticketsAssignedArr,
                ticketsAttendByMeArray: ticketsAttendByMeArr,
                ticketsAttendByMe: ticketsAttendByMe,
                ticketsWaiting: waitingCount,
                openTickets: allTickets.length,
                loading: false,
            });
        } catch (error) {
            console.error("Erro ao carregar tickets:", error);
            set({ error: "Erro ao carregar tickets", loading: false });
        }
    },
// closeTicket: async (id) => {
//     try {
//         await api.closeTicket(id); // Chama a API
//         set((state) => ({
//             tickets: state.tickets.filter(ticket => ticket.id !== id),
//             ticketsAssignedArray: state.ticketsAssignedArray.filter(ticket => ticket.id !== id),
//             openTickets: Math.max(state.openTickets - 1, 0),
//             ticketsWaiting: Math.max(state.ticketsWaiting - 1, 0),
//         }));
//     } catch (error) {
//         console.error("Erro ao finalizar chamado:", error);
//     }
// },

    addNewTicket: (newTicket) => {
        set((state) => ({
            tickets: [newTicket, ...state.tickets],
            openTickets: state.openTickets + 1,
            ticketsUnassignedArray: newTicket.tecnico ? state.ticketsUnassignedArray : [newTicket, ...state.ticketsUnassignedArray],
            ticketsAssignedArray: newTicket.tecnico ? [newTicket, ...state.ticketsAssignedArray] : state.ticketsAssignedArray,
            ticketsUnassigned: newTicket.tecnico ? state.ticketsUnassigned : state.ticketsUnassigned + 1,
            ticketsWaiting: newTicket.tecnico ? state.ticketsWaiting + 1 : state.ticketsWaiting,
        }));
    },

    deleteTicket: async (id, fromPusher = false) => {
        try {
            if (!fromPusher) {
                await api.deleteTicket(id);
            }

            set((state) => {
                const ticketExists = state.tickets.some(ticket => ticket.id === id);
                if (!ticketExists) return state; // Evita erros se o ticket já foi removido antes

                const updatedTickets = state.tickets.filter(ticket => ticket.id !== id);
                const updatedUnassignedTickets = state.ticketsUnassignedArray.filter(ticket => ticket.id !== id);
                const updatedAssignedTickets = state.ticketsAssignedArray.filter(ticket => ticket.id !== id); // <-- Correção aqui!

                return {
                    tickets: updatedTickets,
                    ticketsUnassignedArray: updatedUnassignedTickets,
                    ticketsAssignedArray: updatedAssignedTickets, // Agora atualiza corretamente os atribuídos
                    openTickets: Math.max(state.openTickets - 1, 0),
                    ticketsUnassigned: updatedUnassignedTickets.length,
                    ticketsWaiting: updatedAssignedTickets.length, // <-- Atualiza corretamente os tickets aguardando
                };
            });
        } catch (error) {
            console.error("Erro ao excluir ticket:", error);
        }
    },

    answerTicket: async (id, tecnico) => {
        try {
            await api.answerTicket(id, tecnico);

            set((state) => {
                const updatedTickets = state.tickets.map(ticket =>
                    ticket.id === id ? { ...ticket, tecnico } : ticket
                );

                const updatedUnassignedTickets = state.ticketsUnassignedArray.filter(ticket => ticket.id !== id);
                const updatedAssignedTickets = [...state.ticketsInProgressArray, { id, tecnico }];
                // Atualiza o contador de chamados aguardando atendimento
                const newWaitingCount = updatedTickets.filter(ticket => ticket.tecnico).length;

                return {
                    tickets: updatedTickets,
                    ticketsUnassignedArray: updatedUnassignedTickets,
                    ticketsAssignedArray: updatedAssignedTickets,
                    ticketsUnassigned: updatedUnassignedTickets.length,
                    ticketsWaiting: newWaitingCount, // Corrigindo a atualização do contador
                };
            });

        } catch (error) {
            console.error("Erro ao atender chamado:", error);
        }
    },

    updateTicketPusher: async (updatedTicket) => {
        const currentTicket = get().tickets.find(t => t.id === updatedTicket.id);

        // Se a prioridade não mudou, evita requisição duplicada
        if (currentTicket && currentTicket.prioridade === updatedTicket.prioridade) {
            return;
        }

        set((state) => {
            const updatedTickets = state.tickets.map(ticket =>
                ticket.id === updatedTicket.id ? updatedTicket : ticket
            );

            const updatedUnassignedTickets = state.ticketsUnassignedArray
                ? state.ticketsUnassignedArray.filter(ticket => ticket.id !== updatedTicket.id)
                : [];

            const updatedAssignedArr = state.ticketsAssignedArray
                ? state.ticketsAssignedArray.filter(ticket => ticket.id !== updatedTicket.id)
                : [];

            if (!updatedTicket.tecnico) {
                updatedUnassignedTickets.push(updatedTicket);
            } else {
                updatedAssignedArr.push(updatedTicket);
            }

            return {
                tickets: updatedTickets,
                ticketsUnassignedArray: updatedUnassignedTickets,
                ticketsAssignedArray: updatedAssignedArr,
                ticketsUnassigned: updatedUnassignedTickets.length,
            };
        });
    },

    updateTicket: async (updatedTicket) => {
        const currentTicket = get().tickets.find(t => t.id === updatedTicket.id);

        // Se a prioridade não mudou, evita requisição duplicada
        if (currentTicket && currentTicket.prioridade === updatedTicket.prioridade) {
            return;
        }

        try {
            await api.updatePriorityTicket(updatedTicket.id, updatedTicket.prioridade);

            set((state) => {
                const updatedTickets = state.tickets.map(ticket =>
                    ticket.id === updatedTicket.id ? updatedTicket : ticket
                );

                const updatedUnassignedTickets = state.ticketsUnassignedArray
                    ? state.ticketsUnassignedArray.filter(ticket => ticket.id !== updatedTicket.id)
                    : [];

                const updatedAssignedArr = state.ticketsAssignedArray
                    ? state.ticketsAssignedArray.filter(ticket => ticket.id !== updatedTicket.id)
                    : [];

                if (!updatedTicket.tecnico) {
                    updatedUnassignedTickets.push(updatedTicket);
                } else {
                    updatedAssignedArr.push(updatedTicket);
                }

                return {
                    tickets: updatedTickets,
                    ticketsUnassignedArray: updatedUnassignedTickets,
                    ticketsAssignedArray: updatedAssignedArr,
                    ticketsUnassigned: updatedUnassignedTickets.length,
                };
            });

        } catch (error) {
            console.error("Erro ao atualizar ticket:", error);
        }
    },


    initPusher: () => {
        if (get().pusherInitialized) return;

        window.Pusher = Pusher;
        const echo = new Echo({
            broadcaster: "pusher",
            key: "4969fb9b012504ffd402",
            cluster: "sa1",
            forceTLS: true,
            wsHost: "ws-sa1.pusher.com",
            wsPort: 443,
            wssPort: 443,
            disableStats: true,
        });

        const channel = echo.channel("chamados");

        channel.listen(".chamado", (event) => {
            const store = get(); // Obtém a referência correta da store Zustand

            if (event.tipo === "novo") {
                store.addNewTicket(event.chamado);
            } else  if (event.tipo === "atualizado") {
                const existingTicket = store.tickets.find(t => t.id === event.chamado.id);
                if (existingTicket && existingTicket.prioridade === event.chamado.prioridade) {
                    return; // Evita atualização duplicada pelo Pusher
                }
                store.updateTicketPusher(event.chamado);
            }
        });

        channel.listen(".chamado-deletado", (event) => {
            get().deleteTicket(event.ticketId, true);
        });

        set({ pusherInitialized: true });

        return () => {
            echo.disconnect();
        };
    },
}));

export default useTicketStore;

