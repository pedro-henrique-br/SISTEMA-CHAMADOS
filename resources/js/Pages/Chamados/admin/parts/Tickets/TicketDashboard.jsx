import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Tooltip,
    Avatar,
    Grid,
    IconButton,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip as Tip , Legend } from "chart.js";
import useClosedTicketStore from "../../hooks/useClosedTicketStore";
import useTicketStore from "../../hooks/useTicketStore";
import {
    EmojiEvents,
    Phone,
    Timer,
    Download,
    TrendingUp,
    Visibility,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { FaSyncAlt } from "react-icons/fa";
import { helpers } from "../../../../../helpers";

import {
    BsPinAngleFill,
    BsStarFill,
    BsExclamationTriangleFill,
    BsFillFolderSymlinkFill,
} from "react-icons/bs";

ChartJS.register(ArcElement, Tip, Legend, ChartDataLabels);

const TicketDashboard = () => {
    const {
        tickets: closedTickets,
        closedTicketsQuantity,
        ticketsByDepartment,
        ticketsByTechnician,
        resolvedLastPeriod,
        fetchClosedTickets,
        topTechnicians,
    } = useClosedTicketStore();
    const {
        fetchTickets,
        ticketsWaiting,
        openTickets,
        ticketsUnassigned,
        ticketsAttendByMe,
        initPusher,
        tickets,
    } = useTicketStore();
    const [highPriorityCount, setHighPriorityCount] = useState(0);
    const [startDate, setStartDate] = useState(
        dayjs().subtract(1, "month").date(25),
    );
    const [endDate, setEndDate] = useState(dayjs().date(25));

    useEffect(() => {
        fetchClosedTickets();
        fetchTickets();
        initPusher();
        getPriority();
    }, []);

    const getPriority = async () => {
        if (tickets) {
            let priorityHigh = 0;
            tickets.forEach((ticket) => {
                switch (ticket.prioridade) {
                    case "Crítica" || "Alta":
                        priorityHigh++;
                        break;
                }
                setHighPriorityCount(priorityHigh);
            });
        }
    };


    const exportToPDF = async () => {
        const doc = new jsPDF("p", "mm", "a4");
        doc.setFont("helvetica", "normal");

        doc.text("Tickets Atendidos", 14, 20);
        const tableColumn = ["Data", "Usuário", "Técnico", "Problema", "Status"];
        const tableRows = closedTickets.map(ticket => [
            helpers.formatDate(ticket.criado_em),
            ticket.user_name,
            ticket.tecnico,
            ticket.tipo_do_chamado,
            "Finalizado"
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: "striped"
        });

        doc.save(`Relatorio_Chamados-${new Date().toLocaleDateString("pt-BR")}.pdf`);
    };

    const pieData = {
        labels: Object.keys(ticketsByDepartment),
        datasets: [
            {
                data: Object.values(ticketsByDepartment),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            datalabels: {
                color: "#000", // Cor do número no gráfico
                font: {
                    weight: "bold",
                    size: 14,
                },
                anchor: "end", // Posição do texto dentro da fatia
                align: "start",
                formatter: (value) => value, // Exibir número fixo
            },
        },
    };

    return (
        <Box p={2}>
            <Typography
                variant="h5"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
                <TrendingUp color="primary" /> Dashboard de Chamados
            </Typography>

            {/* Grid Responsivo para os Cards */}
            <Grid container spacing={2}>
                {[
                    {
                        label: "Atendendo Agora",
                        value: ticketsWaiting + ticketsAttendByMe,
                        color: "primary",
                        icon: <Visibility color="primary" />,
                    },
                    {
                        label: "Chamados Abertos",
                        value: openTickets,
                        color: "secondary",
                        icon: <BsStarFill color="#3D933F" size={22} />,
                    },
                    {
                        label: "Urgentes",
                        value: highPriorityCount,
                        color: "error",
                        icon: (
                            <BsExclamationTriangleFill
                                color="#EE4E4E"
                                size={22}
                            />
                        ),
                    },
                    {
                        label: "Resolvidos",
                        value: closedTicketsQuantity,
                        color: "secondary",
                    },
                ].map(({ label, value, color, icon }, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                p: 3,
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                borderRadius: 3,
                                boxShadow: 3,
                                bgcolor: "background.paper",
                                maxHeight: "130px",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "text.primary",
                                }}
                            >
                                {label}
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 1,
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    color={color}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {value}
                                </Typography>
                                {icon}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box
                sx={{
                    display: "flex",
                    gap: "5px",
                    mt: 2,
                    flexDirection: "column",
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{ color: "#fff", fontWeight: "bold" }}
                            >
                                Data Inicial
                            </Typography>
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: "small" } }}
                                sx={{
                                    bgcolor: "#fff",
                                    borderRadius: 1,
                                    minWidth: 200,
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{ color: "#fff", fontWeight: "bold" }}
                            >
                                Data Final
                            </Typography>
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: "small" } }}
                                sx={{
                                    bgcolor: "#fff",
                                    borderRadius: 1,
                                    minWidth: 200,
                                }}
                            />
                        </Box>
                    </Box>
                </LocalizationProvider>
                <Box sx={{ mt: 1, display: "flex", gap: "10px" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FaSyncAlt />}
                        onClick={() =>
                            fetchClosedTickets(
                                startDate.format("YYYY-MM-DD"),
                                endDate.format("YYYY-MM-DD"),
                            )
                        }
                        sx={{ minWidth: 150, height: "40px" }}
                    >
                        Buscar
                    </Button>
                    {/* Botão de Exportação */}
                    <Button
                        sx={{ height: "40px" }}
                        variant="contained"
                        color="primary"
                        startIcon={<Download />}
                        onClick={exportToPDF}
                    >
                        Exportar Relatório
                    </Button>
                </Box>
            </Box>

            {/* TOP 3 Técnicos */}
            <Grid container spacing={2} mt={3}>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <EmojiEvents color="warning" /> TOP 3 Técnicos
                        </Typography>
                        {topTechnicians.length > 0 ? (
                            topTechnicians.map((tecnico, index) => {
                                const medals = ["🥇", "🥈", "🥉"];
                                return (
                                    <Card
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 2,
                                            p: 2,
                                            borderLeft: `5px solid ${index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"}`,
                                            transition: "transform 0.2s",
                                            "&:hover": {
                                                transform: "scale(1.05)",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            src={tecnico.avatar}
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                mr: 2,
                                            }}
                                        />
                                        <CardContent>
                                            <Typography variant="h6">
                                                {medals[index]} {tecnico.name}
                                            </Typography>
                                            <Tooltip title="Total de chamados resolvidos">
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Phone color="primary" />
                                                    <Typography>
                                                        Chamados:{" "}
                                                        {tecnico.chamados}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                            <Tooltip title="Tempo médio de resolução">
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Timer color="secondary" />
                                                    <Typography>
                                                        Tempo Médio:{" "}
                                                        {tecnico.tempoMedio}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Typography variant="body2">
                                Nenhum técnico encontrado.
                            </Typography>
                        )}
                    </Box>
                </Grid>

                {/* Chamados por Departamento */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Chamados por Departamento
                    </Typography>
                    <Box sx={{ background: "#FFF", p: 2, borderRadius: 2 }}>
                        <Pie data={pieData} options={pieOptions} />
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={2} mt={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Chamados Atendidos por Técnico
                    </Typography>
                    <Box
                        sx={{
                            background: "#FFF",
                            p: 2,
                            borderRadius: 2,
                            textAlign: "center",
                        }}
                    >
                        <Bar
                            data={{
                                labels: Object.keys(ticketsByTechnician),
                                datasets: [
                                    {
                                        label: "Quantidade de Chamados Atendidos",
                                        data: Object.values(
                                            ticketsByTechnician,
                                        ),
                                        backgroundColor: "#36A2EB",
                                    },
                                ],
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TicketDashboard;
