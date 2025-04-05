import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../axios";
    
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Fetch user profile on app load
            axios.get("/profile")
                .then(res => {
                    setUser(res.data);
                    setIsLoggedIn(true);
                })
                .catch(err => {
                    console.error("Failed to load profile", err);
                    logout();
                });
        }
    }, []); 

    const login = (token) => {
        localStorage.setItem("token", token);
        setIsLoggedIn(true);
        // Fetch user profile after login
        axios.get("/profile")
            .then(res => setUser(res.data))
            .catch(err => console.error("Failed to fetch profile after login", err));
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
