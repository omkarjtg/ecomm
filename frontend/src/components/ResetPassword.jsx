import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../axios";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
        general: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            password: "",
            confirmPassword: "",
            general: ""
        };

        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const res = await API.post(
                `/reset-password?token=${token}`,
                { newPassword: formData.password }
            );

            toast.success("Password has been reset successfully!");
            navigate('/login');
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                general: error.response?.data?.message || "Error resetting password"
            }));
            toast.error("Failed to reset password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <h2 className="reset-password-heading">Reset Password</h2>
                {errors.general && (
                    <div className="reset-password-error">{errors.general}</div>
                )}
                <form className="reset-password-form" onSubmit={handleSubmit}>
                    <div>
                        <label className="reset-password-label" htmlFor="password">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`reset-password-input ${errors.password ? "input-error" : ""}`}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <div className="reset-password-error">{errors.password}</div>
                        )}
                    </div>

                    <div>
                        <label className="reset-password-label" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`reset-password-input ${errors.confirmPassword ? "input-error" : ""}`}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <div className="reset-password-error">{errors.confirmPassword}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="reset-password-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processing..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;