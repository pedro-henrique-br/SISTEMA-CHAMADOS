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
    DialogContent,
    CircularProgress,
    Modal,
    Divider,
} from "@mui/material";
import { FaTrash, FaSyncAlt, FaUser, FaCheckCircle, FaEye, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";
import useTicketStore from "../../hooks/useTicketStore";
import useUserStore from "../../hooks/useUserStore";
import Form from "../../components/Form";
import { helpers } from "../../../../../helpers";
import { api } from '../../../utils/api'

const TicketsAssignedToAuth = ({ priorityColors, tecnicos }) => {
    const { ticketsAttendByMeArray, fetchTickets, deleteTicket, updateTicket, initPusher } = useTicketStore();
    const { user, fetchUser } = useUserStore();
    const [searchId, setSearchId] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatars, setAvatars] = useState({});
    const [newMessage, setNewMessage] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(false);


    const handleAddObservation = async () => {
        if (!newMessage.trim()) return;

        setLoadingMessage(true);

        try {
            await api.addObservation(selectedTicket.id, selectedTicket.tecnico, newMessage);
            if (!selectedTicket) return;
            // Atualiza o estado local com a nova mensagem
            fetchTickets();
            setSelectedTicket((prev) => ({
                ...prev,
                chat: [...(prev?.chat || []), {
                    tecnico: selectedTicket.tecnico,
                    mensagem: newMessage,
                    dataDoEnvio: new Date().toISOString(),
                }]
            }));
            setNewMessage(""); // Limpa o campo de mensagem
        } catch (error) {
            console.error("Erro ao adicionar observação:", error);
        } finally {
            setLoadingMessage(false);
        }
    };


    useEffect(() => {
        const fetchAvatars = async () => {
            const avatarPromises = ticketsAttendByMeArray.map(async (ticket) => {
                const url = await getUserAvatar(ticket.tecnico);
                return { [ticket.tecnico]: url };
            });

            // Aguarda todas as promessas resolverem e mescla os resultados
            const avatarResults = await Promise.all(avatarPromises);
            setAvatars(Object.assign({}, ...avatarResults));
        };

        fetchAvatars();
    }, [ticketsAttendByMeArray]);

    const getUserAvatar = async (tecnico) => {
        try {
            const response = await api.getUser(tecnico)
            const avatar_url = response.avatar_path ? `http://127.0.0.1:8000/${response.avatar_path}` : null
            return avatar_url
        }
        catch (error) {
            return error
        }
    }

    useEffect(() => {
        fetchUser();
        fetchTickets();
        initPusher();
    }, []);

    const handleCloseTicket = () => {
        setLoading(true);  // Inicia o loading

        try {
            api.closeTicket(selectedTicket?.id);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);  // Inicia o loading
            handleCloseDialog();
        }
    };

    const handleOpenModal = (ticket) => {
        setSelectedTicket(ticket);
        setOpenModal(true);
    };

    const chatArray = (() => {
        try {
            if (!selectedTicket?.chat) return []; // Se for null/undefined, retorna array vazio
            return Array.isArray(selectedTicket.chat) ? selectedTicket.chat : JSON.parse(selectedTicket.chat);
        } catch (error) {
            console.error("Erro ao parsear JSON do chat:", error);
            return []; // Em caso de erro no JSON, evita travar a aplicação
        }
    })();

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTicket(null);
    };

    const handleDelete = async (id) => {
        setLoading(true);  // Inicia o loading

        try {
            if (confirm(`Deseja deletar o ticket ID:${id}?`)) {
                await deleteTicket(id);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);  // Inicia o loading
            handleCloseDialog();
        }
    };

    const handleOpenDialog = (ticket) => {
        setSelectedTicket(ticket);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTicket(null);
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

    const filteredTickets = Array.isArray(ticketsAttendByMeArray) ? ticketsAttendByMeArray
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
            <Typography variant="h5" gutterBottom>Meus Chamados</Typography>

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

            {ticketsAttendByMeArray?.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", overflowX: "auto", width: "100%" }}>
                    <Box sx={{ width: "100%", overflowX: "auto" }}>
                        <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {["ID", "Aberto Por", "Tipo", "Departamento", "Técnico", "Prioridade", "Mensagem", "Imagem", "Data", "Ações"].map((header) => (
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
                                                        {ticket.user_name?.split(" ")[0]}
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
                                        <TableCell sx={{ padding: "6px" }}>
                                            <Select
                                                value={ticket.tecnico}
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
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <Avatar src={avatars[ticket.tecnico]} sx={{ width: 24, height: 24 }} />
                                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                            <Typography sx={{ textTransform: "capitalize", fontSize: "0.75rem" }} variant="body2">
                                                                {ticket.tecnico}
                                                            </Typography>
                                                        </Box>
                                                    </Box>}
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
                                            <Tooltip title={ticket.mensagem} arrow>
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
                                            <Tooltip title="Fechar Chamado" arrow>
                                                <IconButton sx={{ padding: "4px", color: "green" }} onClick={() => handleOpenDialog(ticket)}>
                                                    <FaCheckCircle size={12} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Adicionar/Ver Observações" arrow>
                                                <IconButton sx={{ padding: "4px", color: "blue" }} onClick={() => handleOpenModal(ticket)}>
                                                    <FaEye size={12} />
                                                </IconButton>
                                            </Tooltip>
                                            {ticket?.tecnico && <Form ticket={ticket} />}
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
                    <Typography variant="h6" color="primary">🎉 Você não está atendendo nenhum Chamado!</Typography>
                    <Typography variant="body1" color="#fff">Aproveite para tomar um café ☕ ou revisar processos internos! 🚀</Typography>
                </Box>
            )}

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90vw",
                    maxWidth: 500,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column"
                }}>
                    {selectedTicket && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Chamado #{selectedTicket.id} - {selectedTicket.tipo_do_chamado}
                            </Typography>
                            <Typography variant="body2"><strong>Aberto por:</strong> {selectedTicket.user_name}</Typography>
                            <Typography variant="body2"><strong>Departamento:</strong> {selectedTicket.departamento}</Typography>
                            <Typography variant="body2"><strong>Prioridade:</strong> {selectedTicket.prioridade}</Typography>
                            <Typography variant="body2"><strong>Técnico:</strong> {selectedTicket.tecnico || "N/A"}</Typography>

                            <Divider sx={{ my: 2 }} />

                            {/* Exibição das mensagens do chat */}
                            <Box sx={{
                                maxHeight: "250px",
                                overflowY: "auto",
                                p: 2,
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1
                            }}>

                                {selectedTicket?.chat && selectedTicket.chat?.length > 0 ? (
                                    // ex: [{"mensagem":"Muda a senha e observa Cleverson","tecnico":"Lucas","dataDoEnvio":"21\/02\/2025 00:44:43"}]
                                    chatArray.map((msg, index) => (
                                        <Box key={index} sx={{ p: 1, bgcolor: "white", borderRadius: 1 }}>
                                            <Typography variant="body2">
                                                <strong>{msg.tecnico}:</strong> {msg.mensagem}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {msg.dataDoEnvio}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Nenhuma observação registrada.
                                    </Typography>
                                )}
                            </Box>

                            {/* Formulário para enviar mensagens */}
                            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                                <TextField
                                    label="Digite uma mensagem"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <IconButton color="primary" onClick={handleAddObservation} disabled={loadingMessage}>
                                    {loadingMessage ? <CircularProgress size={24} /> : <FaPaperPlane />}
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Finalizar Chamado</DialogTitle>
                <DialogContent>
                    <Typography>Olá {selectedTicket?.tecnico}, deseja finalizar o chamado de {selectedTicket?.user_name} do departamento {selectedTicket?.departamento}?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
                    <Button onClick={handleCloseTicket} color="primary" variant="contained">Confirmar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={loading}>
                <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
                    <CircularProgress size={50} color="primary" />
                    <Typography sx={{ mt: 2 }}>Atualizando chamado...</Typography>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default TicketsAssignedToAuth;
