import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
    const navigate = useNavigate();

    const initialValues = {
        email: "",
    };

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            await API.post("/forgot-password", values); // assuming your backend handles this
            toast.success("Password reset link sent to your email!");
            navigate("/");
        } catch (error) {
            setStatus({ error: error.response?.data?.message || "Something went wrong." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-container">
                <button className="close-button" onClick={() => navigate("/")}>×</button>
                <h2>Forgot Password</h2>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, status }) => (
                        <Form>
                            {status?.error && <div className="error-message">{status.error}</div>}

                            <div className="form-group">
                                <label htmlFor="email">Enter your email:</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="div" className="error" />
                            </div>

                            <button type="submit" className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? "Sending..." : "Send Reset Link"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
