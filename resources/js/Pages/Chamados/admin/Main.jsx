import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"
import axios from 'axios';
import { Box } from "@mui/material";
import SideBar from "./parts/SideBar/SideBar";
import TicketTabs from "./parts/Tabs/TicketTabs";
import UsersTabs from "./parts/Tabs/UsersTabs";

axios.interceptors.request.use(config => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

const Main = () => {
    const [activeTab, setActiveTab] = useState(Cookies.get("activeTab") || "tickets");

    useEffect(() => {
        Cookies.set("activeTab", activeTab);
    }, [activeTab]);

    return (
        <Box sx={{ display: "flex", overflow: "hidden" }}>
            <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
            <Box sx={{ flexGrow: 1 }}>
                {activeTab === "tickets" && <TicketTabs />}
                {activeTab === "users" && <UsersTabs />}
                {activeTab === "settings" && <h1>Settings Section</h1>}
                {activeTab === "help" && <h1>Help Section</h1>}
            </Box>
        </Box>
    );
};

export default Main;
