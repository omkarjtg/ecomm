import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../context/Context";
import axios from "../axios";
import "../styles/Product.css"; // Import the new CSS file

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/product/${id}`);
        setProduct(response.data);
        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/product/${id}/image`, {
          responseType: "blob",
        });
        setImageUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/product/${id}`);
      removeFromCart(id);
      alert("Product deleted successfully");
      refreshData();
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };
  
  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert("Product added to cart");
  };

  if (!product) {
    return <h2 className="text-center" style={{ padding: "10rem" }}>Loading...</h2>;
  }

  return (
    <div className="containers">
      {/* Left Column - Product Image */}
      <img className="left-column-img" src={imageUrl} alt={product.imageName} />

      {/* Right Column - Product Details */}
      <div className="right-column">
        <div className="product-meta">
          <span>{product.category}</span>
          <p>
            <strong>Listed:</strong> <i>{new Date(product.releaseDate).toLocaleDateString()}</i>
          </p>
        </div>

        <h1 className="product-title">{product.name}</h1>
        <i className="product-brand">{product.brand}</i>

        <p className="product-description-title">PRODUCT DESCRIPTION:</p>
        <p className="product-description">{product.description}</p>

        <div className="product-price">{"$" + product.price}</div>

        <h6>
          Stock Available: <span className="stock-info">{product.stockQuantity}</span>
        </h6>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            className={`btn-primary ${!product.productAvailable ? "disabled-btn" : ""}`}
            onClick={handleAddToCart}
            disabled={!product.productAvailable}
          >
            {product.productAvailable ? "Add to Cart" : "Out of Stock"}
          </button>

          <button className="btn-warning" onClick={handleEditClick}>
            Edit
          </button>

          <button className="btn-danger" onClick={deleteProduct}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
