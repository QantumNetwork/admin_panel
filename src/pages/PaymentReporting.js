import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { PiListBulletsFill } from 'react-icons/pi';
import { MdVerified } from 'react-icons/md';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/payment-reporting.css';

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

  // API functions
  const [activeTab, setActiveTab] = useState('approvedPayments');
  const [venues, setVenues] = useState([]);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  // Members (Members for approval) state
  const [members, setMembers] = useState([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersLimit, setMembersLimit] = useState(10);
  const [membersSearch, setMembersSearch] = useState('');
  const [membersTotalPages, setMembersTotalPages] = useState(1);

  const [dateFilter, setDateFilter] = useState('mtd');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [paymentFilter, setPaymentFilter] = useState('all');

  const [memberships, setMemberships] = useState([]);
  const [membershipFilter, setMembershipFilter] = useState('all');

  // input shown in search bar (applies to active tab)
  const [searchInput, setSearchInput] = useState('');

  const [totalsData, setTotalsData] = useState({
    totalUsers: 0,
    totalAmountPaid: 0,
  });

  const [paymentBreakdown, setPaymentBreakdown] = useState({
    stripe: { amount: 0, users: 0 },
    card_by_venue: { amount: 0, users: 0 },
    cash: { amount: 0, users: 0 },
    management: { amount: 0, users: 0 },
  });

  // Fetch members (for approvals)
  const fetchMembers = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/user/get/verified?page=${membersPage}`;
      //search
      if (membersSearch && membersSearch.trim() !== '')
        url += `&search=${encodeURIComponent(membersSearch.trim())}`;

      // payment type
      if (paymentFilter && paymentFilter !== 'all') {
        url += `&paymentType=${paymentFilter}`;
      }

      // date filter
      url += `&dateType=${dateFilter}`;

      // custom date handling
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `&fromDate=${startDate}&toDate=${endDate}`;
      }

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
    if (activeTab === 'approvedPayments') fetchMembers();
  }, [
    membersPage,
    membersLimit,
    membersSearch,
    paymentFilter,
    dateFilter,
    startDate,
    endDate,
    token,
  ]);

  // When switching tabs, sync search input and fetch for that tab
  useEffect(() => {
    if (activeTab === 'approvedPayments') {
      setSearchInput(membersSearch);
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'totalsAllPaymentMethods' && token) {
      fetchClubPackages();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'totalsAllPaymentMethods' && token) {
      fetchTotals();
    }
  }, [dateFilter, startDate, endDate, membershipFilter, activeTab, token]);

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

  // const handleLock = async () => {
  //   try {
  //     const result = await handleLogout();
  //     if (result.success) {
  //       navigate('/dashboard');
  //     } else {
  //       toast.error(
  //         result.message || 'Failed to remove lock. Please try again.'
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error in handleLock:', error);
  //     toast.error(error.message || 'Failed to remove lock. Please try again.');
  //   }
  // };

  const getFullName = (user) =>
    `${user.GivenNames || ''} ${user.Surname || ''}`.trim();

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

  const fetchPaymentType = (type) => {
    switch (type) {
      case 'cash':
        return 'Cash';
      case 'card_by_venue':
        return 'Card by Venue';
      case 'cheque':
        return 'Cheque';
      case 'management':
        return 'Management Approved';
      case 'card':
        return 'Stripe';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
  };

  const fetchClubPackages = async () => {
    try {
      const res = await axios.get(`${baseUrl}/club-package`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const levels = res.data.data[0]?.membershipLevels || [];
        setMemberships(levels);
      }
    } catch (err) {
      console.error('Error fetching club packages:', err);
    }
  };

  const fetchTotals = async () => {
    try {
      let url = `https://betaapi.s2w.com.au/user/get/total?dateType=${dateFilter}`;

      if (dateFilter === 'custom' && startDate && endDate) {
        url += `&fromDate=${startDate}&toDate=${endDate}`;
      }

      if (membershipFilter !== 'all') {
        url += `&packageId=${membershipFilter}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        // totals
        setTotalsData(res.data.totals);

        // reset breakdown
        const breakdownMap = {
          stripe: { amount: 0, users: 0 },
          card_by_venue: { amount: 0, users: 0 },
          cash: { amount: 0, users: 0 },
          management: { amount: 0, users: 0 },
        };

        res.data.breakdown.forEach((item) => {
          if (item.paymentType === 'card') {
            breakdownMap.stripe.amount = item.totalAmountPaid;
            breakdownMap.stripe.users = item.userCount;
          }

          if (item.paymentType === 'card_by_venue') {
            breakdownMap.card_by_venue.amount = item.totalAmountPaid;
            breakdownMap.card_by_venue.users = item.userCount;
          }

          if (item.paymentType === 'cash') {
            breakdownMap.cash.amount = item.totalAmountPaid;
            breakdownMap.cash.users = item.userCount;
          }

          if (item.paymentType === 'management') {
            breakdownMap.management.amount = item.totalAmountPaid;
            breakdownMap.management.users = item.userCount;
          }
        });

        setPaymentBreakdown(breakdownMap);
      }
    } catch (err) {
      console.error('Error fetching totals:', err);
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
          onClick={() => navigate('/payment-reporting')}
        >
          <MdVerified
            className={`sidebar-icon ${
              isActive('/payment-reporting') ? '' : 'navy-icon'
            }`}
          />{' '}
          &nbsp; Payment Reporting
        </button>
      </aside>

      <div className="sa-filter-buttons">
        <button
          className={`user-btn ${
            activeTab === 'totalsAllPaymentMethods' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('totalsAllPaymentMethods')}
        >
          Totals All Payment Methods
        </button>
        <button
          className={`user-btn ${
            activeTab === 'approvedPayments' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('approvedPayments')}
        >
          Approved Payments
        </button>
      </div>

      {activeTab === 'approvedPayments' && (
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
                  if (activeTab === 'approvedPayments') {
                    setMembersPage(1);
                    setMembersSearch(value);
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
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          marginLeft: '16.5%',
          marginTop: activeTab === 'approvedPayments' ? '5%' : '6%',
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
            <option value="last3month">Last 3 Months</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* START DATE */}
        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#6b6b6b',
                marginBottom: '4px',
              }}
            >
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setMembersPage(1);
                setStartDate(e.target.value);
              }}
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #cfcfcf',
                fontSize: '12px',
                width: '130px',
              }}
            />
          </div>
        )}

        {/* END DATE */}
        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#6b6b6b',
                marginBottom: '4px',
              }}
            >
              END DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setMembersPage(1);
                setEndDate(e.target.value);
              }}
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #cfcfcf',
                fontSize: '12px',
                width: '130px',
              }}
            />
          </div>
        )}

        {activeTab === 'totalsAllPaymentMethods' && (
          <select
            value={membershipFilter}
            onChange={(e) => {
              setMembersPage(1);
              setMembershipFilter(e.target.value);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#F2F2F2',
              cursor: 'pointer',
              minWidth: '160px',
              marginLeft: dateFilter !== 'custom' ? '34%' : '6%',
            }}
          >
            {/* Default */}
            <option value="all">All Memberships</option>

            {/* Dynamic memberships */}
            {memberships.map((membership) => (
              <option key={membership._id} value={membership._id}>
                {membership.membershipName}
              </option>
            ))}
          </select>
        )}

        {/* ALL PAYMENT TYPES */}
        {activeTab === 'approvedPayments' && (
          <select
            value={paymentFilter}
            onChange={(e) => {
              setMembersPage(1);
              setPaymentFilter(e.target.value);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#F2F2F2',
              cursor: 'pointer',
              minWidth: '160px',
              marginLeft: dateFilter !== 'custom' ? '34%' : '6%',
            }}
          >
            <option value="all">All Payment Types</option>
            <option value="card">Stripe</option>
            <option value="cash">Cash</option>
            <option value="card_by_venue">Venue EFTPOS</option>
            <option value="management">Mgmt Approved</option>
          </select>
        )}
      </div>

      {activeTab === 'totalsAllPaymentMethods' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginLeft: '16%',
            marginTop: '3%',
            gap: '24px',
          }}
        >
          <div
            style={{
              width: '360px',
              backgroundColor: '#f3f3f3',
              borderRadius: '8px',
              padding: '16px 20px 80px 20px',
              // marginLeft: '16%',
              // marginTop: '3%',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '600',
                marginBottom: '12px',
              }}
            >
              <span>Payment Type</span>
              <span>Total Payments</span>
            </div>

            {[
              {
                label: 'Total Value',
                value: totalsData.totalAmountPaid.toFixed(2) ?? '0.00',
                bold: true,
              },
              {
                label: 'Stripe',
                value: paymentBreakdown.stripe.amount.toFixed(2) ?? '0.00',
              },
              {
                label: 'Venue EFTPOS',
                value:
                  paymentBreakdown.card_by_venue.amount.toFixed(2) ?? '0.00',
              },
              {
                label: 'Cash',
                value: paymentBreakdown.cash.amount.toFixed(2) ?? '0.00',
              },
              {
                label: 'Mgmt Approved',
                value: paymentBreakdown.management.amount.toFixed(2) ?? '0.00',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontWeight: item.bold ? '600' : '400',
                }}
              >
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              width: '200px',
              backgroundColor: '#f3f3f3',
              borderRadius: '8px',
              padding: '10px 18px 84px 12px',
              marginLeft: '12px',
              // lineHeight: '1.3'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '7px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#000',
                  textAlign: 'center',
                  marginBottom: '3px',
                }}
              >
                Membership by
                <br />
                payment method
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '6px 0',
                fontSize: '13px',
                color: '#4d4d4d',
                marginBottom: '1px',
              }}
            >
              {totalsData.totalUsers}
            </div>

            {/* Stripe */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '6px 0',
                fontSize: '13px',
                color: '#4d4d4d',
                marginBottom: '3px',
              }}
            >
              {paymentBreakdown.stripe.users}
            </div>

            {/* Venue EFTPOS */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '6px 0',
                fontSize: '13px',
                color: '#4d4d4d',
                marginBottom: '4px',
              }}
            >
              {paymentBreakdown.card_by_venue.users}
            </div>

            {/* Cash */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '6px 0',
                fontSize: '13px',
                color: '#4d4d4d',
                marginBottom: '3px'
              }}
            >
              {paymentBreakdown.cash.users}
            </div>

            {/* Mgmt Approved */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '6px 0',
                fontSize: '13px',
                color: '#4d4d4d',
              }}
            >
              {paymentBreakdown.management.users}
            </div>
          </div>
        </div>
      )}

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
                    <th>Name</th>
                    <th>Address</th>
                    <th>Suburb</th>
                    <th>Post Code</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Membership</th>
                    <th>Payment Type</th>
                    <th>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'approvedPayments' &&
                    members.map((member) => (
                      <tr key={member._id}>
                        <td>
                          {member.lastPaymentAtBrisbane
                            ? member.lastPaymentAtBrisbane.replace(
                                /\s\d{1,2}:\d{2}\s[AP]M$/,
                                ''
                              )
                            : '-'}
                        </td>
                        <td>{getFullName(member)}</td>
                        <td>{member.Address || member.address || '-'}</td>
                        <td>{member.Suburb || member.suburb || '-'}</td>
                        <td>{member.PostCode || member.postCode || '-'}</td>
                        <td>{member.Mobile || member.mobile || '-'}</td>
                        <td>{member.Email || member.email || '-'}</td>
                        <td>{member.packageName || '-'}</td>
                        <td>{fetchPaymentType(member.paymentType) || '-'}</td>
                        <td>{'$' + member.amountPaid || '-'}</td>
                      </tr>
                    ))}

                  {activeTab === 'approvedPayments' && members.length === 0 && (
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
