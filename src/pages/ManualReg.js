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
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/manual-reg.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

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
  const [userTimeZone, setUserTimeZone] = useState('');

  // s1 = Register New Member, s2 = Set Membership Level, s3 = Payment Details
  const [s1Visible, setS1Visible] = useState(true); // only s1 shown at start
  const [s2Visible, setS2Visible] = useState(false);
  const [s3Visible, setS3Visible] = useState(false);

  // editing controls: when true -> show Cancel + Next; when false -> show Edit
  // requirement: at beginning register new member should show Cancel + Next
  const [editing1, setEditing1] = useState(true);
  const [editing2, setEditing2] = useState(false);

  const [formData, setFormData] = useState({
    GivenNames: '',
    Surname: '',
    Email: '',
    Mobile: '',
    // mobileFull: '',
    Address: '',
    Suburb: '',
    PostCode: '',
    DateOfBirth: '',
    Gender: '',
    membershipLevel: '',
    paymentEmail: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    country: 'Australia',
    region: null,
  });

  const [clientSecret, setClientSecret] = useState(null);
  const [showStripe, setShowStripe] = useState(false);
  const [verifyPayload, setVerifyPayload] = useState(null);
  const [showConfirmMembership, setShowConfirmMembership] = useState(false);

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

  const [membershipPackages, setMembershipPackages] = useState([]);

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

  const handleManualPaymentClick = () => {
    setShowManualPayment(true);
  };

  const handleCancelManualPayment = () => {
    setShowManualPayment(false);
  };

  const handleConfirmManualPayment = async () => {
    try {
      const selectedPkg = membershipPackages.find(
        (pkg) => pkg._id === formData.membershipLevel
      );

      const payload = {
        GivenNames: formData.GivenNames,
        Surname: formData.Surname,
        Mobile: formData.Mobile,
        DateOfBirth: formData.DateOfBirth,
        PostCode: formData.PostCode,
        Email: formData.Email,
        Gender: formData.Gender,
        Address: formData.Address,
        Suburb: formData.Suburb,
        State: formData.region || null,
        amountPaid: selectedPkg?.calculatedPrice || 0,
        currency: 'aud',
        packageId: selectedPkg?._id,
        packageName: selectedPkg?.membershipName,
      };

      const res = await axios.post(
        `${baseUrl}/user/user-reception-register?appType=Ace`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.thirdPartyData?.Id) {
        toast.success('Payment successful');
        setShowManualPayment(false);
        // optionally close payment section:
        // setS3Visible(false);
      } else {
        toast.error('Payment failed or cancelled');
      }
    } catch (error) {
      console.error(error);
      toast.error('Payment failed or cancelled');
    }
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

  const handleNextS1 = async () => {
    // Step forward from Register -> Membership Level

    if (
      !formData.GivenNames ||
      !formData.Surname ||
      !formData.Address ||
      !formData.Suburb ||
      !formData.PostCode ||
      !formData.DateOfBirth ||
      !formData.Gender
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.Mobile || !formData.Email || formData.Mobile.length < 13) {
      toast.error('Please enter valid mobile number and email');
      return;
    }

    try {
      const body = {
        Mobile: formData.Mobile,
        Email: formData.Email,
      };

      const res = await axios.post(
        `${baseUrl}/user/check-user?appType=Ace`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mobileReg = res.data?.mobile?.registered;
      const emailReg = res.data?.email?.registered;

      // CASE: both registered
      if (mobileReg && emailReg) {
        toast.error('Mobile number and Email are already registered');
        return;
      }

      // CASE: mobile registered
      if (mobileReg) {
        toast.error('Mobile number is already registered');
        return;
      }

      // CASE: email registered
      if (emailReg) {
        toast.error('Email is already registered');
        return;
      }

      // BOTH FALSE → proceed to section 2
      setS2Visible(true);
      setEditing1(false);
      setEditing2(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to validate user');
    }
  };

  const handleCancelS1 = () => {
    // Spec: clicking Cancel on section 1 should do nothing
    // no-op intentionally
  };

  const handleEditS1 = () => {
    // If edit clicked on s1: hide other sections & show cancel+next on s1
    setS2Visible(false);
    setS3Visible(false);
    setEditing1(true);
    setEditing2(false);
  };

  const handleNextS2 = () => {
    // From membership -> payment
    if (!formData.membershipLevel) {
      toast.error('Please select a membership level.');
      return;
    }

    // show edit button immediately
    setEditing2(false);

    // Show confirmation box
    setShowConfirmMembership(true);
  };

  const handleCancelS2 = () => {
    // Hide membership level and payment, show only register section.
    setS2Visible(false);
    setS3Visible(false);
    // Requirement: when membership level cancelled, only register should appear.
    // When returning to register, it should show EDIT as described earlier (if user had progressed and returned)
    setEditing1(false);
    setEditing2(false);
  };

  const handleEditS2 = () => {
    // If edit clicked on s2: hide payment & show cancel+next on s2
    setS3Visible(false);
    setEditing2(true);
  };

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimeZone(tz);
    localStorage.setItem('userTimeZone', tz); // optional
  }, []);

  useEffect(() => {
    const fetchMembershipPackages = async () => {
      if (!selectedVenue || !userTimeZone) return;

      try {
        const response = await axios.get(
          `${baseUrl}/club-package/club?appType=${selectedVenue}&timezone=${encodeURIComponent(
            userTimeZone
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data?.data) {
          setMembershipPackages(response.data.data);
          // Set default membership level if not set
          // if (response.data.data.length > 0 && !formData.membershipLevel) {
          //   setFormData(prev => ({
          //     ...prev,
          //     membershipLevel: response.data.data[0]._id
          //   }));
          // }
        }
      } catch (error) {
        console.error('Error fetching membership packages:', error);
        toast.error('Failed to load membership packages');
      }
    };

    fetchMembershipPackages();
  }, [token, selectedVenue, userTimeZone]);

  const handlePay = async () => {
    try {
      const selectedPkg = membershipPackages.find(
        (pkg) => pkg._id === formData.membershipLevel
      );

      const payload = {
        GivenNames: formData.GivenNames,
        Surname: formData.Surname,
        DateOfBirth: formData.DateOfBirth,
        PostCode: formData.PostCode,
        Mobile: formData.Mobile,
        Email: formData.Email,
        Gender: formData.Gender,
        Address: formData.Address,
        Suburb: formData.Suburb,
        State: formData.region,
        amountPaid: selectedPkg?.calculatedPrice * 100 || 0,
        currency: 'aud',
        packageId: selectedPkg?._id,
        packageName: selectedPkg?.membershipName,
        paymentType: 'card',
      };

      // 1) Create user + paymentIntent via your backend
      const res = await axios.post(
        `${baseUrl}/user/user-register?appType=${selectedVenue}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const secret = res.data?.payment?.clientSecret;

      if (!secret) {
        toast.error('Could not initialize payment');
        return;
      }

      // store clientSecret and open Stripe card input
      setClientSecret(secret);
      setShowStripe(true);
      setVerifyPayload({
        paymentIntentId: res.data?.payment?.paymentIntentId,
        userId: res.data?.userId,
        appType: selectedVenue,
        selectedPkg: selectedPkg,
      });
    } catch (err) {
      console.error(err);
      toast.error(
        `Registration failed - ${
          err.response?.data?.Message || err.response?.data
        }`
      );
    }
  };

  function CardPaymentUI({ clientSecret, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
      if (!stripe || !elements) {
        toast.error('Stripe is not loaded yet');
        return;
      }

      setLoading(true);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.nameOnCard || undefined,
            email: formData.paymentEmail || undefined,
          },
        },
      });

      try {
        const verifyBody = {
          paymentIntentId: verifyPayload.paymentIntentId,
          userId: verifyPayload.userId,
          appType: verifyPayload.appType,
          packageId: verifyPayload.selectedPkg?._id,
          packageName: verifyPayload.selectedPkg?.membershipName,
          paymentType: 'card',
        };

        await axios.post(`${baseUrl}/payment/verify-payment`, verifyBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLoading(false);

        if (result.error) {
          toast.error(result.error.message);
        } else if (
          result.paymentIntent &&
          result.paymentIntent.status === 'succeeded'
        ) {
          toast.success('Payment successful');
          onSuccess();
        } else {
          toast.error('Payment failed or cancelled');
        }
      } catch (err) {
        setLoading(false);
        console.error(err);
        toast.error('Payment failed');
      }
    };

    return (
      <div style={{ marginTop: '20px' }}>
        {/* <CardElement
          options={{ hidePostalCode: true }}
          style={{ base: { fontSize: '16px' } }}
        /> */}
        <button
          onClick={handleConfirm}
          disabled={!stripe || !elements || loading}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#4a90e2',
            color: 'white',
            fontWeight: '600',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Processing...' : 'Confirm Payment'}
        </button>
      </div>
    );
  }

  useEffect(() => {
    // Auto set paymentEmail from registration email
    setFormData((prev) => ({
      ...prev,
      paymentEmail: prev.Email,
    }));
  }, [formData.Email]);

  // Disable all inputs in a section when editing = false
  const disableIf = (condition) => ({
    disabled: !condition,
    style: !condition
      ? { backgroundColor: '#f2f2f2', cursor: 'not-allowed' }
      : {},
  });

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

      <div className="content-wrapper-sa" style={{ top: '120px' }}>
        <section className="new-user-sa" style={{ height: '600px' }}>
          <h2>Register New Member</h2>
          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>First name</label>
            <input
              type="text"
              name="GivenNames"
              value={formData.GivenNames}
              onChange={handleInputChange}
              {...disableIf(editing1)}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Last name</label>
            <input
              type="text"
              name="Surname"
              value={formData.Surname}
              onChange={handleInputChange}
              {...disableIf(editing1)}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Mobile</label>
            <PhoneInput
              defaultCountry="AU" // Australia → +61
              value={formData.Mobile}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, Mobile: value }))
              }
              placeholder="Enter mobile number"
              international
              countryCallingCodeEditable={false}
              {...disableIf(editing1)}
              style={{
                width: '100%',
                backgroundColor: 'white',
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleInputChange}
              {...disableIf(editing1)}
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
                  {...disableIf(editing1)}
                />
              </div>
              <div className="city-zip">
                <input
                  type="text"
                  placeholder="City"
                  name="Suburb"
                  value={formData.Suburb || ''}
                  onChange={handleInputChange}
                  {...disableIf(editing1)}
                />
                <input
                  type="text"
                  placeholder="Postcode"
                  name="PostCode"
                  value={formData.PostCode || ''}
                  onChange={handleInputChange}
                  {...disableIf(editing1)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Birthday</label>
            <input
              type="date"
              name="DateOfBirth"
              value={formData.DateOfBirth}
              onChange={handleInputChange}
              style={{ padding: '8px' }}
              {...disableIf(editing1)}
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginLeft: '28px',
                }}
              >
                <input
                  type="radio"
                  name="Gender"
                  value="M"
                  checked={formData.Gender === 'M'}
                  onChange={handleInputChange}
                  style={{ accentColor: '#002977' }}
                  {...disableIf(editing1)}
                />
                Male
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <input
                  type="radio"
                  name="Gender"
                  value="F"
                  checked={formData.Gender === 'F'}
                  onChange={handleInputChange}
                  style={{ accentColor: '#002977' }}
                  {...disableIf(editing1)}
                />
                Female
              </label>

              <label
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <input
                  type="radio"
                  name="Gender"
                  value="U"
                  checked={formData.Gender === 'U'}
                  onChange={handleInputChange}
                  style={{ accentColor: '#002977' }}
                  {...disableIf(editing1)}
                />
                Non-binary
              </label>
            </div>
          </div>
          <div
            className="d-flex w-100 justify-content-center"
            style={{ marginTop: '120px' }}
          >
            {editing1 ? (
              <>
                <button
                  className="cancel-btn cancel-s1"
                  onClick={handleCancelS1}
                >
                  Cancel
                </button>
                <button className="next-btn" onClick={handleNextS1}>
                  Next
                </button>
              </>
            ) : (
              <button className="blue-btn" onClick={handleEditS1}>
                EDIT
              </button>
            )}
          </div>
        </section>

        {s2Visible && (
          <section className="new-user-sa" style={{ height: '600px' }}>
            <h2>Set Membership Level</h2>
            <div className="form-group">
              <select
                name="membershipLevel"
                value={formData.membershipLevel || ''}
                onChange={handleInputChange}
                className="membershipLevel"
                {...disableIf(editing2)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  appearance: 'none',
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23007bff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 15px center',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {!formData.membershipLevel && (
                  <option value="" disabled style={{ display: 'none' }}>
                    Select from list
                  </option>
                )}

                {membershipPackages.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.membershipName}
                  </option>
                ))}
              </select>
            </div>

            {showConfirmMembership && (
              <div
                style={{
                  width: '86%',
                  background: 'white',
                  padding: '25px',
                  borderRadius: '10px',
                  marginTop: '160px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '15px',
                    marginBottom: '25px',
                    color: '#555',
                    lineHeight: '20px',
                  }}
                >
                  Have you sighted the person’s
                  <br />
                  identification and checked it is valid
                  <br />
                  and they’re over 18?
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      // user clicked cancel
                      setShowConfirmMembership(false);
                      setEditing2(true); // restore Cancel + Next buttons
                    }}
                    style={{
                      padding: '10px 35px',
                      backgroundColor: '#D3D3D3',
                      color: '#555',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      // user clicked yes → open payment
                      setShowConfirmMembership(false);
                      setS3Visible(true);
                    }}
                    style={{
                      padding: '10px 35px',
                      backgroundColor: '#4A90E2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}

            <div
              className="d-flex w-100 justify-content-center"
              style={{ marginTop: !showConfirmMembership ? '430px' : '70px' }}
            >
              {editing2 ? (
                <>
                  <button className="cancel-btn" onClick={handleCancelS2}>
                    Cancel
                  </button>
                  <button className="next-btn" onClick={handleNextS2}>
                    Next
                  </button>
                </>
              ) : (
                <button className="blue-btn" onClick={handleEditS2}>
                  EDIT
                </button>
              )}
            </div>
          </section>
        )}

        {s3Visible && (
          <Elements stripe={stripePromise}>
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
                        disabled
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
                      {/* Stripe CardElement replaces Card Number + Expiry + CVC */}
                      <div
                        style={{
                          border: '1px solid #e0e0e0',
                          padding: '12px',
                          borderRadius: '6px',
                          background: 'white',
                          marginTop: '8px',
                        }}
                      >
                        <CardElement options={{ hidePostalCode: true }} />
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
                        <option value="Australia">Australia</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        placeholder="Queensland"
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
                      onClick={handlePay}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#5296D1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '15px',
                        fontWeight: '600',
                        marginTop: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      Pay AUD$
                      {membershipPackages
                        .find((pkg) => pkg._id === formData.membershipLevel)
                        ?.calculatedPrice?.toFixed(2) || '0.00'}
                    </button>

                    {showStripe && clientSecret && (
                      <CardPaymentUI
                        clientSecret={clientSecret}
                        onSuccess={() => {
                          setShowStripe(false);
                          setClientSecret(null);
                        }}
                        verifyPayload={verifyPayload}
                      />
                    )}
                  </div>

                  <div
                    className="d-flex w-100 justify-content-center"
                    style={{ marginTop: '2px' }}
                  >
                    <button
                      className="payment-btn"
                      onClick={handleManualPaymentClick}
                    >
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
                          onChange={(e) =>
                            setSelectedPaymentMethod(e.target.value)
                          }
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#002977',
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
                          onChange={(e) =>
                            setSelectedPaymentMethod(e.target.value)
                          }
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#002977',
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
                          onChange={(e) =>
                            setSelectedPaymentMethod(e.target.value)
                          }
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#002977',
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
                          checked={
                            selectedPaymentMethod === 'Management approved'
                          }
                          onChange={(e) =>
                            setSelectedPaymentMethod(e.target.value)
                          }
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#002977',
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
          </Elements>
        )}
      </div>
    </div>
  );
};

export default ManualReg;
