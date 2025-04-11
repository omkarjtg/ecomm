import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../axios";
import "../styles/Orders.css";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

const Orders = () => {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({}); // Store image URLs for products

  const userId = useMemo(() => {
    if (!isLoggedIn) return null;
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) throw new Error("Token missing");
      const { userId } = jwtDecode(token);
      return userId;
    } catch (err) {
      console.error("Token decode error:", err);
      return null;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setError("Please log in to view your orders");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/orders/user/${userId}`);
        const data = Array.isArray(res.data) ? res.data : [];
        // Sort orders by orderDate in descending order (newest first)
        const sortedOrders = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sortedOrders);
        if (data.length === 0) toast.info("No orders found for your account");

        // Fetch images for all products in the orders
        const imagePromises = sortedOrders.flatMap((order) =>
          order.items.map(async (item) => {
            try {
              const response = await API.get(`/api/product/${item.productId}/image`, {
                responseType: "blob",
              });
              const imageUrl = URL.createObjectURL(response.data);
              return { productId: item.productId, imageUrl };
            } catch (imageError) {
              console.error(`Error fetching image for product ${item.productId}:`, imageError);
              return { productId: item.productId, imageUrl: "/placeholder-image.png" };
            }
          })
        );

        const images = await Promise.all(imagePromises);
        const imageMap = images.reduce((acc, { productId, imageUrl }) => {
          acc[productId] = imageUrl;
          return acc;
        }, {});
        setImageUrls(imageMap);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to load orders";
        setError(msg);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Cleanup image URLs on component unmount
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url && !url.includes("placeholder-image.png")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [userId, isLoggedIn]);

  const formatDate = (str) => {
    try {
      return new Date(str).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) return <LoadingSpinner message="Loading your orders..." />;

  if (error) {
    return (
      <div className="error-container">
        <h3>{error}</h3>
        {error.includes("log in") && (
          <button className="btn-primary" onClick={() => (window.location.href = "/login")}>
            Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Your Orders</h2>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found for your account</p>
          <button className="btn-primary" onClick={() => (window.location.href = "/products")}>
            Browse Products
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.orderId}</h3>
                <p className="order-date">{formatDate(order.orderDate)}</p>
              </div>
              <p>
                <strong>Razorpay ID:</strong> {order.razorpayOrderId}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{order.amount.toFixed(2)}
              </p>
            </div>

            <div className="order-details">
              <h4>Items:</h4>
              <ul className="order-items">
                {order.items?.map((item) => (
                  <li key={`${order.orderId}-${item.productId}`} className="item-line">
                    <Link to={`/product/${item.productId}`} className="item-link">
                      <img
                        src={imageUrls[item.productId] || "/placeholder-image.png"}
                        alt={item.productName}
                        className="product-image"
                      />
                      <div className="item-details">
                        <span className="product-name">{item.productName}</span>
                        <div className="qty-price">
                          <span className="quantity">Qty: {item.quantity}</span>
                          <span className="price">₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
