import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ onSelectCategory }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate("/login");
  };

  const handleChange = async (value) => {
    setInput(value);

    if (!value.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/products/search?keyword=${value}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      if (data.length > 0) {
        setSearchResults(data);
        setNoResults(false);
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setNoResults(true);
    }
  };


  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0)); // Wraps around
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1)); // Wraps around
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      navigate(`/product/${searchResults[highlightIndex].id}`);
      setShowSearchResults(false);
      setInput(""); // Clear search after selection
    }
  };



  const categories = [
    "Laptops",
    "Headphones",
    "Mobiles",
    "Television",
    "Electronics",
    "Toys",
    "Clothing",
    "Healthcare and Cosmetics",
  ];

  return (
    <header>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Ecomm</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/add_product">Add Product</a>
              </li>
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categories
                </button>
                <ul className="dropdown-menu">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        className="dropdown-item"
                        onClick={() => onSelectCategory(category)}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            {/* Search Bar */}
            <div className="search-container" style={{ position: "relative" }}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                onKeyDown={handleKeyDown} 
              />


              {showSearchResults && (
                <ul className="search-dropdown list-group">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <li
                        key={result.id}
                        className={`list-group-item ${index === highlightIndex ? "highlighted" : ""}`}
                        onMouseDown={() => navigate(`/product/${result.id}`)}
                        onMouseEnter={() => setHighlightIndex(index)} // 👈 Ensures smooth transition between keyboard & mouse
                      >
                        {result.name}
                      </li>
                    ))
                  ) : (
                    <p className="no-results-message">No Product Found</p>
                  )}
                </ul>

              )}
            </div>

            {/* Cart and User Menu */}
            <div className="d-flex align-items-center cart">
              <a href="/cart" className="nav-link">
                <i className="bi bi-cart me-2">Cart</i>
              </a>

              {isLoggedIn ? (
                <div className="position-relative" ref={userMenuRef}>
                  <i
                    className="bi bi-person-circle user-icon"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    style={{ fontSize: "1.8rem", cursor: "pointer", marginLeft: "10px" }}
                  ></i>

                  {showUserMenu && (
                    <div className="user-menu">
                      <ul>
                        <li onClick={() => navigate("/profile")}>Profile</li>
                        <li onClick={handleLogout}>Logout</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="btn btn-primary mx-2" onClick={() => navigate("/login")}>
                    Login
                  </button>
                  <button className="btn btn-success" onClick={() => navigate("/signup")}>
                    Signup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
