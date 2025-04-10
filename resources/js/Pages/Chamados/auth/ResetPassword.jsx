import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Box,
    Typography,
    Container,
    InputBase
} from "@mui/material";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [userData, setUserData] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [params] = useSearchParams();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const token = params.get("token");

    useEffect(() => {
        axios.get(`/password/validate/${token}`)
            .then(res => {
                setUserData(res.data.user);
            })
            .catch(err => {
                setError("Link inválido ou expirado.");
            })
            .finally(() => {
                setIsValidating(false); // finalizou a tentativa de validação
            })
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            return toast.info("Por favor, preencha todos os campos.");
        }

        if (password.length < 6) {
            return toast.warning("A senha deve ter no mínimo 6 caracteres.");
        }

        if (password !== confirmPassword) {
            return toast.error("As senhas não coincidem.");
        }

        setLoading(true)

        try {
            await axios.post(`/password/reset/${token}`, {
                password: password,
                password_confirmation: confirmPassword,
            });
            toast.success("Senha redefinida com sucesso, faça login!");
            setPassword("");
            setConfirmPassword("");
            navigate("/login");
        } catch (error) {
            console.error("Erro ao redefinir senha", error);
            toast.error(error.response.data.message || "Erro ao redefinir senha, Link inexistente ou inválido");
        } finally {
            setLoading(false)
        }
    };

    if (!token || error) return (<Box
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

    if (!isValidating && !error) {
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
                            height: "480px",
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
                            Redefinir Senha
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}
                        >
                            <InputBase
                                type="password"
                                placeholder="Nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            <InputBase
                                type="password"
                                placeholder="Confirmar nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    marginBottom: "5px",
                                    textAlign: "center"
                                }}
                            >
                                Crie uma nova senha com pelo menos 6 caracteres.
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
                                    width: "200px",
                                    height: "55px",
                                    borderRadius: "60px",
                                    fontWeight: "400",
                                    fontSize: "0.9rem",
                                    "&:hover": { backgroundColor: "#9e8e1c" },
                                }}
                            >
                                REDEFINIR SENHA
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        );
    }
}
