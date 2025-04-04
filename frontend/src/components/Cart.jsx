import React, { useContext, useState, useEffect } from "react";
import AppContext from "../context/Context";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartImage, setCartImage] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/products");
        const backendProductIds = response.data.map((product) => product.id);

        const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              const response = await axios.get(
                `http://localhost:8080/api/product/${item.id}/image`,
                { responseType: "blob" }
              );
              const imageFile = await converUrlToFile(response.data, response.data.imageName);
              setCartImage(imageFile);
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

  const converUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      for (const item of cartItems) {
        const { imageUrl, imageName, imageData, imageType, quantity, ...rest } = item;
        const updatedStockQuantity = item.stockQuantity - item.quantity;

        const updatedProductData = { ...rest, stockQuantity: updatedStockQuantity };

        const cartProduct = new FormData();
        cartProduct.append("imageFile", cartImage);
        cartProduct.append(
          "product",
          new Blob([JSON.stringify(updatedProductData)], { type: "application/json" })
        );

        await axios.put(`http://localhost:8080/api/product/${item.id}`, cartProduct, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      clearCart();
      setCartItems([]);
      navigate("/checkout-success"); // Redirect to success page
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutError("Checkout failed. Please try again.");
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
                      <i className="bi bi-dash-square-fill"></i>
                    </button>
                    <input type="text" value={item.quantity} readOnly />
                    <button
                      className="plus-btn"
                      onClick={() => handleIncreaseQuantity(item.id)}
                      disabled={isCheckingOut}
                    >
                      <i className="bi bi-plus-square-fill"></i>
                    </button>
                  </div>

                  <div className="total-price">${(item.price * item.quantity).toFixed(2)}</div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={isCheckingOut}
                  >
                    <button type="button" className="btn btn-danger">REMOVE</button>
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
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              {isCheckingOut ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;