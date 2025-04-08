import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
    CircularProgress,
    Typography
} from "@mui/material";
import { FaEnvelope } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { Bounce, toast } from "react-toastify";
import { motion } from "framer-motion";

const Form = ({ ticket }) => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(ticket);
    const [open, setIsOpen] = useState(false);
    // Atualiza o selectedTicket sempre que a prop ticket mudar
    useEffect(() => {
        setSelectedTicket(ticket);
    }, [ticket]);

    const handleChangeMessage = (event) => setMessage(event.target.value);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) {
            toast.info("Campo mensagem não pode ser nulo!", {
                transition: Bounce,
            });
            return;
        }
        setIsLoading(true);
        setIsOpen(true);
        try {
            await api.sendMessage(
                selectedTicket?.id,
                message,
                selectedTicket?.tecnico,
                selectedTicket?.email
            );
            setMessage("");
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
            setOpenDialog(false);
        }
        setIsLoading(false);
        setIsOpen(false)
    };

    return (
        <>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <Dialog
                        open={open}
                        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
                    >
                        <DialogContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <CircularProgress color="primary" />
                        </DialogContent>
                    </Dialog>
                </motion.div>
            )}
            <IconButton onClick={() => setOpenDialog(true)}>
                <FaEnvelope />
            </IconButton>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle sx={{ mb: 1 }}>
                    Enviar mensagem para {selectedTicket?.email}
                </DialogTitle>
                <DialogContent>
                    <CssBaseline />
                    <Box sx={{ color: "#000000" }}>
                        <TextField
                            required
                            label={`Olá ${selectedTicket?.user_name}, verificamos que...`}
                            multiline
                            rows={4}
                            fullWidth
                            name="message"
                            value={message}
                            onChange={handleChangeMessage}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Form;
