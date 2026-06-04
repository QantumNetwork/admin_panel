import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import {
  FaRegStar,
  FaCheck,
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaPaintBrush,
} from 'react-icons/fa';
import {
  getAppType,
  getAudienceOptions,
  getAudienceStyle,
} from '../utils/appConstants';
import { FaChartPie } from 'react-icons/fa6';
import axios from 'axios';
import '../styles/smart-incentives.css';
const SmartIncentives = () => {
  // track the Audience dropdown container
  const audienceWrapperRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [isEveryone, setIsEveryone] = useState(false);

  // track the Trigger dropdown container
  const triggerWrapperRef = useRef(null);
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);

  // ── TRIGGER SETTINGS state ─────────────────────────────────────────────
  const [selectedIncentive, setSelectedIncentive] = useState('Point Bonus'); // Point Bonus
  const [deliveryMethod, setDeliveryMethod] = useState('Scratch & Win'); // 'Scratch & Win'
  const [triggerBy, setTriggerBy] = useState('turnover');
  const [triggerValue, setTriggerValue] = useState('');
  const [timePeriod, setTimePeriod] = useState('daily');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [tempBenefits, setTempBenefits] = useState('');
  const [levelUpDays, setLevelUpDays] = useState(1);
  const [expiresOn, setExpiresOn] = useState('');
  // ────────────────────────────────────────────────────────────────────────

  const [budget, setBudget] = useState('');
  const [unlimitedBudget, setUnlimitedBudget] = useState(false);
  const [publishing, setPublishing] = useState(false);

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

  const [activeTab, setActiveTab] = useState('createIncentive'); // 'createIncentive' or 'activeCampaigns'

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

  const getTTPValue = (tp) => {
    switch (tp) {
      // ['daily', 'last 7 days', 'last 14 days', 'last 30 days']
      case 'daily':
        return 'Daily';
      case 'last 7 days':
        return 'Last7Days';
      case 'last 14 days':
        return 'Last14Days';
      case 'last 30 days':
        return 'Last30Days';
      default:
        return tp;
    }
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

  useEffect(() => {
    const wrapperEl = triggerWrapperRef.current;

    const handleClickOutside = (e) => {
      // if open and click occurred outside *this* wrapper, close it
      if (showTriggerDropdown && wrapperEl && !wrapperEl.contains(e.target)) {
        setShowTriggerDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTriggerDropdown]);

  const toggleAudienceDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    console.log(
      'toggleAudienceDropdown called, current state:',
      showAudienceDropdown
    );
    if (!isEveryone) {
      setShowTriggerDropdown(false); // Close trigger dropdown if open
      setShowAudienceDropdown((open) => {
        console.log('Setting showAudienceDropdown to:', !open);
        return !open;
      });
    }
  };

  const toggleTriggerDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    console.log(
      'toggleTriggerDropdown called, current state:',
      showTriggerDropdown
    );
    setShowAudienceDropdown(false); // Close audience dropdown if open
    setShowTriggerDropdown((open) => {
      console.log('Setting showTriggerDropdown to:', !open);
      return !open;
    });
  };

  const handleAudienceChange = (value) => {
    // normal multi‑select toggle
    setSelectedAudiences((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleTriggerChange = (value) => {
    setSelectedTrigger(value);
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

  audienceOptions = getAudienceOptions(selectedVenue);

  let triggerOptions = [
    { value: 'Turnover', label: 'Turnover' },
    { value: 'Revenue', label: 'Revenue' },
    { value: 'Visits', label: 'Visits' },
    { value: 'BeverageSales', label: 'Beverage Sales' },
    { value: 'FoodSales', label: 'Food Sales' },
  ];

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

  const handlePublishIncentive = async () => {
    try {
      if (!isEveryone && selectedAudiences.length === 0) {
        toast.error('Please select at least one audience');
        return;
      }

      if (!selectedTrigger) {
        toast.error('Please select a trigger type');
        return;
      }

      if (!triggerValue) {
        toast.error('Please enter trigger value');
        return;
      }

      if (!tempBenefits) {
        toast.error('Please enter incentive value');
        return;
      }

      if (!unlimitedBudget && !budget) {
        toast.error('Please enter budget');
        return;
      }

      if (!scheduleStart || !scheduleEnd) {
        toast.error('Please select start and end dates');
        return;
      }

      setPublishing(true);

      const payload = {
        offerType: 'Point Bonus',
        deliveryMethod: 'Scratch & Win',
        audience: isEveryone ? ['everyone'] : selectedAudiences,
        triggerType: selectedTrigger,
        timePeriod: getTTPValue(timePeriod),
        triggerValue: Number(triggerValue),
        incentiveValue: Number(tempBenefits),
        budget: unlimitedBudget ? 0 : Number(budget),
        unlimitedBudget,
        startDate: scheduleStart,
        endDate: scheduleEnd,
      };

      await axios.post(
        'https://betaapi.s2w.com.au/smart-incentive/create',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Smart incentive created successfully');
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || 'Failed to create smart incentive'
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="digital-app-container">
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

        <button
          className={`sidebar-btn ${isActive('/reporting') ? 'active' : ''}`}
          onClick={() => navigate('/reporting')}
        >
          <FaChartPie
            className={`sidebar-icon ${
              isActive('/reporting') ? '' : 'navy-icon'
            }`}
          />
          Reporting
        </button>
      </aside>

      <div className="sa-filter-buttons">
        <button
          className={`user-btn ${
            activeTab === 'createIncentive' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('createIncentive')}
        >
          Create Incentive
        </button>
        <button
          className={`user-btn ${
            activeTab === 'activeCampaigns' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('activeCampaigns')}
        >
          Active Campaigns
        </button>
      </div>

      <div className="content-body">
        <div className="content-wrapper-displays">
          <section className="current-posts-display">
            <h2>Choose Smart Incentive</h2>
            <div className="incentive-options">
              <label className="incentive-option">
                <input
                  type="radio"
                  name="incentive"
                  value="Point Bonus"
                  checked={selectedIncentive === 'Point Bonus'}
                  onChange={(e) => setSelectedIncentive(e.target.value)}
                  className="incentive-radio"
                  style={{ accentColor: '#002977' }}
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

              <div
                className="form-group inline-form-group"
                style={{ marginBottom: '10px' }}
              >
                <label>
                  <strong>Audience</strong>
                </label>
                <div
                  className="select-wrapper"
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                    zIndex: showAudienceDropdown ? 10 : 1,
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
                              .filter((o) =>
                                selectedAudiences.includes(o.value)
                              )
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
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
              <div
                className="form-group inline-form-group"
                style={{ marginBottom: '20px' }}
              >
                <label>
                  <strong>Trigger by</strong>
                </label>
                <div
                  className="select-wrapper"
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                  }}
                  ref={triggerWrapperRef}
                >
                  <div
                    className="multiselect-display"
                    onClick={toggleTriggerDropdown}
                    style={{
                      cursor: 'pointer',
                      lineHeight: '15px',
                      padding: '0 10px',
                      fontSize: '13px',
                      color: '#666',
                    }}
                  >
                    {selectedTrigger
                      ? triggerOptions.find((o) => o.value === selectedTrigger)
                          ?.label
                      : 'Select from list'}
                  </div>

                  {showTriggerDropdown && (
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
                        display: showTriggerDropdown ? 'block' : 'none',
                      }}
                    >
                      {triggerOptions.map((option) => (
                        <div
                          key={option.value}
                          className="day-item"
                          style={{
                            padding: '5px 10px',
                          }}
                        >
                          <input
                            type="radio"
                            name="triggerType"
                            checked={selectedTrigger === option.value}
                            onChange={() => handleTriggerChange(option.value)}
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
              </div>

              {/* Trigger value */}
              <div className="field-block">
                <label className="field-label" style={{ marginRight: '45px' }}>
                  Trigger value
                </label>
                <input
                  type="text"
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  className="text-input-trigger"
                />
              </div>

              {/* Trigger time period */}
              <div className="field-block" style={{ marginBottom: '50px' }}>
                <label className="field-label">Trigger time period</label>
                {/* first row: daily + weekly */}
                <div className="flex-row" style={{ gap: '10px' }}>
                  {['daily', 'last 7 days', 'last 14 days', 'last 30 days'].map(
                    (tp) => (
                      <label
                        key={tp}
                        className="radio-label"
                        style={{ gap: '0px' }}
                      >
                        <input
                          type="radio"
                          name="timePeriod"
                          value={getTTPValue(tp)}
                          checked={timePeriod === tp}
                          onChange={() => setTimePeriod(tp)}
                          style={{ accentColor: '#002977' }}
                        />
                        <span>{tp.charAt(0).toUpperCase() + tp.slice(1)}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Points bonus value */}
              <div
                className="field-block"
                style={{ textAlign: 'center', marginBottom: '20px' }}
              >
                <label className="field-label">
                  Points bonus value to issue to member
                </label>

                <input
                  type="text"
                  value={tempBenefits}
                  onChange={(e) => setTempBenefits(e.target.value)}
                  className="text-input-trigger"
                  placeholder="20,000"
                />
              </div>

              {/* Budget */}
              <div className="flex-row" style={{ marginBottom: '30px' }}>
                <label
                  className="field-label"
                  style={{ textWrap: 'nowrap', marginRight: '30px' }}
                >
                  Set budget
                </label>

                <div className="flex-row">
                  <input
                    type="number"
                    value={budget}
                    disabled={unlimitedBudget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="text-input-trigger"
                    style={{
                      width: '80px',
                      marginBottom: '5px',
                      marginRight: '10px',
                      opacity: unlimitedBudget ? 0.5 : 1,
                    }}
                  />

                  <label className="day-item">
                    <input
                      type="checkbox"
                      checked={unlimitedBudget}
                      onChange={(e) => setUnlimitedBudget(e.target.checked)}
                    />
                    <span>Unlimited budget</span>
                  </label>
                </div>
              </div>

              {/* Start & End incentive */}
              <div className="flex-row">
                <label
                  className="field-label"
                  style={{ textWrap: 'nowrap', marginRight: '90px' }}
                >
                  Start & End incentive
                </label>

                <div className="schedule-row-si">
                  <div className="date-field">
                    <label className="date-label">START DATE</label>
                    <input
                      type="date"
                      value={scheduleStart}
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className="date-input"
                    />
                  </div>

                  <div className="date-field">
                    <label className="date-label">END DATE</label>
                    <input
                      type="date"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Smart Incentives Section */}
        <div className="live-smart-incentives">
          <h2>Delivery Method</h2>
          <div className="incentive-options">
            <label className="incentive-option">
              <input
                type="radio"
                name="deliveryMethod"
                value="Scratch & Win"
                checked={deliveryMethod === 'Scratch & Win'}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="incentive-radio"
                style={{ accentColor: '#002977' }}
              />
              <div>
                <img
                  src="/scratch_and_win.png"
                  alt="Scratch and Win"
                  style={{ width: '80%' }}
                />
              </div>
            </label>
          </div>
        </div>
        {/* ========== CONTROL BUTTONS ========== */}
        <button
          className="publish-displays-btn icon-button"
          onClick={handlePublishIncentive}
          disabled={publishing}
        >
          <FaCheck className="button-icon" />
          {publishing ? 'PUBLISHING...' : 'PUBLISH'}{' '}
        </button>
      </div>
    </div>
  );
};

export default SmartIncentives;
