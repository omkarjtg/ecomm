import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../axios";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Form.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from "react-bootstrap"; // Import Spinner from react-bootstrap

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState(null);
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: null,
    productAvailable: false,
    stockQuantity: "",
  });
  const [loading, setLoading] = useState(false); // Add loading state

  const converUrlToFile = async (blobData, fileName) => {
    return new File([blobData], fileName, { type: blobData.type });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`api/product/${id}`);

        setProduct(response.data);

        const responseImage = await API.get(`/api/product/${id}/image`, {
          responseType: "blob",
        });
        const image = await converUrlToFile(
          responseImage.data,
          response.data.imageName
        );
        setImage(image);

        setUpdateProduct({
          ...response.data,
          releaseDate: response.data.releaseDate
            ? new Date(response.data.releaseDate)
            : null,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details. Please try again.");
      }
    };

    fetchProduct();
  }, [id]);

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when submission starts

    const formData = new FormData();
    formData.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );

    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await API.put(`/api/product/${id}`, formData);

      console.log("Product updated successfully:", response.data);
      toast.success("Product updated successfully!");
      navigate(`/product/${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setLoading(false); // Reset loading when request completes (success or error)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCancel = () => {
    navigate(`/product/${id}`);
  };

  // If user is not admin, show forbidden message
  if (!isAdmin) {
    return (
      <div className="update-product-container">
        <div className="center-container">
          <h1>Forbidden</h1>
          <p>You don't have permission to update products. Admin access required.</p>
        </div>
      </div>
    );
  }

  // If user is admin, show the update form
  return (
    <div className="update-product-container">
      <div className="center-container">
        <h1>Update Product</h1>
        <form className="row g-3 pt-1" onSubmit={submitHandler}>
          <div className="col-md-6">
            <label className="form-label"><h6>Name</h6></label>
            <input
              type="text"
              className="form-control"
              placeholder={product.name || "Enter name"}
              value={updateProduct.name}
              onChange={handleChange}
              name="name"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label"><h6>Brand</h6></label>
            <input
              type="text"
              name="brand"
              className="form-control"
              placeholder={product.brand || "Enter brand"}
              value={updateProduct.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label"><h6>Description</h6></label>
            <textarea
              type="text"
              className="form-control"
              placeholder={product.description || "Enter description"}
              name="description"
              onChange={handleChange}
              value={updateProduct.description}
              rows="4"
            />
          </div>

          <div className="col-5">
            <label className="form-label"><h6>Price</h6></label>
            <input
              type="number"
              className="form-control"
              onChange={handleChange}
              value={updateProduct.price}
              placeholder={product.price || "Enter price"}
              name="price"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label"><h6>Category</h6></label>
            <select
              className="form-select"
              value={updateProduct.category}
              onChange={handleChange}
              name="category"
              required
            >
              <option value="">Select category</option>
              {[
                "Laptops",
                "Headphones",
                "Mobiles",
                "Television",
                "Electronics",
                "Toys",
                "Clothing",
                "Healthcare and Cosmetics",
              ].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label"><h6>Stock Quantity</h6></label>
            <input
              type="number"
              className="form-control"
              onChange={handleChange}
              placeholder={product.stockQuantity || "Enter stock quantity"}
              value={updateProduct.stockQuantity}
              name="stockQuantity"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label"><h6>Release Date</h6></label> <br />
            <DatePicker
              selected={updateProduct.releaseDate}
              onChange={(date) =>
                setUpdateProduct((prev) => ({ ...prev, releaseDate: date }))
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="form-control"
            />
          </div>

          <div className="col-md-8">
            <label className="form-label"><h6>Image</h6></label>
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Product"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  padding: "5px",
                  margin: "0",
                }}
              />
            ) : (
              <p>No image available</p>
            )}
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
              name="imageUrl"
            />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                checked={updateProduct.productAvailable}
                onChange={(e) =>
                  setUpdateProduct((prev) => ({
                    ...prev,
                    productAvailable: e.target.checked,
                  }))
                }
              />
              <label className="form-check-label">Product Available</label>
            </div>
          </div>

          <div className="col-12 button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && (
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  role="status"
                />
              )}
              Update Product
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
