import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { BsMenuButtonFill } from 'react-icons/bs';
import { TiCreditCard } from 'react-icons/ti';
import { IoDownloadOutline, IoSettingsOutline } from 'react-icons/io5';
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

const ForcedAppUpdates = () => {
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

  const [IOSVersion, setIOSVersion] = useState('');
  const [IOSBuild, setIOSBuild] = useState('');

  const [AndroidVersion, setAndroidVersion] = useState('');
  const [AndroidBuild, setAndroidBuild] = useState('');

  const [selectedMessage, setSelectedMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
  const fetchAppVersions = async () => {
    // We currently only support Ace Rewards
    if (selectedVenue !== 'Ace' && selectedVenue !=='Qantum'  && selectedVenue !=='Manly' && selectedVenue !=='MaxGaming' && selectedVenue !=='StarReward' && selectedVenue !=='EDP') {
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/app-versions/${selectedVenue}/latest`
      );

      if (response.data?.success && response.data?.data) {
        const { android, ios } = response.data.data;

        // Populate iOS fields
        setIOSVersion(ios?.latest_version || '');
        setIOSBuild(
          ios?.latest_build !== undefined
            ? String(ios.latest_build)
            : ''
        );

        // Populate Android fields
        setAndroidVersion(android?.latest_version || '');
        setAndroidBuild(
          android?.latest_build !== undefined
            ? String(android.latest_build)
            : ''
        );

        // Both platforms currently use the same force_update value
        if (android?.force_update || ios?.force_update) {
          setSelectedMessage('force-fau');
        } else {
          setSelectedMessage('later-fau');
        }
      }
    } catch (error) {
      console.error('Error fetching app versions:', error);

      // toast.error(
      //   error.response?.data?.message ||
      //   'Failed to fetch current app versions.'
      // );
    }
  };

  fetchAppVersions();
}, [selectedVenue, baseUrl]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only Ace Rewards can currently save app versions
    if (selectedVenue !== 'Ace' && selectedVenue !=='Qantum'  && selectedVenue !=='Manly' && selectedVenue !=='MaxGaming' && selectedVenue !=='StarReward' && selectedVenue !=='EDP') {
      toast.error(
        'App version updates unavailable on this account'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const forceUpdate = selectedMessage === 'force-fau';

      const payload = {
        appType: selectedVenue,

        android: {
          latest_version: AndroidVersion,
          latest_build: Number(AndroidBuild),
          force_update: forceUpdate,
          store_url: '...',
        },

        ios: {
          latest_version: IOSVersion,
          latest_build: Number(IOSBuild),
          force_update: forceUpdate,
          store_url: '...',
        },

        message: 'A newer version of the app is available.',
      };

      const response = await axios.post(`${baseUrl}/app-versions`, payload);

      if (response.data?.success === false) {
        toast.error(response.data?.message || 'Failed to save app versions.');
        return;
      }

      toast.success('App versions saved successfully.');
    } catch (error) {
      console.error('Error saving app versions:', error);

      toast.error(
        error.response?.data?.message || 'Failed to save app versions.'
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
      </aside>

      <main className="content-wrapper-fau">
        <section className="customer-button-section-fau">
          <h2>Current Live App Versions</h2>

          <form className="fau-form" onSubmit={handleSubmit}>
            {/* Column headings */}
            <div className="fau-input-headings">
              <span>version</span>
              <span>build</span>
            </div>

            <div className="form-group-fau">
              <label htmlFor="ios-version">IOS</label>
              <input
                id="ios-version"
                type="text"
                value={IOSVersion}
                onChange={(e) => setIOSVersion(e.target.value)}
              />
              <input
                id="ios-build"
                type="number"
                value={IOSBuild}
                onChange={(e) => setIOSBuild(e.target.value)}
                required
              />
            </div>

            <div className="form-group-fau">
              <label htmlFor="android-version">Android</label>
              <input
                id="android-version"
                type="text"
                value={AndroidVersion}
                onChange={(e) => setAndroidVersion(e.target.value)}
                required
              />
              <input
                id="android-build"
                type="number"
                value={AndroidBuild}
                onChange={(e) => setAndroidBuild(e.target.value)}
                required
              />
            </div>
          </form>
        </section>

        <section className="preview-section-fau">
          <h2>Select Message for Updates</h2>

          <div className="update-message-options-fau">
            <button
              type="button"
              className={`update-message-option-fau ${selectedMessage === 'later-fau' ? 'selected-fau' : ''}`}
              onClick={() => setSelectedMessage('later-fau')}
              aria-pressed={selectedMessage === 'later-fau'}
            >
              {selectedMessage === 'later-fau' && (
                <span className="selection-check-fau" aria-hidden="true">
                  ✓
                </span>
              )}

              <div className="app-update-card-fau">
                <div className="update-card-icon-fau">
                  <span>
                    <IoSettingsOutline />
                  </span>
                </div>
                <div className="update-card-title-fau">APP UPDATE</div>
                <div className="update-card-title-fau">AVAILABLE</div>
                <p className="update-card-description-fau">
                  Great news! A new app update is
                  <br />
                  available, click the button to update now.
                </p>
                <div className="update-card-actions-fau">
                  <span>LATER</span>
                  <span className="update-now-pill-fau">UPDATE NOW</span>
                </div>
              </div>

              <p className="update-option-description-fau">
                This update message allows the user
                <br />
                to choose to update later.
              </p>
            </button>

            <button
              type="button"
              className={`update-message-option-fau ${selectedMessage === 'force-fau' ? 'selected-fau' : ''}`}
              onClick={() => setSelectedMessage('force-fau')}
              aria-pressed={selectedMessage === 'force-fau'}
            >
              {selectedMessage === 'force-fau' && (
                <span className="selection-check-fau" aria-hidden="true">
                  ✓
                </span>
              )}

              <div className="app-update-card-fau">
                <div className="update-card-icon-fau">
                  <span>
                    <IoSettingsOutline />
                  </span>
                </div>
                <div className="update-card-title-fau">APP UPDATE</div>
                <div className="update-card-title-fau">AVAILABLE</div>
                <p className="update-card-description-fau">
                  Great news! A new app update is
                  <br />
                  available, click the button to update now.
                </p>
                <div className="update-card-actions-fau force-actions-fau">
                  <span className="update-now-pill-fau">UPDATE NOW</span>
                </div>
              </div>

              <p className="update-option-description-fau">
                This update message forces the
                <br />
                user to update and the app cannot
                <br />
                be used until the update occurs.
              </p>
            </button>
          </div>

          <button
            type="button"
            className="activate-btn icon-button fau-save-button"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'SAVING...' : 'SAVE'}
          </button>
        </section>
      </main>
    </div>
  );
};

export default ForcedAppUpdates;
