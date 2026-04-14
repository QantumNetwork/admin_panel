/* AIButtons.js — updated
   - per-sub-button question storage
   - no delete functions/UI
   - renaming allowed
   - persists to localStorage
*/

import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { BsMenuButtonFill } from 'react-icons/bs';
import { TiCreditCard } from 'react-icons/ti';
import { FaMobileScreenButton } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import { handleLogout } from '../utils/api';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { getAppType } from '../utils/appConstants';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ai-buttons.css';

const AIButtons = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail') || 'user@example.com';
  const userInitial = email.charAt(0).toUpperCase();
  const appGroup = localStorage.getItem('appGroup');

  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );

  // UI state
  const [topButtons, setTopButtons] = useState([]); // from API: [{ _id, title, order, ... }]
  const [selectedTop, setSelectedTop] = useState(null); // index into topButtons

  const [subButtons, setSubButtons] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);

  // const [editTitle, setEditTitle] = useState('');
  const [editQuestion, setEditQuestion] = useState('');

  // const [editingType, setEditingType] = useState(null);

  const [topTitleInput, setTopTitleInput] = useState('');
  const [subTitleInput, setSubTitleInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]);

  const userType = localStorage.getItem('userType') || 'admin';

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchTopButtons = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${baseUrl}/main-buttons`, authHeader);

      const backend = Array.isArray(res.data)
        ? [...res.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];

      // Create fixed 4 slots
      const slots = [];

      for (let i = 1; i <= 4; i++) {
        const found = backend.find((b) => b.order === i);

        if (found) {
          slots.push(found);
        } else {
          slots.push({
            _id: null,
            title: `Top Button ${i}`,
            order: i,
            isPlaceholder: true,
          });
        }
      }

      setTopButtons(slots);
      // preserve currently selected order
      if (selectedTop) {
        const stillSelected = slots.find((b) => b.order === selectedTop.order);

        if (stillSelected) {
          setSelectedTop(stillSelected);
        }
      }
    } catch (err) {
      toast.error('Failed to load top buttons');
    } finally {
      setLoading(false);
    }
  };

  // fetch sub-buttons for a given mainButtonId
  const fetchSubButtons = async (mainId) => {
    if (!mainId) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${baseUrl}/sub-buttons/${mainId}/sub-buttons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const backend = Array.isArray(res.data) ? [...res.data] : [];

      // Build strict 16 slots
      const slots = [];

      for (let i = 1; i <= 16; i++) {
        const found = backend.find((b) => b.order === i);

        if (found) {
          slots.push(found);
        } else {
          slots.push({
            _id: null,
            title: `Button ${i}`,
            order: i,
            question: '',
            isPlaceholder: true,
          });
        }
      }

      setSubButtons(slots);

      // Auto-select first slot
      setSelectedSub(slots[0]);
      setEditQuestion(slots[0].question || '');
      setSubTitleInput('');
    } catch (err) {
      console.error('Error fetching sub buttons:', err);
      toast.error('Failed to load sub-buttons');
    } finally {
      setLoading(false);
    }
  };

  // Venue fetching (kept from original)
  useEffect(() => {
    fetchTopButtons();
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    if (!selectedTop) return;

    // If backend top button
    if (selectedTop._id) {
      fetchSubButtons(selectedTop._id);
    } else {
      // Placeholder top button → generate 16 placeholders
      const placeholders = [];

      for (let i = 0; i < 16; i++) {
        placeholders.push({
          _id: null,
          title: `Button ${i + 1}`,
          order: i + 1,
          question: '',
          isPlaceholder: true,
        });
      }

      setSubButtons(placeholders);
      setSelectedSub(placeholders[0]);
      setEditQuestion('');
      setSubTitleInput('');
    }
  }, [selectedTop]);

  // ===== SELECT HANDLERS =====
  const handleTopClick = (btn) => {
    // If clicking same top again
    if (selectedTop?.order === btn.order) {
      if (subButtons.length > 0) {
        setSelectedSub(subButtons[0]);
        setEditQuestion(subButtons[0].question || '');
      }
      return;
    }
    setSelectedTop(btn);
    setSelectedSub(null);
    setTopTitleInput('');
  };

  const handleSubClick = (btn) => {
    setSelectedSub(btn);
    setSubTitleInput('');
    setEditQuestion(btn.question || '');
  };

  const ensureTopExists = async () => {
    if (selectedTop?._id) {
      return selectedTop._id;
    }

    // Create top button from placeholder
    const titleToUse = topTitleInput.trim() || selectedTop.title;

    const res = await axios.post(
      `${baseUrl}/main-buttons`,
      {
        title: titleToUse,
        order: selectedTop.order,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const newTop = res.data;

    // Update state with new _id
    const updatedTop = {
      ...selectedTop,
      _id: newTop._id,
      isPlaceholder: false,
    };
    setSelectedTop(updatedTop);

    // Refresh top buttons list
    await fetchTopButtons();

    return newTop._id;
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const topId = await ensureTopExists();

      // --- TOP BUTTON ---
      if (topTitleInput.trim() && selectedTop) {
        if (selectedTop._id && topId) {
          await axios.put(
            `${baseUrl}/main-buttons/${topId}`,
            {
              title: topTitleInput,
              order: selectedTop.order,
            },
            authHeader
          );
        }

        toast.success('Top button saved');
        setTopTitleInput('');
        await fetchTopButtons();
      }

      // --- SUB BUTTON ---
      if (selectedSub) {
        const titleToUse = subTitleInput.trim() || selectedSub.title;

        const isQuestionEmpty = !editQuestion?.trim();

        const finalTitle = isQuestionEmpty
          ? `Button ${selectedSub.order}`
          : titleToUse;

        if (selectedSub._id) {
          await axios.put(
            `${baseUrl}/sub-buttons/${selectedSub._id}`,
            {
              title: finalTitle,
              order: selectedSub.order,
              question: editQuestion,
            },
            authHeader
          );
        }

        // create sub Button
        else {
          if (!editQuestion?.trim()) {
            toast.error('Question is required for new sub button.');
            return;
          }
          await axios.post(
            `${baseUrl}/sub-buttons`,
            {
              title: titleToUse,
              order: selectedSub.order,
              question: editQuestion,
              mainButton: topId,
            },
            authHeader
          );
        }
        toast.success('Sub button saved');
        setSubTitleInput('');

        await fetchSubButtons(topId);
      }
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  // ===== SPLIT LEFT / RIGHT =====
  const leftColumn = subButtons.slice(0, 8);
  const rightColumn = subButtons.slice(8, 16);

  const handleVenueChange = async (e) => {
    const newVenue = e.target.value;
    if (!newVenue) return;

    try {
      const response = await axios.post(
        `${baseUrl}/admin/token`,
        { appType: newVenue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data?.data?.token) {
        const newToken = response.data.data.token;
        localStorage.setItem('token', newToken);
        setSelectedVenue(newVenue);
        localStorage.setItem('selectedVenue', newVenue);
        await handleLock();
      }
    } catch (error) {
      console.error('Error updating token:', error);
      toast.error('Failed to update venue');
    }
  };

  const isActive = (path) => location.pathname === path;

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
          className={`sidebar-btn ${isActive('/standard-admin') ? 'active' : ''}`}
          onClick={() => navigate('/standard-admin')}
        >
          <FaUser
            className={`sidebar-icon ${isActive('/standard-admin') ? '' : 'navy-icon'}`}
          />{' '}
          &nbsp; Users
        </button>
        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/admin-custom') ? 'active' : ''}`}
          onClick={() => navigate('/admin-custom')}
        >
          <TiCreditCard
            className={`sidebar-icon ${isActive('/admin-custom') ? '' : 'navy-icon'}`}
          />{' '}
          &nbsp; Custom Buttons
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/app-settings') ? 'active' : ''}`}
          onClick={() => navigate('/app-settings', { state: { admin: true } })}
        >
          <FaMobileScreenButton
            className={`sidebar-icon ${isActive('/app-settings') ? '' : 'navy-icon'}`}
          />{' '}
          &nbsp; App Settings
        </button>

        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn ${isActive('/ai-buttons') ? 'active' : ''}`}
          onClick={() => navigate('/ai-buttons')}
        >
          <BsMenuButtonFill
            className={`sidebar-icon ${isActive('/ai-buttons') ? '' : 'navy-icon'}`}
          />{' '}
          &nbsp; AI Buttons
        </button>
      </aside>

      <div className="ai-buttons-body">
        {/* TOP 4 BUTTONS */}
        <div className="top-buttons-row">
          {topButtons.map((btn) => (
            <button
              key={btn._id || `top-${btn.order}`}
              className={`top-btn ${selectedTop?.order === btn.order ? 'active-btn' : ''}`}
              onClick={() => handleTopClick(btn)}
            >
              {btn.title}
            </button>
          ))}
        </div>

        {/* MAIN AREA */}
        {selectedTop && (
          <div className="ai-main-area">
            {/* LEFT */}
            <div className="column">
              {leftColumn.map((btn) => (
                <button
                  key={btn._id || `sub-${btn.order}`}
                  className={`sub-btn ${
                    selectedSub?.order === btn.order ? 'active-btn' : ''
                  }`}
                  onClick={() => handleSubClick(btn)}
                >
                  {btn.title}
                </button>
              ))}
            </div>

            {/* CENTER */}
            <div className="center-panel">
              {selectedSub && (
                <textarea
                  className="ai-textarea"
                  placeholder="Enter AI question"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                />
              )}

              {/*rename top*/}
              <input
                type="text"
                className="rename-btn"
                placeholder="Rename top button"
                value={topTitleInput}
                onChange={(e) => setTopTitleInput(e.target.value)}
              />

              {/* Rename Sub */}
              <input
                type="text"
                className="rename-btn"
                placeholder="Rename side button"
                value={subTitleInput}
                onChange={(e) => setSubTitleInput(e.target.value)}
              />

              <button className="save-qn-btn" onClick={handleSave}>
                Save
              </button>
            </div>

            {/* RIGHT */}
            <div className="column">
              {rightColumn.map((btn) => (
                <button
                  key={btn._id || `sub-${btn.order}`}
                  className={`sub-btn ${
                    selectedSub?.order === btn.order ? 'active-btn' : ''
                  }`}
                  onClick={() => handleSubClick(btn)}
                >
                  {btn.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIButtons;
