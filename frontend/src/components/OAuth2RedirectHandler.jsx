import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(
                    "https://ecomm-txs3.onrender.com/profile",
                    { withCredentials: true }
                );

                if (res.data) {
                    login(null, res.data);
                    toast.success("Logged in via Google!");
                    navigate("/", { replace: true });
                } else {
                    throw new Error("No user info");
                }
            } catch (err) {
                console.error(err);
                toast.error("Login failed");
                navigate("/login", { replace: true });
            }
        };

        fetchUser();
    }, [login, navigate]);

    return null;
};

export default OAuth2RedirectHandler;
