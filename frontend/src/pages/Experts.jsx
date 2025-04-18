// frontend/src/components/Experts.js
import React, { useEffect, useState } from "react";
import "./Experts.css";

const Experts = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const farmerId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchExperts();
    fetchMyRequests();
  }, [farmerId]); // Added farmerId to dependency array to re-fetch on login

  const fetchExperts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/experts");
      const data = await res.json();
      setExperts(data);
    } catch (error) {
      setError("Failed to fetch experts.");
      console.error("Error fetching experts:", error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/farmer/${farmerId}/requests`);
      const data = await res.json();
      setMyRequests(data);
    } catch (error) {
      setError("Failed to fetch your requests.");
      console.error("Error fetching requests:", error);
    }
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    const message = e.target.message.value;

    try {
      const res = await fetch("http://localhost:5000/api/expert-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expert_id: selectedExpert._id,
          farmer_id: farmerId,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Request sent!");
        setSelectedExpert(null);
        fetchMyRequests();
      } else {
        alert("Failed to send request.");
      }
    } catch (error) {
      setError("Failed to send the request.");
      console.error("Error sending request:", error);
    }
  };

  const handleSendMessage = async (requestId) => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/expert-request/${requestId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "farmer", message: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMyRequests();
        setNewMessage(""); // Clear the input after sending
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send the message.");
    }
  };

  const handleCloseRequest = async (requestId) => {
    try {
      await fetch(`http://localhost:5000/api/expert-request/${requestId}/close`, {
        method: "PUT",
      });
      fetchMyRequests();
      setActiveRequest(null); // Clear active request after closing
    } catch (error) {
      console.error("Error closing request:", error);
      setError("Failed to close the request.");
    }
  };

  return (
    <div className="experts-container">
      <h2>👨‍🌾 Available Agricultural Experts</h2>
      {error && <p className="error">{error}</p>}

      <div className="experts-grid">
        {experts.map((expert) => (
          <div className="expert-card" key={expert._id}>
            <h3>{expert.name}</h3>
            <p>
              <strong>Expertise:</strong> {expert.expertise}
            </p>
            <p>
              <strong>Contact:</strong> {expert.contact}
            </p>
            <button onClick={() => setSelectedExpert(expert)}>Request Help</button>
          </div>
        ))}
      </div>

      {selectedExpert && (
        <div className="modal">
          <form className="modal-content" onSubmit={sendRequest}>
            <h3>Request Help from {selectedExpert.name}</h3>
            <textarea
              name="message"
              placeholder="Enter your problem or question..."
              required
            />
            <div className="modal-actions">
              <button type="submit">Send Request</button>
              <button type="button" onClick={() => setSelectedExpert(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🔁 Farmer's Requests Summary */}
      <div className="your-requests">
        <h2>📥 Your Requests</h2>
        {myRequests.length === 0 ? (
          <p>No requests sent yet.</p>
        ) : (
          <div className="requests-list">
            {myRequests.map((req) => (
              <div
                key={req._id}
                className={`request-item ${
                  activeRequest && activeRequest._id === req._id ? "active" : ""
                }`}
                onClick={() => setActiveRequest(req)}
              >
                <p>
                  <strong>Message:</strong> {req.message.slice(0, 60)}...
                </p>
                <p>
                  <strong>Status:</strong> {req.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Chatbox for selected request */}
        {activeRequest && (
          <div className="chatbox">
            <h3>Conversation with Expert</h3>
            <div className="chat-history">
              {activeRequest.conversation && activeRequest.conversation.length > 0 ? (
                activeRequest.conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-bubble ${
                      msg.from === "farmer" ? "message-user" : "message-expert"
                    }`}
                  >
                    <strong>{msg.from === "farmer" ? "You" : "Expert"}:</strong>{" "}
                    {msg.message}
                  </div>
                ))
              ) : (
                <p>No conversation yet.</p>
              )}
            </div>
            {activeRequest.status !== "Closed" && (
              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Reply to expert..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={() => handleSendMessage(activeRequest._id)}>
                  Send
                </button>
              </div>
            )}
            {activeRequest.status !== "Closed" && (
              <button onClick={() => handleCloseRequest(activeRequest._id)}>
                Close Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Experts;