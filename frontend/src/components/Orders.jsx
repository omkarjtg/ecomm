import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../axios";
import "../styles/Orders.css"; // We'll create this for styling
import { toast } from "react-toastify";

const Orders = () => {
    const { isLoggedIn, user } = useAuth(); // Assuming user object contains user ID or token
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) return; // ProtectedRoute should handle this, but extra safety

        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Assuming an API endpoint like /api/orders/user/:userId
                const response = await API.get(`/api/orders/user/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
                    },
                });
                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load orders. Please try again later.");
                setLoading(false);
                toast.error("Error loading orders");
            }
        };

        fetchOrders();
    }, [isLoggedIn, user]);

    if (loading) {
        return (
            <div className="orders-container">
                <h2>Loading Orders...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-container">
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p className="no-orders">You haven't placed any orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.id}</h3>
                                <span className="order-date">
                                    Placed on: {new Date(order.orderDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="order-details">
                                <p>
                                    <strong>Total:</strong> ${order.total.toFixed(2)}
                                </p>
                                <p>
                                    <strong>Status:</strong> {order.status}
                                </p>
                                <h4>Items:</h4>
                                <ul className="order-items">
                                    {order.items.map((item) => (
                                        <li key={item.productId}>
                                            {item.productName} - Quantity: {item.quantity} - $
                                            {item.price.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
