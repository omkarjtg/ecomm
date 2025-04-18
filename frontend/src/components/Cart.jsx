import React, { useEffect, useState, useCallback } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import CartItem from './CartItem';
import '../styles/Cart.css';
import API from "../axios";
import {
  getCartFromLocalStorage,
  removeFromCartInLocalStorage,
  calculateTotalAmount,
  loadRazorpayScript,
} from "../utils/CartUtils";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [postPaymentLoading, setPostPaymentLoading] = useState(false); // New state for post-payment loading
  const [stockChecking, setStockChecking] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const navigate = useNavigate();

  const updateCart = useCallback(async () => {
    const cart = getCartFromLocalStorage();
    if (!cart.length) {
      setCartItems([]);
      return;
    }

    try {
      setStockChecking(true);

      const updatedItems = await Promise.all(
        cart.map(async (item) => {
          try {
            const [productRes, imageRes] = await Promise.all([
              API.get(`/api/product/${item.id}`),
              API.get(`/api/product/${item.id}/image`, { responseType: "blob" }).catch(() => ({ data: null }))
            ]);

            return {
              ...productRes.data,
              quantity: item.quantity,
              imageUrl: imageRes.data ? URL.createObjectURL(imageRes.data) : "/placeholder-image.png"
            };
          } catch (err) {
            console.error("Error fetching item:", err);
            return null;
          }
        })
      );

      const validItems = updatedItems.filter(Boolean);
      const stockIssues = validItems.filter(item => item.quantity > item.stockQuantity);

      setCartItems(validItems);
      setStockErrors(stockIssues);
    } catch (err) {
      console.error("Cart load error:", err);
      toast.error("Failed to load cart items");
    } finally {
      setStockChecking(false);
    }
  }, []);

  useEffect(() => {
    updateCart();
  }, [updateCart]);

  useEffect(() => {
    setTotalAmount(calculateTotalAmount(cartItems));
  }, [cartItems]);

  const handleQuantityChange = (id, qty) => {
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setCartItems(updated);

    const localCart = getCartFromLocalStorage().map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
    );
    localStorage.setItem("cart", JSON.stringify(localCart));
  };

  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    removeFromCartInLocalStorage(id);
    toast.success("Item removed from cart");
  };

  const handleCheckout = async () => {
    if (stockErrors.length > 0) {
      toast.error("Fix stock issues before checkout");
      return;
    }

    try {
      setLoading(true);
      const total = calculateTotalAmount(cartItems);
      const { data: user } = await API.get("/profile");

      // Step 1: Create Razorpay order
      const { data: razorpayOrder } = await API.post("/api/payment/create-order", {
        items: cartItems,
        amount: total
      });

      const { razorpayOrderId } = razorpayOrder;

      // Step 2: Load Razorpay SDK
      if (!await loadRazorpayScript()) throw new Error("Razorpay SDK failed to load");

      // Step 3: Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: total * 100,
        currency: "INR",
        name: "OmCart",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3399cc" },
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            await API.post("/api/payment/verify", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Step 5: Create Order in DB
            await API.post("/api/orders/create", {
              userId: user.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              totalAmount: total,
              items: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
              }))
            });

            // Step 6: Update stock
            await Promise.all(
              cartItems.map(item =>
                API.put(`/api/product/${item.id}/decrement-stock`, {
                  quantity: item.quantity
                })
              )
            );

            // Clear cart
            localStorage.removeItem("cart");
            toast.success("Order placed successfully!");
            Swal.fire("Order placed successfully");

            // Show spinner while redirecting
            setPostPaymentLoading(true);
            setTimeout(() => {
              navigate("/orders");
            }, 1000); // Simulate a brief delay for spinner visibility
          } catch (err) {
            console.error("Order flow failed:", err);
            toast.error("Payment succeeded but order creation failed");
          }
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled"),
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Render spinner during post-payment processing
  if (postPaymentLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Finalizing your order...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
        {cartItems.length > 0 && <span>{cartItems.length} items</span>}
      </div>

      {stockChecking ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>Checking availability...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <img src="/empty-cart.svg" alt="Empty cart" />
          <h4>Your cart is empty</h4>
          <p>Looks like you haven't added anything yet</p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      ) : (
        <>
          {stockErrors.length > 0 && (
            <Alert variant="warning">
              <Alert.Heading>Stock Issues</Alert.Heading>
              <ul>
                {stockErrors.map(item => (
                  <li key={item.id}>
                    {item.name} (Available: {item.stockQuantity})
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="cart-items">
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                disabled={loading}
              />
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-details">
              <div className="summary-row"><span>Subtotal:</span><span>₹{totalAmount.toFixed(2)}</span></div>
              <div className="summary-row"><span>Shipping:</span><span>FREE</span></div>
              <div className="summary-row total"><span>Total:</span><span>₹{totalAmount.toFixed(2)}</span></div>
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={loading || stockErrors.length > 0}
              className="checkout-btn"
            >
              {loading ? <><Spinner as="span" animation="border" size="sm" /> Processing...</> : "Proceed to Checkout"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;