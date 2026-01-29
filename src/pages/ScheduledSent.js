import { useLocation, useNavigate } from 'react-router-dom';
import { FaMobileAlt } from 'react-icons/fa';
import { IoPushOutline } from 'react-icons/io5';
import { BiTargetLock } from 'react-icons/bi';
import { IoIosSend } from 'react-icons/io';
import { logout } from '../utils/auth';
import { IoCopyOutline } from 'react-icons/io5';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { uploadFileToS3 } from '../s3/config';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { trackMenuAccess, handleLogout } from '../utils/api';
import '../styles/scheduledsent.css';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Swal from 'sweetalert2';

const ScheduledSent = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scheduled');
  const [activeFilter, setActiveFilter] = useState('push');
  const [allData, setAllData] = useState([]);
  // Get email from localStorage or use a default
  const email = localStorage.getItem('userEmail') || 'user@example.com';
  const token = localStorage.getItem('token');
  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');
  const userInitial = email.charAt(0).toUpperCase();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSent, setLoadingSent] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);

  const isActive = (path) => {
    // if (path === '/push-messaging') {
    //   return true; // Always return true for Push Messaging to make it active by default
    // }
    return location.pathname === path;
  };

  // Handle reuse click - redirects to market-to-members page with notification ID
  const handleReuse = (id, usersCount) => {
    navigate(`/market-to-members?id=${id}&usersCount=${usersCount}`);
  };

  // Handle delete click - delete a scheduled notification
  const handleDelete = async (id) => {
    try {
      if (!token) {
        toast.error('No authentication token found!');
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this scheduled notification?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel',
      });

      if (result.isConfirmed) {
        const url = `${baseUrl}/notification/delete?id=${id}`;
        const response = await axios.delete(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          toast.success('Notification deleted successfully');
          // Refresh the data after successful deletion
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  // Fix for sidebar navigation - ensure we have the state when navigating
  const handleNavigation = (path) => {
    // For sidebar buttons, always stay on market-to-members
    if (
      path === '/push-messaging' ||
      path === '/sms-email' ||
      path === '/geo-targeting'
    ) {
      navigate('/market-to-members');
    } else {
      // For header buttons, navigate as before
      navigate(path);
    }
  };

  // Sample data for scheduled messages
  const scheduledMessages = [
    {
      date: '22 April 25',
      time: '09:30',
      message: 'Brewing Punk XPA 4pk $14',
      description:
        'Present this voucher to receive a 4 pack of Brewing Punk XPA for $14',
      reach: '22,130',
    },
    {
      date: '22 April 25',
      time: '09:30',
      message: 'Brewing Punk XPA 4pk $14',
      description:
        'Present this voucher to receive a 4 pack of Brewing Punk XPA for $14',
      reach: '22,130',
    },
    {
      date: '22 April 25',
      time: '09:30',
      message: 'Brewing Punk XPA 4pk $14',
      description:
        'Present this voucher to receive a 4 pack of Brewing Punk XPA for $14',
      reach: '22,130',
    },
    {
      date: '22 April 25',
      time: '09:30',
      message: 'Brewing Punk XPA 4pk $14',
      description:
        'Present this voucher to receive a 4 pack of Brewing Punk XPA for $14',
      reach: '22,130',
    },
    {
      date: '22 April 25',
      time: '09:30',
      message: 'Brewing Punk XPA 4pk $14',
      description:
        'Present this voucher to receive a 4 pack of Brewing Punk XPA for $14',
      reach: '22,130',
    },
  ];

  const fetchData = useCallback(
    async (page = 1) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('No authentication token found!');
          return;
        }

        if (activeTab === 'completed') {
          setLoadingSent(true);
        }
        const url = `${baseUrl}/notification/details?type=${activeTab}&page=${page}&limit=10`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data && response.data.success) {
          console.log('response.data', response.data);

          const formattedData = response.data.data.logs.map((log) => {
            // Pick correct field based on status
            let rawDate = null;

            if (log.status === 'scheduled') {
              rawDate = log.scheduledAt; // <-- Use scheduledAt
            } else if (log.status === 'completed') {
              rawDate = log.executedAt; // <-- Use executedAt
            }

            const dateObj = rawDate ? new Date(rawDate) : null;

            const formattedDate = dateObj
              ? dateObj.toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: '2-digit',
                  timeZone: 'Australia/Brisbane',
                })
              : 'N/A';

            const formattedTime = dateObj
              ? dateObj.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'Australia/Brisbane',
                })
              : 'N/A';

            return {
              ...log,
              date: formattedDate,
              time: formattedTime,
            };
          });

          setAllData(formattedData);
          if (activeTab === 'completed') {
            setLoadingSent(false);
          }
          setTotalPages(response.data.data.totalPages);
          setCurrentPage(response.data.data.page);

          console.log('Fetched paginated data:', formattedData);
        } else {
          throw new Error(
            response.data.message || 'Failed to fetch notifications'
          );
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error(error.message || 'Something went wrong!');
        if (activeTab === 'completed') {
          setLoadingSent(false);
        }
      }
    },
    [activeTab, baseUrl]
  );

  // Initial data fetch when component mounts or dependencies change
  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, selectedVenue, currentPage]);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page);
    }
  };

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
    setCurrentPage(1);
    fetchData(1);
  }, [activeTab]);
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
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        setLoading(false);
      }
    };

    if (token && userType === 'admin') {
      fetchVenues();
    }
  }, [token]);

  const handleCardClick = async (accessItem, navigateTo) => {
    try {
      const result = await trackMenuAccess(accessItem);
      // Only navigate if the API call was successful
      if (result.success && navigateTo) {
        navigate(navigateTo, { state: { email } });
      }
      // No need for else if here since trackMenuAccess already shows the error toast
    } catch (error) {
      console.error('Error in handleCardClick:', error);
      // Error toast is already shown by trackMenuAccess
    }
  };

  const onPrev = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const onNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
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
    <div className="ssent-digital-app-container">
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
      <header className="ssent-app-header">
        <div className="s2w-logo" onClick={async () => await handleLock()}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>

        <div className="header-buttons">
          {userType === 'admin' ? (
            <>
              <button
                className="digital-app-btn"
                onClick={() => handleCardClick('digital', '/digital-app')}
              >
                Digital App
              </button>
              <button
                className="market-to-members-btn"
                onClick={() => handleCardClick('m2m', '/market-to-members')}
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
                  onClick={() => handleCardClick('digital', '/digital-app')}
                >
                  Digital App
                </button>
              )}
              {access.includes('m2m') && (
                <button
                  className="market-to-members-btn"
                  onClick={() => handleCardClick('m2m', '/market-to-members')}
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
                right: '70px',
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

                      await handleLock();
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
          )}
        </div>
        <div className="user-section">
          <div
            className="user-avatar-ss"
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

      <aside className="sidebar-ss">
        <button
          className={`sidebar-btn ${
            isActive('/push-messaging') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/push-messaging')}
        >
          <IoPushOutline
            className={`sidebar-icon ${
              isActive('/push-messaging') ? '' : 'navy-icon'
            }`}
          />
          Push Messaging
        </button>

        <button
          className={`sidebar-btn ${
            isActive('/scheduled-&-sent') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/scheduled-&-sent')}
        >
          <IoIosSend
            className={`sidebar-icon ${
              isActive('/scheduled-&-sent') ? '' : 'navy-icon'
            }`}
          />
          Scheduled & Sent
        </button>
      </aside>

      <div className="ssent-message-type-filter">
        <div className="ssent-filter-buttons">
          <button
            className={`ssent-push-btn ${
              activeFilter === 'push' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('push')}
          >
            Push
          </button>
          {/* <button
            className={`ssent-sms-btn ${
              activeFilter === 'sms' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('sms')}
          >
            SMS
          </button>
          <button
            className={`ssent-email-btn ${
              activeFilter === 'email' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('email')}
          >
            Email
          </button>
          <button
            className={`ssent-sso-btn ${
              activeFilter === 'sso' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('sso')}
          >
            Geo
          </button> */}
        </div>
        <div className="ssent-tab-row">
          <div className="ssent-tab-buttons">
            <button
              className={`ssent-tab-btn ${
                activeTab === 'scheduled' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('scheduled')}
            >
              Scheduled
            </button>
            <button
              className={`ssent-tab-btn ${
                activeTab === 'completed' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Sent
            </button>
          </div>
          {loadingSent && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              Loading Sent Notifications...
            </div>
          )}
          <main className="ssent-scheduled-sent-content">
            {allData.length === 0 ? (
              <div
                style={{
                  width: '750px',
                  margin: '40px auto',
                  background: '#ffffff',
                  boxShadow: '1px 2px 10px #e1e3ec',
                  borderRadius: '4px',
                  padding: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '200px',
                    backgroundColor: '#f7fafc',
                    boxShadow: '0px 2px 1px #e1e3ec',
                  }}
                >
                  <img
                    src="/s2w-logo.png"
                    alt="No records"
                    style={{ width: '170px' }}
                  />
                </div>
                <div
                  style={{
                    color: '#064ea1',
                    fontSize: '1.5rem',
                    fontWeight: '500',
                    marginTop: '0.85rem',
                  }}
                >
                  {activeTab === 'completed'
                    ? 'No sent notifications found.'
                    : 'No scheduled notifications found.'}
                </div>
                <div
                  style={{
                    color: '#a2a5b9',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    textAlign: 'center',
                  }}
                ></div>
              </div>
            ) : (
              <div className="ssent-messages-table">
                <div className="ssent-table-header">
                  <div className="ssent-date-column">Date</div>
                  <div className="ssent-time-column">Time</div>
                  <div className="ssent-message-column">Message</div>
                  <div className="ssent-reach-column">Member Reach</div>
                  {activeTab === 'completed' ? (
                    <>
                      <div className="ssent-completed-column">Completed</div>
                      <div className="ssent-reuse-column"></div>
                    </>
                  ) : (
                    <>
                      <div className="ssent-delete-column"></div>
                      <div className="ssent-edit-column"></div>
                    </>
                  )}
                </div>
                <div className="ssent-table-body">
                  {allData.map((message, index) => (
                    <div className="ssent-table-row" key={index}>
                      <div className="ssent-date-column">{message.date}</div>
                      <div className="ssent-time-column">{message.time}</div>
                      <div className="ssent-message-column">
                        <div className="ssent-message-content">
                          {/* Always show details first */}
                          <div className="ssent-message-details">
                            <div className="ssent-message-title">
                              {message.heading}
                            </div>
                            <div className="ssent-message-description">
                              {message.description}
                            </div>
                          </div>

                          {/* Only render image if message.image is provided */}
                          {message.image ? (
                            <div className="ssent-message-image">
                              <img
                                src={message.image}
                                alt={message.heading || 'Notification Image'}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <>
                              <div
                                className="ssent-message-content"
                                style={{
                                  paddingTop: '5px',
                                  paddingBottom: '5px',
                                }}
                              >
                                {/* Other content goes here */}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ssent-reach-column">
                        {message.status === 'scheduled'
                          ? message.market
                          : message.status === 'completed'
                          ? message.successCount
                          : null}
                      </div>

                      {activeTab === 'completed' ? (
                        <>
                          <div className="ssent-completed-column">
                            {message.displayType === 'schedule' &&
                              message.status === 'completed' && (
                                <div className="ssent-checkbox-checked">
                                  <FaCheck />
                                </div>
                              )}
                          </div>
                          <div className="ssent-reuse-column">
                            <button
                              className="ssent-reuse-btn"
                              onClick={() =>
                                handleReuse(message._id, message.successCount)
                              }
                            >
                              <IoCopyOutline className="ssent-reuse-icon" />
                              Reuse
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="ssent-delete-column">
                            <button
                              className="ssent-delete-btn"
                              onClick={() => handleDelete(message._id)}
                            >
                              <FaTrashAlt className="ssent-delete-icon" />
                              Delete
                            </button>
                          </div>
                          <div className="ssent-edit-column">
                            <button
                              className="ssent-edit-btn"
                              onClick={() =>
                                handleReuse(message._id, message.market)
                              }
                            >
                              <FaPencilAlt className="ssent-edit-icon" />
                              Edit
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {allData.length > 0 && (
              <div className="ssent-pagination-container">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    width: '100%',
                  }}
                >
                  <button
                    onClick={onPrev}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor:
                        currentPage === 1 ? '#e0e0e0' : '#002977',
                      color: currentPage === 1 ? '#999' : 'white',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    ← Previous
                  </button>

                  <span style={{ fontWeight: '500', color: '#002977' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={onNext}
                    disabled={currentPage >= totalPages}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor:
                        currentPage >= totalPages ? '#e0e0e0' : '#002977',
                      color: currentPage >= totalPages ? '#999' : 'white',
                      cursor:
                        currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* <div className="ssent-filter-buttons">
          <button
              className={`ssent-push-btn ${
                activeFilter === "scheduled" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("scheduled")}
            >
              Scheduled
            </button>
            <button
              className={`ssent-push-btn ${
                activeFilter === "scheduled" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("scheduled")}
            >
              Sent
            </button>
          </div> */}
    </div>
  );
};

export default ScheduledSent;
