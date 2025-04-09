import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    IconButton,
    Tooltip,
    Chip,
    DialogTitle,
    DialogActions,
    Dialog,
    DialogContent
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { FaTrash, FaSyncAlt, FaUser, FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";
import useTicketStore from "../../hooks/useTicketStore";
import Cookies from "js-cookie";
import { helpers } from "../../../../../helpers";

const TicketsUnassignedTable = ({ priorityColors, tecnicos }) => {
    const { ticketsUnassignedArray, fetchTickets, deleteTicket, addObservation, updateTicket, initPusher } = useTicketStore();
    const [searchId, setSearchId] = useState("");
    const [loading, setLoading] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchTickets();
        initPusher();
    }, []);

    const handleDelete = async (id) => {
        if (confirm(`Deseja deletar o ticket ID:${id}?`)) {
            await deleteTicket(id);
        }
    };

    const handleOpenModal = (ticket) => {
        setSelectedTicket(ticket);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTicket(null);
    };



    const handlePriorityChange = async (event, ticket) => {
        const newPriority = event.target.value;

        if (ticket.prioridade === newPriority) return;

        setLoading(true);  // Inicia o loading

        try {
            const updatedTicket = { ...ticket, prioridade: newPriority };
            await updateTicket(updatedTicket);
        } catch (error) {
            console.error("Erro ao atualizar prioridade:", error);
        } finally {
            setLoading(false);  // Finaliza o loading
        }
    };


    const handleConfirmAttend = async () => {
        const userName = Cookies.get("user_name") || "pedrohenrique.admin"; // Exemplo: "pedrohenrique.admin"

        // Procura um técnico cujo nome esteja contido no userName
        const tecnico = tecnicos.find(t => userName.toLowerCase().includes(t.toLowerCase()));

        if (!tecnico) {
            alert("Seu usuário não está registrado como técnico");
            return;
        }
        setLoading(true);  // Inicia o loading

        try {
            await useTicketStore.getState().answerTicket(selectedTicket.id, tecnico);
        } catch (error) {
            return error
        } finally {
            setLoading(false);  // Inicia o loading
            setOpenDialog(false);
        }
        // Chama a nova função do hook para atender o chamado
    };

    const attendByOtherTecnico = async (e, ticket) => {
        const newTecnico = e.target.value;
        setLoading(true);  // Inicia o loading

        if (newTecnico) {
            try {
                await useTicketStore.getState().answerTicket(ticket.id, newTecnico);
            } catch (error) {
                return error
            } finally {
                setLoading(false);  // Finaliza o loading
            }
        }
    };

    const filteredTickets = Array.isArray(ticketsUnassignedArray) ? ticketsUnassignedArray
        .filter(ticket => {
            // Garantir que a estrutura do ticket esteja correta
            if (!ticket || !ticket.criado_em) return false; // Descartar tickets inválidos ou sem data de criação

            // Filtrar com base nos filtros definidos
            if (priorityFilter && ticket.prioridade !== priorityFilter) return false;
            if (searchId && ticket.id.toString() !== searchId) return false;

            return true;
        })
        .sort((a, b) => {
            // Garantir que a data de criação seja válida
            const dateA = new Date(a.criado_em);
            const dateB = new Date(b.criado_em);

            // Verifica se as datas são válidas antes de comparar
            if (isNaN(dateA) || isNaN(dateB)) {
                console.warn('Data inválida encontrada, retornando sem ordenar.');
                return 0; // Retorna 0 para não alterar a ordem em caso de data inválida
            }

            return dateA - dateB; // Ordenação crescente por data
        }) : []; // Se não for um array, retorna um array vazio

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="h5" gutterBottom>Chamados Não Atribuídos</Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField sx={{ background: "#fff" }} label="Buscar por ID" variant="outlined" size="small" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                <Select sx={{ background: "#fff" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} displayEmpty size="small">
                    <MenuItem value="">Todas Prioridades</MenuItem>
                    {Object.keys(priorityColors).map((priority) => (
                        <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                    ))}
                </Select>
                <Button variant="contained" color="primary" startIcon={<FaSyncAlt />} onClick={fetchTickets}>Atualizar</Button>
            </Box>

            {ticketsUnassignedArray?.length > 0 ? (

                <TableContainer component={Paper} sx={{
                    maxHeight: "70vh", overflowY: "auto", overflowX: "auto", minWidth: "100%"
                }}>
                    <Box sx={{ width: "100%", overflowX: "auto" }}>
                        <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {["ID", "Aberto Por", "Tipo", "Departamento", "Status", "Prioridade", "Mensagem", "Imagem", "Data", "Ações"].map((header) => (
                                        <TableCell key={header} sx={{ fontSize: "0.75rem", padding: "6px" }}>
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTickets?.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell sx={{ fontSize: "0.75rem", padding: "6px" }}>#{ticket.id}</TableCell>
                                        <TableCell sx={{ padding: "6px" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Avatar sx={{ width: 24, height: 24 }}>
                                                    <FaUser size={12} />
                                                </Avatar>
                                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Typography sx={{ textTransform: "capitalize", fontSize: "0.75rem" }} variant="body2">
                                                        {ticket.user_name?.split(" ").slice(0, 2).join(" ")}
                                                    </Typography>
                                                    <Tooltip title={ticket.email} arrow>
                                                        <Typography color="primary" sx={{ fontSize: "0.75rem" }} variant="body2">
                                                            {ticket.email?.substring(0, 10) || "N/A"}...
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "0.75rem", padding: "6px" }}>{ticket.tipo_do_chamado}</TableCell>
                                        <TableCell sx={{ fontSize: "0.75rem", padding: "6px" }}>{ticket.departamento}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={ticket.tecnico || "Em espera"}
                                                onChange={(e) => attendByOtherTecnico(e, ticket)}
                                                displayEmpty
                                                size="small"
                                                sx={{
                                                    color: ticket.tecnico === null ? "#5b5b5b" : "#000",
                                                    "&.MuiOutlinedInput-root": {
                                                        border: "none",
                                                        "& fieldset": { display: "none" }
                                                    },
                                                    "&.MuiInputBase-root": {
                                                        padding: 0,
                                                    }
                                                }}
                                                renderValue={(selected) =>
                                                    selected ? <Typography sx={{ fontSize: "0.7rem", height: "20px" }}>{selected}</Typography> : <Typography sx={{ fontSize: "0.7rem", height: "20px" }} color="textSecondary">Selecione</Typography>
                                                }
                                            >
                                                {tecnicos.map((tecnico) => (
                                                    <MenuItem key={tecnico} value={tecnico}>
                                                        {tecnico}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell sx={{ padding: "6px" }}>
                                            <Select
                                                value={ticket.prioridade}
                                                onChange={(e) => handlePriorityChange(e, ticket)}
                                                displayEmpty
                                                size="small"
                                                sx={{
                                                    "&.MuiOutlinedInput-root": { border: "none", "& fieldset": { display: "none" } },
                                                    "&.MuiInputBase-root": { padding: 0 }
                                                }}
                                                renderValue={(selected) => (
                                                    <Chip label={selected} color={priorityColors[selected]} sx={{ fontSize: "0.7rem", height: "20px" }} />
                                                )}
                                            >
                                                {Object.keys(priorityColors).map((prioridade) => (
                                                    <MenuItem key={prioridade} value={prioridade}>{prioridade}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "0.75rem", padding: "6px" }}>
                                            <Tooltip
                                                title={ticket.mensagem}
                                                arrow
                                                sx={{
                                                    maxWidth: '300px', // Ajuste a largura máxima conforme necessário
                                                    fontSize: '4rem',  // Aumente o tamanho da fonte
                                                    padding: '8px',    // Adicione padding para espaçar o texto
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontSize: "0.7rem" }} noWrap>
                                                    {ticket.mensagem?.substring(0, 20)}...
                                                </Typography>
                                            </Tooltip>

                                        </TableCell>
                                        <TableCell sx={{ fontSize: "0.75rem", padding: "6px" }}>
                                            {ticket.image_path !== "" && ticket.image_path !== null ? (
                                                <Tooltip title="Clique para visualizar" arrow>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontSize: "0.7rem", color: "blue", cursor: "pointer", textDecoration: "underline" }}
                                                        noWrap
                                                        onClick={() => window.open(`http://127.0.0.1:8000/${ticket.image_path}`, "_blank")}
                                                    >
                                                        Ver imagem
                                                    </Typography>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "gray" }} noWrap>
                                                    Sem imagem
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "0.75rem", padding: "6px" }}>
                                            <Tooltip title={helpers.formatDateTime(ticket?.criado_em)} arrow>
                                                <Typography variant="body2" sx={{ fontSize: "0.7rem" }} noWrap>
                                                    {helpers.isExpired(ticket.criado_em) && <span>🚩</span>}
                                                    {helpers.formatDateTime(ticket.criado_em) || "N/A"}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ padding: "6px" }}>
                                            <Tooltip title="Atender Chamado" arrow>
                                                <IconButton sx={{ padding: "4px", color: "rgb(2, 136, 209)" }} onClick={() => handleOpenModal(ticket)}>
                                                    <FaHeadset size={12} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir Chamado" arrow>
                                                <IconButton sx={{ padding: "4px", color: "red" }} onClick={() => handleDelete(ticket.id)}>
                                                    <FaTrash size={12} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </TableContainer>
            ) : (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Typography variant="h6" color="primary">🎉 Nenhum Chamado Aberto!</Typography>
                    <Typography variant="body1" color="#fff">Aproveite para tomar um café ☕ ou revisar processos internos! 🚀</Typography>
                </Box>
            )}
            {/* <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Atender Chamado #{selectedTicket?.id}</DialogTitle>
                <DialogContent>
                    <Typography>Olá {tecnicos.find(t => Cookies.get("user_name") || "pedrohenrique.admin".toLowerCase().includes(t.toLowerCase()))}
                        , Deseja atender o chamado de {selectedTicket?.user_name} do departamento {selectedTicket?.departamento}?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
                    <Button onClick={handleConfirmAttend} color="primary" variant="contained">Confirmar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={loading}>
                <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
                    <CircularProgress size={50} color="primary" />
                    <Typography sx={{ mt: 2 }}>Atualizando chamado...</Typography>
                </DialogContent>
            </Dialog> */}
        </motion.div>
    );
};

export default TicketsUnassignedTable;
