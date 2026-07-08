import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from "js-cookie"

const Protected = () => {
    const token = Cookies.get("token")
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
}

export default Protected