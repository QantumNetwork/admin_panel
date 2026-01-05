import React, { useState, useEffect } from 'react';
import { FaUser, FaRegCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { TiCreditCard } from 'react-icons/ti';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/dashboard.css';
import '../styles/standard-admin.css';
import Swal from 'sweetalert2';

// Custom CSS for form validation
const errorStyle = {
  color: '#dc3545',
  fontSize: '0.7rem',
  marginTop: '0.2rem',
  marginBottom: '0.6rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const StandardAdmin = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const appGroup = localStorage.getItem('appGroup');

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('new-user');
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    company: '',
    access: [],
  });

  const [errors, setErrors] = useState({});

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

  const getIconVenue = (appType) => {
    switch (appType) {
      case 'MaxGaming':
        return '/max_gaming.png';
      case 'Manly':
        return '/mhbc.png';
      case 'Montauk':
        return '/montauk.png';
      case 'StarReward':
        return '/star.png';
      case 'Central':
        return '/central.png';
      case 'Sense':
        return '/star.png';
      case 'Qantum':
        return '/qantum.png';
      case 'North':
        return '/north.png';
      case 'Hogan':
        return '/hogan.png';
      case 'Ace':
        return '/ace.png';
      case 'Queens':
        return '/queens.png';
      case 'Brisbane':
        return '/brisbane.png';
      case 'Bluewater':
        return '/bluewater.png';
      case 'Flinders':
        return '/flinders.png';
      default:
        return appType;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with selectedVenue:', selectedVenue);
      const response = await axios.get(`${baseUrl}/admin/getalluser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        console.log('All users from API:', response.data.data);
        // Always store all users in state
        setUsers(response.data.data);

        // Filter users based on selected venue if one is selected
        if (selectedVenue) {
          const filteredUsers = response.data.data.filter((user) => {
            console.log(
              `User ${user.email} has appType:`,
              user.appType,
              'matches selected:',
              user.appType === selectedVenue
            );
            return user.appType === selectedVenue;
          });
          console.log('Filtered users:', filteredUsers);
          setUsers(filteredUsers);
        } else {
          // If no venue is selected, show all users
          setUsers(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  // Fetch users when the edit tab is active
  useEffect(() => {
    if (activeTab === 'edit-users' && currentUserId === null) {
      fetchUsers();
    }

    if (activeTab === 'new-user') {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        company: '',
        access: [],
      });
      setCurrentUserId(null);
    }
  }, [activeTab]);

  // Refetch users when selected venue changes and we're on the edit tab
  // useEffect(() => {

  //   if (activeTab === 'edit-users' && currentUserId === null) {
  //     // Use a small timeout to ensure the token update is complete
  //     const timer = setTimeout(() => {
  //       fetchUsers();
  //     }, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [selectedVenue, activeTab]);

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

  // Dummy data for edit users
  // const dummyUsers = [
  //   {
  //     name: 'David Ohlson',
  //     username: 'david@star.com.au',
  //     connected: 'Star Rewards',
  //   },
  //   {
  //     name: 'Michael Murray',
  //     username: 'murray@star.com.au',
  //     connected: 'Star Rewards',
  //   },
  //   { name: 'Sarah Lee', username: 'sarah@hotel.com', connected: 'Star Hotel' },
  //   {
  //     name: 'John Doe',
  //     username: 'john@tavern.com',
  //     connected: 'Runcorn Tavern',
  //   },
  // ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle access checkboxes
  const handleAccessChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const access = [...prev.access];
      if (checked) {
        access.push(name);
      } else {
        const index = access.indexOf(name);
        if (index > -1) {
          access.splice(index, 1);
        }
      }
      return { ...prev, access };
    });

    // Clear access error when user selects an option
    if (errors.access) {
      setErrors((prev) => ({
        ...prev,
        access: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Clear previous errors
    setErrors({});

    // Validate required fields
    const requiredFields = [
      { field: 'firstname', message: 'First name is required' },
      { field: 'lastname', message: 'Last name is required' },
      { field: 'email', message: 'Email is required' },
      { field: 'mobile', message: 'Mobile number is required' },
      { field: 'company', message: 'Company name is required' },
    ];

    requiredFields.forEach(({ field, message }) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = message;
        hasErrors = true;
      }
    });

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate mobile number format (basic validation)
    if (formData.mobile && !/^[0-9+\-\s()]{8,20}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
      hasErrors = true;
    }

    // Validate access checkboxes
    if (formData.access.length === 0) {
      newErrors.access = 'Please select at least one access type';
      hasErrors = true;
      toast.error('Please select at least one access type');
    }

    // Validate venue selection
    if (!selectedVenue) {
      newErrors.venue = 'Please select a venue';
      hasErrors = true;
      toast.error('Please select a venue');
    }

    // If there are field-specific errors, show a general error toast
    // if (Object.keys(newErrors).length > 0) {
    //   toast.error('Please fill in all required fields correctly');
    // }

    setErrors(newErrors);
    return !hasErrors;
  };
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.delete(
          `${baseUrl}/admin/delete?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          response.data &&
          response.data.message === 'Admin deleted successfully'
        ) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'The user has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });

          // Refresh users
          fetchUsers();
        } else {
          throw new Error('Unexpected response');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the user.',
          icon: 'error',
        });
      }
    }
  };

  // Handle activate button click
  // Function to handle editing a user
  const handleEditUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${baseUrl}/admin/getuser?id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const userData = response.data.data;

        // Set current user ID for update operation
        setCurrentUserId(userId);

        // Update form data with user details
        setFormData({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
          company: userData.company || '',
          access: userData.access || [],
        });

        // Set the selected venue based on user's appType
        if (userData.appType) {
          setSelectedVenue(userData.appType);
        }

        // Switch to the new-user tab to show the form
        // setActiveTab('new-user');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    }
  };

  const handleActivate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        ...formData,
        appType: selectedVenue,
        type: 'user',
      };

      // Show loading state
      const toastId = toast.loading(
        currentUserId ? 'Updating user...' : 'Registering user...'
      );

      let response;

      // Log the request details for debugging
      console.log('Sending user data:', {
        url: currentUserId
          ? `${baseUrl}/admin/update-user?id=${currentUserId}`
          : `${baseUrl}/admin/register`,
        method: currentUserId ? 'PUT' : 'POST',
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          ...(currentUserId && {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }),
        },
      });

      if (currentUserId) {
        // Update existing user
        response = await axios.put(
          `${baseUrl}/admin/update-user?id=${currentUserId}`,
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        // Create new user
        response = await axios.post(`${baseUrl}/admin/register`, userData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Added authorization header for registration
          },
        });
      }

      if (response.data) {
        toast.success(
          currentUserId
            ? 'User updated successfully!'
            : 'User registered successfully!',
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // Reset form and state
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          mobile: '',
          company: '',
          access: [],
        });
        // setSelectedVenue('');
        setCurrentUserId(null);
        setErrors({});

        // Dismiss loading toast
        toast.dismiss(toastId);

        // Refresh users list if we're in edit mode
        if (currentUserId) {
          setActiveTab('edit-users');
        }
      }
    } catch (error) {
      console.error('Error registering/updating user:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });

      let errorMessage = 'Failed to process user. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 8000, // Increased timeout for better readability
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

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
                  disabled={loading}
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
          className={`sidebar-btn ${
            isActive('/standard-admin') ? 'active' : ''
          }`}
          onClick={() => navigate('/standard-admin')}
        >
          <FaUser
            className={`sidebar-icon ${
              isActive('/standard-admin') ? '' : 'navy-icon'
            }`}
          />{' '}
          &nbsp; Users
        </button>
        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/admin-custom') ? 'active' : ''}`}
          onClick={() => navigate('/admin-custom')}
        >
          <TiCreditCard
            className={`sidebar-icon ${
              isActive('/admin-custom') ? '' : 'navy-icon'
            }`}
          />{' '}
          &nbsp; Custom Buttons
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/app-settings') ? 'active' : ''}`}
          onClick={() => navigate('/app-settings', { state: { admin: true } })}
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
          className={`user-btn ${activeTab === 'new-user' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-user')}
        >
          New User
        </button>
        <button
          className={`user-btn ${activeTab === 'edit-users' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit-users')}
        >
          Edit Users
        </button>
      </div>

      {!(activeTab === 'edit-users' && currentUserId === null) && (
        <button className="activate-btn icon-button" onClick={handleActivate}>
          <FaRegCheckCircle className="button-icon" />
          ACTIVATE
        </button>
      )}

      <div className="content-wrapper-sa">
        {activeTab === 'new-user' ||
        (activeTab === 'edit-users' && currentUserId !== null) ? (
          <>
            <section
              className={
                activeTab === 'new-user' ? 'new-user-sa' : 'edit-user-sa'
              }
            >
              <h2>New User Setup</h2>
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>First name</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                />
              </div>
              {errors.firstname && (
                <span style={errorStyle}>
                  <FaExclamationCircle size={12} /> {errors.firstname}
                </span>
              )}
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Last name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                />
              </div>
              {errors.lastname && (
                <span style={errorStyle}>
                  <FaExclamationCircle size={12} /> {errors.lastname}
                </span>
              )}
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
              </div>
              {errors.mobile && (
                <span style={errorStyle}>
                  <FaExclamationCircle size={12} /> {errors.mobile}
                </span>
              )}
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && (
                <span style={errorStyle}>
                  <FaExclamationCircle size={12} /> {errors.email}
                </span>
              )}
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              {errors.company && (
                <span style={errorStyle}>
                  <FaExclamationCircle size={12} /> {errors.company}
                </span>
              )}
            </section>
            <section className="access-sa">
              <h2>Access</h2>
              <div className="access-item">
                <img src="/digital-app.png" alt="Digital App" />
                <input
                  type="checkbox"
                  name="digital"
                  checked={formData.access.includes('digital')}
                  onChange={handleAccessChange}
                />
              </div>
              <div className="access-item">
                <img src="/m2m.png" alt="Market to Members" />
                <input
                  type="checkbox"
                  name="m2m"
                  checked={formData.access.includes('m2m')}
                  onChange={handleAccessChange}
                />
              </div>
              {/* <div className="access-item">
                <img src="/displays.png" alt="Displays" />
                <input
                  type="checkbox"
                  name="displays"
                  checked={formData.access.includes('displays')}
                  onChange={handleAccessChange}
                />
              </div> */}
              <div className="access-item">
                <img src="/ai-reporting.png" alt="AI Reporting" />
                <input
                  type="checkbox"
                  name="ai-reporting"
                  checked={formData.access.includes('ai-reporting')}
                  onChange={handleAccessChange}
                />
              </div>

              <div className="access-item">
                <img src="/club-desk.png" alt="Club Desk" />
                <input
                  type="checkbox"
                  name="club-desk"
                  checked={formData.access.includes('club-desk')}
                  onChange={handleAccessChange}
                />
              </div>
            </section>
            <section className="connected-sa">
              <h2>Connected to</h2>
              <div className="connected-item">
                <img src={getIconVenue(selectedVenue)} alt="Play Store" />
                <span>
                  {selectedVenue ? getAppType(selectedVenue) : 'Select Venue'}
                </span>
              </div>
            </section>
          </>
        ) : activeTab === 'edit-users' && currentUserId === null ? (
          <table className="edit-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Connected to</th>
                <th>Actions</th> {/* Added Actions column */}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, idx) => (
                  <tr key={idx}>
                    <td>
                      {user.firstname} {user.lastname}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {!user.appType ? (
                        <span>Select Venue</span>
                      ) : (
                        <span>{getAppType(user.appType)}</span>
                      )}
                    </td>
                    <td>
                      <button
                        style={{
                          color: 'red',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          marginRight: '8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleEditUser(user._id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    No users found for the selected venue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
};

export default StandardAdmin;
