// frontend/src/components/ExpertPanel.js
import React, { useEffect, useState } from "react";
import "./ExpertPanel.css";

const ExpertPanel = () => {
  const [requests, setRequests] = useState([]);
  const expertId = localStorage.getItem("user_id");
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/expert/${expertId}/requests`);
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("Failed to fetch requests.");
    }
  };

  const handleReply = async (requestId, message) => {
    try {
      const res = await fetch(`http://localhost:5000/api/expert-request/${requestId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "expert", message }),
      });

      const data = await res.json();
      if (data.success) {
        fetchRequests(); // Refresh requests to show new reply
      } else {
        alert("Failed to send reply.");
      }
    } catch (error) {
      console.error("Error replying:", error);
      setError("Failed to send the reply.");
    }
  };

  const handleClose = async (requestId) => {
    try {
      await fetch(`http://localhost:5000/api/expert-request/${requestId}/close`, {
        method: "PUT",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error closing request:", error);
      setError("Failed to close the request.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="expert-panel">
      <h2>🧑‍🔬 Expert Request Panel</h2>
      {error && <p className="error">{error}</p>}
      {requests.length === 0 ? (
        <p>No requests assigned to you.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="request-card">
            <p><strong>Farmer ID:</strong> {req.farmer_id}</p>
            <p><strong>Message:</strong> {req.message}</p>
            <p><strong>Status:</strong> {req.status}</p>
            {req.reply && req.status === "Resolved" && <p><strong>Initial Reply:</strong> {req.reply}</p>}

            {/* Display conversation */}
            {req.conversation && req.conversation.length > 0 && (
              <div className="conversation">
                {req.conversation.map((msg, idx) => (
                  <div key={idx} className={`chat-msg ${msg.from}`}>
                    <strong>{msg.from === "farmer" ? "Farmer" : "You"}:</strong> {msg.message}
                  </div>
                ))}
              </div>
            )}

            {req.status !== "Closed" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const replyMessage = e.target.replyMessage.value;
                  if (replyMessage) {
                    handleReply(req._id, replyMessage);
                    e.target.reset();
                  }
                }}
              >
                <textarea name="replyMessage" placeholder="Reply to farmer..." required />
                <button type="submit">Send Reply</button>
              </form>
            )}
            {req.status !== "Closed" && (
              <button onClick={() => handleClose(req._id)}>Close Request</button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ExpertPanel;