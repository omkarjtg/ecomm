import React, { useEffect, useState } from "react";
import API from "../axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Badge, Spinner } from "react-bootstrap"; // Added Bootstrap components

const Profile = () => {
    const { user, logout, isAdmin } = useAuth(); // Destructured isAdmin properly
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Debug user state
    console.log("Current user:", user);

    useEffect(() => {
        console.log("useEffect triggered, user:", user);

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                console.log("Fetching profile...");
                const response = await API.get(`/profile`);
                console.log("Profile response:", response);
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to fetch profile.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            console.log("User exists, fetching profile");
            fetchProfile();
        } else {
            console.log("No user found");
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully!");
        navigate("/login");
    };

    return (
        <div className="container mt-5 mb-5">
            <h2 className="text-center mb-4" style={{ color: "#2c3e50" }}>
                User Profile
            </h2>

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading profile...</p>
                </div>
            ) : profile ? (
                <Card className="shadow-lg" style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <Card.Header className="bg-primary text-white text-center">
                        <h4 className="mb-0">
                            {profile.username}
                            {isAdmin && (
                                <Badge bg="success" className="ms-2">
                                    Admin
                                </Badge>
                            )}
                        </h4>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>
                            <strong>Email:</strong> {profile.email}
                        </Card.Text>
                        <Card.Text>
                            <strong>Member Since:</strong>{" "}
                            {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}

                        </Card.Text>

                        {/* Action Buttons */}
                        <div className="d-flex justify-content-between mt-4">
                            {isAdmin && (
                                <Link
                                    to="/add_product"
                                    className="btn btn-success"
                                // style={{ backgroundColor: "#2980b9", borderColor: "#2980b9" }}
                                >
                                    <i className="bi bi-plus-circle me-1"></i> Add Product
                                </Link>
                            )}
                            {!isAdmin && (
                                <Link to="/orders" className="btn btn-warning orders-btn">
                                    <i class="bi bi-bag-check-fill me-1"></i>
                                    Your Orders
                                </Link>
                            )}
                            <button
                                style={{ color: "black" }}
                                className="btn btn-danger ms-auto" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-1"></i>
                                Log Out
                            </button>

                        </div>
                    </Card.Body>
                    {/* <Card.Footer className="text-muted text-center">
                        Last updated: {new Date().toLocaleTimeString()}
                    </Card.Footer> */}
                </Card>
            ) : user ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading profile...</p>
                </div>
            ) : (
                <div className="text-center">
                    <p className="lead">Please log in to view your profile</p>
                    <Link to="/login" className="btn btn-outline-primary">
                        Go to Login
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Profile;