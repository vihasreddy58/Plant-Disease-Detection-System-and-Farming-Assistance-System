import React, { useEffect, useState } from "react";
import "./FarmerOrders.css";

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const farmerId = localStorage.getItem("user_id");
    const res = await fetch(`http://localhost:5000/api/farmer/orders/${farmerId}`);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId, action) => {
    const res = await fetch(`http://localhost:5000/api/farmer/orders/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, action })
    });

    const data = await res.json();
    alert(data.message);
    fetchOrders(); // Refresh list
  };

  return (
    <div className="orders-container">
      <h2>📥 Orders Received</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={index} className="order-card">
              <p><strong>Product ID:</strong> {order.product_id}</p>
              <p><strong>Buyer ID:</strong> {order.buyer_id}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Message:</strong> {order.message}</p>
              <p><strong>Status:</strong> {order.status}</p>

              {order.status === "Pending" && (
                <div className="actions">
                  <button onClick={() => handleAction(order._id, "accept")}>Accept</button>
                  <button className="reject" onClick={() => handleAction(order._id, "reject")}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
