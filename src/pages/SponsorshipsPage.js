import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import {
  FaRegStar,
  FaCheck,
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaPaintBrush,
} from 'react-icons/fa';
import { HiCurrencyDollar } from 'react-icons/hi2';
import { IoIosSend } from 'react-icons/io';
import { IoPushOutline } from 'react-icons/io5';

import {
  getAppType,
  getAudienceOptions,
  getAudienceStyle,
  exportToExcel,
} from '../utils/appConstants';
import { FaChartPie } from 'react-icons/fa6';
import axios from 'axios';
import '../styles/sponsorships-page.css';

const SponsorshipsPage = () => {
  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');
  const [showDropdown, setShowDropdown] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);

  const [activeTab, setActiveTab] = useState('createSponsorship');

  const location = useLocation();
  const navigate = useNavigate();

  const email = localStorage.getItem('userEmail');
  const userInitial = email ? email.charAt(0).toUpperCase() : '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [memberId, setMemberId] = useState('');

  const [sponsorshipsData, setSponsorshipsData] = useState([]);

  const [sponsorshipsPage, setSponsorshipsPage] = useState(1);
  const [sponsorshipsTotalPages, setSponsorshipsTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const [dateFilter, setDateFilter] = useState('mtd');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currentPage = sponsorshipsPage;
  const currentTotalPages = sponsorshipsTotalPages;

  // Pagination controls per tab
  const onPrev = () => {
    if (sponsorshipsPage > 1) setSponsorshipsPage((p) => p - 1);
  };
  const onNext = () => {
    if (sponsorshipsPage < sponsorshipsTotalPages)
      setSponsorshipsPage((p) => p + 1);
  };

  const tableData = sponsorshipsData;

  const [formData, setFormData] = useState({
    Id: '',
    CompanyName: '',
    SponsorshipCode: '',
    GivenNames: '',
    Surname: '',
    Email: '',
    Mobile: '',
    Address: '',
    Suburb: '',
    PostCode: '',
  });

  const isActive = (path) => {
    return location.pathname === path;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Email: allow letters, numbers, @ . _ -
    if (name === 'Email' || name === 'paymentEmail') {
      sanitizedValue = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    }

    // Address: allow letters (all languages), numbers, space, comma and '/'
    else if (name === 'Address') {
      sanitizedValue = value.replace(/[^\p{L}\p{M}0-9\s,\/]/gu, '');
    }

    // Names, Suburb, Region: letters (all languages) + space only
    else if (
      name === 'ComapnyName' ||
      name === 'GivenNames' ||
      name === 'Surname' ||
      name === 'Suburb' ||
      name === 'region' ||
      name === 'nameOnCard'
    ) {
      sanitizedValue = value.replace(/[^\p{L}\p{M}\s]/gu, '');
    }

    // PostCode: numbers only
    else if (name === 'PostCode') {
      sanitizedValue = value.replace(/[^0-9]/g, '');
    }

    // Mobile: numbers only
    else if (name === 'Mobile') {
      sanitizedValue = value.replace(/[^0-9]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const handleCreateSponsorship = async () => {
    try {
      const {
        CompanyName,
        GivenNames,
        Surname,
        Email,
        Mobile,
        Address,
        Suburb,
        PostCode,
      } = formData;

      const payload = {
        company: CompanyName,
        firstName: GivenNames,
        lastName: Surname,
        phone: Mobile,
        email: Email,
        address: `${Address}, ${Suburb}`,
        pin: PostCode,
      };

      const response = await axios.post(`${baseUrl}/sponsorship`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success(
        response.data?.message || 'Sponsorship created successfully'
      );

      // Clear form after successful creation
      setFormData({
        Id: '',
        CompanyName: '',
        GivenNames: '',
        Surname: '',
        Email: '',
        Mobile: '',
        Address: '',
        Suburb: '',
        PostCode: '',
      });
    } catch (error) {
      console.error('Error creating sponsorship:', error);

      toast.error(
        error.response?.data?.message || 'Failed to create sponsorship'
      );
    }
  };

  const fetchSponsorships = async () => {
    try {
      setLoading(true);

      const params = {
        page: sponsorshipsPage,
        limit,
        filter: dateFilter,
      };

      // Only send dates for custom filter
      if (dateFilter === 'custom') {
        if (startDate) {
          params.fromDate = startDate;
        }

        if (endDate) {
          params.toDate = endDate;
        }
      }

      const response = await axios.get(`${baseUrl}/sponsorship`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data;

      setSponsorshipsData(responseData?.data || []);

      setSponsorshipsTotalPages(responseData?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching sponsorships:', error);

      toast.error(
        error.response?.data?.message || 'Failed to fetch sponsorships'
      );

      setSponsorshipsData([]);
      setSponsorshipsTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'currentSponsorships' || !token) {
      return;
    }

    // Don't call API until both dates are selected for custom filter
    if (dateFilter === 'custom' && (!startDate || !endDate)) {
      return;
    }

    fetchSponsorships();
  }, [
    activeTab,
    sponsorshipsPage,
    limit,
    dateFilter,
    startDate,
    endDate,
    token,
  ]);

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

  return (
    <div className="digital-app-container" style={{ height: '1100px' }}>
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
      <header className="app-header">
        <div
          className="s2w-logo"
          onClick={() => handleNavigation('/dashboard')}
        >
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>
        <div className="header-buttons">
          {userType === 'admin' ? (
            <>
              <button
                className="digital-app-btn"
                onClick={() => handleNavigation('/digital-app')}
              >
                Digital App
              </button>
              <button
                className="market-to-members-btn"
                onClick={() => handleNavigation('/market-to-members')}
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
                  onClick={() => handleNavigation('/digital-app')}
                >
                  Digital App
                </button>
              )}
              {access.includes('m2m') && (
                <button
                  className="market-to-members-btn"
                  onClick={() => handleNavigation('/market-to-members')}
                >
                  Market to Members
                </button>
              )}
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

                      navigate('/dashboard');
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

      <aside className="sidebar">
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

        <button
          className={`sidebar-btn ${
            isActive('/sponsorships-page') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/sponsorships-page')}
        >
          <HiCurrencyDollar
            className={`sidebar-icon ${
              isActive('/sponsorships-page') ? '' : 'navy-icon'
            }`}
          />
          Sponsorships
        </button>
      </aside>

      <div className="sponsorship-controls">
        <div className="sa-filter-buttons-sponsor">
          <button
            className={`user-btn ${
              activeTab === 'createSponsorship' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('createSponsorship')}
          >
            Create Sponsorship
          </button>

          <button
            className={`user-btn ${
              activeTab === 'currentSponsorships' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('currentSponsorships')}
          >
            Current Sponsorships
          </button>
        </div>

        {activeTab === 'currentSponsorships' && (
          <div className="sponsorship-date-row">

            <div className="date-filter">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setSponsorshipsPage(1);
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
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="mtd">MTD</option>
                <option value="last3months">Last 3 Months</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div
                className="custom-date-filters"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: '10px',
                  marginTop: '5px',
                }}
              >
                {/* START DATE */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
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
                      setSponsorshipsPage(1);
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

                {/* END DATE */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
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
                      setSponsorshipsPage(1);
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
              </div>
            )}
          </div>
        )}
      </div>

      <div className="content-wrapper-sa" style={{ top: '190px' }}>
        {activeTab === 'createSponsorship' ? (
          <section className="new-user-sa" style={{ height: '550px' }}>
            <h2>New Sponsorship Details</h2>

            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>Company Name</label>
              <input
                type="text"
                name="CompanyName"
                value={formData.CompanyName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>First name</label>
              <input
                type="text"
                name="GivenNames"
                value={formData.GivenNames}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>Last name</label>
              <input
                type="text"
                name="Surname"
                value={formData.Surname}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>Phone</label>
              <input
                type="number"
                name="Mobile"
                value={formData.Mobile}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>Email</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold', marginBottom: '50px' }}>
                Address
              </label>
              <div className="address-grid">
                <div className="address-row">
                  <input
                    type="text"
                    placeholder="Street Address"
                    name="Address"
                    value={formData.Address || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="city-zip">
                  <input
                    type="text"
                    placeholder="City"
                    name="Suburb"
                    value={formData.Suburb || ''}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    placeholder="Postcode"
                    name="PostCode"
                    value={formData.PostCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex w-100 justify-content-center">
              <button
                className="blue-btn"
                style={{ marginTop: '40px', width: '180px' }}
                onClick={handleCreateSponsorship}
              >
                Create Sponsorship
              </button>
            </div>
          </section>
        ) : (
          <div className="members-table-container-sp">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                <table className="members-table-si">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Sponsorship Code</th>
                      <th>Contact Name</th>
                      <th>Join Date</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th># Members</th>
                      <th>Food Sales</th>
                      <th>Beverage Sales</th>
                      <th>Gaming T/O</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((data, index) => (
                        <tr key={data._id || index}>
                          <td>{data.company || '-'}</td>
                          <td>{data.sponsorshipCode || '-'}</td>
                          <td>
                            {data.firstName || data.lastName
                              ? `${data.firstName || ''} ${data.lastName || ''}`.trim()
                              : '-'}
                          </td>

                          <td>
                            {data.createdAt
                              ? new Date(data.createdAt).toLocaleDateString()
                              : '-'}
                          </td>

                          <td>{data.phone || '-'}</td>

                          <td>{data.email || '-'}</td>

                          <td>
                            {`${data.address || ''}, ${data.pin || ''}` || '-'}
                          </td>

                          <td>{data.memberCount || '-'}</td>

                          <td>-</td>

                          <td>-</td>

                          <td>-</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="no-data">
                          No sponsorships found
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
                        currentPage >= currentTotalPages
                          ? '#e0e0e0'
                          : '#002977',
                      color:
                        currentPage >= currentTotalPages ? '#999' : 'white',
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
        )}
      </div>
    </div>
  );
};

export default SponsorshipsPage;
