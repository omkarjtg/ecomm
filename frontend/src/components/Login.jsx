import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../axios";
import "../styles/Auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        identifier: "",
        password: "",
    };

    const validationSchema = Yup.object({
        identifier: Yup.string().required("Username or email is requir  ed"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const response = await API.post("/login", values);
            const token = response.data;
            const user = response.data.user
            console.log(user)   
            // console.log("Received token:", response.data);
            login(token, user);
            // API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            navigate(from, { state: { message: "Login successful!" } });
            toast.success("Login successful!");
        } catch (error) {
            console.log(error);
            setStatus({ error: error.response?.data?.message || "Login failed. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => navigate("/");

    return (
        <div className="auth-overlay">
            <div className="auth-container">
                <button className="close-button" onClick={handleClose}>×</button>
                <h2>Login</h2>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, status }) => (
                        <Form>
                            {status?.error && <div className="error-message">{status.error}</div>}

                            <div className="form-group">
                                <label htmlFor="identifier">Username or Email:</label>
                                <Field type="text" name="identifier" id="identifier" />
                                <ErrorMessage name="identifier" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password:</label>
                                <div className="password-field">
                                    <Field
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                    />
                                    <i
                                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} toggle-password-icon`}
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                                <ErrorMessage name="password" component="div" className="error" />
                            </div>

                            <button type="submit" className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? "Logging in..." : "Login"}
                            </button>

                            <div className="auth-switch">
                                Not registered?{" "}
                                <button type="button" className="switch-button" onClick={() => navigate("/signup")}>
                                    Sign up
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default LoginForm;
