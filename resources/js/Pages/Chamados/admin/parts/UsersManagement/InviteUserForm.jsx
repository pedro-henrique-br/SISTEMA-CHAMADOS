import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    CircularProgress
} from '@mui/material';

const InviteUserForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        role: 'solicitante',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    // Busca o CSRF token ao montar o componente
    useEffect(() => {
        axios.get('http://192.168.25.221:8000/sanctum/csrf-cookie', { withCredentials: true })
            .then(() => {
                setCsrfToken(true); // só marcamos como carregado
            })
            .catch(() => setError('Erro ao obter CSRF token.'));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post(
                'http://192.168.25.221:8000/register/invite',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            setMessage(response.data.message || 'Convite enviado com sucesso!');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao enviar convite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 400, mx: 'auto', mt: 4 }}
        >
            <Typography variant="h5" textAlign="center">Convidar Novo Usuário</Typography>

            <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
            />

            <TextField
                label="Tipo de Acesso"
                name="role"
                value={formData.role}
                onChange={handleChange}
                select
                required
                fullWidth
            >
                <MenuItem value="solicitante">Solicitante</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
            </TextField>

            {formData.role === 'admin' && (
                <TextField
                    label="Senha (opcional)"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                />
            )}

            <Button type="submit" variant="contained" color="primary" disabled={loading || !csrfToken}>
                {loading ? <CircularProgress size={24} /> : 'Enviar Convite'}
            </Button>

            {message && <Typography color="success.main">{message}</Typography>}
            {error && <Typography color="error.main">{error}</Typography>}
        </Box>
    );
};

export default InviteUserForm;
