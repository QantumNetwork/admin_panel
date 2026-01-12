import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { PiListBulletsFill } from 'react-icons/pi';
import { MdVerified } from 'react-icons/md';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/club-desk.css';
import { set } from 'react-hook-form';

const ClubDesk = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const appGroup = localStorage.getItem('appGroup');
  const [dateFilter, setDateFilter] = useState('mtd');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [membersForApproval, setMembersForApproval] = useState([]);
  //   const [declinedMembers, setDeclinedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmVerify, setConfirmVerify] = useState({
    open: false,
    userId: null,
  });

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
  const [membersLimit, setMembersLimit] = useState(10);
  const [membersSearch, setMembersSearch] = useState('');
  const [membersTotalPages, setMembersTotalPages] = useState(1);

  // Waiting for payment state
  const [payments, setPayments] = useState([]);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit, setPaymentsLimit] = useState(10);
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [rejected, setRejected] = useState([]);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedLimit, setRejectedLimit] = useState(10);
  const [rejectedSearch, setRejectedSearch] = useState('');
  const [rejectedTotalPages, setRejectedTotalPages] = useState(1);

  const [verified, setVerified] = useState([]);
  const [verifiedPage, setVerifiedPage] = useState(1);
  const [verifiedLimit, setVerifiedLimit] = useState(10);
  const [verifiedSearch, setVerifiedSearch] = useState('');
  const [verifiedTotalPages, setVerifiedTotalPages] = useState(1);

  // input shown in search bar (applies to active tab)
  const [searchInput, setSearchInput] = useState('');

  // Fetch members (for approvals)
  const fetchMembers = useCallback(async () => {
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
  }, [baseUrl, membersPage, membersLimit, membersSearch, token]);

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
    if (activeTab === 'membersForApproval') fetchMembers();
  }, [membersPage, membersLimit, membersSearch, token]);

  useEffect(() => {
    if (activeTab === 'waitingPayment') fetchPayments();
  }, [paymentsPage, paymentsLimit, paymentsSearch, token]);

  useEffect(() => {
    if (activeTab === 'rejected') fetchRejected();
  }, [rejectedPage, rejectedLimit, rejectedSearch, token]);

  useEffect(() => {
    if (activeTab === 'verified') fetchVerified();
  }, [
    verifiedPage,
    dateFilter,
    verifiedLimit,
    verifiedSearch,
    startDate,
    endDate,
    token,
  ]);

  // When switching tabs, sync search input and fetch for that tab
  useEffect(() => {
    if (activeTab === 'membersForApproval') {
      setSearchInput(membersSearch);
      fetchMembers();
    } else if (activeTab === 'waitingPayment') {
      setSearchInput(paymentsSearch);
      fetchPayments();
    } else if (activeTab === 'rejected') {
      setSearchInput(rejectedSearch);
      fetchRejected();
    } else if (activeTab === 'verified') {
      setSearchInput(verifiedSearch);
      fetchVerified();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Poll members every 30 seconds while on the Members for Approval tab
  useEffect(() => {
    if (activeTab !== 'membersForApproval') return;

    const id = setInterval(() => {
      fetchMembers();
    }, 30000); // 30 seconds

    return () => clearInterval(id);
  }, [activeTab, fetchMembers]);

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

  const renderImage = (field) =>
    !field ? (
      <img
        src="/no_image.png"
        alt="Image"
        onClick={() => setSelectedImage('/no_image.png')}
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
    ) : (
      <img
        src={field}
        alt="Image"
        onClick={() => setSelectedImage(field)}
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
  const renderLicence = (field) =>
    !field ? (
      <img
        src="/no_license.png"
        alt="License"
        onClick={() => setSelectedLicense('/no_license.png')}
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
    u.paymentType === 'reception' ? 'Pay at counter' : 'Declined';

  // Pagination controls per tab
  const onPrev = () => {
    if (activeTab === 'membersForApproval') {
      if (membersPage > 1) setMembersPage((p) => p - 1);
    } else if (activeTab === 'waitingPayment') {
      if (paymentsPage > 1) setPaymentsPage((p) => p - 1);
    } else if (activeTab === 'rejected') {
      if (rejectedPage > 1) setRejectedPage((p) => p - 1);
    } else {
      if (verifiedPage > 1) setVerifiedPage((p) => p - 1);
    }
  };
  const onNext = () => {
    if (activeTab === 'membersForApproval') {
      if (membersPage < membersTotalPages) setMembersPage((p) => p + 1);
    } else if (activeTab === 'waitingPayment') {
      if (paymentsPage < paymentsTotalPages) setPaymentsPage((p) => p + 1);
    } else if (activeTab === 'rejected') {
      if (rejectedPage < rejectedTotalPages) setRejectedPage((p) => p + 1);
    } else {
      if (verifiedPage < verifiedTotalPages) setVerifiedPage((p) => p + 1);
    }
  };

  // const onLimitChange = (e) => {
  //   const v = Number(e.target.value) || 20;
  //   if (activeTab === 'membersForApproval') {
  //     setMembersLimit(v);
  //     setMembersPage(1);
  //   } else {
  //     setPaymentsLimit(v);
  //     setPaymentsPage(1);
  //   }
  // };
  const handleVerify = async () => {
    const memberId = confirmVerify.userId;
    if (!memberId) return;

    try {
      const url = `${baseUrl}/user/${memberId}?appType=${selectedVenue}`;

      const res = await axios.patch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        toast.success('Member Verified successfully!');
        setConfirmVerify({ open: false, userId: null });
        fetchMembers();
      } else {
        toast.error('Verification failed. Try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed');
    }
  };

  const handleMakePayment = async (member) => {
    try {
      const userId = member._id;

      const url = `${baseUrl}/user/${userId}?appType=${selectedVenue}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data;
      if (!data) {
        toast.error('No user data received');
        return;
      }

      // Save data to localStorage so Manual Reg page can auto-fill
      localStorage.setItem('manualRegUserData', JSON.stringify(data));

      // Redirect to manual registration page
      navigate('/manual-reg');
    } catch (error) {
      console.error('Make payment fetch failed:', error);
      toast.error('Failed to fetch payment details');
    }
  };

  const handleReject = async (memberId) => {
    if (!memberId) return;

    try {
      const url = `${baseUrl}/user/declined/${memberId}?appType=${selectedVenue}`;

      const res = await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.message === 'User declined successfully') {
        toast.success('Member rejected successfully');
        {
          activeTab === 'membersForApproval' && fetchMembers();
        } // refresh list
        {
          activeTab === 'verified' && fetchVerified();
        } // refresh list
      } else {
        toast.error('Failed to reject member');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject member');
    }
  };

  const fetchRejected = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/user/reject?page=${rejectedPage}&limit=${rejectedLimit}`;

      if (rejectedSearch && rejectedSearch.trim() !== '') {
        url += `&search=${encodeURIComponent(rejectedSearch.trim())}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data.users)) {
        setRejected(res.data.users);
        setRejectedTotalPages(res.data.totalPages || 1);
      } else {
        setRejected([]);
        setRejectedTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching rejected members:', err);
      toast.error('Failed to fetch rejected members');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerified = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/user/approved?page=${verifiedPage}&limit=${verifiedLimit}`;

      if (verifiedSearch && verifiedSearch.trim() !== '') {
        url += `&search=${encodeURIComponent(verifiedSearch.trim())}`;
      }

      // date filter
      if (dateFilter && dateFilter !== 'all') {
        url += `&paymentRange=${dateFilter}`;
      }

      // custom date handling
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `&fromDate=${startDate}&toDate=${endDate}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data.users)) {
        setVerified(res.data.users);
        setVerifiedTotalPages(res.data.totalPages || 1);
      } else {
        setVerified([]);
        setVerifiedTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching verified members:', err);
      toast.error('Failed to fetch verified members');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBackToApproval = async (memberId) => {
    if (!memberId) return;

    try {
      const url = `${baseUrl}/user/sent-to-verified/${memberId}?appType=${selectedVenue}`;

      const response = await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.message === 'Successfully Send') {
        toast.success('Member sent back to approval successfully');
        fetchRejected(); // refresh rejected list
      } else {
        toast.error('Failed to send member back to approval');
      }
    } catch (error) {
      console.error('Send back error:', error);
      toast.error('Failed to send member back to approval');
    }
  };

  const fetchAllVerifiedForExport = async () => {
    let page = 1;
    let allData = [];
    let totalPages = 1;

    do {
      let url = `${baseUrl}/user/approved?page=${page}&limit=100`;

      if (verifiedSearch) {
        url += `&search=${encodeURIComponent(verifiedSearch)}`;
      }

      if (dateFilter && dateFilter !== 'all') {
        url += `&paymentRange=${dateFilter}`;
      }

      if (dateFilter === 'custom' && startDate && endDate) {
        url += `&fromDate=${startDate}&toDate=${endDate}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      allData = allData.concat(res.data.users || []);
      totalPages = res.data.totalPages || 1;
      page++;
    } while (page <= totalPages);

    return allData;
  };

  const handleVerifiedExport = async () => {
    toast.info('Preparing export...');

    const allVerified = await fetchAllVerifiedForExport();

    if (!allVerified.length) {
      toast.warning('No verified members to export');
      return;
    }

    const toAbsoluteUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      return `${baseUrl}${url}`;
    };

    const formattedData = allVerified.map((u) => ({
      Name: `${u.GivenNames || ''} ${u.Surname || ''}`.trim(),
      Address: u.Address || '',
      Mobile: u.Mobile || '',
      Membership: u.packageName || '',
      // Image links
      'Licence Front': u.licence_front ? toAbsoluteUrl(u.licence_front) : 'NA',

      'Licence Back': u.licence_back ? toAbsoluteUrl(u.licence_back) : 'NA',

      Selfie: u.profile_Image ? toAbsoluteUrl(u.profile_Image) : 'NA',
      PaymentStatus: u.paymentStatus === 'success' ? 'Approved' : 'Declined',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const autoSizeColumns = (worksheet, data) => {
      const keys = Object.keys(data[0]);

      worksheet['!cols'] = keys.map((key) => {
        // Fixed width for image columns
        if (['Licence Front', 'Licence Back', 'Selfie'].includes(key)) {
          return { wch: 18 }; // good for "View Image"
        }
        const maxLength = Math.max(
          key.length,
          ...data.map((row) => (row[key] ? row[key].toString().length : 2))
        );
        return { wch: Math.min(maxLength + 4, 40) };
      });
    };

    const headers = Object.keys(formattedData[0]);
    const imageColumns = ['Licence Front', 'Licence Back', 'Selfie'];

    imageColumns.forEach((colName) => {
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) return;

      for (let row = 1; row <= formattedData.length; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
        const cell = worksheet[cellAddress];

        if (cell && cell.v && cell.v !== 'NA') {
          cell.l = { Target: cell.v };
          cell.v = 'View Image';
        }
      }
    });
    autoSizeColumns(worksheet, formattedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Verified Members');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(blob, 'verified_members.xlsx');
  };

  const currentPage =
    activeTab === 'membersForApproval'
      ? membersPage
      : activeTab === 'waitingPayment'
      ? paymentsPage
      : activeTab === 'rejected'
      ? rejectedPage
      : verifiedPage;

  const currentTotalPages =
    activeTab === 'membersForApproval'
      ? membersTotalPages
      : activeTab === 'waitingPayment'
      ? paymentsTotalPages
      : activeTab === 'rejected'
      ? rejectedTotalPages
      : verifiedTotalPages;

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
      </aside>

      <div className="sa-filter-buttons">
        <button
          className={`user-btn ${
            activeTab === 'membersForApproval' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('membersForApproval')}
        >
          Members for Approval
        </button>
        <button
          className={`user-btn ${
            activeTab === 'waitingPayment' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('waitingPayment')}
        >
          Waiting for Payment
        </button>

        <button
          className={`user-btn ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>

        <button
          className={`user-btn ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          Verified
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
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                if (activeTab === 'membersForApproval') {
                  setMembersPage(1);
                  setMembersSearch(value);
                } else if (activeTab === 'waitingPayment') {
                  setPaymentsPage(1);
                  setPaymentsSearch(value);
                } else if (activeTab === 'rejected') {
                  setRejectedPage(1);
                  setRejectedSearch(value);
                } else if (activeTab === 'verified') {
                  setVerifiedPage(1);
                  setVerifiedSearch(value);
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

      {activeTab === 'verified' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            marginLeft: '16.5%',
            marginTop: '5%',
            flexWrap: 'nowrap',
          }}
        >
          {/* MTD / Date filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <select
              value={dateFilter}
              onChange={(e) => {
                setVerifiedPage(1);
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
              <option value="lastMonth">Last Month</option>
              <option value="all">All</option>
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
                  setVerifiedPage(1);
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
                  setVerifiedPage(1);
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

          {/* EXPORT BUTTON — VERIFIED ONLY */}
          <button
            onClick={handleVerifiedExport}
            style={{
              marginLeft: '80%',
              padding: '8px 18px',
              borderRadius: '20px',
              border: '1px solid #002977',
              backgroundColor: '#fff',
              color: '#002977',
              fontWeight: '600',
              cursor: 'pointer',
              height: '36px',
            }}
          >
            Export
          </button>
        </div>
      )}

      <div
        className="members-table-container"
        style={activeTab === 'verified' ? { marginTop: '1.5%' } : {}}
      >
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
                  {activeTab === 'membersForApproval' && <th>Date Of Birth</th>}
                  <th>Membership</th>
                  <th>Licence Front</th>
                  <th>Licence Back</th>
                  <th>Selfie</th>
                  {activeTab !== 'verified' && <th>Payment</th>}
                  {activeTab === 'rejected' && <th>Status</th>}
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
                      <td>
                        {member.DateOfBirth
                          ? member.DateOfBirth.substring(0, 10)
                              .split('-')
                              .reverse()
                              .join('-')
                          : '-'}
                      </td>
                      <td>{member.packageName || '-'}</td>
                      <td>{renderLicence(member.licence_front)}</td>
                      <td>{renderLicence(member.licence_back)}</td>
                      <td>{renderImage(member.profile_Image)}</td>
                      <td>{renderMemberPaymentStatus(member)}</td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <button
                            onClick={() => handleReject(member._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#002977',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: '12px',
                            }}
                          >
                            ✖ Rejected
                          </button>
                          <button
                            // onClick={() => handleEdit(member)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#002977',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: '12px',
                            }}
                          >
                            ✎ Edit
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          className="action-btn approve"
                          onClick={() =>
                            setConfirmVerify({ open: true, userId: member._id })
                          }
                        >
                          Verified
                        </button>
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
                      <td>{renderImage(member.profile_Image)}</td>
                      <td>{renderWaitingPaymentStatus(member)}</td>
                      <td>
                        <button
                          className="action-btn approve"
                          onClick={() => handleMakePayment(member)}
                        >
                          Make Payment
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'rejected' &&
                  rejected.map((member) => (
                    <tr key={member._id}>
                      <td>{getFullName(member)}</td>
                      <td>{member.Address || '-'}</td>
                      <td>{member.Mobile || '-'}</td>
                      <td>{member.packageName || '-'}</td>
                      <td>{renderLicence(member.licence_front)}</td>
                      <td>{renderLicence(member.licence_back)}</td>
                      <td>{renderImage(member.profile_Image)}</td>
                      <td>{renderMemberPaymentStatus(member)}</td>
                      <td style={{ color: 'red', fontWeight: 'bold' }}>
                        REJECTED
                      </td>
                      <td>
                        <button
                          className="action-btn approve send-back-btn"
                          onClick={() => handleSendBackToApproval(member._id)}
                          style={{
                            whiteSpace: 'normal',
                            maxWidth: '150px',
                            padding: '8px 12px',
                            textAlign: 'center',
                            display: 'inline-block',
                            wordBreak: 'break-word',
                          }}
                        >
                          <span className="send-back-text">
                            Send back to members for approval
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'verified' &&
                  verified.map((member) => (
                    <tr key={member._id}>
                      <td>{getFullName(member)}</td>
                      <td>{member.Address || '-'}</td>
                      <td>{member.Mobile || '-'}</td>
                      <td>{member.packageName || '-'}</td>
                      <td>{renderLicence(member.licence_front)}</td>
                      <td>{renderLicence(member.licence_back)}</td>
                      <td>{renderImage(member.profile_Image)}</td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <button
                            onClick={() => handleReject(member._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#002977',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: '12px',
                            }}
                          >
                            ✖ Rejected
                          </button>
                        </div>
                      </td>
                      <td>{renderMemberPaymentStatus(member)}</td>
                    </tr>
                  ))}

                {((activeTab === 'membersForApproval' &&
                  members.length === 0) ||
                  (activeTab === 'waitingPayment' && payments.length === 0) ||
                  (activeTab === 'rejected' && rejected.length === 0) ||
                  (activeTab === 'verified' && verified.length === 0)) && (
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
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: currentPage === 1 ? '#e0e0e0' : '#002977',
                  color: currentPage === 1 ? '#999' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                }}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: '500', color: '#002977' }}>
                Page {currentPage} of {currentTotalPages}
              </span>
              <button
                onClick={onNext}
                disabled={currentPage >= currentTotalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor:
                    currentPage >= currentTotalPages ? '#e0e0e0' : '#002977',
                  color: currentPage >= currentTotalPages ? '#999' : 'white',
                  cursor:
                    currentPage >= currentTotalPages
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
            style={
              selectedLicense != '/no_license.png'
                ? {
                    position: 'relative',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    overflow: 'auto',
                  }
                : {
                    position: 'relative',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '40vw',
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }
            }
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

      {selectedImage && (
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
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={
              selectedImage != '/no_image.png'
                ? {
                    position: 'relative',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    overflow: 'auto',
                  }
                : {
                    position: 'relative',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '40vw',
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
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
              src={selectedImage}
              alt="Full Image"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      )}
      {confirmVerify.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '8px',
              textAlign: 'center',
              width: '350px',
            }}
          >
            <h3 style={{ marginBottom: '15px', color: '#002977' }}>
              Confirm Verification
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '25px' }}>
              Are you sure you want to verify this member?
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setConfirmVerify({ open: false, userId: null })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#ccc',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#002977',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Yes, Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDesk;
