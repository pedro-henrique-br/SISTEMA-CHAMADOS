import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function CompleteRegistration() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (token) {
            axios.get(`http://192.168.25.221:8000/register/validate/${token}`)
                .then(res => {
                    setUserData(res.data.user);
                })
                .catch(err => {
                    setError("Link inválido ou expirado.");
                });
        }
    }, [token]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!userData) return <p>Validando convite...</p>;

    return (
        <div>
            <h2>Olá! Complete seu cadastro:</h2>
            <p>Email: {userData.email}</p>
            {/* Aqui você implementa o formulário de nome e senha */}
        </div>
    );
}
