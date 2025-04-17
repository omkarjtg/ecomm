import React, { useEffect, useState, useCallback } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import CartItem from './CartItem';
import '../styles/Cart.css';
import { jwtDecode } from "jwt-decode";
import API from "../axios";
import {
  getCartFromLocalStorage,
  removeFromCartInLocalStorage,
  calculateTotalAmount,
  loadRazorpayScript,
  isTokenExpired,
} from "../utils/CartUtils";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
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
        cart.map(async (cartItem) => {
          try {
            const [productRes, imageRes] = await Promise.all([
              API.get(`/api/product/${cartItem.id}`),
              API.get(`api/product/${cartItem.id}/image`, { responseType: "blob" })
                .catch(() => ({ data: null })) // Gracefully handle image errors
            ]);

            const imageUrl = imageRes.data
              ? URL.createObjectURL(imageRes.data)
              : "/placeholder-image.png";

            return {
              ...productRes.data,
              quantity: cartItem.quantity,
              imageUrl
            };
          } catch (error) {
            console.error("Error fetching product:", error);
            return null;
          }
        })
      );

      const validItems = updatedItems.filter(item => item !== null);
      const stockIssues = validItems.filter(item => item.quantity > item.stockQuantity);

      setStockErrors(stockIssues);
      setCartItems(validItems);
    } catch (error) {
      console.error("Error updating cart:", error);
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

  const handleQuantityChange = (id, value) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, value) } : item
    );
    setCartItems(updatedCart);

    const cart = getCartFromLocalStorage();
    const updatedLocalCart = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, value) } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedLocalCart));
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    removeFromCartInLocalStorage(id);
    toast.success("Item removed from cart");
  };

  const handleCheckout = async () => {

    if (stockErrors.length > 0) {
      toast.error("Please fix stock issues before checkout");
      return;
    }

    try {
      setLoading(true);
      const total = calculateTotalAmount(cartItems);
      // const user = jwtDecode(token);
      const profileRes = await API.get("/profile");
      const user = profileRes

      const res = await API.post("/api/payment/create-order", {
        items: cartItems,
        amount: total
      });

      const { razorpayOrderId } = res.data;
      if (!await loadRazorpayScript()) {
        throw new Error("Razorpay SDK load failed");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: total * 100,
        currency: "INR",
        name: "OmCart",
        description: "Product Purchase",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await API.post("/api/payment/verify", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
             });

            // Update stock for all items
            await Promise.all(
              cartItems.map(item =>
                API.put(`/api/product/${item.id}/decrement-stock`, {
                  quantity: item.quantity
                })
              )
            );

            localStorage.removeItem("cart");
            toast.success("Order placed successfully!");
            navigate("/orders");
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => {
            toast.info("Payment window closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-title">Your Shopping Cart</h2>
        {cartItems.length > 0 && (
          <span className="item-count">{cartItems.length} items</span>
        )}
      </div>

      {stockChecking ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Checking product availability...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <img src="/empty-cart.svg" alt="Empty cart" className="empty-cart-img" />
          <h4>Your cart is empty</h4>
          <p>Looks like you haven't added anything to your cart yet</p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          {stockErrors.length > 0 && (
            <Alert variant="warning" className="stock-alert">
              <Alert.Heading>Stock Issues</Alert.Heading>
              <p>Some items in your cart exceed available stock:</p>
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
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveFromCart}
                disabled={loading}
              />
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleCheckout}
              disabled={loading || stockErrors.length > 0}
              className="checkout-btn"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" /> Processing...
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;