import React from "react";
import { useNavigate } from "react-router-dom";

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="container mt-5 text-center">
            <h1 className="display-1">403</h1>
            <h2>Forbidden</h2>
            <p className="lead">You don't have permission to access this page.</p>
            <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/")}
            >
                Return to Home
            </button>
        </div>
    );
};

export default Forbidden;

