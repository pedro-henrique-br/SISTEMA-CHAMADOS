import React, { useState } from "react";
import { Box } from "@mui/material";
import SideBar from "./parts/SideBar/SideBar";
import TicketTabs from "./parts/Tabs/TicketTabs";
import UsersTabs from "./parts/Tabs/UsersTabs";

const Main = () => {
    const [activeTab, setActiveTab] = useState(1);

    return (
        <Box sx={{ display: "flex", overflow: "hidden" }}>
            <SideBar setActiveTab={setActiveTab} />
            <Box sx={{ flexGrow: 1}}>
                {activeTab === "tickets" && <TicketTabs />}
                {activeTab === "users" && <UsersTabs />}
                {activeTab === "settings" && <h1>Settings Section</h1>}
                {activeTab === "help" && <h1>Help Section</h1>}
            </Box>
        </Box>
    );
};

export default Main;
