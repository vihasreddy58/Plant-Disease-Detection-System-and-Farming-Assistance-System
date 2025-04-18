import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ChatBot from "./pages/ChatBot";
import PlantDiseaseDetection from "./pages/Predict";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import PriceForcast from "./pages/PriceForecast";
import DiscussionPage from "./pages/DiscussionPage";
import PesticideFinder from "./pages/PesticideFinder";
import Marketplace from "./pages/Marketplace";
import PostProduct from "./pages/PostProduct";
import FarmerOrders from "./pages/FarmerOrders";
import AdminPanel from "./pages/AdminPanel";
import Experts from "./pages/Experts";
import ExpertPanel from "./pages/ExpertPanel";

// Create the ProtectedRoute component (as defined in the previous response)
const ProtectedRoute = ({ element: Component, allowedRoles, ...rest }) => {
  const role = localStorage.getItem("role");

  if (!role) {
    // User is not logged in
    return <Navigate to="/" replace />; // Redirect to login page
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // User is logged in but doesn't have the required role
    return <Navigate to="/unauthorized" replace />; // Redirect to an unauthorized page
  }

  // User is authorized
  return <Component {...rest} />;
};

function App() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  // Hide Navbar & Footer on these routes or when buyer is on /marketplace
  const hideHeaderFooter = (
    location.pathname === "/" ||
    location.pathname === "/register" ||
    (location.pathname === "/marketplace" && role === "buyer") ||
    location.pathname === "/adminpanel"
  );

  return (
    <>
      {!hideHeaderFooter && <Navbar />}

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/predict" element={<PlantDiseaseDetection />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/price-forecast" element={<PriceForcast />} />
        <Route path="/discussion" element={<DiscussionPage />} />
        <Route path="/pesticide-finder" element={<PesticideFinder />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/post-product" element={<PostProduct />} />
        <Route path="/myorders" element={<FarmerOrders />} />
        <Route path="/adminpanel" element={<ProtectedRoute element={AdminPanel} allowedRoles={["admin"]} />} />
        <Route path="/experts" element={<Experts />} />
        <Route
          path="/expertpanel"
          element={<ProtectedRoute element={ExpertPanel} allowedRoles={["expert", "admin"]} />}
        />
        {/* Add a route for unauthorized access */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;