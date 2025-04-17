// src/components/GoogleLoginButton.js
import React from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../styles/GoogleLoginButton.css"

const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${BASE_URL}/oauth2/authorization/google`;
    };

    return (
        <button className="google-login-button" onClick={handleGoogleLogin}>
            <img
                src="./g-logo.png"
                alt="Google logo"
                className="google-logo"
            />
            Continue with Google
        </button>
    );          
};  

export default GoogleLoginButton;
