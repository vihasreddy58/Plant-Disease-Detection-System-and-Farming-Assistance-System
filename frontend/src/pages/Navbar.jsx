import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    navigate('/');
  };

  const toggleMarketplace = () => {
    setIsMarketplaceOpen(!isMarketplaceOpen);
  };

  const closeMarketplace = () => {
    setIsMarketplaceOpen(false);
  };

  // Close dropdown when a link inside is clicked
  const handleDropdownItemClick = () => {
    closeMarketplace();
  };

  // Close dropdown when the route changes
  useEffect(() => {
    closeMarketplace();
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeMarketplace();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/home">AgriSmart</Link>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link className="nav-link" to="/home" onClick={closeMarketplace}>Home</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/price-forecast" onClick={closeMarketplace}>Prices</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/pesticide-finder" onClick={closeMarketplace}>Pesticide Finder</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/predict" onClick={closeMarketplace}>Predict</Link>
        </li>

        {/* Marketplace Dropdown */}
        <li className={`nav-item dropdown ${isMarketplaceOpen ? 'open' : ''}`} ref={dropdownRef}>
          <div className="nav-link dropdown-toggle" onClick={toggleMarketplace}>Marketplace</div>
          <div className="dropdown-content">
            <Link to="/marketplace" onClick={handleDropdownItemClick}>Marketplace</Link>
            <Link to="/post-product" onClick={handleDropdownItemClick}>Upload Product</Link>
            <Link to="/myorders" onClick={handleDropdownItemClick}>My Orders</Link>
          </div>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/experts" onClick={closeMarketplace}>Consult Expert</Link>
        </li>

        <li className="nav-item">
        <Link to="/" className="nav-link logout-btn" onClick={handleLogout}>
    Logout
  </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;