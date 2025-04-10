import React, { useState, useEffect } from "react";
import { Avatar, Drawer, List, ListItem, ListItemIcon, Box, Badge, Menu, MenuItem, Modal, TextField, Button, Typography, IconButton } from "@mui/material";
import { People, ConfirmationNumber, Settings, HelpOutline, Logout, PhotoCamera } from "@mui/icons-material";
import useUserStore from "../../hooks/useUserStore";
import useTicketStore from "../../hooks/useTicketStore";
import { toast } from "react-toastify"; // Se estiver usando a biblioteca de toast
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";


const SideBar = ({ activeTab, setActiveTab }) => {
    const { user, updateUser, fetchUser, updateAvatar, } = useUserStore();
    const { openTickets, fetchTickets, initPusher } = useTicketStore();
    const [anchorEl, setAnchorEl] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [editedUser, setEditedUser] = useState({ name: user.name, email: user.email, avatar: user.avatar });
    const [avatarFile, setAvatarFile] = useState(null); // Estado para armazenar o arquivo de imagem
    const openMenu = Boolean(anchorEl);

    useEffect(() => {
        fetchUser();
        fetchTickets();
        initPusher();
    }, [initPusher, fetchTickets]);

    const handleTabChange = (tab) => {
        setActiveTab(tab); // Atualiza o estado da aba ativa na aplicação pai
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
        handleClose();
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = () => {
        updateUser(editedUser);
        setOpenModal(false);
    };

    // Função para lidar com a mudança do avatar
    const handleChangeAvatar = (e) => {
        const file = e.target.files[0]; // Obtém o arquivo de imagem
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Por favor, selecione um arquivo de imagem.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarFile(file); // Salva o arquivo real
                setEditedUser({ ...editedUser, avatar: reader.result }); // Previsualiza base64
            };
            reader.readAsDataURL(file);
        }
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove("token"); // Remove o cookie de autenticação
        toast.success("Você saiu com sucesso!");
        window.location.href = "/login";
    };

    const handleUpdateAvatar = async () => {
        if (!avatarFile) {
            toast.error("Por favor, selecione uma imagem.");
            return;
        }

        // Verificar tamanho do arquivo
        if (avatarFile.size > 2048 * 1024) {
            toast.error("A imagem não pode ultrapassar 2MB.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            formData.append("name", editedUser.name); // ou outros campos que desejar alterar

            const response = await updateAvatar(formData);

            if (response?.avatar) {
                updateAvatar({
                    avatar: response.avatar,
                });

                toast.success("Avatar atualizado com sucesso");
                setOpenModal(false);
            }
        } catch (error) {
            console.error(error)
        }
    };

    console.log(user.avatar)

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    overflow: "hidden",
                    width: 55,
                    flexShrink: 0,
                    bgcolor: "#fff",
                    "& .MuiDrawer-paper": {
                        overflow: "hidden", // evita barra de rolagem
                        width: 55,
                        bgcolor: "#fff",
                        borderRight: "1px solid rgb(223, 223, 223)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100vh",
                        pt: 2,
                    },
                }}
            >
                {/* LOGO */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                    <Avatar
                        src="/assets/images/logos/logo_sabedoria2.jpg"
                        sx={{ width: 40, height: 40, borderRight: "1px solid rgb(223, 223, 223)" }}
                        alt="Logo"
                    />
                </Box>

                {/* MENU LOGO + TABS AGRUPADOS */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <List
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <ListItem button selected={activeTab === "tickets"} onClick={() => handleTabChange("tickets")} sx={{ justifyContent: "center" }}>
                            <ListItemIcon sx={{ color: "#838383", minWidth: "auto" }}>
                                <Badge
                                    badgeContent={openTickets > 99 ? "99+" : openTickets}
                                    color="error"
                                    overlap="circular"
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            fontSize: 10,
                                            minWidth: 20,
                                            height: 20,
                                            borderRadius: "10px"
                                        }
                                    }}
                                >
                                    <ConfirmationNumber />
                                </Badge>
                            </ListItemIcon>
                        </ListItem>

                        <ListItem button selected={activeTab === "users"} onClick={() => handleTabChange("users")} sx={{ justifyContent: "center" }}>
                            <ListItemIcon sx={{ color: "#838383", minWidth: "auto" }}>
                                <People />
                            </ListItemIcon>
                        </ListItem>

                        <ListItem button selected={activeTab === "settings"} onClick={() => handleTabChange("settings")} sx={{ justifyContent: "center" }}>
                            <ListItemIcon sx={{ color: "#838383", minWidth: "auto" }}>
                                <Settings />
                            </ListItemIcon>
                        </ListItem>

                        <ListItem button selected={activeTab === "help"} onClick={() => handleTabChange("help")} sx={{ justifyContent: "center" }}>
                            <ListItemIcon sx={{ color: "#838383", minWidth: "auto" }}>
                                <HelpOutline />
                            </ListItemIcon>
                        </ListItem>
                    </List>
                </Box>

                {/* AVATAR DE USUÁRIO NO FINAL */}
                <Box sx={{ mt: "auto", mb: 2, cursor: "pointer" }} onClick={handleAvatarClick}>
                    <Avatar
                        alt={user.name}
                        src={user.avatar}
                        sx={{ width: 40, height: 40, border: "2px solid #ccc" }}
                    />
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    PaperProps={{
                        sx: {
                            bgcolor: "#2c2c2c",
                            color: "#fff",
                            borderRadius: 2,
                            mt: 1
                        }
                    }}
                >
                    <MenuItem onClick={handleOpenModal}>Configurações</MenuItem>
                    <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
            </Drawer>


            {/* MODAL DE CONFIGURAÇÃO */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: 400,
                        bgcolor: "#222831",
                        color: "#fff",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Configurações do Usuário
                    </Typography>

                    <Box sx={{ position: "relative", mb: 2 }}>
                        <Avatar
                            src={editedUser.avatar || user.avatar}
                            alt={user.name}
                            sx={{ width: 70, height: 70, border: "3px solid #fff" }}
                        />
                        <IconButton
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                bgcolor: "#3f51b5",
                                color: "#fff",
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                padding: "5px",
                            }}
                            component="label"
                        >
                            <PhotoCamera sx={{ fontSize: "16px" }} />
                            <input type="file" hidden onChange={handleChangeAvatar} />
                        </IconButton>
                    </Box>

                    <TextField
                        fullWidth
                        name="name"
                        variant="outlined"
                        value={editedUser.name}
                        onChange={handleChange}
                        sx={{ bgcolor: "#fff", borderRadius: "5px", mb: 2 }}
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleUpdateAvatar}>
                        Atualizar Avatar
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default SideBar;
