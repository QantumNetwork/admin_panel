import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { FaUsersRectangle } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { PiListBulletsFill } from 'react-icons/pi';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/manual-reg.css';

const ManualReg = () => {
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
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');

  // API functions
  const [activeTab, setActiveTab] = useState('membersForApproval');
  const [venues, setVenues] = useState([]);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    street: '',
    city: '',
    zip: '',
    birthday: '',
    gender: '',
    membershipLevel: '',
    paymentEmail: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    country: 'United States',
    paymentZip: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleManualPaymentClick = () => {
    setShowManualPayment(true);
  };

  const handleCancelManualPayment = () => {
    setShowManualPayment(false);
  };

  const handleConfirmManualPayment = () => {
    console.log('Payment method selected:', selectedPaymentMethod);
    // setShowManualPayment(false);
  };

    const handleLock = async () => {
      try {
        const result = await handleLogout();
        if(result.success) {
          navigate('/dashboard');
        } else {
          toast.error(result.message || 'Failed to remove lock. Please try again.');
        }
  
      } catch (error) {
        console.error('Error in handleLock:', error);
        toast.error(error.message || 'Failed to remove lock. Please try again.');
      }
    }
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
      </aside>

      <div className="content-wrapper-sa" style={{ top: '120px' }}>
        <section className="new-user-sa" style={{ height: '600px' }}>
          <h2>Register New Member</h2>
          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>First name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Last name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
                  name="street"
                  value={formData.street || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="city-zip">
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  placeholder="Postcode"
                  name="zip"
                  value={formData.zip || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              style={{ padding: '8px' }}
            />
          </div>

          <div className="form-group">
            <div
              style={{
                display: 'flex',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}
            >
              <label style={{ fontWeight: 'bold', minWidth: '62px' }}>
                Gender
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                  style={{accentColor: '#002977'}}
                />
                Male
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                  style={{accentColor: '#002977'}}
                />
                Female
              </label>

              <label
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="non-binary"
                  checked={formData.gender === 'non-binary'}
                  onChange={handleInputChange}
                  style={{accentColor: '#002977'}}
                />
                Non-binary
              </label>
            </div>
          </div>
          <div
            className="d-flex w-100 justify-content-center"
            style={{ marginTop: '120px' }}
          >
            <button className="blue-btn">EDIT</button>
          </div>
        </section>

        <section className="new-user-sa" style={{ height: '600px' }}>
          <h2>Set Membership Level</h2>
          <div className="form-group">
            <input
              type="text"
              name="membershipLevel"
              value={formData.membershipLevel || ''}
              onChange={handleInputChange}
            />
          </div>

          <div
            className="d-flex w-100 justify-content-center"
            style={{ marginTop: '425px' }}
          >
            <button className="blue-btn">EDIT</button>
          </div>
        </section>
        <section className="connected-sa" style={{ height: '600px' }}>
          {!showManualPayment ? (
            <>
              <h2>Payment Details</h2>
              <div className="payment-white-box">
                <div className="form-group">
                  <label
                    style={{
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: '#5a5a5a',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="paymentEmail"
                    value={formData.paymentEmail}
                    onChange={handleInputChange}
                    placeholder="ella.williams@example.com"
                    style={{
                      width: '100%',
                      // padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '5px',
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label
                    style={{
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: '#5a5a5a',
                    }}
                  >
                    Card information
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="4242 4242 4242 4242"
                    style={{
                      width: '100%',
                      // padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px 6px 0 0',
                      borderBottom: 'none',
                      fontSize: '14px',
                      marginTop: '5px',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '0' }}>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="12/24"
                      style={{
                        width: '50%',
                        // padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0 0 0 6px',
                        borderRight: 'none',
                        fontSize: '14px',
                      }}
                    />

                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      style={{
                        width: '50%',
                        // padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0 0 6px 0',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label
                    style={{
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: '#5a5a5a',
                    }}
                  >
                    Name on card
                  </label>
                  <input
                    type="text"
                    name="nameOnCard"
                    value={formData.nameOnCard}
                    onChange={handleInputChange}
                    placeholder="Ella Williams"
                    style={{
                      width: '100%',
                      // padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '5px',
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label
                    style={{
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: '#5a5a5a',
                    }}
                  >
                    Country or region
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '5px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '5px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                  <input
                    type="text"
                    name="paymentZip"
                    value={formData.paymentZip}
                    onChange={handleInputChange}
                    placeholder="97702"
                    style={{
                      width: '100%',
                      // padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '10px',
                    }}
                  />
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a2b4a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginTop: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Pay US$65.00
                </button>
              </div>

              <div
                className="d-flex w-100 justify-content-center"
                style={{ marginTop: '2px' }}
              >
                <button className="payment-btn" onClick={handleManualPaymentClick}>
                  Manually approve payment
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Manual Payment Details</h2>
              <div style={{ marginTop: '30px' }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#5a5a5a',
                    marginBottom: '15px',
                  }}
                >
                  Choose payment method
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash"
                      checked={selectedPaymentMethod === 'Cash'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#002977'
                      }}
                    />
                    Cash
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card by venue"
                      checked={selectedPaymentMethod === 'Card by venue'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#002977'
                      }}
                    />
                    Card by venue
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cheque"
                      checked={selectedPaymentMethod === 'Cheque'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#002977'
                      }}
                    />
                    Cheque
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Management approved"
                      checked={selectedPaymentMethod === 'Management approved'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#002977'
                      }}
                    />
                    Management approved
                  </label>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  marginTop: '320px',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={handleCancelManualPayment}
                  style={{
                    padding: '12px 40px',
                    backgroundColor: '#d3d3d3',
                    color: '#666',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minWidth: '120px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmManualPayment}
                  style={{
                    padding: '12px 40px',
                    backgroundColor: '#4a90e2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minWidth: '120px',
                  }}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManualReg;
