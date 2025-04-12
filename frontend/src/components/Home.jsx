import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";
import AppContext from "../context/Context";
import unplugged from "../assets/unplugged.png";
import "../styles/Home.css";
import { Spinner } from "react-bootstrap";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    if (data && data.length > 0) {
      const fetchImagesAndUpdateProducts = async () => {
        const updatedProducts = await Promise.all(
          data.map(async (product) => {
            try {
              const response = await API.get(
                `/api/product/${product.id}/image`,
                { responseType: "blob" }
              );
              const imageUrl = URL.createObjectURL(response.data);
              return { ...product, imageUrl };
            } catch (error) {
              console.error(
                "Error fetching image for product ID:",
                product.id,
                error
              );
              return { ...product, imageUrl: "placeholder-image-url" };
            }
          })
        );
        setProducts(updatedProducts);
      };

      fetchImagesAndUpdateProducts();
    }
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  if (isError) {
    return (
      <h2 className="text-center" style={{ padding: "18rem" }}>
        <img
          src={unplugged}
          alt="Error"
          style={{ width: "100px", height: "100px" }}
        />
      </h2>
    );
  }

  return (
    <div className="home-container">

      {/* Display selected category as h2 */}
      <h2 className="category-heading">
        {selectedCategory ? ` ${selectedCategory}` : "All Products"}
      </h2>

      <div className="grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h2 className="me-4">Loading Products...   </h2>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, imageUrl } =
              product;

            return (
              <Link
                to={`/product/${id}`}
                style={{ textDecoration: "none", color: "inherit" }}
                key={id}
              >
                <div
                  className={`card ${!productAvailable ? "out-of-stock" : ""}`}
                >
                  <img src={imageUrl} alt={name} />
                  <div className="card-body">
                    <div>
                      <h5 className="card-title">{name.toUpperCase()}</h5>
                      <i className="card-brand">{"~ " + brand}</i>
                    </div>
                    <hr className="hr-line" />
                    <div className="home-cart-price">
                      <h5>
                        <i className="bi bi-currency-rupee"></i>
                        {price}
                      </h5>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
