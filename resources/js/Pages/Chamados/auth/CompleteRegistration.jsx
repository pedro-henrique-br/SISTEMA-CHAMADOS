import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
    Button,
    Box,
    Typography,
    Container,
    useMediaQuery,
    useTheme,
    InputBase,
    Link
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export default function CompleteRegistration() {
    const [params] = useSearchParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const token = params.get("token");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const theme = useTheme();

    // useEffect(() => {
    //     const isAuth = Cookies.get("user_name");
    //     if (isAuth) {
    //         window.location.href = "/chamados/admin";
    //     }
    // }, []);


    useEffect(() => {
        axios.get(`/register/validate/${token}`)
            .then(res => {
                setUserData(res.data.user);
            })
            .catch(err => {
                setError("Link inválido ou expirado.");
            });
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!userName || !password || !confirmPassword) {
            return toast.info("Preencha todos os campos.");
        }

        if (password.length < 6) {
            return toast.error("A senha deve ter no mínimo 6 caracteres.");
        }

        if (password !== confirmPassword) {
            return toast.error("As senhas não coincidem.");
        }

        try {
            await axios.post(`/register/complete/${token}`, {
                name: userName,
                password: password,
                password_confirmation: confirmPassword
            });

            toast.success("Cadastro concluído! Faça login.");
            navigate("/login");
        } catch (error) {
            console.error("Erro ao completar cadastro", error);
            toast.error("Erro ao completar cadastro.");
        } finally {
            setLoading(false);
        }
    };


    if (error) return (<Box
        sx={{
            width: "100vw",
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
        }}>
        <Typography sx={{ fontSize: "2.5rem" }}>Erro 403</Typography>
        <Typography>{error}</Typography>
        <Button href="/login">Voltar</Button>
    </Box>
    );

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
            <Container component="main" maxWidth="xs" sx={{ fontFamily: "Poppins, sans-serif" }}>
                <Box
                    sx={{
                        textAlign: "center",
                        marginBottom: "2vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        backgroundColor: "white",
                        paddingTop: "40px",
                        padding: 4,
                        borderRadius: "4px",
                        width: "430px",
                        border: "1px solid #cecece",
                        height: "540px",
                        boxShadow: "0px 1px 15px 1px rgba(91, 87, 101, 0.34)"
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
                        component="h5"
                        variant="h5"
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
                        component="h5"
                        variant="h5"
                    >
                        Complete seu cadastro:
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
                        <InputBase
                            sx={{
                                width: "100%",
                                marginBottom: "10px",
                                padding: "15px 20px",
                                borderRadius: "9999px",
                                backgroundColor: "#f9f8fb",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "0.9rem",
                                fontWeight: "400",
                                lineHeight: "1.25",
                                color: "#91899f",
                                "& input::placeholder": {
                                    color: "#b0acc1",
                                    opacity: 1,
                                },
                                "& input:-webkit-autofill": {
                                    transition: "background-color 9999s ease-in-out 0s",
                                    WebkitTextFillColor: "#333",
                                },
                            }}
                            placeholder="Nome e Sobrenome"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            autoFocus
                        />
                        <InputBase
                            sx={{
                                width: "100%",
                                marginBottom: "15px",
                                padding: "15px 20px",
                                borderRadius: "9999px",
                                backgroundColor: "#f9f8fb",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "0.9rem",
                                fontWeight: "400",
                                lineHeight: "1.25",
                                color: "#91899f",
                                "& input::placeholder": {
                                    color: "#b0acc1",
                                    opacity: 1,
                                },
                                "& input:-webkit-autofill": {
                                    transition: "background-color 9999s ease-in-out 0s",
                                    WebkitTextFillColor: "#333",
                                },
                            }}
                            margin="none"
                            fullWidth
                            name="password"
                            placeholder="Senha"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputBase
                            sx={{
                                width: "100%",
                                marginBottom: "15px",
                                padding: "15px 20px",
                                borderRadius: "9999px",
                                backgroundColor: "#f9f8fb",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "0.9rem",
                                fontWeight: "400",
                                lineHeight: "1.25",
                                color: "#91899f",
                                "& input::placeholder": {
                                    color: "#b0acc1",
                                    opacity: 1,
                                },
                                "& input:-webkit-autofill": {
                                    transition: "background-color 9999s ease-in-out 0s",
                                    WebkitTextFillColor: "#333",
                                },
                            }}
                            margin="none"
                            fullWidth
                            name="password"
                            placeholder="Confirmar senha"
                            type="password"
                            autoComplete="current-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                            disabled={loading}
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 1,
                                mb: 2,
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
                            ENTRAR
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
