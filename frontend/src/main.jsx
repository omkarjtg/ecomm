import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { useContext } from "react";
import { AppProvider } from "./context/Context.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
// import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <Router> */}
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    {/* </Router> */}
    </AuthProvider> 
  </React.StrictMode>
);