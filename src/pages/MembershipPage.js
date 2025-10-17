import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { PiListBulletsFill } from 'react-icons/pi';
import { FaUpload } from 'react-icons/fa';
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

  return (
    <div className="dashboard-container">
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
          // onClick={addMode ? submitNewOffer : handleUpdateVoucher}
        >
          <FaUpload /> Activate
        </button>

              <div className="content-wrapper-sa" style={{top: '80px', marginLeft: "20px"}}>
        <section className="new-user-sa" style={{width: "50%", height: '500px'}}>
          <h2>Enter Membership Levels & Pricing</h2>

           <table style={{width: '100%', marginTop: '20px', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '12px'}}>
            <thead>
              <tr>
                <th style={{textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd', width: '33.33%'}}>Enter Membership Name</th>
                <th style={{textAlign: 'center', padding: '10px', borderBottom: '1px solid #ddd', width: '33.33%'}}>Price</th>
                <th style={{textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd', width: '33.33%'}}>Pro Rata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding: '10px'}}>
                  <input 
                    type="text" 
                    defaultValue="Social Member 1 Year"
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </td>
                <td style={{padding: '10px', textAlign: 'center'}}>
                  <input 
                    type="text" 
                    defaultValue="$5"
                    style={{width: '50%', padding: '8px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </td>
                <td style={{padding: '10px'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '15px'}}>
                    <input type="radio" name="prorata" style={{accentColor: '#002977'}} defaultChecked />
                    <button style={{background: 'none', border: 'none', color: '#007bff', fontSize: '20px', cursor: 'pointer'}}>+</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{padding: '10px'}}>
                  <input 
                    type="text" 
                    defaultValue="Social Member 3 Years"
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </td>
                <td style={{padding: '10px', textAlign: 'center'}}>
                  <input 
                    type="text" 
                    defaultValue="$10"
                    style={{width: '50%', padding: '8px',textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </td>
                <td style={{padding: '10px'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '15px'}}>
                    <input type="radio" name="prorata" style={{accentColor: '#002977'}} />
                    <button style={{background: 'none', border: 'none', color: '#007bff', fontSize: '20px', cursor: 'pointer'}}>+</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="new-user-sa" style={{height: '500px', width: '40%', fontSize: '12px'}}>
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Set Renewal Date</label>
            <input 
              type="date" 
              style={{width: '60%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', marginBottom: '10px'}}
            />
          </div>
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Grace Period</label>
            <input 
              type="text" 
              style={{width: '60%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px'}}
            />
          </div>
          <div style={{marginTop: '30px', textAlign: 'center'}}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Pro Rata (Months)</label>
            <input 
              type="text" 
              style={{width: '60%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px'}}
            />
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default MembershipPage;
