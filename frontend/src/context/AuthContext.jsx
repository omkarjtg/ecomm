import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token !== "undefined") {
            // API.defaults.headers.common["Authorization"] = `Bearer ${token}`;    
        
            API.get("/profile")
                .then(res => {
                    setUser(res.data);
                    setIsLoggedIn(true);
                    setIsAdmin(res.data.roles?.includes('ADMIN') || false);
                })
                .catch(err => {
                    console.error("Failed to load profile", err);
                    // logout();
                });
        }
    }, []);

    const login = async (token) => {
        if (!token) {
            console.error("No token received for login.");
            return;
        }

        localStorage.setItem("token", token);
        // API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsLoggedIn(true);

     
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
            setUser({ email: decodedToken.sub }); // Example: set minimal user data
            setIsAdmin(decodedToken.role === 'ADMIN' || decodedToken.roles?.includes('ADMIN') || false);
        } catch (err) {
            console.error("Failed to decode token", err);
      
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