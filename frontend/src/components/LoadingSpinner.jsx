import React from "react";
import PropTypes from "prop-types";
import "../styles/LoadingSpinner.css"; // Create this CSS file

const LoadingSpinner = ({ size = "medium", color = "primary", message }) => {
    const sizeClass = `spinner-${size}`;
    const colorClass = `spinner-${color}`;

    return (
        <div className="loading-spinner-container">
            <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
                <div className="spinner-sector spinner-sector-1"></div>
                <div className="spinner-sector spinner-sector-2"></div>
                <div className="spinner-sector spinner-sector-3"></div>
            </div>
            {message && <p className="spinner-message">{message}</p>}
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(["small", "medium", "large"]),
    color: PropTypes.oneOf(["primary", "secondary", "light", "dark"]),
    message: PropTypes.string,
};

export default LoadingSpinner;