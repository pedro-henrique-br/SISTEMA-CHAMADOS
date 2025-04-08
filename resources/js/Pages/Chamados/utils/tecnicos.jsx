import axios from "axios";
import { Bounce, toast } from "react-toastify";
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom";

const getTechnicians = () => {
    const tecnicos = ["Pedro", "Cleverson", "Lucas", "João"]
    return tecnicos
}

export const tecnicos = {
    getTechnicians,
};
