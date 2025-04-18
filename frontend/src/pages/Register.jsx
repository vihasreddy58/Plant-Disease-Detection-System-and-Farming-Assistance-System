import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css"; // Updated CSS

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [contactDetails, setContactDetails] = useState("");
  const [expertise, setExpertise] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const registrationData = { name, mobile, village, password, role };
    if (role === "expert") {
      registrationData.contactDetails = contactDetails;
      registrationData.expertise = expertise;
    }

    const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData),
    });

    const data = await response.json();
    if (data.success) {
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div>
          <h2 className="register-title">User Registration</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label">Register As</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="form-select"
              >
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="expert">Expert</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Village</Form.Label>
              <Form.Control
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
              />
            </Form.Group>

            {role === "expert" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Contact Details</Form.Label>
                  <Form.Control
                    type="text"
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    required
                    className="form-control"
                  />
                  
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Expertise</Form.Label>
                  <Form.Control
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    required
                    className="form-control"
                  />
                  
                </Form.Group>
              </>
            )}

            <Button type="submit" className="register-button">
              Register
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
