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
    useMediaQuery,
    DialogTitle,
    DialogActions,
    Dialog,
    DialogContent,
    CircularProgress
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { FaTrash, FaSyncAlt, FaUser, FaCheckCircle, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import useClosedTicketStore from "../../hooks/useClosedTicketStore";
import Form from "../../components/Form";
import { helpers } from "../../../../../helpers";
import { api } from '../../../utils/api'

const TicketClosedTable = ({ priorityColors, tecnicos }) => {
    const [searchTechnician, setSearchTechnician] = useState("");
    const [startDate, setStartDate] = useState(dayjs().subtract(1, "month").date(25));
    const [endDate, setEndDate] = useState(dayjs().date(25));
    const { tickets, fetchClosedTickets } = useClosedTicketStore();
    const [avatars, setAvatars] = useState({});
    const [searchId, setSearchId] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    useEffect(() => {
        fetchClosedTickets(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
    }, []);

    useEffect(() => {
        const fetchAvatars = async () => {
            const avatarPromises = tickets?.map(async (ticket) => {
                const url = await getUserAvatar(ticket.tecnico);
                return { [ticket.tecnico]: url };
            });

            // Aguarda todas as promessas resolverem e mescla os resultados
            const avatarResults = await Promise.all(avatarPromises);
            setAvatars(Object.assign({}, ...avatarResults));
        };

        fetchAvatars();
    }, [tickets]);

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

    const filteredTickets = Array.isArray(tickets) ? tickets
        .filter(ticket => {
            // Garantir que a estrutura do ticket esteja correta
            if (!ticket || !ticket.criado_em) return false; // Descartar tickets inválidos ou sem data de criação
            if (searchTechnician && ticket.tecnico !== searchTechnician) return false;
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
            <Typography variant="h5" gutterBottom color="white">Chamados Fechados</Typography>

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <TextField
                    label="Buscar por ID"
                    variant="outlined"
                    size="small"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    sx={{ bgcolor: "#fff", minWidth: 200 }}
                />

                <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{ bgcolor: "#fff", borderRadius: 1, minWidth: 200 }}
                >
                    <MenuItem value="">Todas Prioridades</MenuItem>
                    {Object.keys(priorityColors).map((priority) => (
                        <MenuItem key={priority} value={priority}>
                            {priority}
                        </MenuItem>
                    ))}
                </Select>

                <Select
                    value={searchTechnician}
                    onChange={(e) => setSearchTechnician(e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{ bgcolor: "#fff", borderRadius: 1, minWidth: 200 }}
                >
                    <MenuItem value="">Todos Técnicos</MenuItem>
                    {tecnicos.map((tecnico) => (
                        <MenuItem key={tecnico} value={tecnico}>
                            {tecnico}
                        </MenuItem>
                    ))}
                </Select>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: "#fff", fontWeight: "bold" }}>
                                Data Inicial
                            </Typography>
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: "small" } }}
                                sx={{ bgcolor: "#fff", borderRadius: 1, minWidth: 200 }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ color: "#fff", fontWeight: "bold" }}>
                                Data Final
                            </Typography>
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: "small" } }}
                                sx={{ bgcolor: "#fff", borderRadius: 1, minWidth: 200 }}
                            />
                        </Box>
                    </Box>
                </LocalizationProvider>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaSyncAlt />}
                    onClick={() =>
                        fetchClosedTickets(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"))
                    }
                    sx={{ minWidth: 150, height: "40px" }}
                >
                    Buscar
                </Button>
            </Box>


            {tickets?.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", overflowX: "auto", width: "100%" }}>
                    <Box sx={{ width: "100%", overflowX: "auto" }}>
                        <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {["ID", "Aberto Por", "Tipo", "Departamento", "Técnico", "Prioridade", "Mensagem", "Imagem", "Tempo De Conclusão"].map((header) => (
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
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Avatar src={avatars[ticket.tecnico]} sx={{ width: 24, height: 24 }} />
                                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Typography sx={{ textTransform: "capitalize", fontSize: "0.75rem" }} variant="body2">
                                                        {ticket.tecnico}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: "6px" }}>
                                            <Chip label={ticket.prioridade} color={priorityColors[ticket.prioridade]} sx={{ fontSize: "0.7rem", height: "20px" }} />
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
                                            <Tooltip title={helpers.formatDateTime(ticket?.tempo_de_conclusao)} arrow>
                                                <Typography variant="body2" sx={{ fontSize: "0.7rem" }} noWrap>{ticket.tempo_de_conclusao}</Typography>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </TableContainer>
            )
                : (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="h6" color="primary">🎉 Nenhum Fechado!</Typography>
                        <Typography variant="body1" color="#fff">Aproveite para atender Chamados internos! 🚀</Typography>
                    </Box>
                )}

        </motion.div>
    );
};

export default TicketClosedTable;
