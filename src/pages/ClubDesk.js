import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { PiListBulletsFill } from 'react-icons/pi';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/club-desk.css';

const ClubDesk = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const appGroup = localStorage.getItem('appGroup');
  // const [membersForApproval, setMembersForApproval] = useState([]);
  //   const [declinedMembers, setDeclinedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // API functions
  const [activeTab, setActiveTab] = useState('membersForApproval');
  const [venues, setVenues] = useState([]);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  const [membersForApproval, setMembersForApproval] = useState([
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Smith',
      address: '00 Barrabooka Dr. The Gap 0000',
      phoneNumber: '+61 412 345 678',
      membership: 'Social',
    },
    {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      address: '00 Barrabooka Dr. The Gap 0000',
      phoneNumber: '+61 423 456 789',
      membership: 'Social',
    },
    {
      _id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      address: '00 Barrabooka Dr. The Gap 0000',
      phoneNumber: '+61 434 567 890',
      membership: 'Full',
    },
  ]);

  const [declinedMembers, setDeclinedMembers] = useState([
    {
      _id: '4',
      firstName: 'Emma',
      lastName: 'Davis',
      address: '00 Barrabooka Dr. The Gap 0000',
      phoneNumber: '+61 423 456 789',
      membership: 'Social',
    },
    {
      _id: '5',
      firstName: 'James',
      lastName: 'Wilson',
      address: '00 Barrabooka Dr. The Gap 0000',
      phoneNumber: '+61 423 456 789',
      membership: 'Social',
    },
  ]);

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
        <div className="s2w-logo" onClick={() => handleLock()}>
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

      {/* sidebar */}
      <aside className="sidebar-sa">
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
          className={`sidebar-btn ${isActive('/club-pkg') ? 'active' : ''}`}
          onClick={() => navigate('/club-pkg')}
        >
          <PiListBulletsFill
            className={`sidebar-icon ${
              isActive('/club-pkg') ? '' : 'navy-icon'
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
      </aside>

      <div className="sa-filter-buttons">
        <button
          className={`user-btn ${
            activeTab === 'membersForApproval' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('membersForApproval')}
        >
          Members For Approval
        </button>
        <button
          className={`user-btn ${
            activeTab === 'declinedMembers' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('declinedMembers')}
        >
          Declined Members
        </button>
      </div>

      <div className="members-table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Mobile</th>
                <th>Membership</th>
                <th>Licence Front</th>
                <th>Licence Back</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'membersForApproval' &&
              membersForApproval.length > 0 ? (
                membersForApproval.map((member, index) => (
                  <tr key={member._id || index}>
                    <td>
                      {member.firstName} {member.lastName}
                    </td>
                    <td>{member.address}</td>
                    <td>{member.phoneNumber}</td>
                    <td>{member.membership}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Approved</td>
                    <td>
                      <a href="#" style={{ marginRight: '5px' }}>
                        Decline
                      </a>
                      <a href="#" style={{ marginRight: '20px' }}>
                        Edit
                      </a>
                      <button className="action-btn approve">Approve</button>
                    </td>
                  </tr>
                ))
              ) : activeTab === 'declinedMembers' &&
                declinedMembers.length > 0 ? (
                declinedMembers.map((member, index) => (
                  <tr key={member._id || index}>
                    <td>
                      {member.firstName} {member.lastName}
                    </td>
                    <td>{member.address}</td>
                    <td>{member.phoneNumber}</td>
                    <td>{member.membership}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Approved</td>
                    <td>
                      <a href="#">Move to approval</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClubDesk;
