import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      setMessage("Please enter a valid email.");
    } else {
      setMessage("Thank you for subscribing!");
      setEmail("");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* About Section */}
        <div className="footer-section about">
          <h3>About AgriSmart</h3>
          <p>Empowering farmers with AI-driven disease detection, weather insights, and smart agricultural solutions.</p>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p><FaMapMarkerAlt /> Hyderabad, India</p>
          <p><FaPhone /> +91 9999999999</p>
          <p><FaEnvelope /> support@agrismart.com</p>
        </div>

        {/* Social Media Section */}
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="footer-section subscribe">
          <h3>Subscribe for Agriculture News</h3>
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© 2025 AgriSmart. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;