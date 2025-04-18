import React, { useEffect, useState } from "react";
import "./Marketplace.css";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const openOrder = (product) => setSelected(product);
  const closeOrder = () => setSelected(null);

  const handleOrder = async (e) => {
    e.preventDefault();
    const buyerId = localStorage.getItem("user_id");
    const quantity = e.target.quantity.value;
    const message = e.target.message.value;

    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: selected._id,
        buyer_id: buyerId,
        quantity,
        message,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Order placed!");
      closeOrder();
    } else {
      alert("Error placing order!");
    }
  };

  return (
    <div className="marketplace-container">
      <h2>🌾 AgriSathi Marketplace</h2>
      <div className="grid">
        {products.map((product) => (
          <div className="card" key={product._id}>
            <img
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
            />
            <div className="card-content">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>₹{product.price}</strong></p>
              <p><small>Available: {product.unit}</small></p>
              <p><small>From: {product.location}</small></p>
              <button onClick={() => openOrder(product)}>Order Now</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleOrder}>
            <h3>Order {selected.name}</h3>
            <input type="number" name="quantity" min="1" placeholder="Quantity" required />
            <textarea name="message" placeholder="Message to seller (optional)" />
            <div className="modal-actions">
              <button type="submit">Place Order</button>
              <button type="button" onClick={closeOrder}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
