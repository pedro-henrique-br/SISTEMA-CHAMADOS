import React from 'react'
import { Button } from "@mui/material";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove("user_name"); // Remove o cookie de autenticação
        toast.success("Você saiu com sucesso!");
        navigate("/chamados/admin"); // Redireciona para a página de login
    };

    return (
        <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ position: "absolute", top: 10, right: 20 }}
        >
            Sair
        </Button>
    );
};

export default LogoutButton;
