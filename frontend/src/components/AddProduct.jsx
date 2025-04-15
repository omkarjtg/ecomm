import React, { useState } from "react";
import API from "../axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Form.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from "react-bootstrap"; // Import Spinner from react-bootstrap

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: null,
    productAvailable: false,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleDateChange = (date) => {
    setProduct({ ...product, releaseDate: date });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when submission starts

    // Format release date properly
    const formattedDate = product.releaseDate
      ? product.releaseDate.toISOString().split("T")[0]
      : "";

    const formData = new FormData();
    formData.append(
      "product",
      new Blob([JSON.stringify({ ...product, releaseDate: formattedDate })], {
        type: "application/json",
      })
    );

    if (image) {
      formData.append("imageFile", image);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user might be logged out.");
        toast.error("Authentication error. Please log in.");
        setLoading(false); // Reset loading on error
        return;
      }

      console.log("Using token for API request:", token);
      console.log(formData);

      const response = await API.post(
        "/api/product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const productId = response.data.id;

      console.log("Product added successfully:", response.data);
      toast.success("Product added successfully!");
      navigate(`/product/${productId}`);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product");
    } finally {
      setLoading(false); // Reset loading when request completes (success or error)
    }
  };

  return (
    <div className="container">
      <h1>Add Product</h1>
      <form className="row g-3 pt-5" onSubmit={submitHandler}>
        {/* Product Name */}
        <div className="col-md-6">
          <label className="form-label"><h6>Name</h6></label>
          <input
            type="text"
            className="form-control"
            placeholder="Product Name"
            onChange={handleInputChange}
            value={product.name}
            name="name"
            required
          />
        </div>

        {/* Brand */}
        <div className="col-md-6">
          <label className="form-label"><h6>Brand</h6></label>
          <input
            type="text"
            name="brand"
            className="form-control"
            placeholder="Enter your Brand"
            value={product.brand}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Description */}
        <div className="col-12">
          <label className="form-label"><h6>Description (Optional - Will be generated if left blank)</h6></label>
          <textarea
            className="form-control"
            placeholder="Add product description (optional)"
            value={product.description}
            name="description"
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        {/* Price */}
        <div className="col-md-6">
          <label className="form-label"><h6>Price</h6></label>
          <input
            type="number"
            className="form-control"
            placeholder="Eg: $1000"
            onChange={handleInputChange}
            value={product.price}
            name="price"
            required
          />
        </div>

        {/* Category */}
        <div className="col-md-6">
          <label className="form-label"><h6>Category</h6></label>
          <select
            className="form-select"
            value={product.category}
            onChange={handleInputChange}
            name="category"
            required
          >
            <option value="">Select category</option>
            <option value="Laptops">Laptops</option>
            <option value="Headphones">Headphones</option>
            <option value="Mobiles">Mobiles</option>
            <option value="Television">Television</option>
            <option value="Electronics">Electronics</option>
            <option value="Toys">Toys</option>
            <option value="Clothing">Clothing</option>
            <option value="Healthcare and Cosmetics">Healthcare and Cosmetics</option>
          </select>
        </div>

        {/* Stock Quantity */}
        <div className="col-md-6">
          <label className="form-label"><h6>Stock Quantity</h6></label>
          <input
            type="number"
            className="form-control"
            placeholder="Stock Remaining"
            onChange={handleInputChange}
            value={product.stockQuantity}
            name="stockQuantity"
            required
          />
        </div>

        {/* Release Date */}
        <div className="col-md-6">
          <label className="form-label"><h6>Release Date</h6></label> <br />
          <DatePicker
            selected={product.releaseDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select release date"
            className="form-control"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="col-md-6">
          <label className="form-label"><h6>Image</h6></label>
          <input
            className="form-control"
            type="file"
            onChange={handleImageChange}
            required
          />
        </div>

        {/* Product Available Checkbox */}
        <div className="col-12 form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="productAvailable"
            checked={product.productAvailable}
            onChange={(e) =>
              setProduct({ ...product, productAvailable: e.target.checked })
            }
          />
          <label className="form-check-label">Product Available</label>
        </div>

        {/* Submit Button */}
        <div className="col-12">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && (
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
                role="status"
              />
            )}
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
