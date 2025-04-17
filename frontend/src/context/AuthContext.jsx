import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        API.get("/profile")
            .then(res => {
                const userData = res.data;
                setUser(userData);
                setIsLoggedIn(true);
                setIsAdmin(userData.roles?.includes("ADMIN") || false);
            })
            .catch(err => {
                console.error("❌ Failed to load profile:", err);
                logout();
            });
    }, []);
        

    const login = async (token) => {
        if (!token) return console.error("❌ No token received at login.");

        localStorage.setItem("token", token);
        setIsLoggedIn(true);

        try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const minimalUser = {
                email: decoded.sub,
                roles: decoded.roles || [],
            };
            setUser(minimalUser);
            setIsAdmin(minimalUser.roles.includes("ADMIN"));

            // Optional: Immediately fetch full profile
            API.get("/profile")
                .then(res => {
                    setUser(res.data);
                    setIsAdmin(res.data.roles?.includes("ADMIN") || false);
                })
                .catch(console.error);

        } catch (err) {
            console.error("❌ Failed to decode JWT:", err);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isAdmin, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
