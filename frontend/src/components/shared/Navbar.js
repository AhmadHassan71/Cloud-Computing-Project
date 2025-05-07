import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ setIsAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update authentication state
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    
    // Redirect to login page
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/home">
            <h1>Espresso Elegance</h1>
          </Link>
        </div>
        
        <div className="navbar-mobile-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <li className={isActive('/allItems')}>
            <Link to="/allItems">Menu Items</Link>
          </li>
          <li className={isActive('/ordercreate')}>
            <Link to="/ordercreate">Create Order</Link>
          </li>
          <li className={isActive('/allorders')}>
            <Link to="/allorders">View Orders</Link>
          </li>
          <li className={isActive('/downloadInvoice')}>
            <Link to="/downloadInvoice">Reports</Link>
          </li>
          <li className="navbar-logout">
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;