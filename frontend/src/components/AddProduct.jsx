import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Form.css"; 

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: null, // Using Date object for DatePicker
    productAvailable: false,
  });
  const [image, setImage] = useState(null);

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

    // Format the release date to "yyyy-MM-dd"
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
      const response = await axios.post("http://localhost:8080/api/product", formData);
      console.log("Product added successfully:", response.data);
      alert("Product added successfully");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product");
    }
  };

  return (
    <div className="container">
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
          />
        </div>

        {/* Description */}
        <div className="col-12">
          <label className="form-label"><h6>Description</h6></label>
          <input
            type="text"
            className="form-control"
            placeholder="Add product description"
            value={product.description}
            name="description"
            onChange={handleInputChange}
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
          />
        </div>

        {/* Release Date */}
        <div className="col-md-6">
          <label className="form-label"><h6>Release Date</h6></label>
          <DatePicker
            selected={product.releaseDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select release date"
            className="form-control"
          />
        </div>

        {/* Image Upload */}
        <div className="col-md-6">
          <label className="form-label"><h6>Image</h6></label>
          <input className="form-control" type="file" onChange={handleImageChange} />
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
          <button type="submit" className="btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
