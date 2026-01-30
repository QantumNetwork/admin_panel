import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import {
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaCalendarAlt,
  FaPaintBrush,
  FaRegStar,
} from 'react-icons/fa';
import { FaChartPie } from 'react-icons/fa6';
import 'react-toastify/dist/ReactToastify.css';

const Reporting = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const access = localStorage.getItem('access');
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(false);
  const [confirmVerify, setConfirmVerify] = useState({
    open: false,
    userId: null,
  });

  // API functions
  const [activeTab, setActiveTab] = useState('special-offers');
  const [venues, setVenues] = useState([]);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  const [reportingData, setReportingData] = useState([]);

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
      case 'Ace':
        return 'Ace Rewards';
      case 'Queens':
        return 'Queens Hotel';
      case 'Brisbane':
        return 'Brisbane Brewing Co';
      case 'Bluewater':
        return 'Bluewater Captains Club';
      case 'Flinders':
        return 'Flinders Street Wharves';
      case 'Drinks':
        return 'Drinks HQ';
      default:
        return appType;
    }
  };

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
          //   setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        // setLoading(false);
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

        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      toast.error('Failed to update venue');
    }
  };

  const userType = 'admin';

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const fetchReportingData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/offer/list?appType=${selectedVenue}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && response.data.data) {
          setReportingData(response.data.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching reporting data:', err);
        toast.error('Failed to fetch reporting data');
        setLoading(false);
      }
    };

    fetchReportingData();

  }, [token, selectedVenue]);

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
        <div className="s2w-logo" onClick={() => navigate('/dashboard')}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>

        <div className="header-buttons">
          {userType === 'admin' ? (
            <>
              <button
                className="digital-app-btn"
                onClick={() => navigate('/digital-app')}
              >
                Digital App
              </button>
              <button
                className="market-to-members-btn"
                onClick={() => navigate('/market-to-members')}
              >
                Market to Members
              </button>
              {/* <button
                className="displays-btn"
                onClick={() => handleNavigation('/displays')}
              >
                Displays
              </button> */}
            </>
          ) : (
            <>
              {access.includes('digital') && (
                <button
                  className="digital-app-btn"
                  onClick={() => navigate('/digital-app')}
                >
                  Digital App
                </button>
              )}
              {access.includes('m2m') && (
                <button
                  className="market-to-members-btn"
                  onClick={() => navigate('/market-to-members')}
                >
                  Market to Members
                </button>
              )}
              {/* {access.includes('displays') && (
                <button
                  className="displays-btn"
                  onClick={() => handleNavigation('/displays')}
                >
                  Displays
                </button>
              )} */}
            </>
          )}

          {userType === 'admin' && (
            <div
              style={{
                position: 'absolute',
                right: '100px',
                top: '40px',
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
                value={selectedVenue}
                onChange={handleVenueChange}
                // disabled={loading}
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
      <aside className="sidebar">
        <button
          className={`sidebar-btn ${isActive('/digital-app') ? 'active' : ''}`}
          onClick={() => navigate('/digital-app')}
        >
          <FaBullhorn
            className={`sidebar-icon ${
              isActive('/digital-app') ? '' : 'navy-icon'
            }`}
          />
          Promotions
        </button>
        <button
          className={`sidebar-btn ${
            isActive('/special-offers') ? 'active' : ''
          }`}
          onClick={() => navigate('/special-offers')}
        >
          <FaGift
            className={`sidebar-icon ${
              isActive('/special-offers') ? '' : 'navy-icon'
            }`}
          />
          Special Offers
        </button>
        {selectedVenue === 'Ace' && (
          <button
            className={`sidebar-btn ${
              isActive('/smart-incentives') ? 'active' : ''
            }`}
            onClick={() => navigate('/smart-incentives')}
          >
            <FaRegStar
              className={`sidebar-icon ${
                isActive('/smart-incentives') ? '' : 'navy-icon'
              }`}
            />
            Smart Incentives
          </button>
        )}
        <button
          className={`sidebar-btn ${isActive('/my-benefits') ? 'active' : ''}`}
          onClick={() => navigate('/my-benefits')}
        >
          <FaUtensils
            className={`sidebar-icon ${
              isActive('/my-benefits') ? '' : 'navy-icon'
            }`}
          />
          My Benefits
        </button>

        <button
          className={`sidebar-btn ${isActive('/art-gallery') ? 'active' : ''}`}
          onClick={() => navigate('/art-gallery')}
        >
          <FaPaintBrush
            className={`sidebar-icon ${
              isActive('/art-gallery') ? '' : 'navy-icon'
            }`}
          />
          Art Gallery
        </button>

        <button
          className={`sidebar-btn ${isActive('/reporting') ? 'active' : ''}`}
          onClick={() => navigate('/reporting')}
        >
          <FaChartPie
            className={`sidebar-icon ${
              isActive('/reporting') ? '' : 'navy-icon'
            }`}
          />
          Reporting
        </button>
      </aside>

      <div className="sa-filter-buttons">
        <button
          className={`user-btn ${
            activeTab === 'special-offers' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('special-offers')}
        >
          Special Offers
        </button>
      </div>

      {activeTab === 'special-offers' && (
        <div className="members-table-container-pr" style={{ marginTop: '5%' }}>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Date Created</th>
                    <th>Name of Offer</th>
                    <th>Start Date</th>
                    <th>Expiry Date</th>
                    <th>Reach</th>
                    <th>Claimed</th>
                    <th>Days Active</th>
                    <th>S2W Points</th>
                    <th>Points Value</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'special-offers' && (
                    <>
                      {reportingData.length > 0 ? (
                        reportingData.map((data, index) => (
                          <tr key={index}>
                            <td>
                              {data.createdAt
                                .substring(0, 10)
                                .split('-')
                                .reverse()
                                .join('-') || '-'}
                            </td>
                            <td>{data.header || '-'}</td>
                            <td>
                              {data.startDate
                                .substring(0, 10)
                                .split('-')
                                .reverse()
                                .join('-') || '-'}
                            </td>
                            <td>
                              {data.expiryDate
                                .substring(0, 10)
                                .split('-')
                                .reverse()
                                .join('-') || '-'}
                            </td>
                            <td>{data.reach || '-'}</td>
                            <td>{data.claims || '-'}</td>
                            <td>{data.daysActive || '-'}</td>
                            <td>{data.points || '-'}</td>
                            <td>{data.dollarValue || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="no-data">
                            No members found
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reporting;
