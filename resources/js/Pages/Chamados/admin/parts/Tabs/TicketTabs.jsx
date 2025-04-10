import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"
import { Tabs, Tab, Box, Button, TextField, Typography, Badge, IconButton, Collapse, Divider } from "@mui/material";
import { ExpandMore, ExpandLess, ConfirmationNumber, Dashboard, BarChart, Group, Speed, Settings } from "@mui/icons-material";
import useTicketStore from "../../hooks/useTicketStore";
import TicketsUnassignedTable from "../Tickets/TicketsUnassignedTable";
import TicketAssignedTable from "../Tickets/TicketAssignedTable";
import TicketClosedTable from "../Tickets/TicketClosedTable";
import TicketsAssignedToAuth from "../Tickets/TicketsAssignedToAuth";
import TicketDashboard from "../Tickets/TicketDashboard";
import TicketTecnicos from "../Tickets/TicketTecnicos";
import { tecnicos } from '../../../utils/tecnicos';
import { priorityColors } from '../../../utils/priorityColors';

const TicketTabs = () => {
    const [selectedTab, setSelectedTab] = useState(Cookies.get("ticketsTab") || "tickets");
    const [tabIndex, setTabIndex] = useState(Cookies.get("ticketsTabIndex") || 0);
    const [dashboardTabIndex, setDashboardTabIndex] = useState(Cookies.get("dashboardTabIndex") || null);
    const [openMenu, setOpenMenu] = useState(Cookies.get("openMenuTickets") || true);
    const [openMenuDashboard, setOpenMenuDashboard] = useState(Cookies.get("openMenuDashboard") || (true));
    const { ticketsAttendByMe, ticketsWaiting, ticketsUnassigned, fetchTickets, initPusher } = useTicketStore();


    useEffect(() => {
        Cookies.set("ticketsTab", selectedTab);
        Cookies.set("ticketsTabIndex", tabIndex);
        Cookies.set("openMenuDashboard", openMenuDashboard);
        Cookies.set("dashboardTabIndex", dashboardTabIndex);
        Cookies.set("openMenuTickets", openMenu);
    }, [selectedTab, openMenuDashboard, dashboardTabIndex, tabIndex, openMenu]);

    useEffect(() => {
        fetchTickets();
        initPusher();
    }, [fetchTickets, initPusher]);

    const switchToTickets = (event, newIndex) => {
        if (selectedTab !== "tickets") {
            setDashboardTabIndex(null); // Reseta o índice do Dashboard
            setSelectedTab("tickets");
        }
        setTabIndex(newIndex);
    };

    const switchToDashboard = (event, newIndex) => {
        if (selectedTab !== "dashboard") {
            setTabIndex(null); // Reseta o índice dos Tickets
            setSelectedTab("dashboard");
        }
        setDashboardTabIndex(newIndex);
    };

    const ticketTabs = [
        { label: "👋 Não Atribuídos", count: ticketsUnassigned || 0, component: <TicketsUnassignedTable priorityColors={priorityColors} tecnicos={tecnicos} /> },
        { label: "📂 Meus Chamados", count: ticketsAttendByMe || 0, component: <TicketsAssignedToAuth priorityColors={priorityColors} tecnicos={tecnicos} /> },
        { label: "⏳ Em Atendimento", count: ticketsWaiting || 0, component: <TicketAssignedTable priorityColors={priorityColors} tecnicos={tecnicos} /> },
        { label: "✅ Finalizados", count: 0, component: <TicketClosedTable priorityColors={priorityColors} tecnicos={tecnicos} /> },
    ];

    const dashboardTabs = [
        { label: "📈 Relatórios", icon: <BarChart fontSize="small" />, component: <TicketDashboard /> },
        { label: "👥 Técnicos", icon: <Group fontSize="small" />, component: <TicketTecnicos /> },
        { label: "⚡ Performance", icon: <Speed fontSize="small" />, component: <Typography>Indicadores de performance do atendimento...</Typography> },
        { label: "🛠️ Configurações", icon: <Settings fontSize="small" />, component: <Typography>Configurações gerais do sistema...</Typography> },
    ];

    return (
        <Box sx={{ display: "flex", height: "100vh", bgcolor: "#222324" }}>
            {/* Sidebar */}
            <Box sx={{ width: "260px", bgcolor: "#334155", p: 2, borderRight: "1px solid #475569", color: "white" }}>

                {/* Cabeçalho de Chamados */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6">Chamados</Typography>
                        <ConfirmationNumber />
                    </Box>
                    <IconButton onClick={() => setOpenMenu(!openMenu)} sx={{ color: "white" }}>
                        {openMenu ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>

                <Collapse in={openMenu}>
                    {/* Campo de Pesquisa */}
                    <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="Buscar chamados..."
                        sx={{
                            mb: 2,
                            bgcolor: "#555d6b",
                            input: { color: "white" },
                            "& fieldset": { borderColor: "#475569" }
                        }}
                    />

                    {/* Tabs de Tickets */}
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={tabIndex}
                        onChange={switchToTickets}
                        sx={{ width: "100%" }}
                    >
                        {ticketTabs.map((tab, index) => (
                            <Tab
                                key={index}
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <span>{tab.label}</span>
                                        {tab.count > 0 && (
                                            <Badge
                                                badgeContent={tab.count}
                                                color="error"
                                                sx={{
                                                    "& .MuiBadge-badge": { fontSize: "0.75rem", minWidth: "22px", height: "22px" }
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                sx={{
                                    justifyContent: "space-between",
                                    pr: 2,
                                    color: "white",
                                    bgcolor: selectedTab === "tickets" && tabIndex === index ? "#475569" : "transparent",
                                    borderRadius: "8px",
                                    "&.Mui-selected": {
                                        bgcolor: "#475569",
                                        fontWeight: "bold"
                                    },
                                    "&:hover": { bgcolor: "#3b4a62" }
                                }}
                            />
                        ))}
                    </Tabs>
                </Collapse>

                {/* Divider entre Tickets e Dashboard */}
                <Divider sx={{ my: 2, bgcolor: "#475569" }} />

                {/* Seção do Dashboard */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6">Dashboard</Typography>
                        <Dashboard />
                    </Box>
                    <IconButton onClick={() => setOpenMenuDashboard(!openMenuDashboard)} sx={{ color: "white" }}>
                        {openMenuDashboard ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>

                <Collapse in={openMenuDashboard}>
                    {/* Tabs do Dashboard */}
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={dashboardTabIndex}
                        onChange={switchToDashboard}
                        sx={{ width: "100%" }}
                    >
                        {dashboardTabs.map((tab, index) => (
                            <Tab
                                key={index}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                                sx={{
                                    justifyContent: "start",
                                    fontSize: "0.8rem",
                                    minHeight: "36px",
                                    color: "white",
                                    bgcolor: selectedTab === "dashboard" && dashboardTabIndex === index ? "#475569" : "transparent",
                                    borderRadius: "8px",
                                    "&.Mui-selected": {
                                        bgcolor: "#475569",
                                        fontWeight: "bold"
                                    },
                                    "&:hover": { bgcolor: "#3b4a62" }
                                }}
                            />
                        ))}
                    </Tabs>
                </Collapse>
            </Box>

            {/* Conteúdo das abas (tickets ou dashboard) */}
            <Box sx={{ flex: 1, p: 3, color: "white", overflowY: "auto" }}>
                {selectedTab === "tickets"
                    ? ticketTabs[tabIndex].component
                    : dashboardTabs[dashboardTabIndex].component}
            </Box>
        </Box>
    );
};

export default TicketTabs;
