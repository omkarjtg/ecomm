import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../context/Context";
import { useAuth } from "../context/AuthContext";
import API from "../axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "../styles/Product.css";
import ReactMarkdown from "react-markdown";
import GenerateDescriptionButton from "./GenerateDescriptionButton";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // New state for toggling description
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        const [productRes, imageRes] = await Promise.all([
          API.get(`/api/product/${id}`),
          API.get(`/api/product/${id}/image`, { responseType: "blob" }),
        ]);

        setProduct(productRes.data);
        setImageUrl(URL.createObjectURL(imageRes.data));
      } catch (err) {
        console.error("Failed to fetch product data", err);
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleDelete = async () => {
    if (!isAdmin) return toast.error("Admin only!");

    const result = await Swal.fire({
      title: "Delete this product?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/api/product/${id}`);
        removeFromCart(id);
        toast.success("Product deleted successfully");
        refreshData();
        navigate("/");
      } catch (err) {
        console.error("Delete failed", err);
        toast.error("Could not delete product");
      }
    }
  };

  const handleEdit = () => {
    if (!isAdmin) return toast.error("Admin only!");
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleDescriptionGenerated = (updatedProduct) => {
    // Update the product state with the new description
    setProduct(updatedProduct);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const DESCRIPTION_LIMIT = 200;

  const description = product?.description || "No description available.";

  // Determine if the description should be truncated
  const isTruncatable = description.length > DESCRIPTION_LIMIT;
  const truncatedDescription = isTruncatable
    ? `${description.substring(0, DESCRIPTION_LIMIT)}...`
    : description;

  if (isLoading) {
    return <div className="product-loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="product-error">Product not found</div>;
  }

  return (
    <section className="product-container">
      <div className="product-image-container">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = "/placeholder-product.png";
          }}
        />
      </div>

      <div className="product-details">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-date">
            Added: {new Date(product.releaseDate).toLocaleDateString()}
          </span>
        </div>

        <h1 className="product-title">{product.name}</h1>
        <p className="product-brand">Brand: {product.brand}</p>

        <div className="product-description">
        <p>
          <ReactMarkdown>
            {isDescriptionExpanded || !isTruncatable ? description : truncatedDescription}
          </ReactMarkdown>
          {isTruncatable && (
            <span
              className="see-more-link"
              onClick={toggleDescription}
              style={{ cursor: "pointer"}}
            >
              {isDescriptionExpanded ? " See Less" : " See More"}
            </span>
          )}
        </p>
          {isAdmin && (
            <GenerateDescriptionButton
              productId={id}
              onDescriptionGenerated={handleDescriptionGenerated}
            />
          )}
        </div>

        <div className="product-pricing">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          <span
            className={`product-stock ${product.stockQuantity > 0 ? "in-stock" : "out-of-stock"
              }`}
          >
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : "Out of stock"}
          </span>
        </div>

        <div className="product-actions">
          <button
            className="btn-add-to-cart"
            onClick={handleAddToCart}
            disabled={!product.productAvailable || product.stockQuantity <= 0}
          >
            {product.productAvailable ? "Add to Cart" : "Unavailable"}
          </button>

          {isAdmin && (
            <div className="admin-actions">
              <button className="btn-edit" onClick={handleEdit}>
                Edit Product
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete Product
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Product;