// src/components/OAuth2RedirectHandler.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            // You can optionally fetch the user info here using the token
            login(token, null); // assuming your login function handles just the token
            toast.success("Logged in via Google!");
            navigate("/", { replace: true });
        } else {
            toast.error("Login failed: No token received.");
            navigate("/login", { replace: true });
        }
    }, [location, login, navigate]);

    return null;
};

export default OAuth2RedirectHandler;
