import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import "./login.css";
import video from "../assets/Images/video.mp4";
const LoginPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const userType = isAdmin ? "admin" : "user";
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userType, identifier, password }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id || "");
      localStorage.setItem("name", data.name || "");

      if (data.role === "admin") navigate("/adminpanel");
      else if (data.role === "buyer") navigate("/marketplace");
      else if (data.role === "farmer") navigate("/home");
      else if (data.role === "expert") navigate("/expertpanel");
    } else {
      setError(data.message);
    }
  };
  return (
    <div className="login-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <video autoPlay muted loop className="background-video">
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="form-overlay">
        <Card style={{ width: "400px", padding: "20px", boxShadow: "0 3px 6px rgba(0,0,0,0.3)" }}>
          <Card.Body>
            <h2 className="text-center">{isAdmin ? "Admin Login" : "Login"}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{isAdmin ? "Username" : "Phone Number"}</Form.Label>
                <Form.Control
                  type={isAdmin ? "text" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Login
              </Button>
            </Form>
            <Button
              variant="link"
              className="w-100 mt-3"
              onClick={() => setIsAdmin(!isAdmin)}
            >
              {isAdmin ? "Switch to Farmer Login" : "Admin Login"}
            </Button>

            {/* ✅ Register Option */}
            {!isAdmin && (
              <div className="text-center mt-3">
                <span>Don't have an account? </span>
                <p variant="link" onClick={() => navigate("/register")} style={{pointerEvents:"cursor"}}>
                  Register here
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
