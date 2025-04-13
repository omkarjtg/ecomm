import React from "react";
import { useNavigate } from "react-router-dom";


const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="container mt-5 text-center">
            <h1 className="display-1">404</h1>
            <h2>Page Not Found</h2>
            <p className="lead">The page you're looking for doesn't exist.</p>
            <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/")}
            >
                Return to Home  
            </button>
        </div>
    );
};

export default NotFound;