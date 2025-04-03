import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const navigate = useNavigate();

    const initialValues = {
        identifier: "", // Changed from email to identifier
        password: "",
    };

    const validationSchema = Yup.object({
        identifier: Yup.string()
            .required("Username or email is required"), // Removed email-specific validation
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const response = await axios.post("http://localhost:8080/login", values);
            localStorage.setItem("token", response.data.token);
            window.dispatchEvent(new Event("storage")); // Notify all tabs/components
            navigate("/", { state: { message: "Login successful!" } });

        } catch (error) {
            setStatus({ error: error.response?.data?.message || "Login failed. Please try again." });
            console.error("Login failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        navigate("/"); // Navigate back to the home page when closing the popup
    };

    return (
        <div className="auth-overlay">
            <div className="auth-container">
                <button className="close-button" onClick={handleClose}>
                    ×
                </button>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, status }) => (
                        <Form>
                            {status?.error && <div className="error-message">{status.error}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="identifier">Username or Email:</label>
                                <Field
                                    type="text"
                                    name="identifier"
                                    id="identifier"
                                    placeholder="Enter your username or email"
                                />
                                <ErrorMessage name="identifier" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password:</label>
                                <Field type="password" name="password" id="password" />
                                <ErrorMessage name="password" component="div" className="error" />
                            </div>

                            <button type="submit" className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? "Logging in..." : "Login"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default LoginForm;