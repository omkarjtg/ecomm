import API from "../axios";
import { useState, useEffect, createContext } from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: (product) => { },
  removeFromCart: (productId) => { },
  updateCartItemQuantity: (productId, newQuantity) => { }, // Added this
  refreshData: () => { },
  updateStockQuantity: (productId, newQuantity) => { },
  clearCart: () => { }
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
  };

  // Add this new function
  const updateCartItemQuantity = (productId, newQuantity) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const refreshData = async () => {
    try {
      const response = await API.get("/api/products");
      setData(response.data);
    } catch (error) {
      setIsError(error.message);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <AppContext.Provider
      value={{
        data,
        isError,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        refreshData,
        clearCart
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;