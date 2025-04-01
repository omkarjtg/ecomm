    import React, { useEffect, useState } from "react";
    import Home from "./Home"
    import axios from "axios";
    import { useNavigate } from "react-router-dom"; 
    // import { json } from "react-router-dom";
    // import { BiSunFill, BiM  oon } from "react-icons/bi";

    const Navbar = ({ onSelectCategory, onSearch }) => {
      const navigate = useNavigate();
      const getInitialTheme = () => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme ? storedTheme : "light-theme";
      };
      const [selectedCategory, setSelectedCategory] = useState("");
      const [theme, setTheme] = useState(getInitialTheme());
      const [input, setInput] = useState("");
      const [searchResults, setSearchResults] = useState([]);
      const [noResults, setNoResults] = useState(false);
      const [searchFocused, setSearchFocused] = useState(false);
      const [highlightIndex, setHighlightIndex] = useState(-1);
      const [showSearchResults, setShowSearchResults] = useState(false)
      useEffect(() => {
        fetchData();
      }, []);

      const fetchData = async (value) => {
        try {
          const response = await axios.get("http://localhost:8080/api/products");
          setSearchResults(response.data);
          } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

     
  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/search?keyword=${value}`
        );
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
        setHighlightIndex(-1); // Reset index on new search
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };  


      // const handleChange = async (value) => {
      //   setInput(value);
      //   if (value.length >= 1) {
      //     setShowSearchResults(true);
      //     try {
      //       let response;
      //       if (!isNaN(value)) {
      //         // Input is a number, search by ID
      //         response = await axios.get(`http://localhost:8080/api/products/search?id=${value}`);
      //       } else {
      //         // Input is not a number, search by keyword
      //         response = await axios.get(`http://localhost:8080/api/products/search?keyword=${value}`);
      //       }

      //       const results = response.data;
      //       setSearchResults(results);
      //       setNoResults(results.length === 0);
      //       console.log(results);
      //     } catch (error) {
      //       console.error("Error searching:", error.response ? error.response.data : error.message);
      //     }
      //   } else {
      //     setShowSearchResults(false);
      //     setSearchResults([]);
      //     setNoResults(false);
      //   }
      // };

      const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        onSelectCategory(category);
      };

      const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
          setHighlightIndex((prev) =>
            Math.min(prev + 1, searchResults.length - 1)
          );
        } else if (e.key === "ArrowUp") {
          setHighlightIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && highlightIndex >= 0) {
          navigate(`/product/${searchResults[highlightIndex].id}`);
          setShowSearchResults(false);
        }
      };

      const toggleTheme = () => {
        const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
      };

      useEffect(() => {
        document.body.className = theme;
      }, [theme]);

      const categories = [
        "Laptops",
        "Headphones",
        "Mobiles",
        "Television",
        "Electronics",
        "Toys",
        "Clothing",
        "Healthcare and Cosmetics"
      ];
      return (
        <>
          <header>
            <nav className="navbar navbar-expand-lg fixed-top">
              <div className="container-fluid">
                <a className="navbar-brand" href="/">
                  Ecomm
                </a>
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
                <div
                  className="collapse navbar-collapse"
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <a className="nav-link active" aria-current="page" href="/">
                        Home
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/add_product">
                        Add Product
                      </a>
                    </li>

                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="/"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Categories
                      </a>

                      <ul className="dropdown-menu">
                        {categories.map((category) => (
                          <li key={category}>
                            <button
                              className="dropdown-item"
                              onClick={() => handleCategorySelect(category)}
                            >
                              {category}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="nav-item"></li>
                  </ul>
                  <button className="theme-btn" onClick={toggleTheme}>
                    {theme === "dark-theme" ? (
                      <i className="bi bi-moon-fill"></i>
                    ) : (
                      <i className="bi bi-sun"></i>
                    )}
                  </button>

                  <div className="d-flex align-items-center cart">
                    <a href="/cart" className="nav-link text-dark">
                      <i
                        className="bi bi-cart me-2"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        Cart
                      </i>
                    </a>
                    {/* <form className="d-flex" role="search" onSubmit={handleSearch} id="searchForm"> */}
                    <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSearchResults(true)}
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />
        {showSearchResults && (
          <ul className="list-group">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <li
                  key={result.id}
                  className={`list-group-item ${highlightIndex === index ? "active" : ""}`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={() => navigate(`/product/${result.id}`)}
                >
                  {result.name}
                </li>
              ))
            ) : (
              noResults && <p className="no-results-message">No Product Found</p>
            )}
          </ul>
        )}
                    {/* <button
                      className="btn btn-outline-success"
                      onClick={handleSearch}
                    >
                      Search Products
                    </button> */}
                    {/* </form> */}
                    <div />
                  </div>
                </div>
              </div>
            </nav>
          </header>
        </>
      );
    };

    export default Navbar;
