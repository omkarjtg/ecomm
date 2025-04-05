import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    // Debug user state
    console.log("Current user:", user);

    useEffect(() => {
        console.log("useEffect triggered, user:", user);

        const fetchProfile = async () => {
            try {
                console.log("Fetching profile...");
                const response = await axios.get(`/profile`);
                console.log("Profile response:", response);
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to fetch profile.");
            }
        };

        if (user) {
            console.log("User exists, fetching profile");
            fetchProfile();
        } else {
            console.log("No user found");
        }
    }, [user]);

    return (
        <div className="container mt-5">
            <h2 className="text-center">Profile</h2>

            {profile ? (
                <div className="profile-card">
                    <h4>{profile.username}</h4>
                    <p>Email: {profile.email}</p>
                    <button className="btn btn-danger mt-3" onClick={logout}>
                        Logout
                    </button>
                </div>
            ) : user ? (
                <p>Loading profile...</p>
            ) : (
                <p>Please log in to view your profile</p>
            )}
        </div>
    );
};

export default Profile;