import "./App.css";
import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";
import Product from "./components/Product";
import { toast, ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import API from './axios';
import UpdateProduct from "./components/UpdateProduct";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import LoginForm from "./components/Login";
import ForgotPasswordForm from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import RegisterForm from "./components/SignUp";
import Profile from "./components/Profile";
import Forbidden from "./components/Forbidden";
import { useAuth } from "./context/AuthContext";
import NotFound from "./components/NotFound";
import Orders from "./components/Orders";


// ProtectedRoute component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isLoggedIn, hasRole, user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [shouldShowForbidden, setShouldShowForbidden] = useState(false);

  useEffect(() => {
    if (user === null) return; // wait for user data to load

    setChecked(true);

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
  }, [isLoggedIn, requireAdmin, hasRole, user]);

  if (!checked) return null; // or a loader

  if (shouldRedirect) return <Navigate to="/login" replace />;
  if (shouldShowForbidden) return <Navigate to="/forbidden" replace />;

  return children;
};




function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate('/');
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
    <>
      <Navbar
        onSelectCategory={handleCategorySelect}
      // selectedCategory={selectedCategory}
      />
      <ToastContainer
        position="top-center"
        autoClose={1500} />
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
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} /> 

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
    </>
  );
}

export default App;