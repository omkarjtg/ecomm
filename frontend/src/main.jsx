import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // This is crucial!
import "./index.css";
import { AppProvider } from "./context/Context.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <Router> */}
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
        <App />
        </BrowserRouter>  
      </AppProvider>
    {/* </Router> */}
    </AuthProvider> 
  </React.StrictMode>
);