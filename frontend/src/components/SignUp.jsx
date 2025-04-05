import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
    const { login } = useAuth();    
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        name: "",
        email: "",
        password: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string().max(50, "Name must be 50 characters or less").required("Name is required"),
        email: Yup.string().email("Invalid email address").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    });

        const handleSubmit = async (values, { setSubmitting, setStatus }) => {
            try {
                // Register user
                await axios.post("http://localhost:8080/register", values);

                // Auto-login after successful registration
                const loginResponse = await axios.post("http://localhost:8080/login", {
                    identifier: values.email,
                    password: values.password,
                });

                // Store login and redirect
                login(loginResponse.data);
                navigate("/", { state: { message: "Signup successful! You are now logged in." } });
                toast.success("Sign up successful, Welcome!");

            } catch (error) {
                setStatus({ error: error.response?.data?.message || "Signup/login failed. Please try again." });
                console.error("Signup/Login error:", error);
            } finally {
                setSubmitting(false);
            }
        };


    const handleClose = () => navigate("/");

    return (
        <div className="auth-overlay">
            <div className="auth-container">
                <button className="close-button" onClick={handleClose}>×</button>
                <h2>Sign Up</h2>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, status }) => (
                        <Form>
                            {status?.error && <div className="error-message">{status.error}</div>}

                            <div className="form-group">
                                <label htmlFor="name">Name:</label>
                                <Field type="text" name="name" id="name" />
                                <ErrorMessage name="name" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="div" className="error" />
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
                                {isSubmitting ? "Signing up..." : "Sign Up"}
                            </button>

                            <div className="auth-switch">
                                Already registered?{" "}
                                <button type="button" className="switch-button" onClick={() => navigate("/login")}>
                                    Log in
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default SignupForm;
