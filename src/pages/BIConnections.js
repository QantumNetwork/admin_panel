import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { FaRegCheckCircle } from 'react-icons/fa';
import { BsMenuButtonFill } from 'react-icons/bs';
import { TiCreditCard } from 'react-icons/ti';
import { IoDownloadOutline, IoSettingsOutline } from 'react-icons/io5';
import { TbConnection } from 'react-icons/tb';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { handleLogout } from '../utils/api';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { CiStar } from 'react-icons/ci';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/forced-app-updates.css';
import { getAppType } from '../utils/appConstants';
import '../styles/bi-connections.css';

const BIConnections = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail') || '';
  const userInitial = email.charAt(0).toUpperCase();
  const appGroup = localStorage.getItem('appGroup');
  const userType = localStorage.getItem('userType') || 'admin';

  const [showDropdown, setShowDropdown] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullAccessKey, setFullAccessKey] = useState('');
  const [gamingOnlyKey, setGamingOnlyKey] = useState('');
  const [posOnlyKey, setPosOnlyKey] = useState('');

  const [securityConfigId, setSecurityConfigId] = useState('');

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          setVenues(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && userType === 'admin') {
      fetchVenues();
    } else {
      setLoading(false);
    }
  }, [baseUrl, token, userType]);

  
const fetchSecurityLevels = async () => {
  if (!token) return;

  try {
    const response = await axios.get(
      'https://betaapi.s2w.com.au/security',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.success === true) {
      const config = response.data.data;

      setSecurityConfigId(config?._id || '');
      setFullAccessKey(config?.All || '');
      setGamingOnlyKey(config?.Gaming || '');
      setPosOnlyKey(config?.POS || '');
    }
  } catch (error) {
    console.error(
      'Error fetching security levels:',
      error.response?.data || error.message
    );
  }
};


  useEffect(() => {
    fetchSecurityLevels();
  }, [token]);

  const handleVenueChange = async (e) => {
    const newVenue = e.target.value;
    if (!newVenue) return;

    try {
      const response = await axios.post(
        `${baseUrl}/admin/token`,
        { appType: newVenue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.token) {
        const newToken = response.data.data.token;
        localStorage.removeItem('token');
        localStorage.setItem('token', newToken);
        setSelectedVenue(newVenue);
        localStorage.setItem('selectedVenue', newVenue);
        await handleLock();
      }
    } catch (error) {
      console.error('Error updating token:', error);
      toast.error('Failed to update venue');
    }
  };

  const isActive = (path) => location.pathname === path;

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

  const handleActivate = async () => {
    if (!fullAccessKey.trim() && !gamingOnlyKey.trim() && !posOnlyKey.trim()) {
      toast.error('Please enter at least one access key.');
      return;
    }

    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    const payload = {
    All: fullAccessKey.trim(),
    Gaming: gamingOnlyKey.trim(),
    POS: posOnlyKey.trim(),
  };

    setIsSubmitting(true);

    try {
      let response;

    if (securityConfigId) {
      // Update existing configuration
      response = await axios.put(
        `https://betaapi.s2w.com.au/security?id=${encodeURIComponent(securityConfigId)}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      // Create a new configuration
      response = await axios.post(
        'https://betaapi.s2w.com.au/security',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }


      if (response.data?.success === true) {
        await fetchSecurityLevels();

        toast.success(
          response.data.message || 'Security levels saved successfully.'
        );
        
        setTimeout(() => {
          navigate('/standard-admin');
        }, 3000);
        
      } else {
        toast.error(
          response.data?.message || 'Failed to save security levels.'
        );
      }
    } catch (error) {
      console.error('Error saving security levels:', error);

      toast.error(
        error.response?.data?.message ||
          'Failed to save security levels. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
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

      <header className="dashboard-header">
        <div className="s2w-logo" onClick={() => navigate('/dashboard')}>
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
                  // disabled={loading}
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

      <aside className="sidebar-sa">
        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/standard-admin') ? 'active' : ''}`}
          onClick={() => navigate('/standard-admin')}
        >
          <FaUser
            className={`sidebar-icon ${isActive('/standard-admin') ? '' : 'navy-icon'}`}
          />
          &nbsp; Users
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/admin-custom') ? 'active' : ''}`}
          onClick={() => navigate('/admin-custom')}
        >
          <TiCreditCard
            className={`sidebar-icon ${isActive('/admin-custom') ? '' : 'navy-icon'}`}
          />
          &nbsp; Custom Buttons
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/app-settings') ? 'active' : ''}`}
          onClick={() => navigate('/app-settings', { state: { admin: true } })}
        >
          <FaMobileScreenButton
            className={`sidebar-icon ${isActive('/app-settings') ? '' : 'navy-icon'}`}
          />
          &nbsp; App Settings
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/ai-buttons') ? 'active' : ''}`}
          onClick={() => navigate('/ai-buttons')}
        >
          <BsMenuButtonFill
            className={`sidebar-icon ${isActive('/ai-buttons') ? '' : 'navy-icon'}`}
          />
          &nbsp; AI Buttons
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/status-credits') ? 'active' : ''}`}
          onClick={() => navigate('/status-credits')}
        >
          <CiStar
            className={`sidebar-icon ${isActive('/status-credits') ? '' : 'navy-icon'}`}
          />
          &nbsp; Status Credits
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/forced-app-updates') ? 'active' : ''}`}
          onClick={() => navigate('/forced-app-updates')}
        >
          <IoDownloadOutline
            className={`sidebar-icon ${isActive('/forced-app-updates') ? '' : 'navy-icon'}`}
          />
          &nbsp; Forced App Updates
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/bi-connections') ? 'active' : ''}`}
          onClick={() => navigate('/bi-connections')}
        >
          <TbConnection
            className={`sidebar-icon ${isActive('/bi-connections') ? '' : 'navy-icon'}`}
          />
          &nbsp; BI Connections
        </button>
      </aside>

      <main className="bi-connections-content">
        <section className="security-level-card">
          <h3 className="security-level-title">Security Level Access</h3>

          <h2 className="security-level-venue">{getAppType(selectedVenue)}</h2>

          <div className="security-level-table">
            <div className="security-level-header">
              <span>Security level</span>
              <span>Access Key</span>
            </div>

            <div className="security-level-row">
              <label htmlFor="full-access-key">Full Access</label>
              <input
                id="full-access-key"
                type="text"
                className="security-level-input"
                value={fullAccessKey}
                onChange={(e) => setFullAccessKey(e.target.value)}
              />
            </div>

            <div className="security-level-row">
              <label htmlFor="gaming-only-key">Gaming Only</label>
              <input
                id="gaming-only-key"
                type="text"
                className="security-level-input"
                value={gamingOnlyKey}
                onChange={(e) => setGamingOnlyKey(e.target.value)}
              />
            </div>

            <div className="security-level-row">
              <label htmlFor="pos-only-key">POS Only</label>
              <input
                id="pos-only-key"
                type="text"
                className="security-level-input"
                value={posOnlyKey}
                onChange={(e) => setPosOnlyKey(e.target.value)}
              />
            </div>
          </div>
        </section>
      </main>

      <button
        type="button"
        className="activate-btn icon-button"
        style={{ backgroundColor: '#5396D1' }}
        onClick={handleActivate}
        disabled={isSubmitting}
      >
        <FaRegCheckCircle className="button-icon" />
        Activate
      </button>
    </div>
  );
};

export default BIConnections;
