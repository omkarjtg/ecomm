import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Collapse } from "bootstrap";
import API from "../axios";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Navbar.css";
import * as bootstrap from "bootstrap";

const Navbar = ({ onSelectCategory, selectedCategory }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const collapseRef = useRef(null);

  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const collapseEl = document.getElementById("navbarSupportedContent");
    if (collapseEl) new Collapse(collapseEl, { toggle: false });
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
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    if (input.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        performSearch(input);
      }, 500); // Adjust delay (ms) as needed
    } else {
      setSearchResults([]);
      setNoResults(false);
    }

    return () => clearTimeout(debounceRef.current);
  }, [input]);


  const performSearch = async (value) => {
    try {
      const response = await API.get(`/api/products/search?keyword=${value}`);
      const data = response.data;
      if (data.length > 0) {
        setSearchResults(data);
        setNoResults(false);
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
      setNoResults(true);
    }
  };


  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      navigate(`/product/${searchResults[highlightIndex].id}`);
      setShowSearchResults(false);
      setInput("");
    }
  };

  const handleCategoryClick = (category) => {
    onSelectCategory(category);
    if (dropdownRef.current) {
      const dropdown = bootstrap.Dropdown.getOrCreateInstance(dropdownRef.current);
      dropdown.hide();
    }
  };

  const categories = [
    "Laptops", "Headphones", "Mobile Phones", "Television",
    "Electronics", "Toys", "Clothing", "Healthcare and Cosmetics",
  ];

  return (
    <header>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">eComm</Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => {
              if (collapseRef.current) {
                const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseRef.current);
                bsCollapse.toggle();
              }
            }}
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>


          <div
            ref={collapseRef}
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" to="/">Home</Link>
              </li>

              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  ref={dropdownRef}
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
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>

              {selectedCategory && (
                <li className="nav-item">
                  <span className="nav-link">{selectedCategory}</span>
                </li>
              )}
                <li className="nav-item">
                <a className="nav-link active" target="_blank" href="https://github.com/omkarjtg/ecomm/">About</a>
              </li>     
            </ul>

            {/* Search bar */}
            <div className="search-container position-relative">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" />
                </span>
                <input
                  className="form-control search-input"
                  type="search"
                  placeholder="Search"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {showSearchResults && (
                <ul className="search-dropdown list-group">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <li
                        key={result.id}
                        className={`list-group-item ${index === highlightIndex ? "highlighted" : ""}`}
                        onMouseDown={() => navigate(`/product/${result.id}`)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        {result.name}
                      </li>
                    ))
                  ) : (
                    noResults && <p className="no-results-message">No Product Found</p>
                  )}
                </ul>
              )}
            </div>

            {/* Auth Section */}
            <div className="d-flex align-items-center cart">
              <Link to="/cart" className="nav-link">
                <i className="bi bi-cart me-2">Cart</i>
              </Link>

              {isLoggedIn ? (
                <div className="position-relative" ref={userMenuRef}>
                  <i
                    className="bi bi-person-circle user-icon"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    style={{ fontSize: "1.8rem", cursor: "pointer", marginLeft: "10px" }}
                  />
                  {showUserMenu && (
                    <div className="user-menu">
                      <ul>
                        <li onClick={() => navigate("/profile")}>Profile</li>
                        <li onClick={() => navigate("/orders")}>My Orders</li>
                        <li
                          style={{ backgroundColor: "#d55360" }}
                          onClick={handleLogout}
                        >
                          Logout
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    className="btn btn-primary mx-2"
                    onClick={() => navigate("/login", { state: { from: location.pathname } })}
                  >
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
