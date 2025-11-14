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

  // Members (Members for approval) state
  const [members, setMembers] = useState([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersLimit, setMembersLimit] = useState(20);
  const [membersSearch, setMembersSearch] = useState('');
  const [membersTotalPages, setMembersTotalPages] = useState(1);

  // Waiting for payment state
  const [payments, setPayments] = useState([]);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit, setPaymentsLimit] = useState(20);
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState(null);


  // input shown in search bar (applies to active tab)
  const [searchInput, setSearchInput] = useState('');

  // Fetch members (for approvals)
  const fetchMembers = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/user/user-details?page=${membersPage}&limit=${membersLimit}`;
      if (membersSearch && membersSearch.trim() !== '')
        url += `&search=${encodeURIComponent(membersSearch.trim())}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && Array.isArray(res.data.users)) {
        setMembers(res.data.users);
        setMembersTotalPages(res.data.totalPages || 1);
      } else {
        setMembers([]);
        setMembersTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments (waiting payment)
  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/user/user-waiting?page=${paymentsPage}&limit=${paymentsLimit}`;
      if (paymentsSearch && paymentsSearch.trim() !== '')
        url += `&search=${encodeURIComponent(paymentsSearch.trim())}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && Array.isArray(res.data.users)) {
        setPayments(res.data.users);
        // Note: server totalPages corresponds to full result set; keep it for navigation consistency
        setPaymentsTotalPages(res.data.totalPages || 1);
      } else {
        setPayments([]);
        setPaymentsTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // const [membersForApproval, setMembersForApproval] = useState([
  //   {
  //     _id: '1',
  //     firstName: 'John',
  //     lastName: 'Smith',
  //     address: '00 Barrabooka Dr. The Gap 0000',
  //     phoneNumber: '+61 412 345 678',
  //     membership: 'Social',
  //   },
  //   {
  //     _id: '2',
  //     firstName: 'Sarah',
  //     lastName: 'Johnson',
  //     address: '00 Barrabooka Dr. The Gap 0000',
  //     phoneNumber: '+61 423 456 789',
  //     membership: 'Social',
  //   },
  //   {
  //     _id: '3',
  //     firstName: 'Michael',
  //     lastName: 'Brown',
  //     address: '00 Barrabooka Dr. The Gap 0000',
  //     phoneNumber: '+61 434 567 890',
  //     membership: 'Full',
  //   },
  // ]);

  // const [waitingPayment, setWaitingPayment] = useState([
  //   {
  //     _id: '4',
  //     firstName: 'David',
  //     lastName: 'Ohlson',
  //     address: '00 Barrabooka Dr. The Gap 0000',
  //     phoneNumber: '+61 423 456 789',
  //     membership: 'Social',
  //     payment: 'Approved',
  //   },
  //   {
  //     _id: '5',
  //     firstName: 'James',
  //     lastName: 'Wilson',
  //     address: '00 Barrabooka Dr. The Gap 0000',
  //     phoneNumber: '+61 423 456 789',
  //     membership: 'Social',
  //     payment: 'Approved',
  //   },
  //   {
  //     _id: '6',
  //     firstName: 'Emma',
  //     lastName: 'Davis',
  //     address: '00 Barrabooka Dr. The Gap 0000',
  //     phoneNumber: '+61 423 456 789',
  //     membership: 'Social',
  //     payment: 'Declined',
  //   },
  // ]);

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

  // Fetch when pages/limits/search change for respective tabs
useEffect(() => {
  if (activeTab === 'membersForApproval') fetchMembers();
}, [membersPage, membersLimit, membersSearch, token]);

useEffect(() => {
  if (activeTab === 'waitingPayment') fetchPayments();
}, [paymentsPage, paymentsLimit, paymentsSearch, token]);

  // When switching tabs, sync search input and fetch for that tab
  useEffect(() => {
    if (activeTab === 'membersForApproval') {
      setSearchInput(membersSearch);
      fetchMembers();
    } else {
      setSearchInput(paymentsSearch);
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Trigger search on keystroke for members tab
// useEffect(() => {
//   if (activeTab === 'membersForApproval') {
//     fetchMembers();
//   }
// }, [membersSearch]);

// Trigger search on keystroke for payments tab
// useEffect(() => {
//   if (activeTab === 'waitingPayment') {
//     fetchPayments();
//   }
// }, [paymentsSearch]);

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

  const getFullName = (user) =>
    `${user.GivenNames || ''} ${user.Surname || ''}`.trim();
  const renderLicence = (field) =>
  !field ? (
    <span style={{ color: '#999' }}>-</span>
  ) : (
    <img
      src={field}
      alt="License"
      onClick={() => setSelectedLicense(field)}
      style={{
        width: '80px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '4px',
        cursor: 'pointer',
        border: '1px solid #ddd',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
    />
  );
  const renderMemberPaymentStatus = (u) =>
    u.paymentStatus === 'success' ? 'Approved' : 'Declined';

  const renderWaitingPaymentStatus = (u) =>
    u.paymentType === 'reception' ? 'Pay at counter' : 'Declined'

  // Search button clicked: apply search to active tab
  const onSearchClick = () => {
  if (activeTab === 'membersForApproval') {
    setMembersPage(1);
    setMembersSearch(searchInput);
  } else {
    setPaymentsPage(1);
    setPaymentsSearch(searchInput);
  }
};

  // Pagination controls per tab
  const onPrev = () => {
    if (activeTab === 'membersForApproval') {
      if (membersPage > 1) setMembersPage((p) => p - 1);
    } else {
      if (paymentsPage > 1) setPaymentsPage((p) => p - 1);
    }
  };
  const onNext = () => {
    if (activeTab === 'membersForApproval') {
      if (membersPage < membersTotalPages) setMembersPage((p) => p + 1);
    } else {
      if (paymentsPage < paymentsTotalPages) setPaymentsPage((p) => p + 1);
    }
  };

  const onLimitChange = (e) => {
    const v = Number(e.target.value) || 20;
    if (activeTab === 'membersForApproval') {
      setMembersLimit(v);
      setMembersPage(1);
    } else {
      setPaymentsLimit(v);
      setPaymentsPage(1);
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
            activeTab === 'waitingPayment' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('waitingPayment')}
        >
          Waiting for Payment
        </button>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search for member"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
    if (e.key === 'Enter') {
      onSearchClick();
    }
  }}
              style={{
                padding: '8px 12px',
    borderRadius: '20px',
    border: '2px solid #002977',
    fontSize: '14px',
    width: '250px',
    outline: 'none',

              }}
            />
            <button
  onClick={onSearchClick}
  style={{
    padding: '10px 10px',
    borderRadius: '20px',
    backgroundColor: '#002977',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  }}
>
  GO
</button>
          </div>
        </div>
      </div>

      <div className="members-table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'membersForApproval' &&
                  members.map((member) => (
                    <tr key={member._id}>
                      <td>{getFullName(member)}</td>
                      <td>{member.Address || member.address || '-'}</td>
                      <td>{member.Mobile || member.mobile || '-'}</td>
                      <td>{member.packageName || '-'}</td>
                      <td>{renderLicence(member.licence_front)}</td>
                      <td>{renderLicence(member.licence_back)}</td>
                      <td>{renderMemberPaymentStatus(member)}</td>
                      <td>
                        <button className="action-btn approve">Verified</button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'waitingPayment' &&
                  payments.map((member) => (
                    <tr key={member._id}>
                      <td>{getFullName(member)}</td>
                      <td>{member.Address || member.address || '-'}</td>
                      <td>{member.Mobile || member.mobile || '-'}</td>
                      <td>{member.packageName || '-'}</td>
                      <td>{renderLicence(member.licence_front)}</td>
                      <td>{renderLicence(member.licence_back)}</td>
                      <td>{renderWaitingPaymentStatus(member)}</td>
                      <td>
                        <button className="action-btn approve">
                          Make Payment
                        </button>
                      </td>
                    </tr>
                  ))}

                {((activeTab === 'membersForApproval' &&
                  members.length === 0) ||
                  (activeTab === 'waitingPayment' &&
                    payments.length === 0)) && (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No members found
                    </td>
                  </tr>
                )}
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
                disabled={
                  activeTab === 'membersForApproval'
                    ? membersPage === 1
                    : paymentsPage === 1
                }
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: (
                    activeTab === 'membersForApproval'
                      ? membersPage === 1
                      : paymentsPage === 1
                  )
                    ? '#e0e0e0'
                    : '#002977',
                  color: (
                    activeTab === 'membersForApproval'
                      ? membersPage === 1
                      : paymentsPage === 1
                  )
                    ? '#999'
                    : 'white',
                  cursor: (
                    activeTab === 'membersForApproval'
                      ? membersPage === 1
                      : paymentsPage === 1
                  )
                    ? 'not-allowed'
                    : 'pointer',
                  fontWeight: '500',
                }}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: '500', color: '#002977' }}>
                Page{' '}
                {activeTab === 'membersForApproval'
                  ? membersPage
                  : paymentsPage}{' '}
                of{' '}
                {activeTab === 'membersForApproval'
                  ? membersTotalPages
                  : paymentsTotalPages}
              </span>
              <button
                onClick={onNext}
                disabled={
                  activeTab === 'membersForApproval'
                    ? membersPage >= membersTotalPages
                    : paymentsPage >= paymentsTotalPages
                }
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: (
                    activeTab === 'membersForApproval'
                      ? membersPage >= membersTotalPages
                      : paymentsPage >= paymentsTotalPages
                  )
                    ? '#e0e0e0'
                    : '#002977',
                  color: (
                    activeTab === 'membersForApproval'
                      ? membersPage >= membersTotalPages
                      : paymentsPage >= paymentsTotalPages
                  )
                    ? '#999'
                    : 'white',
                  cursor: (
                    activeTab === 'membersForApproval'
                      ? membersPage >= membersTotalPages
                      : paymentsPage >= paymentsTotalPages
                  )
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
      {selectedLicense && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
    }}
    onClick={() => setSelectedLicense(null)}
  >
    <div
      style={{
        position: 'relative',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setSelectedLicense(null)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#002977',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
      <img
        src={selectedLicense}
        alt="Full License"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: '4px',
        }}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default ClubDesk;
