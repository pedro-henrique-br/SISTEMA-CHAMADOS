import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Button, TextField, Typography, Badge, IconButton, Collapse, Divider } from "@mui/material";
import { ExpandMore, ExpandLess, ConfirmationNumber, Dashboard, BarChart, Group, Speed, Settings } from "@mui/icons-material";
import useTicketStore from "../../hooks/useTicketStore";
import TicketAssignedTable from "../Tickets/TicketAssignedTable";
import InviteUserForm from "../UsersManagement/InviteUserForm";
import TicketClosedTable from "../Tickets/TicketClosedTable";
import TicketsAssignedToAuth from "../Tickets/TicketsAssignedToAuth";
import TicketDashboard from "../Tickets/TicketDashboard";
import TicketTecnicos from "../Tickets/TicketTecnicos";
import { tecnicos } from '../../../utils/tecnicos';
import { priorityColors } from '../../../utils/priorityColors';

const UsersTabs = () => {
    const [selectedTab, setSelectedTab] = useState("tickets");
    const [tabIndex, setTabIndex] = useState(0);
    const [dashboardTabIndex, setDashboardTabIndex] = useState(null);
    const [openMenu, setOpenMenu] = useState(true);
    const [openMenuDashboard, setOpenMenuDashboard] = useState(true);
    const { ticketsAttendByMe, ticketsWaiting, ticketsUnassigned, fetchTickets, initPusher } = useTicketStore();

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
        { label: "👋 Convidar Usuário", count: ticketsUnassigned || 0, component: <InviteUserForm /> },
        { label: "📂 Convites Enviados", count: ticketsAttendByMe || 0, component: <TicketsAssignedToAuth priorityColors={priorityColors} tecnicos={tecnicos} /> },
        { label: "⏳ Usuários", count: ticketsWaiting || 0, component: <TicketAssignedTable priorityColors={priorityColors} tecnicos={tecnicos} /> },
        { label: "✅ Finalizados", count: 0, component: <TicketClosedTable priorityColors={priorityColors} tecnicos={tecnicos} /> },
    ];

    const dashboardTabs = [
        { label: "📈 Relatórios", icon: <BarChart fontSize="small" />, component: <TicketDashboard /> },
        { label: "👥 Técnicos", icon: <Group fontSize="small" />, component: <TicketTecnicos /> },
        { label: "⚡ Performance", icon: <Speed fontSize="small" />, component: <Typography>Indicadores de performance do atendimento...</Typography> },
        { label: "🛠️ Configurações", icon: <Settings fontSize="small" />, component: <Typography>Configurações gerais do sistema...</Typography> },
    ];

    return (
        <Box sx={{ display: "flex", height: "100vh", bgcolor: "#b9b9b9" }}>
            {/* Sidebar */}
            <Box sx={{ width: "250px", bgcolor: "#fff", p: 2, borderRight: "1px solid #838383", color: "white" }}>

                {/* Cabeçalho de Chamados */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6" color="#838383">Usuários</Typography>
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
                            bgcolor: "#b9b9b9",
                            input: { color: "white" },
                            "& fieldset": { borderColor: "#000" }
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
                                        <span color="#838383">{tab.label}</span>
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
                                    color: "#838383",
                                    bgcolor: selectedTab === "tickets" && tabIndex === index ? "#b9b9b9" : "transparent",
                                    borderRadius: "8px",
                                    "&.Mui-selected": {
                                        bgcolor: "#b9b9b9",
                                        fontWeight: "bold"
                                    },
                                    "&:hover": { bgcolor: "#b9b9b9" }
                                }}
                            />
                        ))}
                    </Tabs>
                </Collapse>

                {/* Divider entre Tickets e Dashboard */}
                <Divider sx={{ my: 2, bgcolor: "#838383" }} />

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
                                    color: "#838383",
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

export default UsersTabs;
