import '../css/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import Login from './Pages/Chamados/Login';
import NotFound from './Pages/NotFound';
import Form from './Pages/Chamados/user/Form';
import Main from './Pages/Chamados/admin/Main';
import PrivateRoute from './Pages/Chamados/router/PrivateRoute';
import Cookies from 'js-cookie'

const container = document.getElementById('app');
const isAuth = Cookies.get("user_name")
// 25-26

if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.Fragment>
            <Router>
                <Routes>
                    <Route path='/*' element={<NotFound />} />

                    {/* <Route path='/chamados/solicitante' element={
                        <PrivateRoute auth={isAuth}>
                            <Main />
                        </ PrivateRoute>
                    }/> */}

                    <Route path='/chamados/admin' element={
                        <PrivateRoute auth={isAuth}>
                            <Main />
                        </ PrivateRoute>
                    }/>

                    <Route path='/passwordReset' element={
                        <Login />
                    }/>
                    <Route path='/login' element={
                        <Login />
                    }/>
                    {/* Registrar como admin */}

                </Routes>
            </Router>
            <ToastContainer />
        </React.Fragment>
    );
} else {
    console.error("Elemento de montagem não encontrado no DOM.");
}
