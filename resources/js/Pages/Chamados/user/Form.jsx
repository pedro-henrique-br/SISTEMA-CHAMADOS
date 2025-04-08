import {
    Box,
    Button,
    CssBaseline,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { BsCloud } from "react-icons/bs";
import styled from "@emotion/styled";
import { api } from "../utils/api";
import { Bounce, toast } from "react-toastify";

// VisuallyHiddenInput for file input accessibility
const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const Form = () => {
    const [windowWidth, setWindowWidth] = useState(window.screen.width);
    const [type, setType] = useState("");
    const [priority, setPriority] = useState("");
    const [department, setDepartment] = useState("");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const ticketTypes = [
        "📨 Problemas com Email",
        "🖨️ Problemas com Impressora",
        "💻 Problemas com Computador",
        "🔑 Alteração de Senha",
        "🖥️ Requisição de Computador",
        "🚫 Requisição de Acesso(s)",
        "⚠️ Problemas com NBS",
        "⚛️ Problemas com Via Nuvem",
        "🌐 Global Connect",
        "📞 Problemas com Ramal/Telefone",
        "⚛️ Processo Via Nuvem",
        "🗂️ Implantação de Sistema",
        "📊 Analise de BI",
        "👥 Treinamento",
        "🛡️ Modificação de Sistema",
        "💬 Outro...",
    ];

    const departments = [
        "Vendas",
        "Oficina",
        "Administrativo",
        "Peças",
        "Contabilidade",
        "Estoque",
        "Financeiro",
        "Vendas Direta",
        "Compras",
        "RH",
        "Diretoria",
        "Ecommerce",
        "CRM",
        "Caixa",
        "SGMK",
        "Terceiros",
        "TI",
    ];

    const handleChangeType = (event) => setType(event.target.value);
    const handleChangeLocation = (event) => setDepartment(event.target.value);
    const handleChangeEmail = (event) => setEmail(event.target.value);
    const handleChangeMessage = (event) => setMessage(event.target.value);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            const maxSize = 3 * 1024 * 1024; // 3MB

            if (!validImageTypes.includes(selectedFile.type)) {
                alert("Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas.");
                return;
            }

            if (selectedFile.size > maxSize) {
                alert("A imagem deve ter no máximo 3MB.");
                return;
            }

            setFile(selectedFile);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!department || !email) {
            toast.info("Preencha os campos Email e Departamento!", { transition: Bounce });
            return;
        }

        setIsLoading(true);
        const formData = new FormData(); // Definição correta da variável

        const ticket = {
            _type: type,
            _department: department,
            user_email: email,
            message,
        };

        try {
            // if (file) await api.uploadFile(file);
            await api.createTicket(ticket._type, ticket.user_email, ticket._department, ticket.message, file);
            setDepartment("")
            setEmail("")
            setMessage("")
            setFile("")
            setType("")
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    };

    const matchesMobile = useMediaQuery("(max-width: 800px)");

    window.addEventListener("resize", () => setWindowWidth(window.screen.width));

    return (
        <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
            <Box
                sx={{
                    color: "#000000",
                    width: "100vw",
                    display: "flex",
                    height: "100vh",
                    gap: "20px",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        background: "#f7f7f7",
                        height: "100vh",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "2rem",
                    }}
                >
                    <CssBaseline />
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: matchesMobile ? "100%" : "45%",
                            padding: "1rem",
                            background: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <Typography component="h1" variant="h5" sx={{ marginBottom: "2vh", fontWeight: "bold" }}>
                            Abertura de Chamado
                        </Typography>

                        <Box component="form" noValidate onSubmit={handleSubmit}>

                            <InputLabel sx={{ fontWeight: "bold", marginBottom: 1 }}>Email</InputLabel>
                            <TextField
                                required
                                label="exemplo@caprichoveiculos.com.br"
                                fullWidth
                                name="email"
                                value={email}
                                onChange={handleChangeEmail}
                                sx={{ marginBottom: 1 }}
                            />
                            <InputLabel sx={{ fontWeight: "bold", marginBottom: 1 }}>Tipo de Chamado</InputLabel>
                            <Select
                                fullWidth
                                value={type}
                                onChange={handleChangeType}
                                sx={{ marginBottom: 2 }}
                            >
                                {ticketTypes.map((ticketType, index) => (
                                    <MenuItem key={index} value={ticketType}>
                                        {ticketType}
                                    </MenuItem>
                                ))}
                            </Select>

                            <TextField
                                required
                                label="Conte-nos mais sobre o problema..."
                                multiline
                                rows={4}
                                fullWidth
                                name="message"
                                value={message}
                                onChange={handleChangeMessage}
                                sx={{ marginBottom: 2 }}
                            />

                            <Button
                                sx={{ marginBottom: "1vh", marginTop: "10px" }}
                                component="label"
                                variant="contained"
                                startIcon={<BsCloud />}
                                fullWidth
                            >
                                {file ? file.name : "Anexar imagem"}
                                <VisuallyHiddenInput type="file" onChange={handleFileChange} accept="image/*" />
                            </Button>


                            <Box sx={{ flex: 1 }}>
                                <InputLabel sx={{ fontWeight: "bold" }}>Departamento</InputLabel>
                                <Select
                                    value={department}
                                    onChange={handleChangeLocation}
                                    fullWidth
                                >
                                    {departments.map((dept, index) => (
                                        <MenuItem key={index} value={dept}>
                                            {dept}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 1,
                                    mb: 2,
                                    backgroundColor: "#1a73e8",
                                    "&:hover": {
                                        backgroundColor: "#155ab6",
                                    },
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} sx={{ color: "#18bd5b" }} />
                                ) : (
                                    "Abrir Chamado"
                                )}
                            </Button>
                        </Box>
                    </Box>

                    <img
                        style={{ height: "321px", width: "514px" }}
                        src="/suporte-de-ti.jpeg"
                        alt="suporte de ti"
                    />
                </Box>
            </Box>
        </motion.div>
    );
};

export default Form;
