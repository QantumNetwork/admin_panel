import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import { BsDisplayFill } from 'react-icons/bs';
import { RiRectangleFill } from 'react-icons/ri';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { uploadFileToS3 } from '../s3/config';
import {
  FaCheck,
  FaCloudUploadAlt,
  FaTrashAlt,
  FaPlusCircle,
  FaEdit,
  FaImages,
} from 'react-icons/fa';
import Select, { components } from 'react-select';
import { FaMobileAlt } from 'react-icons/fa';
import { IoPushOutline } from 'react-icons/io5';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/displays.css';

const Displays = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [advertImages, setAdvertImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [position, setPosition] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [venue, setVenue] = useState([]);
  const [isEveryone, setIsEveryone] = useState(false);
  const [isAudienceMenuOpen, setIsAudienceMenuOpen] = useState(false);
  // Track if the venue field is being edited in current posts
  const [isAudienceEditing, setIsAudienceEditing] = useState(false);
  const audienceSelectRef = useRef(null);
  // const fileInputRef = useRef(null);

  const access = localStorage.getItem("access");
  const userType = localStorage.getItem("userType");

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem('token');
    const [selectedVenue, setSelectedVenue] = useState(
      localStorage.getItem('selectedVenue') || ''
    );
    const appGroup = localStorage.getItem('appGroup');
     const [loading, setLoading] = useState(true);
      const [venues, setVenues] = useState([]);

  // Helper to convert venue (array of strings) into ReactSelect option objects
  // Uses case-insensitive matching.
  const convertAudienceToObjects = (audienceArray) => {
    if (!Array.isArray(audienceArray)) return [];
    return audienceOptions.filter((opt) =>
      audienceArray.some((aud) => aud.toLowerCase() === opt.value.toLowerCase())
    );
  };

  // Options for venue selection
  const audienceOptions = [
    { value: 'valued', label: 'Valued' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'staff', label: 'Staff' },
  ];

  // Checkbox for "Everyone"
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    console.log('Everyone checkbox changed:', checked);

    // This is the key change - only update isEveryone when the checkbox is clicked
    setIsEveryone(checked);

    if (checked) {
      // When "Everyone" is checked, set venue to include all available options
      setVenue(audienceOptions.map((option) => option.value));

      // Force disable the venue input fields
      const audienceFields = document.querySelectorAll('.venue-field');
      audienceFields.forEach((field) => {
        field.disabled = true;
        field.classList.add('disabled-field');
      });

      // Close and disable the venue dropdown if it's open
      setIsAudienceEditing(false);
      setIsAudienceMenuOpen(false);

      // Force update the Select component's disabled state
      setTimeout(() => {
        const selectContainer = document.querySelector(
          '.venue-select-container'
        );
        if (selectContainer) {
          selectContainer.classList.add('disabled-select');
        }
      }, 0);
    } else {
      // When "Everyone" is unchecked, set venue to empty array
      setVenue([]);

      // Enable the venue input fields
      const audienceFields = document.querySelectorAll('.venue-field');
      audienceFields.forEach((field) => {
        field.disabled = false;
        field.classList.remove('disabled-field');
      });

      // Enable the Select component
      const selectContainer = document.querySelector('.venue-select-container');
      if (selectContainer) {
        selectContainer.classList.remove('disabled-select');
      }
    }
  };

  const CustomMultiValue = () => null; // Hides selected values in the input field

  const CustomValueContainer = ({ children, ...props }) => {
    const { getValue } = props;
    const selectedOptions = getValue();
    let displayText = 'None selected';

    if (selectedOptions.length > 0) {
      displayText =
        selectedOptions.length === 5
          ? 'All selected'
          : `${selectedOptions.length} selected`;
    }

    return (
      <components.ValueContainer {...props}>
        <div style={{ color: '#333', padding: '2px' }}>{displayText}</div>
      </components.ValueContainer>
    );
  };

  const CheckboxOption = (props) => {
    const optionStyle = {
      display: 'flex',
      alignItems: 'center',
      ...(props.data.value === 'platinum' && { whiteSpace: 'nowrap' }),
    };

    return (
      <components.Option {...props}>
        <div style={optionStyle}>
          <input
            type="checkbox"
            checked={props.isSelected}
            readOnly
            tabIndex={-1} // Prevents the checkbox from capturing focus.
            style={{ marginRight: 8 }}
          />
          <span>{props.label}</span>
        </div>
      </components.Option>
    );
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const s3Url = await uploadFileToS3(file);
        console.log(s3Url);
        setSelectedImage(s3Url);
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        toast.error('Failed to upload image. Please try again.');
      }
    }
  };

  const location = useLocation();
  const navigate = useNavigate();

  const email = localStorage.getItem('userEmail');
  const userInitial = email ? email.charAt(0).toUpperCase() : '';

  const isActive = (path) => {
    if (path === '/digital-app') {
      return (
        location.pathname === '/digital-app' ||
        location.pathname === '/small-advert'
      );
    }
    return location.pathname === path;
  };

  // Fix for sidebar navigation - ensure we have the state when navigating
  const handleNavigation = (path) => {
    // Force a full page reload to ensure proper rendering
    window.location.href = path;
  };

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

{userType === "admin" && (
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
              <button className="logout-btn" onClick={() => logout(navigate)}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <aside className="sidebar">
        <button
          className={`sidebar-btn ${isActive('/displays') ? 'active' : ''}`}
          onClick={() => handleNavigation('/displays')}
        >
          <RiRectangleFill
            className={`sidebar-icon ${
              isActive('/displays') ? '' : 'navy-icon'
            }`}
          />
          Galaxy Displays
        </button>
        <button
          className={`sidebar-btn ${isActive('/tv-displays') ? 'active' : ''}`}
          onClick={() => handleNavigation('/tv-displays')}
        >
          <BsDisplayFill
            className={`sidebar-icon ${
              isActive('/tv-displays') ? '' : 'navy-icon'
            }`}
          />
          TV Displays
        </button>
      </aside>

      <div className="content-body">
        <button className="card-not-inserted-btn nav-btn">Card Not Inserted</button>
        <button className="card-inserted-btn nav-btn">Card Inserted</button>

        <div className="content-wrapper-displays">
          <section className="current-posts-display">
            <h2>Current posts</h2>
            <div className="post-card-displays">
              <div
                className="post-image"
                style={{
                  background:
                    isAddingNew || (!isAddingNew && advertImages.length == 0)
                      ? 'transparent linear-gradient(180deg, #203366 0%, #0758A7 100%) 0% 0% no-repeat padding-box'
                      : '#bbb',
                  position: 'relative',
                }}
              >
                {!isAddingNew &&
                  (selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={`POST ${activeImageIndex + 1}`}
                    />
                  ) : advertImages.length > 0 ? (
                    <img
                      src={
                        advertImages[activeImageIndex].imageUrl ||
                        advertImages[activeImageIndex]
                      }
                      alt={`POST ${activeImageIndex + 1}`}
                    />
                  ) : null)}
                {isAddingNew && selectedImage && (
                  <img src={selectedImage} alt="POST 1" />
                )}
                {!isAddingNew && advertImages.length > 1 && (
                  <>
                    {activeImageIndex !== 0 && (
                      <button
                        className="carousel-control left"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '-50px',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveImageIndex(activeImageIndex - 1);
                          setSelectedImage(null);
                        }}
                      >
                        <IoIosArrowBack />
                      </button>
                    )}
                    {activeImageIndex !== advertImages.length - 1 && (
                      <button
                        className="carousel-control right"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '-50px',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '45%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setActiveImageIndex(activeImageIndex + 1);
                          setSelectedImage(null);
                        }}
                      >
                        <IoIosArrowForward />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="post-details-displays">
              <div className="field-row">
                <label className="field-label">Position</label>
                {isAddingNew ? (
                  <input
                    type="number"
                    className="field-select"
                    placeholder="Enter position..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                ) : (
                  <input
                    type="number"
                    className="field-select"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                )}
              </div>
              <div className="field-row">
                <label className="field-label">Venue</label>
                {isAddingNew ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{ flex: 1 }}
                      ref={audienceSelectRef}
                      className={`venue-select-container ${
                        isEveryone ? 'disabled-select' : ''
                      }`}
                    >
                      <Select
                        isMulti
                        options={audienceOptions}
                        value={convertAudienceToObjects(venue)}
                        onChange={(e) => {
                          const selectedOptions = Array.isArray(e)
                            ? e.map((x) => x.value)
                            : [];
                          setVenue(selectedOptions);

                          // Only handle the case when selected options are LESS than all options
                          // and isEveryone is true - in this case, uncheck the Everyone checkbox
                          if (
                            selectedOptions.length < audienceOptions.length &&
                            isEveryone
                          ) {
                            setIsEveryone(false);
                          }
                          // Don't automatically set isEveryone to true when all options are selected manually
                        }}
                        isDisabled={isEveryone}
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        menuIsOpen={isAudienceMenuOpen}
                        onMenuOpen={() => setIsAudienceMenuOpen(true)}
                        onMenuClose={() => setIsAudienceMenuOpen(false)}
                        components={{
                          Option: CheckboxOption,
                          MultiValue: CustomMultiValue,
                          ValueContainer: CustomValueContainer,
                        }}
                        styles={{
                          control: (base) => ({
                            ...base,
                            width: '140px',
                            minHeight: '22px',
                            height: '22px',
                            fontSize: '11px',
                            borderColor: '#ccc',
                            backgroundColor: 'white',
                            borderRadius: '3px',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#999',
                            },
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: '11px',
                            padding: '6px 8px',
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '0px 6px',
                            fontSize: '11px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: '0 4px',
                            width: '16px',
                            height: '16px',
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            padding: '0 2px',
                            width: '16px',
                            height: '16px',
                          }),
                          indicatorSeparator: (base) => ({
                            ...base,
                            margin: '0px',
                          }),
                          singleValue: (base) => ({
                            ...base,
                            fontSize: '11px',
                          }),
                          menu: (base) => ({
                            ...base,
                            width: 'auto',
                            minWidth: '140px',
                          }),
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '10px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isEveryone}
                        onChange={handleCheckboxChange}
                        className="audience-checkbox"
                      />
                      &nbsp;All Venues
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{ flex: 1 }}
                      ref={audienceSelectRef}
                      className={`venue-select-container ${
                        isEveryone ? 'disabled-select' : ''
                      }`}
                    >
                      <Select
                        isMulti
                        options={audienceOptions}
                        value={convertAudienceToObjects(venue)}
                        onChange={(e) => {
                          const selectedOptions = Array.isArray(e)
                            ? e.map((x) => x.value)
                            : [];
                          setVenue(selectedOptions);

                          // Only handle the case when selected options are LESS than all options
                          // and isEveryone is true - in this case, uncheck the Everyone checkbox
                          if (
                            selectedOptions.length < audienceOptions.length &&
                            isEveryone
                          ) {
                            setIsEveryone(false);
                          }
                          // Don't automatically set isEveryone to true when all options are selected manually
                        }}
                        isDisabled={isEveryone}
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        menuIsOpen={isAudienceMenuOpen}
                        onMenuOpen={() => setIsAudienceMenuOpen(true)}
                        onMenuClose={() => setIsAudienceMenuOpen(false)}
                        components={{
                          Option: CheckboxOption,
                          MultiValue: CustomMultiValue,
                          ValueContainer: CustomValueContainer,
                        }}
                        styles={{
                          control: (base) => ({
                            ...base,
                            width: '140px',
                            minHeight: '22px',
                            height: '22px',
                            fontSize: '11px',
                            borderColor: '#ccc',
                            backgroundColor: 'white',
                            borderRadius: '3px',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#999',
                            },
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: '11px',
                            padding: '6px 8px',
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '0px 6px',
                            fontSize: '11px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: '0 4px',
                            width: '16px',
                            height: '16px',
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            padding: '0 2px',
                            width: '16px',
                            height: '16px',
                          }),
                          indicatorSeparator: (base) => ({
                            ...base,
                            margin: '0px',
                          }),
                          singleValue: (base) => ({
                            ...base,
                            fontSize: '11px',
                          }),
                          menu: (base) => ({
                            ...base,
                            width: 'auto',
                            minWidth: '140px',
                          }),
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '10px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isEveryone}
                        onChange={handleCheckboxChange}
                        className="audience-checkbox"
                      />
                      &nbsp;All Venues
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Display Options */}
          <div className="display-options-panel responsive-panel">
            <div className="scrollable-content">
              <h2>Display Options</h2>

              <div className="form-group-displays expiry-section">
                <label>
                  <strong>Expiry</strong>
                </label>
                <div className="expiry-options">
                  <div
                    style={{
                      alignItems: 'center',
                      gap: '20px',
                      marginTop: '10px',
                    }}
                  >
                    <div className="radio-group" style={{ margin: 0 }}>
                      <input
                        type="radio"
                        id="never"
                        name="expiry"
                        value="never"
                        // checked={expiryType === "never"}
                        // onChange={() => handleExpiryChange("never")}
                      />
                      <label htmlFor="never">Never</label>
                    </div>
                    <div className="expiry-row-displays dates-row">
                      <div className="validFrom-label">
                        <input
                          type="radio"
                          id="validFrom"
                          name="expiry"
                          value="validFrom"
                          // checked={expiryType === "validFrom"}
                          // onChange={() => handleExpiryChange("validFrom")}
                        />
                        <label htmlFor="validFrom">Display between</label>
                      </div>
                      <div className="time-input-fields">
                        <div className="time-field">
                          <label>START DATE</label>
                          <input
                            type="date"
                            className="time-input"
                            // value={startDate}
                            // onChange={(e) =>
                            //   handleDateChange("start", e.target.value)
                            // }
                            // onClick={(e) => {
                            //   // Ensure expiry type is set to validFrom when clicking on date input
                            //   if (expiryType !== "validFrom") {
                            //     setExpiryType("validFrom");

                            //     // Also select the validFrom radio
                            //     const validFromRadio = document.getElementById("validFrom");
                            //     if (validFromRadio) {
                            //       validFromRadio.checked = true;
                            //     }
                            //   }
                            // }}
                            // disabled={expiryType !== "validFrom"}
                          />
                        </div>
                        <div className="time-field">
                          <label>END DATE</label>
                          <input
                            type="date"
                            className="time-input"
                            // value={endDate}
                            // onChange={(e) =>
                            //   handleDateChange("end", e.target.value)
                            // }
                            // onClick={(e) => {
                            //   // Ensure expiry type is set to validFrom when clicking on date input
                            //   if (expiryType !== "validFrom") {
                            //     setExpiryType("validFrom");

                            //     // Also select the validFrom radio
                            //     const validFromRadio = document.getElementById("validFrom");
                            //     if (validFromRadio) {
                            //       validFromRadio.checked = true;
                            //     }
                            //   }
                            // }}
                            // disabled={expiryType !== "validFrom"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* {expiryDaysError && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{expiryDaysError}</div>} */}

                  {/* {dateError && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{dateError}</div>} */}
                </div>
              </div>

              <div className="form-group days-section">
                <label>
                  <strong>Display on Days of the Week</strong>
                </label>
                <div className="days-options">
                  <div className="days-selector-displays">
                    <div className="day-item">
                      <input
                        type="checkbox"
                        id="everyday"
                        name="everyday"
                        // checked={validDays.everyday}
                        // onChange={() => handleDayChange("everyday")}
                      />
                      <label
                        htmlFor="everyday"
                        // onClick={(e) => {
                        //   e.preventDefault();
                        //   handleDayChange("everyday");
                        // }}
                      >
                        Everyday
                      </label>
                    </div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                      (day) => (
                        <div key={day} className="day-item">
                          <input
                            type="checkbox"
                            id={day.toLowerCase()}
                            name={day.toLowerCase()}
                            // checked={validDays[day.toLowerCase()]}
                            // onChange={() => handleDayChange(day.toLowerCase())}
                            // disabled={validDays.everyday}
                          />
                          <label
                            htmlFor={day.toLowerCase()}
                            // onClick={(e) => {
                            //   e.preventDefault();
                            //   if (!validDays.everyday) {
                            //     handleDayChange(day.toLowerCase());
                            //   }
                            // }}
                            // style={{
                            //   opacity: validDays.everyday ? 0.5 : 1
                            // }}
                          >
                            {day}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
                {/* {validDaysError && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{validDaysError}</div>} */}
              </div>

              <div className="form-group time-section">
                <label>
                  <strong>Display on following times</strong>
                </label>
                <div className="time-options">
                  <div className="radio-group">
                    <input
                      type="radio"
                      id="allTimes"
                      name="time"
                      value="allTimes"
                      // checked={timeValid.allTimes}
                      // onChange={() => handleTimeChange("allTimes")}
                    />
                    <label htmlFor="allTimes">All times</label>
                  </div>
                  <div className="time-inputs inline-form-group">
                    <div className="time-input-row">
                      <input
                        type="radio"
                        id="onlyBetween"
                        name="time"
                        value="onlyBetween"
                        // checked={!timeValid.allTimes}
                        // onChange={() => handleTimeChange("onlyBetween")}
                      />
                      <label htmlFor="onlyBetween">Only between</label>
                    </div>
                    <div className="time-input-fields">
                      <div className="time-field">
                        <label>START TIME</label>
                        <input
                          type="time"
                          className="time-input"
                          // value={timeValid.start}
                          // onChange={(e) =>
                          //   handleTimeInputChange("start", e.target.value)
                          // }
                          // disabled={timeValid.allTimes}
                        />
                      </div>
                      <div className="time-field">
                        <label>END TIME</label>
                        <input
                          type="time"
                          className="time-input"
                          // value={timeValid.end}
                          // onChange={(e) =>
                          //   handleTimeInputChange("end", e.target.value)
                          // }
                          // disabled={timeValid.allTimes}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* {timeError && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{timeError}</div>} */}
              </div>

              <div className="form-group inline-form-group">
                <label>
                  <strong>Set seconds image will appear for</strong>
                </label>
                <div style={{ marginBottom: '0' }}>
                  <input
                    type="text"
                    className="trigger-input"
                    placeholder=""
                    // value={triggerValue}
                    // onChange={(e) => setTriggerValue(e.target.value)}
                    style={{ height: '25px' }}
                  />
                </div>
                {/* {triggerValueError && <div className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '5px', marginLeft: '20px', width: '100%' }}>{triggerValueError}</div>} */}
              </div>
              {/* </> */}
              {/* )} */}
            </div>
            <button className='update-displays-btn button-icon icon-button'>UPDATE</button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="preview-section-displays">
          <h2 className="section-title">Preview</h2>

          <div className="preview-content">
            <div className="preview-voucher-container">
              <div style={{ display: 'flex' }}>
                <div
                  className="preview-image-container-m2m"
                  style={{ width: '100%', marginRight: '10px' }}
                >
                  <img
                    // src={image}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
            <p style={{color: '#000000', fontSize: '13px', textAlign: 'center'}}>Adverts Loaded &nbsp;<strong>10</strong></p>
            <button className="play-displays-btn button-icon icon-button">PLAY</button>
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

        <input
          type="file"
          // ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        {!isAddingNew ? (
          <>
            <button className="upload-displays-btn icon-button">
              <FaCloudUploadAlt className="button-icon" />
              UPLOAD NEW IMAGE
            </button>
            <button className="delete-displays-btn icon-button">
              <FaTrashAlt className="button-icon" />
              DELETE POST
            </button>
          </>
        ) : (
          <>
            <button className="upload-btn-add-new icon-button">
              <FaCloudUploadAlt className="button-icon" />
              UPLOAD NEW IMAGE
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Displays;
