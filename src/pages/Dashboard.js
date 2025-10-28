import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { trackMenuAccess } from '../utils/api';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const email = localStorage.getItem('userEmail'); // default if missing
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const appGroup = localStorage.getItem('appGroup');
  const location = useLocation();
  const access = localStorage.getItem('access');

  // Debug logs
  console.log('User Type:', userType);
  console.log('Access:', access);
  console.log('Location State:', location.state);

  const userInitial = email.charAt(0).toUpperCase();

  const [showDropdown, setShowDropdown] = useState(false);
  const [appType, setAppType] = useState('');

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  const getAppType = (appType) => {
    switch (appType) {
      case 'MaxGaming':
        return 'Max Gaming';
      case 'Manly':
        return 'Manly Harbour Boat Club';
      case 'Montauk':
        return 'Montauk Tavern';
      case 'StarReward':
        return 'Star Reward';
      case 'Central':
        return 'Central Lane Hotel';
      case 'Sense':
        return 'Sense Of Taste';
      case 'North':
        return 'North Shore Tavern';
      case 'Hogan':
        return "Hogan's";
      default:
        return appType;
    }
  };

  useEffect(() => {
    console.log(
      'Selected Venue:',
      selectedVenue,
      'Type:',
      typeof selectedVenue,
      'Length:',
      selectedVenue?.length
    );
  }, [selectedVenue]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.data && response.data.data) {
          setVenues(response.data.data);
          setLoading(false);

          // Check if we have a saved venue in localStorage
          const savedVenue = localStorage.getItem('selectedVenue');

          if (userType === 'user') {
            setSelectedVenue(appGroup);
            localStorage.setItem('selectedVenue', appGroup);
          }
          // If we have a saved venue that exists in the venues list, use it
          else if (
            savedVenue &&
            response.data.data.some(
              (venue) => venue.appName && venue.appName.includes(savedVenue)
            )
          ) {
            setSelectedVenue(savedVenue);
          }
          // Otherwise use the default logic
          else if (response.data.data.length > 0) {
            const matchingVenue = response.data.data.find(
              (venue) => venue.appType === appGroup
            );
            if (
              matchingVenue &&
              matchingVenue.appName &&
              matchingVenue.appName.length > 0
            ) {
              const defaultVenue = matchingVenue.appName[0];
              setSelectedVenue(defaultVenue);
              localStorage.setItem('selectedVenue', defaultVenue);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        setLoading(false);
      }
    };

    if (token) {
      fetchVenues();
    }
  }, [token]);

  useEffect(() => {
    const initializeVenueToken = async () => {
      const savedVenue = localStorage.getItem('selectedVenue');
      if (savedVenue && userType === 'admin') {
        try {
          const response = await axios.post(
            `${baseUrl}/admin/token`,
            { appType: savedVenue },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data?.data?.token) {
            localStorage.setItem('token', response.data.data.token);
          }
        } catch (error) {
          console.error('Error initializing venue token:', error);
        }
      }
    };

    initializeVenueToken();
  }, []); // Empty dependency array to run only on mount

const handleCardClick = async (accessItem, navigateTo) => {
    const result = await trackMenuAccess(accessItem);
    // Only navigate if the API call was successful
  if (result.success && navigateTo) {
    navigate(navigateTo, { state: { email } });
  } else if (!result.success) {
    // Optionally show an error message to the user
    console.warn('Navigation prevented:', result.message);
    // You might want to show a toast or alert here
  }
};

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="s2w-logo">
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
            </>
          )}
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
              value={userType === 'user' ? appGroup : selectedVenue}
              onChange={async (e) => {
                const selectedValue = e.target.value;
                if (!selectedValue) return;

                try {
                  const response = await axios.post(
                    `${baseUrl}/admin/token`,
                    { appType: selectedValue },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );

                  if (
                    response.data &&
                    response.data.data &&
                    response.data.data.token
                  ) {
                    // Remove old token and save new one
                    localStorage.removeItem('token');
                    localStorage.setItem('token', response.data.data.token);
                    setSelectedVenue(selectedValue);
                    localStorage.removeItem('selectedVenue');
                    localStorage.setItem('selectedVenue', selectedValue);
                    setAppType(selectedValue);
                  }
                } catch (error) {
                  console.error('Error updating venue:', error);
                }
              }}
              disabled={loading}
            >
              {userType === 'admin' &&
                venues.map(
                  (venue) =>
                    venue.appType === appGroup &&
                    venue.appName &&
                    venue.appName.map((app, index) => (
                      <option key={`${venue._id}-${index}`} value={app}>
                        {getAppType(app)}
                      </option>
                    ))
                )}
              {userType === 'user' && (
                <option value={appGroup}>{getAppType(appGroup)}</option>
              )}
            </select>
          </div>
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

      {/* Main Content: Dashboard cards based on user access */}
      <main
        className={`dashboard-content ${
          userType !== 'admin' && access.length > 0 ? 'user-access' : ''
        }`}
      >
        <div
          className={`card-container ${
            userType !== 'admin' && access.length > 0 ? 'user-access' : ''
          }`}
        >
          {userType === 'admin' || (access && access.length === 0) ? (
            // Show all cards for admin
            <>
              <div
                className="dashboard-card"
                style={{ gridArea: 'digital-app' }}
                onClick={() => handleCardClick('digital', '/digital-app')}

              >
                <img
                  src="/digital-app.png"
                  alt="Digital App"
                  className="card-image"
                />
              </div>
              <div
                className="dashboard-card"
                style={{ gridArea: 'market-members' }}
                onClick={() => handleCardClick('m2m', '/market-to-members')}
              >
                <img
                  src="/m2m.png"
                  alt="Market to Members"
                  className="card-image"
                />
              </div>
              {/* <div
                className="dashboard-card"
                style={{ gridArea: 'displays' }}
                onClick={() => navigate('/displays', { state: { email } })}
              >
                <img
                  src="/displays.png"
                  alt="Displays"
                  className="card-image"
                />
              </div> */}
              <div
                className="dashboard-card"
                style={{ gridArea: 'ai-reporting' }}
                onClick={() => handleCardClick('ai-reporting', '/ai-reporting')}

              >
                <img
                  src="/ai-reporting.png"
                  alt="AI Reporting"
                  className="card-image"
                />
              </div>

              {(selectedVenue === 'Qantum' || selectedVenue === 'Manly') && (
                <div
                  className="dashboard-card"
                  style={{ gridArea: 'club-desk' }}
                  onClick={() => handleCardClick('club-desk', '/approvals')}

                >
                  <img
                    src="/club-desk.png"
                    alt="Club Desk"
                    className="card-image"
                  />
                </div>
              )}
            </>
          ) : (
            // Show cards based on user access
            <>
              {access.includes('digital') && (
                <div
                  className="dashboard-card"
                  style={{ gridArea: 'digital-app' }}
                  onClick={() => handleCardClick('digital', '/digital-app')}

                >
                  <img
                    src="/digital-app.png"
                    alt="Digital App"
                    className="card-image"
                  />
                </div>
              )}
              {access.includes('m2m') && (
                <div
                  className="dashboard-card"
                  style={{ gridArea: 'market-members' }}
                  onClick={() => handleCardClick('m2m', '/market-to-members')}

                >
                  <img
                    src="/m2m.png"
                    alt="Market to Members"
                    className="card-image"
                  />
                </div>
              )}
              {/* {access.includes('displays') && (
                <div
                  className="dashboard-card"
                  style={{ gridArea: 'displays' }}
                  onClick={() => navigate('/displays', { state: { email } })}
                >
                  <img
                    src="/displays.png"
                    alt="Displays"
                    className="card-image"
                  />
                </div>
              )} */}
              {access.includes('ai-reporting') && (
                <div
                  className="dashboard-card"
                  style={{ gridArea: 'ai-reporting' }}
                  onClick={() => handleCardClick('ai-reporting', '/ai-reporting')}

                >
                  <img
                    src="/ai-reporting.png"
                    alt="AI Reporting"
                    className="card-image"
                  />
                </div>
              )}

              {access.includes('club-desk') && (
                <div
                  className="dashboard-card"
                  style={{ gridArea: 'club-desk' }}
                  onClick={() => handleCardClick('club-desk', '/approvals')}

                >
                  <img
                    src="/club-desk.png"
                    alt="Club Desk"
                    className="card-image"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Settings Button */}
      {userType === 'admin' && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '200px',
            // backgroundColor: '#002977',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            // boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          }}
          onClick={() => navigate('/standard-admin')} // Add your settings click handler here
        >
          <img
            src="/settings.png"
            alt="Settings"
            style={{
              width: '80px',
              height: '80px',
              // filter: 'brightness(0) invert(1)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
