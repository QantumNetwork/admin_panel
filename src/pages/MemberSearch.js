import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { PiListBulletsFill } from 'react-icons/pi';
import { CiSearch } from 'react-icons/ci';
import { MdVerified } from 'react-icons/md';
import { MdRefresh } from 'react-icons/md';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/member-search.css';

const MemberSearch = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const appGroup = localStorage.getItem('appGroup');

  const [loading, setLoading] = useState(false);
  const [confirmVerify, setConfirmVerify] = useState({
    open: false,
    userId: null,
  });

  // API functions
  const [venues, setVenues] = useState([]);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  const [members, setMembers] = useState([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersLimit, setMembersLimit] = useState(10);
  const [membersSearch, setMembersSearch] = useState('');
  const [membersTotalPages, setMembersTotalPages] = useState(1);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [memberId, setMemberId] = useState('');

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

  //Pagination controls per tab
  const onPrev = () => {
    if (membersPage > 1) setMembersPage((p) => p - 1);
  };
  const onNext = () => {
    if (membersPage < membersTotalPages) setMembersPage((p) => p + 1);
  };

  const userType = 'admin';

  const isActive = (path) => {
    return location.pathname === path;
  };

  const fetchMembers = useCallback(async () => {
    if (!selectedVenue || !token) return;

    // NEW: prevent API call if all filters empty
    if (!firstName && !lastName && !mobile && !cardNumber && !memberId) {
      setMembers([]);
      setMembersTotalPages(1);
      return;
    }

    try {
      setLoading(true);

      const params = {
        appType: selectedVenue,
        page: membersPage,
        limit: membersLimit,
      };

      if (firstName) params.firstName = firstName;
      if (lastName) params.lastName = lastName;
      if (mobile) params.mobile = mobile;
      if (cardNumber) params.cardNumber = cardNumber;
      if (memberId) params.bluizeId = memberId;

      const response = await axios.get(`${baseUrl}/user/search`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setMembers(response.data.data);
        setMembersTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [
    selectedVenue,
    token,
    membersPage,
    membersLimit,
    firstName,
    lastName,
    mobile,
    cardNumber,
    memberId,
    baseUrl,
  ]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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

        {/* <button
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
        </button> */}

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${
            isActive('/payment-reporting') ? 'active' : ''
          }`}
          onClick={() => navigate('/payment-reporting')}
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
      </aside>

      <div className="content-area">
        {/* Search panel placed above the table */}
        <div className="search-panel">
          <h3>Search Member</h3>
          <div className="search-row">
            <input
              placeholder="First name"
              value={firstName}
              onChange={(e) => {
                setMembersPage(1);
                setFirstName(e.target.value);
              }}
            />

            <input
              placeholder="Last name"
              value={lastName}
              onChange={(e) => {
                setMembersPage(1);
                setLastName(e.target.value);
              }}
            />

            <input
              placeholder="Mobile / Phone"
              value={mobile}
              onChange={(e) => {
                setMembersPage(1);
                setMobile(e.target.value);
              }}
            />

            <input
              placeholder="Card #"
              value={cardNumber}
              onChange={(e) => {
                setMembersPage(1);
                setCardNumber(e.target.value);
              }}
            />

            <input
              placeholder="Member #"
              value={memberId}
              onChange={(e) => {
                setMembersPage(1);
                setMemberId(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="members-table-container" style={{ marginLeft: '15%'}}>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <table className="members-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Mem ID</th>
                  <th>Card #</th>
                  <th>Expiry</th>
                  <th>Phone</th>
                  <th>Birthday</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>State</th>
                  <th>Postcode</th>
                </tr>
              </thead>
              <tbody>
                {!firstName &&
                !lastName &&
                !mobile &&
                !cardNumber &&
                !memberId ? (
                  <tr>
                    <td colSpan="12" className="no-data">
                      Start typing to search members
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="no-data">
                      No members found
                    </td>
                  </tr>
                ) : null}

                {members &&
                  members.map((member) => (
                    <tr key={member._id}>
                      <td>{member.GivenNames}</td>
                      <td>{member.Surname}</td>
                      <td>{member.BluizeId}</td>
                      <td>{member.CardNumber}</td>
                      <td>
                        {member.ExpiryDate
                          ? member.ExpiryDate.substring(0, 10)
                              .split('-')
                              .reverse()
                              .join('-')
                          : ''}
                      </td>
                      <td>{member.Mobile}</td>
                      <td>
                        {member.DateOfBirth
                          ? member.DateOfBirth.substring(0, 10)
                              .split('-')
                              .reverse()
                              .join('-')
                          : ''}
                      </td>
                      <td>{member.Gender}</td>
                      <td>{member.Email}</td>
                      <td>{member.Address}</td>
                      <td>{member.State}</td>
                      <td>{member.PostCode}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingRight: '20px',
                paddingLeft: '20px',
              }}
            >
              <button
                onClick={onPrev}
                disabled={membersPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: membersPage === 1 ? '#e0e0e0' : '#002977',
                  color: membersPage === 1 ? '#999' : 'white',
                  cursor: membersPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                }}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: '500', color: '#002977' }}>
                Page {membersPage} of {membersTotalPages}
              </span>
              <button
                onClick={onNext}
                disabled={membersPage >= membersTotalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor:
                    membersPage >= membersTotalPages ? '#e0e0e0' : '#002977',
                  color: membersPage >= membersTotalPages ? '#999' : 'white',
                  cursor:
                    membersPage >= membersTotalPages
                      ? 'not-allowed'
                      : 'pointer',
                  fontWeight: '500',
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberSearch;
