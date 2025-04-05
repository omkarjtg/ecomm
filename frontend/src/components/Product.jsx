import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../context/Context";
import { useAuth } from "../context/AuthContext"; // Added import for useAuth
import axios from "../axios";
import "../styles/Product.css";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const { isAdmin } = useAuth(); // Added useAuth to get isAdmin status
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
    if (!isAdmin) {
      toast.error("Forbidden: Admin access required to delete products");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/product/${id}`);
        removeFromCart(id);
        toast.info("Product deleted successfully");
        refreshData();
        navigate("/");
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire("Error!", "Something went wrong while deleting.", "error");
      }
    }
  };

  const handleEditClick = () => {
    if (!isAdmin) {
      toast.error("Forbidden: Admin access required to edit products");
      return;
    }
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast("Added to Cart!");
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

          {isAdmin && (
            <button className="btn-warning" onClick={handleEditClick}>
              Edit
            </button>
          )}
          {isAdmin && (
            <button className="btn-danger" onClick={deleteProduct}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;