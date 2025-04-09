import React, { useContext, useState, useEffect, useCallback } from "react";
import.meta.env.VITE_RAZORPAY_KEY;
import { jwtDecode } from 'jwt-decode';
import AppContext from "../context/Context";
import API from "../axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";
// import { getValidToken, getUserIdFromToken } from '../utils/authValidity';
import CheckoutPopup from "./CheckoutPopup";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import CartItem from "./CartItem";

// Utility function to get and validate token
const getValidToken = () => {
  const token = localStorage.getItem("token")?.trim();
  if (!token || typeof token !== 'string') {
    return null;
  }
  return token;
};

const Cart = () => {
  const { user } = useAuth();
  const { cart, removeFromCart, clearCart, updateCartItemQuantity } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const calculateTotal = useCallback((items) => {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, []);

  const fetchCartDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (cart.length === 0) {
        setCartItems([]);
        return;
      }

      const enhancedItems = await Promise.all(
        cart.map(async (cartItem) => {
          try {
            const productResponse = await API.get(`/api/product/${cartItem.id}`);
            const product = productResponse.data;

            let imageUrl = "/placeholder-image.png";
            try {
              const imageResponse = await API.get(
                `api/product/${cartItem.id}/image`,
                { responseType: "blob" }
              );
              imageUrl = URL.createObjectURL(imageResponse.data);
            } catch (imageError) {
              console.error("Error fetching image:", imageError);
            }

            return {
              ...cartItem,
              ...product,
              imageUrl
            };
          } catch (error) {
            console.error(`Error fetching product ${cartItem.id}:`, error);
            return null;
          }
        })
      );

      const validItems = enhancedItems.filter(item => item !== null);
      setCartItems(validItems);
      setTotalPrice(calculateTotal(validItems));
    } catch (error) {
      console.error("Error fetching cart details:", error);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [cart, calculateTotal]);

  useEffect(() => {
    fetchCartDetails();

    return () => {
      cartItems.forEach(item => {
        if (item.imageUrl && !item.imageUrl.includes("placeholder-image.png")) {
          URL.revokeObjectURL(item.imageUrl);
        }
      });
    };
  }, [fetchCartDetails]);

  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    updateCartItemQuantity(itemId, newQuantity);
  }, [updateCartItemQuantity]);

  const handleRemoveItem = useCallback((itemId) => {
    removeFromCart(itemId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success("Item removed from cart");
  }, [removeFromCart]);

  const validateCart = useCallback(() => {
    const validationErrors = [];

    if (cartItems.length === 0) {
      validationErrors.push("Your cart is empty");
    }

    const outOfStockItems = cartItems.filter(item => item.quantity > item.stockQuantity);
    if (outOfStockItems.length > 0) {
      validationErrors.push(
        `Some items exceed available stock: ${outOfStockItems.map(item => item.name).join(", ")}`
      );
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return false;
    }

    return true;
  }, [cartItems]);

  const handleProceedToCheckout = useCallback(() => {
    if (validateCart()) {
      setShowCheckoutPopup(true);
    }
  }, [validateCart]);

  const processOrder = async () => {
    try {
      setIsProcessing(true);
      
      const token = getValidToken();
      if (!token) {
        throw new Error("Please log in to complete your order");
      }

      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId;
        
        if (!userId) {
          throw new Error("User information not found in token");
        }
      } catch (decodeError) {
        console.error("Token decoding failed:", decodeError);
        throw new Error("Invalid session. Please log in again.");
      }

      // Update stock quantities
      await Promise.all(
        cartItems.map(item =>
          API.put(`api/product/${item.id}/decrement-stock`,
            { quantity: item.quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      // Create order
      await API.post(
        `/api/orders/create`,
        {
          userId, // Send userId in the body instead of query param
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return true;
    } catch (error) {
      console.error('Order processing failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setShowCheckoutPopup(false);

      const token = getValidToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const amountInCents = Math.round(totalPrice * 100);
      const orderResponse = await API.post('/api/payment/create-order', {
        amount: amountInCents,
        currency: 'INR',
        receipt: `order_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { id: order_id, currency, amount } = orderResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_KR4cQ1DoHif5Ar',
        amount,
        currency,
        name: 'Ecomm',
        description: 'Purchase',
        order_id,
        handler: async (response) => {
          try {
            // Verify payment with current token
            const currentToken = getValidToken();
            if (!currentToken) {
              throw new Error("Session expired. Please log in again.");
            }

            await API.post('/api/payment/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }, {
              headers: { Authorization: `Bearer ${currentToken}` }
            });

            await processOrder();
            clearCart();
            toast.success("Order placed successfully!")
            navigate('/orders');
          } catch (err) {
            console.error('Payment verification failed:', err);
            Swal.fire({
              title: 'Payment Error',
              text: err.message || 'Payment verification failed',
              icon: 'error'
            });
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            Swal.fire('Payment Cancelled', 'You can complete your payment later', 'info');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout failed:', error);
      
      let errorMessage = error.response?.data?.message || error.message || 'Checkout error. Please try again.';
      
      if (error.message.includes('token') || error.message.includes('log in')) {
        errorMessage = "Session expired. Please log in again.";
        navigate('/login');
      }

      setError(errorMessage);
      Swal.fire({
        title: 'Checkout Failed',
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [totalPrice, user, processOrder, clearCart, navigate]);

  if (!user) {
    return <div className="auth-prompt">
      <p>Please log in to view your cart</p>
      <button 
        className="btn-primary" 
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </div>;
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your cart..." />;
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
        {cartItems.length > 0 && (
          <span className="item-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <img src="/src/assets/empty-cart.svg" alt="Empty cart" />
          <p>Your cart is empty</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                disabled={isProcessing}
              />
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleProceedToCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>

          <CheckoutPopup
            show={showCheckoutPopup}
            handleClose={() => setShowCheckoutPopup(false)}
            cartItems={cartItems}  // Make sure this is always an array
            totalPrice={totalPrice}
            handleCheckout={handleCheckout}
            loading={isProcessing}
          />
        </>
      )}
    </div>
  );
};

export default Cart;