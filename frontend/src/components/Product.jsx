import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../context/Context";
import { useAuth } from "../context/AuthContext";
import API from "../axios";
import "../styles/Product.css";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/api/product/${id}`);
        setProduct(response.data);
        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
        toast.error("Failed to load product");
      }
    };

    const fetchImage = async () => {
      try {
        const response = await API.get(`/api/product/${id}/image`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
        return url;
      } catch (error) {
        console.error("Error fetching image:", error);
        return "";
      }
    };

    fetchProduct();

    // Cleanup image URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [id, imageUrl]);

  const deleteProduct = async () => {
    if (!isAdmin) {
      toast.error("Forbidden: Admin access required");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/api/product/${id}`);
        removeFromCart(Number(id));
        toast.success("Product deleted successfully");
        refreshData();
        navigate("/");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEditClick = () => {
    if (!isAdmin) {
      toast.error("Forbidden: Admin access required");
      return;
    }
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success("Added to Cart!");
    }
  };

  if (error) {
    return <h2 className="text-center" style={{ padding: "10rem" }}>{error}</h2>;
  }

  if (!product) {
    return <h2 className="text-center" style={{ padding: "10rem" }}>Loading...</h2>;
  }

  return (
    <div className="product-container">
      {/* Product Image */}
      <img
        className="product-image"
        src={imageUrl || "/placeholder.png"}
        alt={product.name}
      />

      {/* Product Details */}
      <div className="product-details">
        <div className="product-meta">
          <span>{product.category}</span>
          <span>
            Listed: {new Date(product.releaseDate).toLocaleDateString()}
          </span>
        </div>

        <h1 className="product-title">{product.name}</h1>
        <p className="product-brand">{product.brand}</p>

        <p className="product-description-title">Description</p>
        <p className="product-description">{product.description}</p>

        <p className="product-price">₹{product.price}</p>

        <p className="product-stock">
          Stock: {product.stockQuantity > 0 ? product.stockQuantity : "Out of Stock"}
        </p>

        {/* Action Buttons */}
        <div className="product-buttons">
          <button
            className={`product-button product-button--primary ${
              !product.productAvailable ? "product-button--disabled" : ""
            }`}
            onClick={handleAddToCart}
            disabled={!product.productAvailable}
          >
            {product.productAvailable ? "Add to Cart" : "Out of Stock"}
          </button>

          {isAdmin && (
            <button
              className="product-button product-button--warning"
              onClick={handleEditClick}
            >
              Edit
            </button>
          )}
          {isAdmin && (
            <button
              className="product-button product-button--danger"
              onClick={deleteProduct}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;