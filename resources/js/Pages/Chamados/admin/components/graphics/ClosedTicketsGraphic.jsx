import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { api } from "../../../utils/api";
import { Typography } from "@mui/material";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ClosedTicketsGraphic = () => {
    const [admins, setAdmins] = useState([]);  // Correção aqui
    const [closedTickets, setClosedTickets] = useState([]);

    const getClosedTickets = async () => {
        try {
            const response = await api.getClosedTickets();
            const data = []
            for (let index = 1; response?.last_page >= index; index++) {
                const response = await api.getClosedTickets(index);
                data.push(response?.data)
            }

            const ticketClosedByAdmins = {
                Pedro: 0,
                Lucas: 0,
                Cleverson: 0,
                João: 0,
            };

            // Cores fixas para os técnicos
            const colors = {
                Pedro: "#2A004E",
                Lucas: "#2b2b2b",
                Cleverson: "#EEDF7A",
                João: "#36BA98",
            };

            // Contabilizando os chamados fechados por técnico
            data.map((tickets) => tickets.forEach((ticket) => {
                if (ticketClosedByAdmins[ticket.tecnico] !== undefined) {
                    ticketClosedByAdmins[ticket.tecnico] += 1;
                }
            }));

            // Criando os dados para o gráfico com cores fixas associadas aos técnicos
            const adminData = Object.keys(ticketClosedByAdmins).map((tecnico) => ({
                label: tecnico,
                data: [ticketClosedByAdmins[tecnico]],  // Dados para o gráfico
                backgroundColor: colors[tecnico], // Cor fixa para o técnico
            }));

            setClosedTickets(data);  // Atualiza o estado de tickets
            setAdmins(adminData);    // Atualiza o estado de admins com os dados dos técnicos
        } catch (error) {
            console.error("Erro ao buscar os chamados fechados", error);
        }
    };

    useEffect(() => {
        getClosedTickets();
    }, []);

    const data = {
        labels: ["Chamados atendidos"],  // Label para o eixo X
        datasets: admins,  // Dados do gráfico com técnicos e suas contagens
    };

    const options = {
        responsive: true,
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <>
            {admins.length > 0 && closedTickets.length > 0 ? (
                <Bar
                    data={data}
                    options={options}
                    style={{ width: "500px", height: "650px" }}
                />
            ) : (
                <Typography>Nenhum Chamado Atendido este mês!</Typography>
            )}
        </>
    );
};

export default ClosedTicketsGraphic;
