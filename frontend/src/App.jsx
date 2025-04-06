import "./App.css";
import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import { toast, ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/Context";
import UpdateProduct from "./components/UpdateProduct";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import LoginForm from "./components/Login";
import RegisterForm from "./components/SignUp";
import Profile from "./components/Profile";
import Forbidden from "./components/Forbidden";
import { useAuth } from "./context/AuthContext";
import NotFound from "./components/NotFound";

// ProtectedRoute component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isLoggedIn, hasRole } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [shouldShowForbidden, setShouldShowForbidden] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please log in to access this page");
      setShouldRedirect(true);
      return;
    }

    if (requireAdmin && !hasRole("ADMIN")) {
      toast.info("Admin access required for this page");
      setShouldShowForbidden(true);
      return;
    }
  }, [isLoggedIn, requireAdmin, hasRole]);
  if (!isLoggedIn) {
    toast.info("Please log in to access this page");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !hasRole("ADMIN")) {
    toast.info("Admin access required for this page");
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar onSelectCategory={handleCategorySelect} />
        <ToastContainer autoClose={2000} />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Home
                addToCart={addToCart}
                selectedCategory={selectedCategory}
              />
            }
          />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<RegisterForm />} />
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Protected Routes (require login) */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin-only Routes */}
          <Route
            path="/add_product"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/update/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <UpdateProduct />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;