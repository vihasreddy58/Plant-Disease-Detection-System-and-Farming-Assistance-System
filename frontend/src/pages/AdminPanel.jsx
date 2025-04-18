import React, { useState } from "react";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [announcement, setAnnouncement] = useState("");
  


  const submitAnnouncement = async () => {
    if (!announcement.trim()) return alert("Announcement cannot be empty!");

    try {
      await fetch("http://localhost:5000/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: announcement }),
      });
      alert("Announcement posted!");
      setAnnouncement("");
    } catch (error) {
      alert("Failed to post announcement.");
    }
  };

  

  return (
    <div className="admin-panel">
      <h2 className="panel-title">🛡️ AgriSathi Admin Panel</h2>

      {/* Announcement Section */}
      <section className="admin-section">
        <h3>📢 Post an Announcement</h3>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Write your announcement here..."
          rows={4}
          className="admin-textarea"
        />
        <button className="admin-button" onClick={submitAnnouncement}>Post</button>
      </section>
      
    </div>
  );
};

export default AdminPanel;
