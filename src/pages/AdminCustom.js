import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaRegCheckCircle,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
} from 'react-icons/fa';
import { TiCreditCard } from 'react-icons/ti';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { handleLogout } from '../utils/api';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/admin-custom.css';
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

const AdminCustom = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();
  const appGroup = localStorage.getItem('appGroup');

  const [showDropdown, setShowDropdown] = useState(false);
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
  // Button position state (1-6)
  // Button position state (1-6)
  const [buttonPosition, setButtonPosition] = useState(1);
  // Button name input state
  const [buttonName, setButtonName] = useState('');
  // Linked URL state
  const [linkedUrl, setLinkedUrl] = useState('');
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Preview buttons labels
  const [previewButtons, setPreviewButtons] = useState(Array(6).fill(''));
  const [buttonLinks, setButtonLinks] = useState(Array(6).fill(''));
  const [buttonIds, setButtonIds] = useState(Array(6).fill(''));

  // Fetch buttons from API
  const fetchButtons = async () => {
    try {
      const response = await axios.get('https://api.s2w.com.au/button/get', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.data?.buttons) {
        const buttons = response.data.data.buttons;
        const newPreviewButtons = Array(6).fill('');
        const newButtonLinks = Array(6).fill('');
        const newButtonIds = Array(6).fill('');

        // Filter buttons for the currently selected venue
        const venueButtons = buttons.filter(
          (button) => button.appType === selectedVenue
        );

        venueButtons.forEach((button) => {
          const pos = button.position - 1; // Convert to 0-based index
          if (pos >= 0 && pos < 6) {
            newPreviewButtons[pos] = button.name || '';
            newButtonLinks[pos] = button.link || '';
            newButtonIds[pos] = button._id || '';
          }
        });

        setPreviewButtons(newPreviewButtons);
        setButtonLinks(newButtonLinks);
        setButtonIds(newButtonIds);

        // Find the first occupied position (1-based index)
        const firstOccupiedPos = newPreviewButtons.findIndex((btn) => btn) + 1;
        if (firstOccupiedPos > 0) {
          setButtonPosition(firstOccupiedPos);
          // Set the form fields for the first occupied position
          setButtonName(newPreviewButtons[firstOccupiedPos - 1] || '');
          setLinkedUrl(newButtonLinks[firstOccupiedPos - 1] || '');
        } else {
          setButtonPosition(1); // Default to position 1 if no buttons exist
          // Clear the form fields if no buttons exist
          setButtonName('');
          setLinkedUrl('');
        }
      }
    } catch (error) {
      console.error('Error fetching buttons:', error);
      toast.error('Failed to fetch buttons');
    }
  };

  // Swap positions in preview grid and update position state
  const changePosition = (newPos) => {
    if (newPos < 1 || newPos > 6 || newPos === buttonPosition) return;

    // Update the button position
    setButtonPosition(newPos);

    // Update the form fields with the data for the selected position
    const newButtonName = previewButtons[newPos - 1] || '';
    const newLinkedUrl = buttonLinks[newPos - 1] || '';

    setButtonName(newButtonName);
    setLinkedUrl(newLinkedUrl);
  };

  const decrementPosition = () => changePosition(buttonPosition - 1);
  const incrementPosition = () => changePosition(buttonPosition + 1);

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

  // Fetch buttons when component mounts or when selectedVenue changes
  useEffect(() => {
    if (token) {
      fetchButtons();
    }
  }, [token, selectedVenue]);

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

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  let isUpdating = false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buttonName.trim()) {
      toast.error('Please enter a button name');
      return;
    }

    const trimmedUrl = linkedUrl.trim();
    if (!trimmedUrl) {
      toast.error('Please enter a linked URL');
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if we're updating an existing button
      isUpdating = previewButtons[buttonPosition - 1] !== '';

      let response;

      if (isUpdating) {
        // Update existing button
        const buttonId = buttonIds[buttonPosition - 1];
        if (!buttonId) {
          throw new Error('Button ID not found for update');
        }
        response = await axios.put(
          `${baseUrl}/button/update?id=${buttonId}`,
          {
            name: buttonName.trim(),
            link: trimmedUrl,
            position: buttonPosition,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Create new button
        response = await axios.post(
          `${baseUrl}/button/create`,
          {
            name: buttonName.trim(),
            link: trimmedUrl,
            position: buttonPosition,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (response.data) {
        toast.success(
          `Custom Button(s) have been ${isUpdating ? 'updated' : 'created'}`
        );
        // Refresh buttons from API after successful operation
        await fetchButtons();
      }
    } catch (error) {
      console.error(
        `Error ${isUpdating ? 'updating' : 'creating'} button:`,
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${isUpdating ? 'update' : 'create'} button`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteButton = async (buttonId) => {
    if (!buttonId) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this button?',
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
          `${baseUrl}/button/delete?id=${buttonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'The button has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });

          // Refresh button state
          await fetchButtons();
        } else {
          throw new Error('Unexpected delete response');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the button.',
          icon: 'error',
        });
      }
    }
  };
  const isActive = (path) => {
    return location.pathname === path;
  };

  const userType = 'admin';

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
          marginTop: '90px',
          fontSize: '14px',
          minWidth: '300px',
          textAlign: 'center' }}
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
      </aside>

      {/* Main Content - Custom Buttons */}
      <div className="content-wrapper-cb">
        <div className="customer-button-section">
          <h2>Customer Button</h2>
          <form className="cb-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>Button name</label>
              <input
                type="text"
                // placeholder="Book Restaurant"
                value={buttonName}
                onChange={(e) => setButtonName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 'bold' }}>Linked URL</label>
              <input
                type="url"
                // placeholder="https://example.com"
                value={linkedUrl}
                onChange={(e) => setLinkedUrl(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex' }}>
              <label style={{ fontWeight: 'bold' }}>Button position</label>
              <div className="position-selector">
                <button
                  type="button"
                  className="arrow-btn"
                  onClick={decrementPosition}
                >
                  <FaChevronLeft size={12} />
                </button>
                <div className="value-box">{buttonPosition}</div>
                <button
                  type="button"
                  className="arrow-btn"
                  onClick={incrementPosition}
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Keypad grid */}
            <div className="keypad-container">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className={`keypad-cell ${
                    buttonPosition === num ? 'active' : ''
                  }`}
                  onClick={() => changePosition(num)}
                  style={{ cursor: 'pointer' }}
                >
                  {num}
                </div>
              ))}
            </div>
            {previewButtons[buttonPosition - 1] && (
              <div className="delete-button-wrapper">
                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    handleDeleteButton(buttonIds[buttonPosition - 1])
                  }
                >
                  <FaTrash style={{ marginRight: '8px' }} />
                  Delete Custom Button
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="preview-section">
          <h2>Preview</h2>
          <div className="preview-image-wrapper">
            <img src="/preview-cb.png" alt="Preview" />
            <div className="preview-overlay">
              {previewButtons.map((label, idx) => (
                <div key={idx} className="preview-btn">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="activate-btn icon-button"
        style={{ backgroundColor: '#5396D1' }}
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        <FaRegCheckCircle className="button-icon" />
        PUBLISH
      </button>

    </div>
  );
};

export default AdminCustom;
