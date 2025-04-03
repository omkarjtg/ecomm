import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../styles/Auth.css"
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
    const navigate = useNavigate();

    const initialValues = {
        name: "",
        email: "",
        password: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string()
            .max(50, "Name must be 50 characters or less")
            .required("Name is required"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            await axios.post("http://localhost:8080/register", values);
            navigate("/login", { state: { message: "Signup successful! Please login." } });
        } catch (error) {
            setStatus({ error: error.response?.data?.message || "Signup failed. Please try again." });
            console.error("Signup failed:", error);
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
                                <Field type="password" name="password" id="password" />
                                <ErrorMessage name="password" component="div" className="error" />
                            </div>

                            <button type="submit" className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? "Signing up..." : "Sign Up"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default SignupForm;