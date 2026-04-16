import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { PiListBulletsFill } from 'react-icons/pi';
import { MdBorderBottom, MdRefresh } from 'react-icons/md';
import { CiSearch } from 'react-icons/ci';
import { MdVerified, MdHistory } from 'react-icons/md';
import { handleLogout } from '../utils/api';
import { getAppType } from '../utils/appConstants';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/payment-reporting.css';
import { set } from 'react-hook-form';

const PaymentReporting = () => {
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

  const userType = localStorage.getItem('userType') || 'admin';

  // API functions
  const [activeTab, setActiveTab] = useState('approvedPayments');
  const [venues, setVenues] = useState([]);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  // Members (Members for approval) state
  const [membersPage, setMembersPage] = useState(1);
  const [membersLimit, setMembersLimit] = useState(10);
  const [membersSearch, setMembersSearch] = useState('');
  const [membersTotalPages, setMembersTotalPages] = useState(1);

  const [dateFilter, setDateFilter] = useState('mtd');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // input shown in search bar (applies to active tab)
  const [searchInput, setSearchInput] = useState('');

  const [transactionHistory, setTransactionHistory] = useState([]);

  const fetchTransactionHistory = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/user/update-details?filter=${dateFilter}&page=${membersPage}`;

      if (membersSearch && membersSearch.trim() !== '')
        url += `&search=${encodeURIComponent(membersSearch.trim())}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.data && Array.isArray(res.data.data)) {
        setTransactionHistory(res.data.data);
        console.log('Transaction history response:', res.data.data);
        setMembersTotalPages(res.data.totalPages);
      } else {
        setTransactionHistory([]);
        setMembersTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      toast.error('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  const formatToBrisbaneTime = (utcString) => {
    const date = new Date(utcString);

    return date.toLocaleTimeString('en-AU', {
      timeZone: 'Australia/Brisbane',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
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

  useEffect(() => {
    fetchTransactionHistory();
  }, [dateFilter, startDate, endDate, membersPage, membersSearch, token]);

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

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Pagination controls per tab
  const onPrev = () => {
    if (activeTab === 'approvedPayments') {
      if (membersPage > 1) setMembersPage((p) => p - 1);
    }
  };
  const onNext = () => {
    if (activeTab === 'approvedPayments') {
      if (membersPage < membersTotalPages) setMembersPage((p) => p + 1);
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
      </aside>

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
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                setMembersPage(1);
                setMembersSearch(value);
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
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          marginLeft: '16.5%',
          marginTop: '1%',
          flexWrap: 'nowrap',
        }}
      >
        {/* MTD / Date filter */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <select
            value={dateFilter}
            onChange={(e) => {
              setMembersPage(1);
              setDateFilter(e.target.value);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#F2F2F2',
              cursor: 'pointer',
              minWidth: '100px',
            }}
          >
            <option value="mtd">MTD</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
          </select>
        </div>
      </div>

      {activeTab === 'approvedPayments' && (
        <div className="members-table-container-pr">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Requester</th>
                    <th>Member Name</th>
                    <th>Card ID</th>
                    <th></th>
                    <th>Previous</th>
                    <th>New change</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{ textAlign: 'center', padding: '20px' }}
                      >
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactionHistory.map((transaction) =>
                      transaction.changes.map((change, index) => (
                        <tr key={change._id}>
                          {/* Show these ONLY for first change */}
                          {index === 0 && (
                            <>
                              <td rowSpan={transaction.changes.length}>
                                {transaction.updatedAt
                                  ?.substring(0, 10)
                                  .split('-')
                                  .reverse()
                                  .join('-')}
                              </td>

                              <td rowSpan={transaction.changes.length}>
                                {formatToBrisbaneTime(transaction.updatedAt)}
                              </td>

                              <td rowSpan={transaction.changes.length}>
                                {transaction.updatedBy}
                              </td>

                              <td rowSpan={transaction.changes.length}>
                                {transaction.GivenNames}
                              </td>

                              <td rowSpan={transaction.changes.length}>
                                {transaction.CardNumber}
                              </td>
                            </>
                          )}

                          {/* These repeat for each change */}
                          <td>{change.field}</td>
                          <td>{change.oldValue}</td>
                          <td>{change.newValue}</td>
                        </tr>
                      ))
                    )
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
                    activeTab === 'approvedPayments' ? membersPage === 1 : null
                  }
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: (
                      activeTab === 'approvedPayments'
                        ? membersPage === 1
                        : null
                    )
                      ? '#e0e0e0'
                      : '#002977',
                    color: (
                      activeTab === 'approvedPayments'
                        ? membersPage === 1
                        : null
                    )
                      ? '#999'
                      : 'white',
                    cursor: (
                      activeTab === 'approvedPayments'
                        ? membersPage === 1
                        : null
                    )
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: '500',
                  }}
                >
                  ← Previous
                </button>
                <span style={{ fontWeight: '500', color: '#002977' }}>
                  Page {activeTab === 'approvedPayments' ? membersPage : null}{' '}
                  of{' '}
                  {activeTab === 'approvedPayments' ? membersTotalPages : null}
                </span>
                <button
                  onClick={onNext}
                  disabled={
                    activeTab === 'approvedPayments'
                      ? membersPage >= membersTotalPages
                      : null
                  }
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: (
                      activeTab === 'approvedPayments'
                        ? membersPage >= membersTotalPages
                        : null
                    )
                      ? '#e0e0e0'
                      : '#002977',
                    color: (
                      activeTab === 'approvedPayments'
                        ? membersPage >= membersTotalPages
                        : null
                    )
                      ? '#999'
                      : 'white',
                    cursor: (
                      activeTab === 'approvedPayments'
                        ? membersPage >= membersTotalPages
                        : null
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
      )}
    </div>
  );
};

export default PaymentReporting;
