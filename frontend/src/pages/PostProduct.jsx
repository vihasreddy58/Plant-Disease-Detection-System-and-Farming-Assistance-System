import React, { useState } from "react";
import "./PostProduct.css";

const PostProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    location: ""
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const farmer_id = localStorage.getItem("user_id");

    const response = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, user_id: farmer_id }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Product posted!");
      setProduct({ name: "", description: "", price: "", unit: "", location: "" });
    } else {
      alert("Error posting product.");
    }
  };

  return (
    <div className="post-container">
      <h2>📝 Post a New Product</h2>
      <form onSubmit={handleSubmit} className="post-form">
        {["name", "description", "price", "unit", "location"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={product[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            required
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PostProduct;
