import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { PiListBulletsFill } from 'react-icons/pi';
import { FaUpload } from 'react-icons/fa';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/membership-page.css';

const MembershipPage = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const appGroup = localStorage.getItem('appGroup');
  const [venues, setVenues] = useState([]);
  const [activeTab, setActiveTab] = useState('setMemberLevels');
  const [renewalDate, setRenewalDate] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [membershipData, setMembershipData] = useState(null);


const [membershipRows, setMembershipRows] = useState(() => {
  // If we have data and it's for the selected venue, use it
  if (membershipData && membershipData.appType === selectedVenue) {
    return membershipData.membershipLevels.map((level, index) => ({
      id: index + 1,
      name: level.membershipName,
      price: `$${level.price}`,
      proRata: level.proRata
    }));
  }
  // Default rows if no data
  return [
    { id: 1, name: 'Social Member 1 Year', price: '$5', proRata: false },
    { id: 2, name: 'Social Member 3 Years', price: '$10', proRata: false }
  ];
});

  const token = localStorage.getItem('token');
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
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.data) {
          setVenues(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
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

  useEffect(() => {
  const fetchMembershipData = async () => {
    if (!selectedVenue) return;
    
    try {
      const response = await axios.get(`${baseUrl}/club-packages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.data?.length > 0) {
        console.log(response.data.data);
        setMembershipData(response.data.data[0]); // Take the first package if multiple exist

        const rows=response.data.data[0].membershipLevels.map((level,index)=> ({
          id: index+1,
          name: level.membershipName,
          price: `$${level.price}`,
          proRata: level.proRata
        }));

        setMembershipRows(rows);
      }
    } catch (error) {
      console.error('Error fetching membership data:', error);
      toast.error('Failed to load membership data');
    }
  };

  fetchMembershipData();
}, [selectedVenue, token]);

useEffect(() => {
  if (membershipData && membershipData.appType === selectedVenue) {
    setRenewalDate(membershipData.renewalDate.split('T')[0]); // Format date for input
    {membershipData.proRataMonths!==0 ? setDaysRemaining(calculateDaysRemaining(membershipData.renewalDate)) : setDaysRemaining(0)};
    
  } else {
    setRenewalDate('');
    setDaysRemaining(null);
  }
}, [membershipData, selectedVenue]);

  const userType = 'admin';

  const isActive = (path) => {
    return location.pathname === path;
  };

  const calculateDaysRemaining = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(dateString);
  const diffTime = renewal - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays - 1 : 0; // Exclude renewal date
};

const handleDateChange = (e) => {
  const selectedDate = e.target.value;
  setRenewalDate(selectedDate);
  setDaysRemaining(calculateDaysRemaining(selectedDate));
};

const addMembershipRow = () => {
  const newId = membershipRows.length > 0 ? Math.max(...membershipRows.map(r => r.id)) + 1 : 1;
  setMembershipRows([...membershipRows, { id: newId, name: '', price: '', proRata: false }]);
};

const removeMembershipRow = (id) => {
  if (membershipRows.length > 1) { // Keep at least one row
    setMembershipRows(membershipRows.filter(row => row.id !== id));
  }
};

const updateMembershipRow = (id, field, value) => {
  setMembershipRows(membershipRows.map(row => 
    row.id === id ? { ...row, [field]: value } : row
  ));
};

const handleActivate = async () => {
  try {
    // Prepare the request body
    const requestBody = {
      membershipLevels: membershipRows.map(row => ({
        membershipName: row.name,
        price: parseFloat(row.price.replace(/[^0-9.-]+/g, '')), // Remove any non-numeric characters except decimal point
        proRata: row.proRata
      })),
      renewalDate: renewalDate,
      gracePeriod: 0, // Default grace period as per your requirements
      proRataMonths: isAnyProRataChecked ? daysRemaining : 0
    };

    // Make the API call
    const response = await axios.post(
      `${baseUrl}/club-packages`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if(response.data.message) {
      console.log(response.data);
      toast.success(response.data.message);

      navigate('/membership');
    }
    
  } catch (error) {
    console.error('Error creating club package:', error);
    const errorMessage = error.response?.data?.message || 'Failed to create club package';
    toast.error(errorMessage);
  }
};

const isAnyProRataChecked = membershipRows.some(row => row.proRata === true);


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
                    style={{ zIndex: 9999, 
                      marginTop: '60px',
                      fontSize: '14px',
                      minWidth: '300px',
                      textAlign: 'center' }}
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
          className={`sidebar-btn ${isActive('/membership') ? 'active' : ''}`}
          onClick={() => navigate('/membership')}
        >
          <PiListBulletsFill
            className={`sidebar-icon ${
              isActive('/membership') ? '' : 'navy-icon'
            }`}
          />{' '}
          &nbsp; Club Package
        </button>
      </aside>

      <div className="navigation-buttons-member">
        <div className="nav-tabs-member">
          <button
            className={`user-btn ${
              activeTab === 'setMemberLevels' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('setMemberLevels')}
          >
            Set Member Levels
          </button>
          <button
            className={`user-btn ${
              activeTab === 'manualMembership' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('manualMembership')}
          >
            Manual Membership
          </button>
        </div>
        <button
          className="publish-button"
          onClick={handleActivate}
        >
          <FaUpload /> Activate
        </button>

        {activeTab === 'setMemberLevels' ? (
          <div
            className="content-wrapper-sa"
            style={{ top: '80px', marginLeft: '20px' }}
          >
            <section
              className="new-user-sa"
              style={{ width: '50%', height: '500px' }}
            >
              <h2>Enter Membership Levels & Pricing</h2>

              <table
                style={{
                  width: '100%',
                  marginTop: '20px',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  fontSize: '12px',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                        width: '33.33%',
                      }}
                    >
                      Enter Membership Name
                    </th>
                    <th
                      style={{
                        textAlign: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                        width: '33.33%',
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                        width: '33.33%',
                      }}
                    >
                      Pro Rata
                    </th>
                  </tr>
                </thead>
                <tbody>
  {membershipRows.map((row) => (
    <tr key={row.id}>
      <td style={{ padding: '10px' }}>
        <input
          type="text"
          value={row.name}
          onChange={(e) => updateMembershipRow(row.id, 'name', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </td>
      <td style={{ padding: '10px', textAlign: 'center' }}>
        <input
          type="text"
          value={row.price}
          onChange={(e) => updateMembershipRow(row.id, 'price', e.target.value)}
          style={{
            width: '50%',
            padding: '8px',
            textAlign: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </td>
      <td style={{ padding: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginLeft: '15px',
          }}
        >
          <input
            type="checkbox"
            checked={row.proRata}
            onChange={(e) => updateMembershipRow(row.id, 'proRata', e.target.checked)}
            style={{ accentColor: '#002977' }}
          />
          <div>
            <button
              onClick={addMembershipRow}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '20px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              +
            </button>
            {membershipRows.length > 1 && (
              <button
                onClick={() => removeMembershipRow(row.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4444',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </section>

            <section
              className="new-user-sa"
              style={{ height: '500px', width: '40%', fontSize: '12px' }}
            >
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  Set Renewal Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={renewalDate}
                  onChange={handleDateChange}
                  style={{
                    width: '60%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  Grace Period
                </label>
                <input
                  type="text"
                  style={{
                    width: '60%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '10px',
                  }}
                />
              </div>
              {isAnyProRataChecked && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  Pro Rata
                </label>
                <div
                  style={{
                    width: '57.5%',
                    backgroundColor: 'white',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    margin: '0 auto',
                  }}
                >
                    {daysRemaining !== null && daysRemaining}

                </div>
              </div>
              )}              
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MembershipPage;
