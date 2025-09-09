import React, { useEffect, useRef, useState } from 'react';
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
import axios from 'axios';
import '../styles/smart-incentives.css';
const SmartIncentives = () => {
  // track the Audience dropdown container
  const audienceWrapperRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [isEveryone, setIsEveryone] = useState(false);

  // ── TRIGGER SETTINGS state ─────────────────────────────────────────────
  const [selectedIncentive, setSelectedIncentive] = useState('play_now'); // 'level_up', 'play_now', or 'points_bonus'
  const [triggerBy, setTriggerBy] = useState('turnover');
  const [triggerValue, setTriggerValue] = useState('');
  const [timePeriod, setTimePeriod] = useState('daily');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [tempBenefits, setTempBenefits] = useState('');
  const [levelUpDays, setLevelUpDays] = useState(1);
  const [expiresOn, setExpiresOn] = useState('');
  // ────────────────────────────────────────────────────────────────────────

  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const email = localStorage.getItem('userEmail');
  const userInitial = email ? email.charAt(0).toUpperCase() : '';

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Fix for sidebar navigation - ensure we have the state when navigating
  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const wrapperEl = audienceWrapperRef.current;

    const handleClickOutside = (e) => {
      // if open and click occurred outside *this* wrapper, close it
      if (showAudienceDropdown && wrapperEl && !wrapperEl.contains(e.target)) {
        setShowAudienceDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAudienceDropdown]);

  const toggleAudienceDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    console.log(
      'toggleAudienceDropdown called, current state:',
      showAudienceDropdown
    );
    if (!isEveryone) {
      setShowAudienceDropdown((open) => {
        console.log('Setting showAudienceDropdown to:', !open);
        return !open;
      });
    }
  };

  const handleAudienceChange = (value) => {
    // normal multi‑select toggle
    setSelectedAudiences((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleEveryoneChange = (e) => {
    const checked = e.target.checked;
    setIsEveryone(checked);

    if (checked) {
      // Select all audience options when "Everyone" is checked
      setSelectedAudiences(audienceOptions.map((option) => option.value));
    } else {
      // Clear selection when "Everyone" is unchecked
      setSelectedAudiences([]);
    }
  };

  let audienceOptions = [];

  if (selectedVenue === 'Qantum' || selectedVenue === 'MaxGaming') {
    // Options for audience selection - Match with venue's membership levels
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  } else if (selectedVenue === 'StarReward') {
    // Star Reward specific audience levels
    audienceOptions = [
      { value: 'Pre 3 Month', label: 'Pre 3 Month' },
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  } else if (selectedVenue === 'Manly') {
    // Manly Harbour Boat Club specific audience levels
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Crewmate', label: 'Crewmate' },
      { value: 'Lieutenant', label: 'Lieutenant' },
      { value: 'Commander', label: 'Commander' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commodore', label: 'Commodore' },
    ];
  } else if (selectedVenue === 'Montauk') {
    // Montauk Tavern specific audience levels
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Bronze', label: 'Bronze' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  } else if (selectedVenue === 'Central') {
    // Central Lane Hotel specific audience levels
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Member', label: 'Member' },
      { value: 'VIP', label: 'VIP' },
    ];
  } else if (selectedVenue === 'Sense') {
    // Sense Of Taste specific audience levels
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Regular', label: 'Regular' },
      { value: 'VIP', label: 'VIP' },
      { value: 'VVIP', label: 'VVIP' },
    ];
  } else {
    // Default audience levels for other venues
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  }

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
    <div className="digital-app-container">
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
              <button
                className="displays-btn"
                onClick={() => handleNavigation('/displays')}
              >
                Displays
              </button>
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
              {access.includes('displays') && (
                <button
                  className="displays-btn"
                  onClick={() => handleNavigation('/displays')}
                >
                  Displays
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
          className={`sidebar-btn ${isActive('/digital-app') ? 'active' : ''}`}
          onClick={() => handleNavigation('/digital-app')}
        >
          <FaBullhorn
            className={`sidebar-icon ${
              isActive('/digital-app') ? '' : 'navy-icon'
            }`}
          />
          Promotions
        </button>
        <button
          className={`sidebar-btn ${
            isActive('/special-offers') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/special-offers')}
        >
          <FaGift
            className={`sidebar-icon ${
              isActive('/special-offers') ? '' : 'navy-icon'
            }`}
          />
          Special Offers
        </button>
        <button
          className={`sidebar-btn ${
            isActive('/smart-incentives') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/smart-incentives')}
        >
          <FaRegStar
            className={`sidebar-icon ${
              isActive('/smart-incentives') ? '' : 'navy-icon'
            }`}
          />
          Smart Incentives
        </button>
        <button
          className={`sidebar-btn ${isActive('/my-benefits') ? 'active' : ''}`}
          onClick={() => handleNavigation('/my-benefits')}
        >
          <FaUtensils
            className={`sidebar-icon ${
              isActive('/my-benefits') ? '' : 'navy-icon'
            }`}
          />
          My Benefits
        </button>

        <button
          className={`sidebar-btn ${isActive('/art-gallery') ? 'active' : ''}`}
          onClick={() => handleNavigation('/art-gallery')}
        >
          <FaPaintBrush
            className={`sidebar-icon ${
              isActive('/art-gallery') ? '' : 'navy-icon'
            }`}
          />
          Art Gallery
        </button>
      </aside>

      <div className="content-body">
        <div className="content-wrapper-displays">
          <section className="current-posts-display">
            <h2>Choose Smart Incentive</h2>
            <div className="incentive-options">
              <label className="incentive-option">
                <input
                  type="radio"
                  name="incentive"
                  value="play_now"
                  checked={selectedIncentive === 'play_now'}
                  onChange={(e) => setSelectedIncentive(e.target.value)}
                  className="incentive-radio"
                />
                <div className="incentive-image">
                  <img src="/play_now.png" alt="Play Now" />
                </div>
              </label>
              <label className="incentive-option">
                <input
                  type="radio"
                  name="incentive"
                  value="level_up"
                  checked={selectedIncentive === 'level_up'}
                  onChange={(e) => setSelectedIncentive(e.target.value)}
                  className="incentive-radio"
                />
                <div className="incentive-image">
                  <img src="/level_up.png" alt="Level Up" />
                </div>
              </label>
              <label className="incentive-option">
                <input
                  type="radio"
                  name="incentive"
                  value="points_bonus"
                  checked={selectedIncentive === 'points_bonus'}
                  onChange={(e) => setSelectedIncentive(e.target.value)}
                  className="incentive-radio"
                />
                <div className="incentive-image">
                  <img src="/points_bonus.png" alt="Points Bonus" />
                </div>
              </label>
            </div>
          </section>

          {/* Display Options */}
          <div className="display-options-panel responsive-panel">
            <div className="scrollable-content">
              <h2>Trigger settings</h2>

              <div className="form-group inline-form-group">
                <label>
                  <strong>Audience</strong>
                </label>
                <div
                  className="select-wrapper"
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                  }}
                  ref={audienceWrapperRef}
                >
                  <div
                    className="multiselect-display"
                    onClick={toggleAudienceDropdown}
                    style={{
                      cursor: isEveryone ? 'not-allowed' : 'pointer',
                      lineHeight: '15px',
                      padding: '0 10px',
                      fontSize: '13px',
                      color: isEveryone ? '#999' : '#666',
                    }}
                  >
                    {isEveryone
                      ? 'All Selected'
                      : selectedAudiences.length > 0
                      ? selectedAudiences.length > 2
                        ? `${selectedAudiences.length} selected`
                        : audienceOptions
                            .filter((o) => selectedAudiences.includes(o.value))
                            .map((o) => o.label)
                            .join(', ')
                      : 'Select from list'}
                  </div>

                  {showAudienceDropdown && !isEveryone && (
                    <div
                      className="multiselect-options"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        // boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        display: showAudienceDropdown ? 'block' : 'none',
                      }}
                    >
                      {audienceOptions.map((option) => (
                        <div
                          key={option.value}
                          className="day-item"
                          style={{
                            padding: '5px 10px',
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`aud-${option.value}`}
                            checked={selectedAudiences.includes(option.value)}
                            onChange={() => handleAudienceChange(option.value)}
                          />
                          <label
                            htmlFor={`aud-${option.value}`}
                            style={{ marginLeft: '6px' }}
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="day-item"
                  style={{ marginTop: '10px', marginLeft: '5px' }}
                >
                  <input
                    type="checkbox"
                    id="aud-everyone"
                    checked={isEveryone}
                    onChange={handleEveryoneChange}
                  />
                  <label htmlFor="aud-everyone">Everyone</label>
                </div>
              </div>

              {/* Trigger by */}
              <div className="field-block flex-row align-center">
                <label className="field-label inline-label">Trigger by</label>
                <div className="flex-row">
                  {['Turnover', 'Revenue', 'Visits'].map(o => (
                    <label key={o} className="radio-label">
                      <input
                        type="radio"
                        name="triggerBy"
                        value={o.toLowerCase()}
                        checked={triggerBy === o.toLowerCase()}
                        onChange={() => setTriggerBy(o.toLowerCase())}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trigger value */}
              <div className="field-block">
                <label className="field-label">Trigger value</label>
                <input
                  type="text"
                  value={triggerValue}
                  onChange={e => setTriggerValue(e.target.value)}
                  className="text-input-trigger"
                />
              </div>

              {/* Trigger time period */}
              <div className="field-block">
                <label className="field-label">Trigger time period</label>
                {/* first row: daily + weekly */}
                <div className="flex-row">
                  {['daily','weekly'].map(tp=>(
                    <label key={tp} className="radio-label">
                      <input
                        type="radio"
                        name="timePeriod"
                        value={tp}
                        checked={timePeriod===tp}
                        onChange={()=>setTimePeriod(tp)}
                      />
                      <span>{tp.charAt(0).toUpperCase()+tp.slice(1)}</span>
                    </label>
                  ))}
                </div>

                {/* second row: schedule + always‑visible dates */}
                <div className="schedule-line flex-row">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="timePeriod"
                      value="schedule"
                      checked={timePeriod==='schedule'}
                      onChange={()=>setTimePeriod('schedule')}
                    />
                    <span>Schedule</span>
                  </label>
                  <div className="schedule-row-si">
                    <div className="date-field">
                      <label className="date-label">Start date</label>
                      <input
                        type="date"
                        value={scheduleStart}
                        onChange={e=>setScheduleStart(e.target.value)}
                        className="date-input"
                      />
                    </div>
                    <div className="date-field">
                      <label className="date-label">End date</label>
                      <input
                        type="date"
                        value={scheduleEnd}
                        onChange={e=>setScheduleEnd(e.target.value)}
                        className="date-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional fields based on incentive type */}
              {selectedIncentive === 'level_up' && (
                <>
                  {/* Temporary benefits level - Only for level_up */}
                  <div className="field-block">
                    <label className="field-label">Temporary benefits level</label>
                    <select
                      value={tempBenefits}
                      onChange={e=>setTempBenefits(e.target.value)}
                      className="select-input"
                    >
                      <option value="">Select from list</option>
                      {audienceOptions.map(o=>(
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Time Level Up benefits - Only for level_up */}
                  <div className="field-block">
                    <label className="field-label">
                      Time Level Up benefits will apply after earning
                    </label>
                    <div className="flex-row align-center">
                      <input
                        type="number"
                        min={1}
                        value={levelUpDays}
                        onChange={e=>setLevelUpDays(e.target.value)}
                        className="small-number-input"
                      />
                      <span className="unit-label">Days</span>
                    </div>
                  </div>
                </>
              )}

              {selectedIncentive === 'play_now' && (
                <div className="field-block">
                  <label className="field-label">Wheel average prize value</label>
                  <div className="flex-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    {[10, 20, 50, 100, 200].map((value) => (
                      <label key={value} className="radio-label" style={{ marginRight: '15px' }}>
                        <input
                          type="radio"
                          name="wheelPrizeValue"
                          value={value}
                          checked={tempBenefits === value.toString()}
                          onChange={(e) => setTempBenefits(e.target.value)}
                        />
                        <span>${value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedIncentive === 'points_bonus' && (
                <div className="field-block">
                  <label className="field-label">Points bonus value to issue to member</label>
                  <input
                    type="text"
                    value={tempBenefits}
                    onChange={e => setTempBenefits(e.target.value)}
                    className="text-input-trigger"
                    placeholder="Enter points bonus value"
                  />
                </div>
              )}

              {/* Smart Incentive expires */}
              <div className="field-block">
                <label className="field-label">Smart Incentive expires</label>
                <input
                  type="date"
                  value={expiresOn}
                  onChange={e=>setExpiresOn(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Smart Incentives Section */}
        <div className="live-smart-incentives">
          <h2>Live Smart Incentives</h2>
          <div className="incentives-grid">
            {/* Row 1 - Spin & Win */}
            <div className="incentive-card">
              <div className="incentive-image-container">
                <img src="/spin_win.png" alt="Spin & Win" className="incentive-img" />
              </div>
              <div className="incentive-details">
                <div className="incentive-header">
                  <h3>Spin & Win</h3>
                </div>
                <p className="incentive-description">
                  $5,000 Trigger Daily $ Avg Prize $20
                </p>
              </div>
            </div>

            {/* Row 2 - Spin & Win */}
            <div className="incentive-card">
              <div className="incentive-image-container">
                <img src="/spin_win.png" alt="Spin & Win" className="incentive-img" />
              </div>
              <div className="incentive-details">
                <div className="incentive-header">
                  <h3>Spin & Win</h3>
                </div>
                <p className="incentive-description">
                  $5,000 Trigger Daily $ Avg Prize $20
                </p>
              </div>
            </div>

            {/* Row 3 - Level Up */}
            <div className="incentive-card">
              <div className="incentive-image-container">
                <img src="/gold_star.png" alt="Level Up" className="incentive-img" />
              </div>
              <div className="incentive-details">
                <div className="incentive-header">
                  <h3>Level Up</h3>
                </div>
                <p className="incentive-description">
                  $500 Revenue Trigger Daily 
                </p>
              </div>
            </div>

            {/* Row 4 - Special Offer */}
            <div className="incentive-card">
              <div className="incentive-image-container">
                <img src="/gifts.png" alt="Special Offer" className="incentive-img" />
              </div>
              <div className="incentive-details">
                <div className="incentive-header">
                  <h3>Special Offer</h3>
                </div>
                <p className="incentive-description">
                  After 5 visits - Prize $25
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* ========== CONTROL BUTTONS ========== */}
        <button
          className="publish-displays-btn icon-button"
          // onClick={handlePublishPromotion}
        >
          <FaCheck className="button-icon" />
          PUBLISH
        </button>
      </div>
    </div>
  );
};

export default SmartIncentives;
