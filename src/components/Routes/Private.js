import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth.js";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";

export default function PrivateRoute() {
    const [auth, setAuth] = useAuth();
    const API_BASE_URL = process.env.NODE_API_URL || 'https://express-vercel-demo-six.vercel.app';


    
    useEffect(() => {
        const authCheck = async () => {
            if (!auth.isAuthenticated) {
                const res = await axios.get('${API_BASE_URL}/admin/user-auth');
                if(res.data.ok) {
                    setAuth(prevAuth => ({ ...prevAuth, isAuthenticated: true }));
                } else {
                    setAuth(prevAuth => ({ ...prevAuth, isAuthenticated: false }));
                }
            }
        };
        if(auth?.token) authCheck();
    }, [auth?.token, auth.isAuthenticated, setAuth]);

    return auth.isAuthenticated ? <Outlet /> : <Spinner />;
}







