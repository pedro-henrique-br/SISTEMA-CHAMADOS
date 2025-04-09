import React, { useEffect, useState } from "react";
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
import { api } from "../../Chamados/utils/api";
import Cookies from "js-cookie";

const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const isAuth = Cookies.get("user_name");
        if (isAuth) {
            window.location.href = "/chamados/admin";
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userName && password) {
            try {
                await api.auth(userName, password);
                if (Cookies.get("user_name")) {
                    window.location.href = "/chamados/admin";
                }
            } catch (error) {
                console.error("Authentication failed", error);
            }
        } else {
            toast.info("Preencha todos os campos");
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
                        width: isMobile ? "90vw" : "430px",
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
                            marginBottom: "3rem",
                        }}
                        component="h5"
                        variant="h5"
                    >
                        GRUPO SABEDORIA - CHAMADOS
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
                            placeholder="Email"
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
                        <Button
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
                    <Link
                        href="/reset-password"
                        underline="none"
                        sx={{
                            color: '#1976d2',
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            display: 'block',
                            transition: '0.2s',
                            '&:hover': {
                                color: '#115293',
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Redefinir Senha
                    </Link>
                </Box>
            </Container>
        </Box>
    );
};

export default Login;
