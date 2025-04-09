import React from 'react'
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ auth, children }) => {
  return children;
};

// auth ? children : <Navigate to="/chamados/admin/login" />;

export default PrivateRoute;
