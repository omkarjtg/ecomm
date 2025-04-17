import { jwtDecode } from 'jwt-decode';

export const getCartFromLocalStorage = () =>
    JSON.parse(localStorage.getItem("cart")) || [];

export const removeFromCartInLocalStorage = (id) => {
    const cart = getCartFromLocalStorage();
    const updated = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
};

export const calculateTotalAmount = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const isTokenExpired = (token) => {
    try {
        const { exp } = jwtDecode(token);
        return Date.now() >= exp * 1000;
    } catch {
        return true;
    }
};

export const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
