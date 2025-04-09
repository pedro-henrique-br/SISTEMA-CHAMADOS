import { Box, Button, Typography } from "@mui/material";
import React from "react";

const NotFound = () => {

  return (
    <Box
      sx={{
        width: "100vw",
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}>
      <Typography sx={{ fontSize: "2.5rem" }}>Erro 404</Typography>
      <Typography>Endereço não encontrado</Typography>
      <Button href="/login">Voltar</Button>
    </Box>
  );
};

export default NotFound
