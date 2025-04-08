import { create } from "zustand";
import { api } from "../../utils/api"; // Função de fetch
import dayjs from "dayjs"; // Manipulação de datas

// ✅ Converte tempo em string para minutos
const parseTimeString = (timeString) => {
    if (!timeString) return 0;

    let totalMinutes = 0;
    const daysMatch = timeString.match(/(\d+)\s*dias?/);
    const hoursMatch = timeString.match(/(\d+)\s*horas?/);
    const minutesMatch = timeString.match(/(\d+)\s*minutos?/);
    const secondsMatch = timeString.match(/(\d+)\s*segundos?/);

    if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60;
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
    if (secondsMatch) totalMinutes += Math.round(parseInt(secondsMatch[1]) / 60);

    return totalMinutes; // Retorna total em minutos
};

// ✅ Formata minutos para "HH:MM"
const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// ✅ Obtém os 3 melhores técnicos
const getTopTechnicians = async (ticketsByTechnician, technicianAvgTime) => {
    const technicians = await Promise.all(
        Object.entries(ticketsByTechnician).map(async ([name, chamados]) => {
            const avatar = await api.getUserAvatar(name);
            return {
                name,
                chamados,
                tempoMedio: technicianAvgTime[name] || "00:00",
                avatar,
            };
        })
    );

    return technicians
        .sort((a, b) => b.chamados - a.chamados)
        .slice(0, 3);
};

const useClosedTicketStore = create((set, get) => ({
    tickets: [],
    loading: false,
    error: null,
    closedTicketsQuantity: 0,
    ticketsByDepartment: {},
    ticketsByTechnician: {},
    ticketsInProgress: 0,
    resolvedLast30Days: 0,
    topTechnicians: [],

    fetchClosedTickets: async (start_date, end_date) => {
        set({ loading: true, error: null });

        try {
            const today = dayjs();
            const currentDay = today.date();
            const startDate = today.subtract(1, "month").date(25).startOf("day");
            const endDate = currentDay < 25 ? today.date(25).endOf("day") : today.endOf("day");

            let tickets = [];
            let page = 1;
            let lastPage = 1;

            do {
                const response = await api.getClosedTickets(
                    start_date || startDate.format("YYYY-MM-DD"),
                    end_date || endDate.format("YYYY-MM-DD"),
                    page
                );

                if (response?.data) {
                    tickets.push(...response.data);
                }

                lastPage = response?.last_page || 1;
                page++;
            } while (page <= lastPage);

            let ticketsByDepartment = {};
            let ticketsByTechnician = {};
            let technicianResolutionTimes = {};
            let ticketsInProgress = 0;
            let resolvedLast30Days = 0;
            const last30Days = dayjs().subtract(30, "days");

            tickets.forEach((ticket) => {
                const department = ticket.departamento || "Outros";
                ticketsByDepartment[department] = (ticketsByDepartment[department] || 0) + 1;

                if (ticket.tecnico && ticket.tecnico !== "NULL") {
                    ticketsByTechnician[ticket.tecnico] = (ticketsByTechnician[ticket.tecnico] || 0) + 1;

                    // ✅ Converte tempo corretamente
                    if (ticket.tempo_de_conclusao && ticket.tempo_de_conclusao !== "NULL") {
                        const tempoEmMinutos = parseTimeString(ticket.tempo_de_conclusao);
                        if (!technicianResolutionTimes[ticket.tecnico]) {
                            technicianResolutionTimes[ticket.tecnico] = [];
                        }
                        technicianResolutionTimes[ticket.tecnico].push(tempoEmMinutos);
                    }
                }

                if (ticket.status === "Em atendimento") {
                    ticketsInProgress++;
                }

                if (dayjs(ticket.criado_em).isAfter(last30Days)) {
                    resolvedLast30Days++;
                }
            });

            // ✅ Calcula tempo médio correto
            let technicianAvgTime = {};
            Object.entries(technicianResolutionTimes).forEach(([tecnico, tempos]) => {
                const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
                technicianAvgTime[tecnico] = formatTime(Math.round(media));
            });

            // ✅ Obtém top técnicos com tempo médio formatado
            const topTechnicians = await getTopTechnicians(ticketsByTechnician, technicianAvgTime);

            set({
                tickets,
                closedTicketsQuantity: tickets.length,
                ticketsByDepartment,
                ticketsByTechnician,
                ticketsInProgress,
                resolvedLast30Days,
                topTechnicians,
                loading: false,
            });

        } catch (error) {
            set({ error: "Erro ao carregar tickets", loading: false });
        }
    },
}));

export default useClosedTicketStore;
