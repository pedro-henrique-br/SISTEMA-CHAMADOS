import React, { useState } from "react";
import axios from "axios";
import {
    Button,
    Box,
    Typography,
    Container,
    useMediaQuery,
    useTheme,
    InputBase
} from "@mui/material";
import { toast } from "react-toastify";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!email) {
            return toast.info("Por favor, preencha o e-mail.");
        }

        try {
            await axios.post("/password/forgot", { email });
            toast.success("Enviamos um e-mail com instruções para redefinir sua senha.");
            setEmail("");
        } catch (error) {
            console.error("Erro ao solicitar redefinição de senha", error);
            toast.error("Erro ao enviar e-mail. Verifique se o e-mail está correto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "url('assets/images/background/bg-3.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        textAlign: "center",
                        marginBottom: "2vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        backgroundColor: "white",
                        padding: 4,
                        borderRadius: "4px",
                        width: "430px",
                        border: "1px solid #cecece",
                        height: "440px",
                        boxShadow: "0px 1px 15px 1px rgba(91, 87, 101, 0.34)",
                    }}
                >
                    <img
                        src="assets/images/logos/logo_sabedoria.jpg"
                        alt="Logo"
                        style={{
                            width: "101px",
                            height: "38px",
                            marginTop: "10px",
                            marginBottom: "5px",
                        }}
                    />
                    <Typography
                        sx={{
                            margin: "15px 0",
                            color: "#575962",
                            fontWeight: "400",
                            fontSize: "1rem",
                            textAlign: "center",
                            marginBottom: "1rem",
                        }}
                    >
                        GRUPO SABEDORIA - CHAMADOS
                    </Typography>
                    <Typography
                        sx={{
                            color: "#575962",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            textAlign: "center",
                            marginBottom: "1rem",
                        }}
                    >
                        Esqueceu sua senha?
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                        <InputBase
                            type="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                width: "100%",
                                padding: "15px 20px",
                                borderRadius: "9999px",
                                backgroundColor: "#f9f8fb",
                                fontSize: "0.9rem",
                                fontFamily: "Poppins, sans-serif",
                                color: "#91899f",
                                "& input::placeholder": {
                                    color: "#b0acc1",
                                    opacity: 1,
                                },
                            }}
                        />
                        <Typography
                            sx={{
                                fontSize: "0.8rem",
                                color: "#91899f",
                                marginBottom: "20px",
                            }}
                        >
                            Informe seu e-mail e enviaremos instruções para redefinir sua senha.
                        </Typography>
                        <Button
                            disabled={loading}
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 1,
                                backgroundColor: "#ada333",
                                color: "white",
                                width: "162px",
                                height: "55px",
                                borderRadius: "60px",
                                fontWeight: "400",
                                fontSize: "0.9rem",
                                "&:hover": { backgroundColor: "#9e8e1c" },
                            }}
                        >
                            ENVIAR
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
