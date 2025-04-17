import React, { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../axios";
import "../styles/Orders.css";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const formatDate = (str) => {
  try {
    return new Date(str).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

const Orders = () => {
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const imageUrlsRef = useRef({});

  const userId = useMemo(() => {
    const token = localStorage.getItem("token")?.trim();
    if (!isLoggedIn || !token) return user?.id || null;
    try {
      const { userId } = jwtDecode(token);
      return userId;  
    } catch {
      return user?.id || null;
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let currentUserId = user?.id;
        if (!currentUserId) {
          const profileRes = await API.get("/profile");
          currentUserId = profileRes.data.id;
        }

        const res = await API.get(`/api/orders/user/${currentUserId}`);
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sorted);

        if (sorted.length === 0) toast.info("No orders found for your account");

        const imageTasks = sorted.flatMap((order) =>
          order.items.map(async ({ productId }) => {
            try {
              const blob = await API.get(`/api/product/${productId}/image`, { responseType: "blob" });
              return { productId, imageUrl: URL.createObjectURL(blob.data) };
            } catch {
              return { productId, imageUrl: "/placeholder-image.png" };
            }
          })
        );

        const resolved = await Promise.all(imageTasks);
        const map = resolved.reduce((acc, { productId, imageUrl }) => {
          acc[productId] = imageUrl;
          return acc;
        }, {});
        imageUrlsRef.current = map;
        setImageUrls(map);

      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to load orders";
        setError(msg);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      Object.values(imageUrlsRef.current).forEach((url) => {
        if (url && !url.includes("placeholder-image.png")) URL.revokeObjectURL(url);
      });
    };
  }, [user?.id]);

  if (loading) return <Spinner message="Loading your orders..." />;
  if (error) {
    return (
      <div className="error-container">
        <h3>{error}</h3>
        {error.toLowerCase().includes("log in") && (
          <button className="btn-primary" onClick={() => (window.location.href = "/login")}>Login</button>
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
          <button className="btn-primary" onClick={() => (window.location.href = "/")}>Browse Products</button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.orderId}</h3>
                <p className="order-date">{formatDate(order.orderDate)}</p>
              </div>
              <p><strong>Razorpay ID:</strong> {order.razorpayOrderId}</p>
              <p><strong>Total Amount:</strong> ₹{order.amount.toFixed(2)}</p>
            </div>

            <div className="order-details">
              <h4>Items:</h4>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={`${order.orderId}-${item.productId}`} className="item-line">
                    <Link to={`/product/${item.productId}`} className="item-link">
                      <img
                        src={imageUrls[item.productId] || "/placeholder-image.png"}
                        alt={item.productName}
                        className="order-product-image"
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
