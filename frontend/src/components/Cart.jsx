import React, { useContext, useState, useEffect } from "react";
import AppContext from "../context/Context";
import API from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import CheckoutPopup from "./CheckoutPopup";
import Swal from "sweetalert2";

const Cart = () => {
  const { cart, removeFromCart, clearCart, user } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      try {
        const response = await API.get("http://localhost:8080/api/products");
        const backendProductIds = response.data.map((product) => product.id);

        const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              const response = await API.get(
                `http://localhost:8080/api/product/${item.id}/image`,
                { responseType: "blob" }
              );
              const imageUrl = URL.createObjectURL(response.data);
              return { ...item, imageUrl };
            } catch (error) {
              console.error("Error fetching image:", error);
              return { ...item, imageUrl: "placeholder-image-url" };
            }
          })
        );
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cart.length) {
      fetchImagesAndUpdateCart();
    }
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const handleProceedToCheckout = () => {
    const outOfStockItems = cartItems.filter(item => item.quantity > item.stockQuantity);
    if (outOfStockItems.length > 0) {
      setCheckoutError(`Some items exceed available stock`);
      return;
    }
    setShowCheckoutPopup(true);
  };

  const handleCloseCheckoutPopup = () => {
    setShowCheckoutPopup(false);
  };

  const handleIncreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.quantity < item.stockQuantity) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          alert("Cannot add more than available stock");
        }
      }
      return item;
    });
    setCartItems(newCartItems);
  };

  const handleDecreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    setCartItems(newCartItems);
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
  };

  const processOrder = async () => {
    try {
      // Update product stocks
      for (const item of cartItems) {
        await API.put(
          `http://localhost:8080/api/product/${item.id}`,
          { stockQuantity: item.stockQuantity - item.quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
            }
          }
        );
      }

      // Create order record
      await API.post(
        'http://localhost:8080/api/orders/create',
        {
          userId: user?.id,
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
          }
        }
      );
    } catch (error) {
      console.error('Order processing failed:', error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    setShowCheckoutPopup(false);

    try {
      const amountInCents = Math.round(totalPrice * 100); // Convert to cents for Razorpay

      const response = await API.post(
        'http://localhost:8080/api/payment/create-order',
        {
          amount: amountInCents,
          currency: 'USD',
          receipt: `order_${Date.now()}`
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
      );

      const { id: order_id, currency, amount } = response.data;

      const options = {
        key: 'rzp_test_KR4cQ1DoHif5Ar', // Replace with your Razorpay key
        amount,
        currency,
        name: 'E-Commerce Store',
        description: 'Purchase',
        order_id,
        handler: async (response) => {
          try {
            await API.post(
              'http://localhost:8080/api/payment/verify',
              {
                orderId: order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
              }
            );

            await processOrder();
            clearCart();
            navigate('/checkout-success');
          } catch (err) {
            console.error('Payment verification failed:', err);
            Swal.fire('Payment Error', 'Verification failed. Contact support.', 'error');
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
          contact: ''
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Checkout failed:', error);
      Swal.fire(
        'Payment Failed', 
        error.response?.data?.message || 'Checkout error. Please try again.', 
        'error'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-title">Your Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">Your cart is empty</div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-left">
                  <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-name">{item.name}</div>
                </div>

                <div className="cart-item-right">
                  <div className="quantity">
                    <button
                      className="minus-btn"
                      onClick={() => handleDecreaseQuantity(item.id)}
                      disabled={isCheckingOut}
                    >
                      -
                    </button>
                    <input type="text" value={item.quantity} readOnly />
                    <button
                      className="plus-btn"
                      onClick={() => handleIncreaseQuantity(item.id)}
                      disabled={isCheckingOut}
                    >
                      +
                    </button>
                  </div>

                  <div className="total-price">${(item.price * item.quantity).toFixed(2)}</div>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={isCheckingOut}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              Total: <span className="cart-total-amount">${totalPrice.toFixed(2)}</span>
            </div>
            {checkoutError && (
              <div className="alert alert-danger">{checkoutError}</div>
            )}
            <button
              className="checkout-btn"
              onClick={handleProceedToCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>

          <CheckoutPopup
            show={showCheckoutPopup}
            handleClose={handleCloseCheckoutPopup}
            cartItems={cartItems}
            totalPrice={totalPrice}
            handleCheckout={handleCheckout}
            loading={isCheckingOut}
          />
        </>
      )}
    </div>
  );
};

export default Cart;