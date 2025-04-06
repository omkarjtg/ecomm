import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Fetch user profile on app load
            const token = localStorage.getItem("token");
            if (token) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
            axios.get("/profile")
                .then(res => {

                    setUser(res.data);
                    setIsLoggedIn(true);
                    // Check if user has ADMIN role (note uppercase)
                    setIsAdmin(res.data.roles?.includes('ADMIN') || false);
                })
                .catch(err => {
                    console.error("Failed to load profile", err);
                    logout();
                });
        }
    }, []);

    const login = async (token) => {
        localStorage.setItem("token", token);
        setIsLoggedIn(true);

        try {
            const res = await axios.get("/profile");
            setUser(res.data);
            setIsAdmin(res.data.roles?.includes('ADMIN') || false);
        } catch (err) {
            console.error("Failed to fetch profile after login", err);
            logout();
        }
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isAdmin, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);