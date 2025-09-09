import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from "../utils/auth";
import { FaBullhorn, FaGift, FaUtensils, FaCalendarAlt, FaPaintBrush } from "react-icons/fa";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);

  // Get email from localStorage or use a default
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const userInitial = email.charAt(0).toUpperCase();

  const access = localStorage.getItem("access");
  const userType = localStorage.getItem("userType");

  const isActive = (path) => {
    if (path === '/digital-app') {
      return location.pathname === '/digital-app' || location.pathname === '/small-advert';
    }
    return location.pathname === path;
  };

  // Fix for sidebar navigation - ensure we have the state when navigating
  const handleNavigation = (path) => {
    // Force a full page reload to ensure proper rendering
    window.location.href = path;
  };

  return (
    <div className="digital-app-container">
      <header className="app-header">
        <div className="s2w-logo" onClick={() => handleNavigation('/dashboard')}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>
        <div className="header-buttons">
          {userType === 'admin' ? (
            <>
            <button 
            className="digital-app-btn" 
            onClick={() => handleNavigation('/digital-app')}
          >
            Digital App
          </button>
          <button 
            className="market-to-members-btn" 
            onClick={() => handleNavigation('/market-to-members')}
          >
            Market to Members
          </button>
          <button 
            className="displays-btn" 
            onClick={() => handleNavigation('/displays')}
          >
            Displays
          </button>
            </>
          ) : (
            <>
            {access.includes('digital') && (
            <button 
            className="digital-app-btn" 
            onClick={() => handleNavigation('/digital-app')}
          >
            Digital App
          </button>
          )}
          {access.includes('m2m') && (
            <button 
            className="market-to-members-btn" 
            onClick={() => handleNavigation('/market-to-members')}
          >
            Market to Members
          </button>
          )}
          {access.includes('displays') && (
            <button 
            className="displays-btn" 
            onClick={() => handleNavigation('/displays')}
          >
            Displays
          </button>
          )}
            </>
          )}
          
        </div>
        <div className="user-section">
          <div
            className="user-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userInitial}
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              <p>{email}</p>
              <button className="logout-btn" onClick={() => logout(navigate)}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <aside className="sidebar">
        <button 
          className={`sidebar-btn ${isActive('/digital-app') ? 'active' : ''}`}
          onClick={() => handleNavigation('/digital-app')}
        >
          <FaBullhorn className={`sidebar-icon ${isActive('/digital-app') ? '' : 'navy-icon'}`} />
          Promotions
        </button>
        <button 
          className={`sidebar-btn ${isActive('/special-offers') ? 'active' : ''}`}
          onClick={() => handleNavigation('/special-offers')}
        >
          <FaGift className={`sidebar-icon ${isActive('/special-offers') ? '' : 'navy-icon'}`} />
          Special Offers
        </button>
        <button 
          className={`sidebar-btn ${isActive('/my-benefits') ? 'active' : ''}`}
          onClick={() => handleNavigation('/my-benefits')}
        >
          <FaUtensils className={`sidebar-icon ${isActive('/my-benefits') ? '' : 'navy-icon'}`} />
          My Benefits
        </button>
        <button 
          className={`sidebar-btn ${isActive('/whats-on') ? 'active' : ''}`}
          onClick={() => handleNavigation('/whats-on')}
        >
          <FaCalendarAlt className={`sidebar-icon ${isActive('/whats-on') ? '' : 'navy-icon'}`} />
          What's On
        </button>
        <button 
          className={`sidebar-btn ${isActive('/art-gallery') ? 'active' : ''}`}
          onClick={() => handleNavigation('/art-gallery')}
        >
          <FaPaintBrush className={`sidebar-icon ${isActive('/art-gallery') ? '' : 'navy-icon'}`} />
          Art Gallery
        </button>
      </aside>
      {children}
    </div>
  );
};

export default AppLayout;