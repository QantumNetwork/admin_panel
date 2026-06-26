import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { TiCreditCard } from 'react-icons/ti';
import { PiListBulletsFill } from 'react-icons/pi';
import { BsMenuButtonFill } from 'react-icons/bs';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { FaUser, FaRegCheckCircle } from 'react-icons/fa';
import { MdVerified, MdRefresh, MdHistory } from 'react-icons/md';
import { CiSearch } from 'react-icons/ci';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { handleLogout } from '../utils/api';
import { getAppType } from '../utils/appConstants';
import { CiStar } from 'react-icons/ci';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/status-credits.css';

const AppSettings = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const appGroup = localStorage.getItem('appGroup');
  const [menuType, setMenuType] = useState('multiple'); // 'standard' | 'multiple'
  const [offerTypes, setOfferTypes] = useState(['WMLC', 'Fielders']);
  const userType = localStorage.getItem('userType') || 'admin';
  const isAdmin = userType === "admin";
  const [venues, setVenues] = useState([]);

  const [venueOfferTypes, setVenueOfferTypes] = useState([
    { id: null, name: '' },
  ]);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.data) {
          setVenues(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    };

    if (token && userType === 'admin') {
      fetchVenues();
    }
  }, [token]);

  const handleVenueChange = async (e) => {
    const newVenue = e.target.value;
    if (!newVenue) return;

    try {
      const response = await axios.post(
        `${baseUrl}/admin/token`,
        {
          appType: newVenue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.token) {
        // Save the new token
        const newToken = response.data.data.token;
        localStorage.removeItem('token');
        localStorage.setItem('token', newToken);

        // Update the selected venue after successful token update
        setSelectedVenue(newVenue);
        localStorage.removeItem('selectedVenue');
        localStorage.setItem('selectedVenue', newVenue);

        await handleLock();
      }
    } catch (error) {
      console.error('Error updating token:', error);
      toast.error('Failed to update venue');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLock = async () => {
    try {
      const result = await handleLogout();
      if (result.success) {
        navigate('/dashboard');
      } else {
        toast.error(
          result.message || 'Failed to remove lock. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error in handleLock:', error);
      toast.error(error.message || 'Failed to remove lock. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        style={{
          zIndex: 9999,
          marginTop: '90px',
          fontSize: '14px',
          minWidth: '300px',
          textAlign: 'center',
        }}
      />
      {/* Header */}
      <header className="dashboard-header">
        <div className="s2w-logo" onClick={async () => await handleLock()}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {userType === 'admin' && (
            <>
              <p
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontWeight: 'bold',
                  color: '#002977',
                  fontSize: '20px',
                  margin: 0,
                }}
              >
                Admin
              </p>
              <div
                style={{
                  position: 'absolute',
                  right: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    fontWeight: '500',
                    color: '#002977',
                    fontSize: '15px',
                    fontWeight: 'bold',
                  }}
                >
                  Venue
                </span>
                <select
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: '#F2F2F2',
                    cursor: 'pointer',
                    minWidth: '200px',
                  }}
                  className="form-select"
                  value={selectedVenue}
                  onChange={handleVenueChange}
                  required
                >
                  {venues.map(
                    (venue) =>
                      venue.appType === appGroup &&
                      venue.appName &&
                      venue.appName.map((app, index) => (
                        <option key={`${venue._id}-${index}`} value={app}>
                          {getAppType(app)}
                        </option>
                      ))
                  )}
                </select>
              </div>
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
              <button className="logout-btn" onClick={() => logout(navigate)}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* sidebar */}
      <aside className="sidebar-sa">
        {!isAdmin ? (
          <>
            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/approvals') ? 'active' : ''}`}
              onClick={() => navigate('/approvals')}
            >
              <FaUsersRectangle
                className={`sidebar-icon ${
                  isActive('/approvals') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Approvals
            </button>
            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/manual-reg') ? 'active' : ''}`}
              onClick={() => navigate('/manual-reg')}
            >
              <HiOutlinePencilSquare
                className={`sidebar-icon ${
                  isActive('/manual-reg') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Manual Registration
            </button>
            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/membership') ? 'active' : ''}`}
              onClick={() => navigate('/membership')}
            >
              <PiListBulletsFill
                className={`sidebar-icon ${
                  isActive('/membership') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Club Package
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/app-settings') ? 'active' : ''}`}
              onClick={() => navigate('/app-settings')}
            >
              <FaMobileScreenButton
                className={`sidebar-icon ${
                  isActive('/app-settings') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; App Settings
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${
                isActive('/payment-reporting') ? 'active' : ''
              }`}
              onClick={() => {
                navigate('/payment-reporting');
              }}
            >
              <MdVerified
                className={`sidebar-icon ${
                  isActive('/payment-reporting') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Payment Reporting
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/renewals') ? 'active' : ''}`}
              onClick={() => navigate('/renewals')}
            >
              <MdRefresh
                className={`sidebar-icon ${
                  isActive('/renewals') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Renewals
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/member-search') ? 'active' : ''}`}
              onClick={() => navigate('/member-search')}
            >
              <CiSearch
                className={`sidebar-icon ${
                  isActive('/member-search') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Member Search
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/transaction-history') ? 'active' : ''}`}
              onClick={() => navigate('/transaction-history')}
            >
              <MdHistory
                className={`sidebar-icon ${
                  isActive('/transaction-history') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Transaction History
            </button>
          </>
        ) : (
          <>
            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${
                isActive('/standard-admin') ? 'active' : ''
              }`}
              onClick={() => navigate('/standard-admin')}
            >
              <FaUser
                className={`sidebar-icon ${
                  isActive('/standard-admin') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Users
            </button>
            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/admin-custom') ? 'active' : ''}`}
              onClick={() => navigate('/admin-custom')}
            >
              <TiCreditCard
                className={`sidebar-icon ${
                  isActive('/admin-custom') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Custom Buttons
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/app-settings') ? 'active' : ''}`}
              onClick={() =>
                navigate('/app-settings', { state: { admin: true } })
              }
            >
              <FaMobileScreenButton
                className={`sidebar-icon ${
                  isActive('/app-settings') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; App Settings
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/ai-buttons') ? 'active' : ''}`}
              onClick={() => navigate('/ai-buttons')}
            >
              <BsMenuButtonFill
                className={`sidebar-icon ${isActive('/ai-buttons') ? '' : 'navy-icon'}`}
              />{' '}
              &nbsp; AI Buttons
            </button>

            <button
              style={{ fontSize: '12px' }}
              className={`sidebar-btn ${isActive('/status-credits') ? 'active' : ''}`}
              onClick={() => navigate('/status-credits')}
            >
              <CiStar
                className={`sidebar-icon ${
                  isActive('/status-credits') ? '' : 'navy-icon'
                }`}
              />{' '}
              &nbsp; Status Credits
            </button>
          </>
        )}
      </aside>

      <main className="special-offers-container">
        <div className="special-offers-wrapper">
          <div className="special-offers-card">
            <h3 className="special-offers-title">
              Status Credits to Maintain Current Level
            </h3>

            <div className="status-credit-table">
              <div className="status-row">
                <span className="status-name">Valued</span>
                <span className="status-value">
                  30,000 <small>Status Credits</small>
                </span>
              </div>

              <div className="status-row">
                <span className="status-name">Silver</span>
                <span className="status-value">
                  80,000 <small>Status Credits</small>
                </span>
              </div>

              <div className="status-row">
                <span className="status-name">Gold</span>
                <span className="status-value">
                  150,000 <small>Status Credits</small>
                </span>
              </div>

              <div className="status-row">
                <span className="status-name">Platinum</span>
                <span className="status-value">
                  1,000,000 <small>Status Credits</small>
                </span>
              </div>
            </div>

            <div className="update-btn-app-wrapper">
              <button
                className="action-btn approve"
                style={{ width: '30%', marginLeft: '34%', marginTop: '35px' }}
                // onClick={handleUpdate}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </main>

      <button
        type="submit"
        className="activate-btn icon-button"
        style={{ backgroundColor: '#5396D1' }}
        // disabled={isSubmitting}
        // onClick={handleSubmit}
      >
        <FaRegCheckCircle className="button-icon" />
        Activate
      </button>
    </div>
  );
};

export default AppSettings;
