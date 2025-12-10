import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Select from 'react-select';
import { Editor } from '@tinymce/tinymce-react';
import { uploadFileToS3 } from '../s3/config';
import { logout } from '../utils/auth';
import { trackMenuAccess, handleLogout } from '../utils/api';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

import {
  FaRegStar,
  FaTrashAlt,
  FaUpload,
  FaPlus,
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaPaintBrush,
} from 'react-icons/fa';
import '../styles/special-offers.css';
import axios from 'axios';
import { IoIosArrowDown, IoIosArrowUp, IoMdImage } from 'react-icons/io';

const SpecialOffers = () => {
  // track the Audience dropdown container
  const audienceWrapperRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  // Default to 'A' if userInitial is not provided
  // Get email from localStorage or use a default
  const email = localStorage.getItem('userEmail');
  const userInitial = email.charAt(0).toUpperCase();

  const [offers, setOffers] = useState([]);

  // Initialize selectedOffer with null, will be set after API fetch
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [activeTab, setActiveTab] = useState('live');

  // State to track whether we're in "add new offer" mode
  const [addMode, setAddMode] = useState(false);

  // State for image upload
  const [uploadedImage, setUploadedImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // State for scroll position in offers panel
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollStep = 100; // pixels to scroll per click

  // Target Market State
  const [voucherType, setVoucherType] = useState({
    value: '',
    label: 'Select from list',
  });
  // Add a state to track the currently selected voucher type for UI rendering
  const [selectedVoucherType, setSelectedVoucherType] = useState('standard');
  const [ratingLevel, setRatingLevel] = useState({
    value: '',
    label: 'Select from list',
  });
  const [expiryType, setExpiryType] = useState('never');
  const [expiryDays, setExpiryDays] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validDays, setValidDays] = useState({
    everyday: true,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
  });
  const [timeValid, setTimeValid] = useState({
    allTimes: true,
    start: '--:--',
    end: '--:--',
  });
  const [triggerValue, setTriggerValue] = useState('');
  const [oneTimeUse, setOneTimeUse] = useState(false);

  // Initialize headingText and descriptionText as empty, will be set after API fetch
  const [headingText, setHeadingText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Add new validation error states
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [expiryDaysError, setExpiryDaysError] = useState('');
  const [triggerValueError, setTriggerValueError] = useState('');

  // Add validation error states
  const [headingError, setHeadingError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [imageError, setImageError] = useState('');

  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);

  // multi‑select state for Audience
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [isEveryone, setIsEveryone] = useState(false);

  const toggleAudienceDropdown = () => {
    if (!isEveryone) {
      setShowAudienceDropdown((open) => !open);
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
    // Options for audience selection
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  } else if (selectedVenue === 'StarReward') {
    // Options for audience selection
    audienceOptions = [
      { value: 'Staff Pre 3Mth', label: 'Staff Pre 3Mth' },
      { value: 'Star Staff', label: 'Star Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Platinum Black', label: 'Platinum Black' },
    ];
  } else if (selectedVenue === 'Manly') {
    // Options for audience selection

    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Crewmate', label: 'Crewmate' },
      { value: 'Lieutenant', label: 'Lieutenant' },
      { value: 'Commander', label: 'Commander' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commodore', label: 'Commodore' },
    ];
  } else if (selectedVenue === 'Hogan') {
    audienceOptions = [
      { value: 'Bronze', label: 'Bronze' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Staff', label: 'Staff' },
      { value: 'Management', label: 'Management' },
      { value: 'Family', label: 'Family' },
      { value: 'Directors', label: 'Directors' },
    ];
  } else if (selectedVenue === 'North') {
    audienceOptions = [
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
      // { value: 'Pre Staff', label: 'Pre Staff' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Staff', label: 'Staff' },
      // { value: 'Valued', label: 'Valued' },
    ];
  } else if (selectedVenue === 'Montauk' || selectedVenue === 'Central') {
    audienceOptions = [
      { value: 'Premium Member', label: 'Premium Member' },
      { value: 'Member', label: 'Member' },
      { value: 'Staff', label: 'Staff' },
    ];
  } else if (selectedVenue === 'Ace') {
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Tens', label: 'Tens' },
      { value: 'Jacks', label: 'Jacks' },
      { value: 'Queens', label: 'Queens' },
      { value: 'Kings', label: 'Kings' },
      { value: 'Ace', label: 'Ace' },
      { value: 'Ace Plus', label: 'Ace Plus' },
    ];
  } else if (selectedVenue === 'Queens') {
    audienceOptions = [
      { value: 'Queens', label: 'Queens' },
      { value: 'Ruby', label: 'Ruby' },
      { value: 'Emerald', label: 'Emerald' },
      { value: 'Sapphire', label: 'Sapphire' },
      { value: 'Diamond', label: 'Diamond' },
      { value: 'Diamond Plus', label: 'Diamond Plus' },
      { value: 'Curtis Coast', label: 'Curtis Coast' },
    ];
  } else if (selectedVenue === 'Brisbane') {
    audienceOptions = [
      { value: 'Brew Crew', label: 'Brew Crew' },
      { value: 'Member', label: 'Member' },
      { value: 'Regular', label: 'Regular' },
      { value: 'Champion', label: 'Champion' },
      { value: 'Legend', label: 'Legend' },
    ];
  } else if (selectedVenue === 'Bluewater') {
    audienceOptions = [
      { value: 'Deckhand', label: 'Deckhand' },
      { value: 'First Mate', label: 'First Mate' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commodore', label: 'Commodore' },
      { value: 'Admiral', label: 'Admiral' },
    ];
  } else if (selectedVenue === 'Flinders') {
    audienceOptions = [
      { value: 'Staff', label: 'Staff' }, 
      { value: 'Member', label: 'Member' },
      { value: 'Corporate', label: 'Corporate' },
      { value: 'VIP', label: 'VIP' },
    ];
  } else {
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  }

  // Helper function to get rating level from audience option
  // const getRatingLevelFromAudience = (audienceValue) => {
  //   const option = audienceOptions.find((opt) => opt.value === audienceValue);
  //   return option ? [option.label] : [];
  // };

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/offer/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Extract the vouchers from the nested structure
        let vouchers = [];
        if (data && data.success && data.data) {
          if (activeTab === 'live' && Array.isArray(data.data.liveData)) {
            vouchers = data.data.liveData;
          } else if (
            activeTab === 'expired' &&
            Array.isArray(data.data.expiryData)
          ) {
            vouchers = data.data.expiryData;
          }
        }

        // Check if we have a selected offer that we want to keep
        const currentOfferId = selectedOffer?._id;

        // Update offers list
        setOffers(vouchers);

        // Skip further processing if we're returning from Art Gallery with an image
        if (location.state?.selectedImageFromGallery) {
          return;
        }

        if (vouchers.length > 0) {
          // If we have a current offer, try to find it in the updated list
          let offerToSelect = null;

          if (currentOfferId) {
            offerToSelect = vouchers.find(
              (offer) => offer._id === currentOfferId
            );
          }

          // If we couldn't find the current offer or don't have one, use the first offer
          if (!offerToSelect) {
            offerToSelect = vouchers[0];
          }

          // Only update the selected offer if it's different from the current one
          if (!selectedOffer || selectedOffer._id !== offerToSelect._id) {
            // Update the trigger value in state first
            setTriggerValue(offerToSelect.triggerValue?.toString() || '');

            // Then update the rest of the state
            setSelectedOffer(offerToSelect);
            setHeadingText(offerToSelect.header || '');
            setDescriptionText(offerToSelect.description || '');
            setUploadedImage(offerToSelect.image || null);
            setSelectedVoucherType(offerToSelect.voucherType || 'standard');
            setVoucherTypeFromAPI(offerToSelect.voucherType);
            setRatingLevelFromAPI(offerToSelect.ratingLevel);
            setExpiryFromAPI(offerToSelect.expiry);
            setValidDaysFromAPI(offerToSelect.validDaysOfWeek);
            setValidTimeFromAPI(offerToSelect.validTime);
            setOneTimeUse(offerToSelect.oneTimeUse || false);
            setAddMode(false);

            // Update trigger value in state only once
            // setTriggerValue(offerToSelect.triggerValue?.toString() || '');

            // Remove direct DOM manipulation for trigger inputs
            // The value will be set through React's state management
          }
        } else {
          // If no offers are found, clear the selected offer
          setSelectedOffer(null);
          setHeadingText('');
          setDescriptionText('');
          setUploadedImage(null);
          setTriggerValue('');
          setSelectedAudiences([]);
          setIsEveryone(false);
          setAddMode(false);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        toast.error('Failed to fetch offers. Please try again.');
      }
    };
    fetchOffers();
  }, [
    activeTab,
    deleteSuccess,
    location.state?.selectedImageFromGallery,
    selectedVenue,
    token,
  ]); // Added selectedImageFromGallery to dependencies

  // Helper functions to set target market fields from API data
  const setVoucherTypeFromAPI = (voucherType) => {
    if (!voucherType) return;

    const voucherTypeMap = {
      birthday: 'type1',
      new: 'type2',
      standard: 'type3',
    };

    const selectValue = voucherTypeMap[voucherType] || '';
    const newVoucherType =
      voucherType === 'birthday'
        ? 'birthdayOffer'
        : voucherType === 'new'
        ? 'newSignUp'
        : 'standard';

    // Update the select element value
    const selectElement = document.querySelector(
      '.target-market-panel select:first-of-type'
    );

    if (selectElement) {
      selectElement.value = selectValue;
    }

    // Update the React state
    setSelectedVoucherType(newVoucherType);
  };

  const setRatingLevelFromAPI = (ratingLevel) => {
    // If there's no data, clear everything
    if (!Array.isArray(ratingLevel) || ratingLevel.length === 0) {
      setSelectedAudiences([]);
      setIsEveryone(false);
      return;
    }

    // Map each returned LABEL (e.g. 'Staff', 'Gold') back to your value
    const mapLabelToValue = audienceOptions.reduce((m, o) => {
      m[o.value] = o.value;
      return m;
    }, {});

    // Get all available options
    const allOptions = audienceOptions.map((option) => option.value);

    // Special case: if ratingLevel is just ['everyone']
    if (ratingLevel.length === 1 && ratingLevel[0] === 'everyone') {
      setIsEveryone(true);
      setSelectedAudiences([...allOptions]);
      return;
    }

    // Handle other cases
    let newSelected = [];

    if (ratingLevel.includes('everyone')) {
      // If 'everyone' is in ratingLevel, check if all options are selected
      const allSelected = allOptions.every((option) =>
        ratingLevel.includes(option)
      );

      if (allSelected) {
        // If all options are selected, use them directly
        newSelected = [...allOptions];
      } else {
        // If not all options are selected, filter out 'everyone' and use the rest
        newSelected = ratingLevel
          .filter((label) => label !== 'everyone')
          .map((lbl) => mapLabelToValue[lbl])
          .filter(Boolean);
      }
    } else {
      // No 'everyone' in ratingLevel, just map the labels to values
      newSelected = ratingLevel
        .map((lbl) => mapLabelToValue[lbl])
        .filter(Boolean);
    }

    // Check if all available options are selected
    const allSelected = allOptions.every((option) =>
      newSelected.includes(option)
    );

    setIsEveryone(allSelected);
    setSelectedAudiences(allSelected ? allOptions : newSelected);
  };

  const setExpiryFromAPI = (expiry) => {
    if (!expiry) return;

    console.log('Setting expiry from API:', expiry);

    // Clear all expiry fields first to ensure no leftover values
    setExpiryDays('');
    setStartDate('');
    setEndDate('');

    // Clear input fields directly
    setTimeout(() => {
      // Clear days input
      const daysInput = document.querySelector(
        '.target-market-panel input[type="number"][placeholder="Days"]'
      );
      if (daysInput) {
        daysInput.value = '';
      }

      // Clear date inputs
      const dateInputs = document.querySelectorAll(
        '.target-market-panel input[type="date"]'
      );
      dateInputs.forEach((input) => {
        input.value = '';
      });
    }, 100);

    if (expiry.type === 'never') {
      setExpiryType('never');

      setTimeout(() => {
        const neverRadio = document.querySelector(
          '.target-market-panel input[type="radio"][value="never"]'
        );
        if (neverRadio) {
          neverRadio.checked = true;
          const event = new Event('change', { bubbles: true });
          neverRadio.dispatchEvent(event);
        }
      }, 200);
    } else if (expiry.type === 'onetime') {
      setExpiryType('oneTimeUse');

      setTimeout(() => {
        const onetimeRadio = document.querySelector(
          '.target-market-panel input[type="radio"][value="oneTimeUse"]'
        );
        if (onetimeRadio) {
          onetimeRadio.checked = true;
          const event = new Event('change', { bubbles: true });
          onetimeRadio.dispatchEvent(event);
        }
      }, 200);
    } else if (expiry.type === 'expiresInDays' && expiry.expiresInDays) {
      setExpiryType('expiresIn');
      setExpiryDays(expiry.expiresInDays.toString());

      setTimeout(() => {
        // Set radio button
        const expiresInRadio = document.querySelector(
          '.target-market-panel input[type="radio"][value="expiresIn"]'
        );
        if (expiresInRadio) {
          expiresInRadio.checked = true;
          const event = new Event('change', { bubbles: true });
          expiresInRadio.dispatchEvent(event);
        }

        // Set days input
        const daysInput = document.querySelector(
          '.target-market-panel input[type="number"][placeholder="Days"], .target-market-panel input[type="text"][placeholder=""]'
        );
        if (daysInput) {
          daysInput.value = expiry.expiresInDays.toString();
          const event = new Event('change', { bubbles: true });
          daysInput.dispatchEvent(event);
        }
      }, 200);
    } else if (expiry.type === 'validFromTo') {
      setExpiryType('validFrom');

      // Convert ISO date strings to YYYY-MM-DD format for input fields
      const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      const validFrom = formatDate(expiry.validFrom);
      const validTo = formatDate(expiry.validTo);

      console.log('Setting valid from:', validFrom, 'to:', validTo);

      setStartDate(validFrom);
      setEndDate(validTo);

      // Also update the date input fields directly
      setTimeout(() => {
        // Set radio button first
        const validFromRadio = document.querySelector(
          '.target-market-panel input[type="radio"][value="validFrom"]'
        );
        if (validFromRadio) {
          validFromRadio.checked = true;
          const event = new Event('change', { bubbles: true });
          validFromRadio.dispatchEvent(event);
        }

        // Find date inputs by looking for inputs within the expiry section
        const dateInputs = document.querySelectorAll(
          '.target-market-panel .expiry-row.dates-row input[type="date"]'
        );

        if (dateInputs.length >= 2) {
          // Start date
          dateInputs[0].value = validFrom;
          const startEvent = new Event('change', { bubbles: true });
          dateInputs[0].dispatchEvent(startEvent);

          // End date
          dateInputs[1].value = validTo;
          const endEvent = new Event('change', { bubbles: true });
          dateInputs[1].dispatchEvent(endEvent);
        } else {
          console.error(
            'Date input fields not found, trying alternative selector'
          );

          // Try alternative selector
          const startDateInput = document.querySelector(
            '.target-market-panel .time-input-fields input[type="date"]:first-of-type'
          );
          const endDateInput = document.querySelector(
            '.target-market-panel .time-input-fields input[type="date"]:last-of-type'
          );

          if (startDateInput) {
            startDateInput.value = validFrom;
            const event = new Event('change', { bubbles: true });
            startDateInput.dispatchEvent(event);
          }

          if (endDateInput) {
            endDateInput.value = validTo;
            const event = new Event('change', { bubbles: true });
            endDateInput.dispatchEvent(event);
          }
        }
      }, 300);
    }
  };

  const setValidDaysFromAPI = (validDays) => {
    if (!validDays || !Array.isArray(validDays)) return;

    // Check for both cases of "Everyday" in the array
    if (validDays.includes('Everyday') || validDays.includes('everyday')) {
      setValidDays({
        everyday: true,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      });
    } else {
      // Initialize all days as false
      const newValidDays = {
        everyday: false,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      };

      // This should be the inverse of the mapping used in submitNewOffer
      // API returns full day names like "Monday" and we map them to abbreviated state keys like "mon"
      const dayMapping = {
        Monday: 'mon',
        Tuesday: 'tue',
        Wednesday: 'wed',
        Thursday: 'thu',
        Friday: 'fri',
        Saturday: 'sat',
        Sunday: 'sun',
      };

      // Also handle lowercase variant for robustness
      const lowercaseDayMapping = {
        monday: 'mon',
        tuesday: 'tue',
        wednesday: 'wed',
        thursday: 'thu',
        friday: 'fri',
        saturday: 'sat',
        sunday: 'sun',
      };

      validDays.forEach((day) => {
        // Try first with the proper case mapping
        let shortDay = dayMapping[day];

        // If not found, try with lowercase
        if (!shortDay) {
          shortDay = lowercaseDayMapping[day.toLowerCase()];
        }

        if (shortDay) {
          newValidDays[shortDay] = true;
        }
      });

      setValidDays(newValidDays);
    }
  };

  const setValidTimeFromAPI = (validTime) => {
    if (!validTime) return;

    console.log('Setting valid time from API:', validTime);

    if (validTime.type === 'all-time') {
      setTimeValid({
        allTimes: true,
        start: '--:--',
        end: '--:--',
      });

      // Update radio button
      setTimeout(() => {
        const allTimesRadio = document.querySelector(
          '.target-market-panel input[type="radio"][value="allTimes"]'
        );
        if (allTimesRadio) {
          allTimesRadio.checked = true;
          const event = new Event('change', { bubbles: true });
          allTimesRadio.dispatchEvent(event);
        }
      }, 300);
    } else if (validTime.type === 'onlybetween') {
      const startTime = validTime.startTime || '--:--';
      const endTime = validTime.endTime || '--:--';

      console.log('Setting time range:', startTime, 'to', endTime);

      setTimeValid({
        allTimes: false,
        start: startTime,
        end: endTime,
      });

      // Update radio button and time inputs
      setTimeout(() => {
        // Set the radio button
        const betweenRadio = document.querySelector(
          '.target-market-panel input[type="radio"][value="between"]'
        );
        if (betweenRadio) {
          betweenRadio.checked = true;
          const event = new Event('change', { bubbles: true });
          betweenRadio.dispatchEvent(event);
        }

        // Set the time inputs - try different selectors
        const timeSection = document.querySelector(
          '.target-market-panel .time-section'
        );
        if (timeSection) {
          const timeInputs = timeSection.querySelectorAll('input[type="time"]');
          console.log('Found time inputs:', timeInputs.length);

          if (timeInputs.length >= 2) {
            // Start time
            timeInputs[0].value = startTime;
            timeInputs[0].dispatchEvent(new Event('change', { bubbles: true }));

            // End time
            timeInputs[1].value = endTime;
            timeInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          // Fallback to a more general selector
          const allTimeInputs = document.querySelectorAll(
            '.target-market-panel input[type="time"]'
          );
          console.log('Found all time inputs:', allTimeInputs.length);

          if (allTimeInputs.length >= 2) {
            // Start time
            allTimeInputs[0].value = startTime;
            allTimeInputs[0].dispatchEvent(
              new Event('change', { bubbles: true })
            );

            // End time
            allTimeInputs[1].value = endTime;
            allTimeInputs[1].dispatchEvent(
              new Event('change', { bubbles: true })
            );
          }
        }
      }, 300);
    }
  };

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
    navigate(path);
  };

  // Revert to a simpler day selection handler that at least allows one selection
  const handleDayChange = (day) => {
    if (day === 'everyday') {
      // If everyday is selected, deselect all other days
      setValidDays((prev) => ({
        everyday: !prev.everyday,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      }));
    } else {
      // For individual days, toggle the selection and turn off "everyday"
      setValidDays((prev) => ({
        ...prev,
        [day]: !prev[day],
        everyday: false,
      }));
    }
  };

  // Handle time selection
  const handleTimeChange = (type) => {
    setTimeValid({
      ...timeValid,
      allTimes: type === 'allTimes',
      // Clear time values if switching to all times
      ...(type === 'allTimes' ? { start: '--:--', end: '--:--' } : {}),
    });

    // Also clear the input fields directly if switching to all times
    if (type === 'allTimes') {
      setTimeout(() => {
        const timeInputs = document.querySelectorAll(
          '.target-market-panel input[type="time"]'
        );
        timeInputs.forEach((input) => {
          input.value = '';
        });
      }, 100);
    }
  };

  // Handle expiry selection
  const handleExpiryChange = (type) => {
    setExpiryType(type);

    // Clear fields based on the type selected
    if (type !== 'validFrom') {
      // Clear date fields when switching from validFrom to any other type
      setStartDate('');
      setEndDate('');

      // Clear date input fields directly
      setTimeout(() => {
        const dateInputs = document.querySelectorAll(
          '.target-market-panel input[type="date"]'
        );
        dateInputs.forEach((input) => {
          input.value = '';
        });
      }, 100);
    }

    if (type !== 'expiresIn') {
      // Clear days field when not selecting expiresIn
      setExpiryDays('');

      // Clear days input field directly
      setTimeout(() => {
        const daysInput = document.querySelector(
          '.target-market-panel input[type="number"][placeholder="Days"]'
        );
        if (daysInput) {
          daysInput.value = '';
        }
      }, 100);
    }
  };

  // Handle when an offer is selected from the list
  const handleOfferSelect = (offer) => {
    // Set the selected offer
    setSelectedOffer(offer);

    // Exit add mode if we're in it
    if (addMode) setAddMode(false);

    // Make sure to set heading and description directly from the offer
    setHeadingText(offer.header || '');
    setDescriptionText(offer.description || '');
    setUploadedImage(offer.image || null);

    // Set the voucher type to the one from the offer
    const voucherType = offer.voucherType || 'standard';
    setSelectedVoucherType(voucherType);

    // Always set the trigger value regardless of voucher type
    setTriggerValue(offer.triggerValue?.toString() || '');

    // Map the voucher type to select value
    const voucherTypeSelectValue =
      {
        birthday: 'type1',
        new: 'type2',
        standard: 'type3',
      }[voucherType] || 'type3';

    // Set select elements directly - for immediate UI update
    setTimeout(() => {
      // Set voucher type select
      const voucherTypeSelect = document.querySelector(
        '.target-market-panel select:first-of-type'
      );
      if (voucherTypeSelect) {
        voucherTypeSelect.value = voucherTypeSelectValue;
        const event = new Event('change', { bubbles: true });
        voucherTypeSelect.dispatchEvent(event);
      }
    }, 100);

    // Set the audience from the offer
    setRatingLevelFromAPI(offer.ratingLevel);

    // Set the expiry type and related values
    setExpiryFromAPI(offer.expiry);

    // Initialize oneTimeUse
    setOneTimeUse(offer.oneTimeUse || false);

    // Set the valid days if applicable for this voucher type
    if (voucherType === 'standard') {
      setValidDaysFromAPI(offer.validDaysOfWeek);

      // Set the time valid
      setValidTimeFromAPI(offer.validTime);
    } else if (voucherType === 'new') {
      // For new sign up voucher, handle start and end date if available
      if (offer.expiry && offer.expiry.validFrom && offer.expiry.validTo) {
        const formatDate = (dateString) => {
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
          } catch (error) {
            console.error('Error formatting date:', error);
            return '';
          }
        };

        const validFrom = formatDate(offer.expiry.validFrom);
        const validTo = formatDate(offer.expiry.validTo);

        console.log(
          'Setting new voucher dates - from:',
          validFrom,
          'to:',
          validTo
        );

        setStartDate(validFrom);
        setEndDate(validTo);

        // Force expiry type to validFrom for new sign up vouchers
        setExpiryType('validFrom');

        // Update the date input fields directly
        setTimeout(() => {
          // Find date inputs by looking for inputs within the dates section
          const dateInputs = document.querySelectorAll(
            '.target-market-panel .time-input-fields input[type="date"]'
          );

          if (dateInputs.length >= 2) {
            // Start date
            dateInputs[0].value = validFrom;
            dateInputs[0].dispatchEvent(new Event('change', { bubbles: true }));

            // End date
            dateInputs[1].value = validTo;
            dateInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 200);
      }
    }

    // Ensure the trigger value is displayed correctly in the UI by directly setting the input value
    setTimeout(() => {
      const triggerInputs = document.querySelectorAll('.trigger-input');
      triggerInputs.forEach((input) => {
        input.value = offer.triggerValue?.toString() || '';
      });
    }, 300);
  };

  // Handle add new offer button click
  const handleAddNewOffer = () => {
    // Set selectedOffer to null to disconnect from any existing offer data
    setSelectedOffer(null);

    setAddMode(true);
    setHeadingText(''); // Clear heading field
    setDescriptionText(''); // Clear description field
    setUploadedImage(null); // Clear uploaded image
    // Reset trigger value in state
    setTriggerValue('');

    // Immediately clear trigger input fields - do this first
    const triggerInputs = document.querySelectorAll('.trigger-input');
    triggerInputs.forEach((input) => {
      input.value = '';
    });

    // Reset Target market fields to default values
    setTimeout(() => {
      // Reset voucher type to default (first option)
      const voucherTypeSelect = document.querySelector(
        '.target-market-panel select:first-of-type'
      );
      if (voucherTypeSelect) {
        voucherTypeSelect.value = 'type3'; // Default to standard
        const event = new Event('change', { bubbles: true });
        voucherTypeSelect.dispatchEvent(event);
      }

      // Reset audience to default (first option)
      const ratingLevelSelect = document.querySelector(
        '.target-market-panel select[name="rating-level"]'
      );
      if (ratingLevelSelect) {
        ratingLevelSelect.value = 'everyone'; // Default to everyone
        const event = new Event('change', { bubbles: true });
        ratingLevelSelect.dispatchEvent(event);
      }

      // Reset expiry type to default
      setExpiryType('never');
      setExpiryDays('');
      setStartDate('');
      setEndDate('');

      // Reset valid days to default
      setValidDays({
        everyday: true,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      });

      // Reset valid time to default
      setTimeValid({
        allTimes: true,
        start: '--:--',
        end: '--:--',
      });

      // Reset one time use to default
      setOneTimeUse(false);

      // Clear trigger inputs again after other changes
      setTimeout(() => {
        const triggerInputsAgain = document.querySelectorAll('.trigger-input');
        triggerInputsAgain.forEach((input) => {
          input.value = '';
        });
      }, 50);
    }, 100);
  };

  // Handle scroll in offers panel
  const handleScroll = (direction) => {
    const offersListElement = document.querySelector('.offers-list');
    if (offersListElement) {
      const newPosition =
        direction === 'up'
          ? Math.max(0, scrollPosition - scrollStep)
          : scrollPosition + scrollStep;

      offersListElement.scrollTop = newPosition;
      setScrollPosition(newPosition);
    }
  };

  // Trigger file input click - Updated to ensure it works in all scenarios
  // const triggerFileInput = () => {
  //   if (fileInputRef.current) {
  //     // Reset the input value to ensure onChange fires even if the same file is selected
  //     fileInputRef.current.value = '';
  //     fileInputRef.current.click();
  //   }
  // };

  // Function to handle navigating to Art Gallery
  const handleUploadFromArtGallery = () => {
    // Get current ID from selectedOffer if available
    const currentId = selectedOffer?._id || null;

    console.log('Current selected offer ID:', currentId);

    // Get audience value
    let ratingLevelValue = '';
    const ratingLevelSelect = document.querySelector(
      '.target-market-panel select[name="rating-level"]'
    );
    if (ratingLevelSelect) {
      ratingLevelValue = ratingLevelSelect.value;
    }

    // Get voucher type value
    let voucherTypeValue = '';
    const voucherTypeSelect = document.querySelector(
      '.target-market-panel select:first-of-type'
    );
    if (voucherTypeSelect) {
      voucherTypeValue = voucherTypeSelect.value;
    }

    // Create form values object with all current form state
    const formValues = {
      id: currentId,
      headingText,
      descriptionText,
      voucherTypeValue,
      ratingLevelValue,
      expiryType,
      expiryDays,
      startDate,
      endDate,
      validDays: { ...validDays },
      timeValid: { ...timeValid },
      triggerValue,
      oneTimeUse,
    };

    console.log('Sending form values to Art Gallery:', formValues);

    // Navigate to art gallery with state using react-router navigate
    navigate('/art-gallery', {
      state: {
        email,
        returnTo: '/special-offers',
        advertType: 'Special-Offers',
        isAddingNew: addMode,
        formValues,
      },
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const s3Url = await uploadFileToS3(file);
        console.log(s3Url);
        setUploadedImage(s3Url);

        // Update selectedOffer's image if we have one, regardless of addMode
        if (selectedOffer) {
          setSelectedOffer({
            ...selectedOffer,
            image: s3Url,
          });
        }
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        toast.error('Failed to upload image. Please try again.');
      }
    }
  };

  // Compress image to reduce payload size
  // const compressImage = (dataUrl, maxWidth, maxHeight, quality) => {
  //   const img = new Image();
  //   img.onload = () => {
  //     let width = img.width;
  //     let height = img.height;

  //     // Calculate new dimensions while maintaining aspect ratio
  //     if (width > maxWidth) {
  //       height = Math.round((height * maxWidth) / width);
  //       width = maxWidth;
  //     }
  //     if (height > maxHeight) {
  //       width = Math.round((width * maxHeight) / height);
  //       height = maxHeight;
  //     }

  //     const canvas = document.createElement('canvas');
  //     canvas.width = width;
  //     canvas.height = height;

  //     const ctx = canvas.getContext('2d');
  //     ctx.drawImage(img, 0, 0, width, height);

  //     // Get compressed image data
  //     const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  //     setImagePreview(compressedDataUrl);
  //   };
  //   img.src = dataUrl;
  // };

  // Handle time input changes
  const handleTimeInputChange = (field, value) => {
    setTimeValid({
      ...timeValid,
      [field]: value,
    });
  };

  // Handle date input changes
  const handleDateChange = (field, value) => {
    if (field === 'start') {
      setStartDate(value);
    } else if (field === 'end') {
      setEndDate(value);
    }

    // IMPORTANT: Always force expiry type to validFrom when selecting dates
    setExpiryType('validFrom');

    // Also manually set the radio button checked state
    setTimeout(() => {
      const validFromRadio = document.getElementById('validFrom');
      if (validFromRadio) {
        validFromRadio.checked = true;
      }
    }, 0);
  };

  // For dynamic updating of heading/description in Current post section
  const handleHeadingChange = (e) => {
    const newHeading = e.target.value;
    setHeadingText(newHeading);
    // Update selectedOffer to reflect change in UI immediately
    if (selectedOffer && !addMode) {
      setSelectedOffer({
        ...selectedOffer,
        header: newHeading,
      });
    }
  };

  // For dynamic updating of heading/description in Current post section
  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescriptionText(newDescription);
    // Update selectedOffer to reflect change in UI immediately
    if (selectedOffer && !addMode) {
      setSelectedOffer({
        ...selectedOffer,
        description: newDescription,
      });
    }
  };

  // Add validation error state for day selection
  const [validDaysError, setValidDaysError] = useState('');

  // Function to validate days selection before update
  const validateDaysSelection = () => {
    const hasAnyDaySelected =
      validDays.everyday ||
      validDays.mon ||
      validDays.tue ||
      validDays.wed ||
      validDays.thu ||
      validDays.fri ||
      validDays.sat ||
      validDays.sun;

    if (!hasAnyDaySelected) {
      setValidDaysError('Please select at least one day');
      return false;
    }

    setValidDaysError('');
    return true;
  };

  // Submit new offer
  const submitNewOffer = async () => {
    // Reset all validation errors
    setValidDaysError('');
    setDateError('');
    setTimeError('');
    setExpiryDaysError('');
    setTriggerValueError('');
    setHeadingError('');
    setDescriptionError('');
    setImageError('');

    // Validate required fields for publishing
    let hasValidationErrors = false;

    // Validate image
    if (!uploadedImage) {
      setImageError('Please upload an image');
      hasValidationErrors = true;
    }

    // Validate heading
    if (!headingText || headingText.trim() === '') {
      setHeadingError('Please enter a heading');
      hasValidationErrors = true;
    }

    // Validate description
    if (!descriptionText || descriptionText.trim() === '') {
      setDescriptionError('Please enter a description');
      hasValidationErrors = true;
    }

    // Get all select elements in the target market panel
    const selectElements = document.querySelectorAll(
      '.target-market-panel select'
    );

    // Get the selected voucher type from the first dropdown
    let voucherTypeValue = 'standard'; // Default
    if (selectElements.length > 0) {
      const voucherTypeSelect = selectElements[0];
      const voucherTypeMap = {
        type1: 'birthday',
        type2: 'new',
        type3: 'standard',
      };

      const selectedValue = voucherTypeSelect.value;
      if (voucherTypeMap[selectedValue]) {
        voucherTypeValue = voucherTypeMap[selectedValue];
      }
    }

    // Validate fields based on voucher type
    if (voucherTypeValue === 'standard' && !validateDaysSelection()) {
      hasValidationErrors = true;
    }

    // Validate date fields if "validFrom" is selected (for standard and new voucher types)
    if (
      (voucherTypeValue === 'standard' || voucherTypeValue === 'new') &&
      expiryType === 'validFrom'
    ) {
      if (!startDate || !endDate) {
        setDateError('Both start date and end date are required');
        hasValidationErrors = true;
      } else if (new Date(startDate) > new Date(endDate)) {
        setDateError('Start date cannot be after end date');
        hasValidationErrors = true;
      }
    }

    // Validate time fields if "between" is selected (for standard voucher type only)
    if (voucherTypeValue === 'standard' && !timeValid.allTimes) {
      if (
        timeValid.start === '--:--' ||
        timeValid.end === '--:--' ||
        !timeValid.start ||
        !timeValid.end
      ) {
        setTimeError('Both start time and end time are required');
        hasValidationErrors = true;
      } else if (timeValid.start >= timeValid.end) {
        setTimeError('Start time must be before end time');
        hasValidationErrors = true;
      }
    }

    // Validate expiry days if "expiresIn" is selected (for standard voucher type only)
    if (voucherTypeValue === 'standard' && expiryType === 'expiresIn') {
      if (
        !expiryDays ||
        isNaN(parseInt(expiryDays)) ||
        parseInt(expiryDays) <= 0
      ) {
        setExpiryDaysError('Please enter a valid number of days');
        hasValidationErrors = true;
      }
    }

    // Validate trigger value for all voucher types
    if (!triggerValue || triggerValue.trim() === '') {
      setTriggerValueError('Trigger value is required');
      hasValidationErrors = true;
    }

    // If there are validation errors, stop submission
    if (hasValidationErrors) {
      // Display a general error message using toast
      toast.error('Please fix the form errors before publishing');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const imageData = uploadedImage || 'https://example.com/placeholder.jpg';

      // Get all select elements in the target market panel
      const selectElements = document.querySelectorAll(
        '.target-market-panel select'
      );

      // Get the selected voucher type from the first dropdown
      let voucherTypeValue = 'standard'; // Default
      if (selectElements.length > 0) {
        const voucherTypeSelect = selectElements[0];
        const voucherTypeMap = {
          type1: 'birthday',
          type2: 'new',
          type3: 'standard',
        };

        const selectedValue = voucherTypeSelect.value;
        if (voucherTypeMap[selectedValue]) {
          voucherTypeValue = voucherTypeMap[selectedValue];
        }
      }

      const ratingLevelArray = isEveryone
        ? // if “Everyone” is checked, send exactly ['everyone']
          ['everyone']
        : // otherwise, map whatever specific audiences were ticked to their labels
          selectedAudiences;

      // (optional) if you really want to guard against an empty array:
      if (ratingLevelArray.length === 0) {
        // default back to everyone rather than sending []
        ratingLevelArray.push('everyone');
      }

      // Create request body based on voucher type
      let requestBody = {
        header: headingText,
        description: descriptionText,
        voucherType: voucherTypeValue,
        ratingLevel: ratingLevelArray,
        triggerValue: triggerValue, // Always include trigger value for all voucher types
        image: imageData,
      };

      if (voucherTypeValue === 'standard') {
        // Prepare the expiry object based on the selected expiry type
        let expiryObj = {};

        if (expiryType === 'never') {
          expiryObj = {
            type: 'never',
          };
        } else if (expiryType === 'expiresIn' && expiryDays) {
          expiryObj = {
            type: 'expiresInDays',
            expiresInDays: parseInt(expiryDays),
          };
        } else if (expiryType === 'validFrom') {
          // Use the actual date inputs from the user
          expiryObj = {
            type: 'validFromTo',
            validFrom: startDate
              ? new Date(startDate + 'T00:00:00.000Z').toISOString()
              : new Date().toISOString(),
            validTo: endDate
              ? new Date(endDate + 'T23:59:59.000Z').toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }

        // Prepare the valid days array with the correct format expected by the API
        let validDaysArray = [];
        if (validDays.everyday) {
          validDaysArray = ['Everyday'];
        } else {
          // Map the abbreviated days to the full names required by the API
          const dayMapping = {
            mon: 'Monday',
            tue: 'Tuesday',
            wed: 'Wednesday',
            thu: 'Thursday',
            fri: 'Friday',
            sat: 'Saturday',
            sun: 'Sunday',
          };

          // Convert abbreviated days to full names
          validDaysArray = Object.keys(validDays)
            .filter((day) => validDays[day] && dayMapping[day])
            .map((day) => dayMapping[day]);

          // If no days are selected, default to everyday
          if (validDaysArray.length === 0) {
            validDaysArray = ['Everyday'];
          }
        }

        // Prepare the valid time object
        let validTimeObj = {};
        if (timeValid.allTimes) {
          validTimeObj = {
            type: 'all-time',
          };
        } else {
          validTimeObj = {
            type: 'onlybetween',
            startTime: timeValid.start || '09:00', // Default or from input
            endTime: timeValid.end || '18:00', // Default or from input
          };
        }

        // Add standard voucher specific properties to requestBody
        requestBody = {
          ...requestBody,
          expiry: expiryObj,
          oneTimeUse: oneTimeUse,
          validDaysOfWeek: validDaysArray,
          validTime: validTimeObj,
        };
      } else if (voucherTypeValue === 'new') {
        // Build the new sign up voucher request body
        if (expiryType === 'never') {
          requestBody = {
            ...requestBody,
            expiry: {
              type: 'never',
            },
          };
        } else {
          requestBody = {
            ...requestBody,
            expiry: {
              type: 'validFromTo',
              validFrom: startDate
                ? new Date(startDate + 'T00:00:00.000Z').toISOString()
                : new Date().toISOString(),
              validTo: endDate
                ? new Date(endDate + 'T23:59:59.000Z').toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          };
        }
      }
      // No additional properties needed for birthday voucher type

      console.log('Request Body:', requestBody);

      // Make the POST request to the new API endpoint
      const response = await fetch(`${baseUrl}/offer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('API Response:', data);

      toast.success('Offer submitted successfully!', {
        containerId: 'offerActions',
      });

      setAddMode(false);

      // Add a delay before refreshing the page
      setTimeout(() => {
        navigate('/special-offers');
      }, 1500); // 1.5 seconds delay
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error('Failed to submit offer. Please try again.');
    }
  };

  // Add useEffect to handle scroll events to prevent header overlap
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.app-header');
      if (!header) return;

      const headerHeight = header.offsetHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // // Add a class to the body when scrolling to ensure content stays below header
      // if (scrollTop > 0) {
      //   document.body.classList.add('is-scrolling');
      // } else {
      //   document.body.classList.remove('is-scrolling');
      // }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call to set correct state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDeleteVoucher = async (voucherId) => {
    try {
      const token = localStorage.getItem('token');

      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this Offer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel',
      });

      if (!result.isConfirmed) {
        return; // Exit if user cancels
      }

      const response = await axios.delete(`${baseUrl}/offer/delete`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        params: { id: voucherId }, // Passing voucher ID as a query parameter
      });

      if (response.status === 200) {
        toast.success('Voucher deleted successfully!');
        setDeleteSuccess((prevState) => !prevState);
        setOffers(offers.filter((offer) => offer._id !== voucherId));
      } else {
        throw new Error('Failed to delete voucher');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Failed to delete voucher. Please try again.');
    }
  };

  // Updated handleUpdateVoucher and submitNewOffer functions with validation
  const handleUpdateVoucher = async () => {
    if (!selectedOffer) {
      toast.error('No offer selected for update.');
      return;
    }

    // Reset all validation errors
    setValidDaysError('');
    setDateError('');
    setTimeError('');
    setExpiryDaysError('');
    setTriggerValueError('');
    setHeadingError('');
    setDescriptionError('');

    // Validate required fields for updating
    let hasValidationErrors = false;

    // Validate heading
    if (!headingText || headingText.trim() === '') {
      setHeadingError('Please enter a heading');
      hasValidationErrors = true;
    }

    // Validate description
    if (!descriptionText || descriptionText.trim() === '') {
      setDescriptionError('Please enter a description');
      hasValidationErrors = true;
    }

    // Get all select elements in the target market panel
    const selectElements = document.querySelectorAll(
      '.target-market-panel select'
    );

    // Get the selected voucher type from the first dropdown
    let voucherTypeValue = 'standard'; // Default
    if (selectElements.length > 0) {
      const voucherTypeSelect = selectElements[0];
      const voucherTypeMap = {
        type1: 'birthday',
        type2: 'new',
        type3: 'standard',
      };

      const selectedValue = voucherTypeSelect.value;
      if (voucherTypeMap[selectedValue]) {
        voucherTypeValue = voucherTypeMap[selectedValue];
      }
    }

    // Validate fields based on voucher type
    if (voucherTypeValue === 'standard' && !validateDaysSelection()) {
      hasValidationErrors = true;
    }

    // Validate date fields if "validFrom" is selected (for standard and new voucher types)
    if (
      (voucherTypeValue === 'standard' || voucherTypeValue === 'new') &&
      expiryType === 'validFrom'
    ) {
      if (!startDate || !endDate) {
        setDateError('Both start date and end date are required');
        hasValidationErrors = true;
      } else if (new Date(startDate) > new Date(endDate)) {
        setDateError('Start date cannot be after end date');
        hasValidationErrors = true;
      }
    }

    // Validate time fields if "between" is selected (for standard voucher type only)
    if (voucherTypeValue === 'standard' && !timeValid.allTimes) {
      if (
        timeValid.start === '--:--' ||
        timeValid.end === '--:--' ||
        !timeValid.start ||
        !timeValid.end
      ) {
        setTimeError('Both start time and end time are required');
        hasValidationErrors = true;
      } else if (timeValid.start >= timeValid.end) {
        setTimeError('Start time must be before end time');
        hasValidationErrors = true;
      }
    }

    // Validate expiry days if "expiresIn" is selected (for standard voucher type only)
    if (voucherTypeValue === 'standard' && expiryType === 'expiresIn') {
      if (
        !expiryDays ||
        isNaN(parseInt(expiryDays)) ||
        parseInt(expiryDays) <= 0
      ) {
        setExpiryDaysError('Please enter a valid number of days');
        hasValidationErrors = true;
      }
    }

    // Validate trigger value for all voucher types
    if (!triggerValue || triggerValue.trim() === '') {
      setTriggerValueError('Trigger value is required');
      hasValidationErrors = true;
    }

    // If there are validation errors, stop submission
    if (hasValidationErrors) {
      // Display a general error message using toast
      toast.error('Please fix the form errors before updating');
      return;
    }

    try {
      const ratingLevelArray = isEveryone
        ? // if “Everyone” is checked, send exactly ['everyone']
          ['everyone']
        : // otherwise, map whatever specific audiences were ticked to their labels
          selectedAudiences;

      // (optional) if you really want to guard against an empty array:
      if (ratingLevelArray.length === 0) {
        // default back to everyone rather than sending []
        ratingLevelArray.push('everyone');
      }

      // Use uploaded image if available, otherwise use the existing image
      const imageData = uploadedImage || selectedOffer.image;

      // Prepare the base request body with fields common to all voucher types
      let requestBody = {
        header: headingText,
        description: descriptionText,
        voucherType: voucherTypeValue,
        ratingLevel: ratingLevelArray,
        image: imageData,
        triggerValue: triggerValue, // Always include trigger value for all voucher types
      };

      if (voucherTypeValue === 'standard') {
        // Prepare the expiry object based on the selected expiry type
        let expiryObj = {};
        if (expiryType === 'never') {
          expiryObj = { type: 'never' };
        } else if (expiryType === 'expiresIn' && expiryDays) {
          expiryObj = {
            type: 'expiresInDays',
            expiresInDays: parseInt(expiryDays),
          };
        } else if (expiryType === 'validFrom') {
          expiryObj = {
            type: 'validFromTo',
            validFrom: startDate
              ? new Date(startDate + 'T00:00:00.000Z').toISOString()
              : new Date().toISOString(),
            validTo: endDate
              ? new Date(endDate + 'T23:59:59.000Z').toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }

        // Prepare the valid days array
        let validDaysArray = [];
        if (validDays.everyday) {
          validDaysArray = ['Everyday'];
        } else {
          const dayMapping = {
            mon: 'Monday',
            tue: 'Tuesday',
            wed: 'Wednesday',
            thu: 'Thursday',
            fri: 'Friday',
            sat: 'Saturday',
            sun: 'Sunday',
          };

          validDaysArray = Object.keys(validDays)
            .filter((day) => validDays[day] && dayMapping[day])
            .map((day) => dayMapping[day]);

          if (validDaysArray.length === 0) {
            validDaysArray = ['Everyday'];
          }
        }

        // Prepare the valid time object
        let validTimeObj = {};
        if (timeValid.allTimes) {
          validTimeObj = { type: 'all-time' };
        } else {
          validTimeObj = {
            type: 'onlybetween',
            startTime: timeValid.start || '09:00',
            endTime: timeValid.end || '18:00',
          };
        }

        // Add standard voucher specific fields
        requestBody = {
          ...requestBody,
          expiry: expiryObj,
          oneTimeUse: oneTimeUse,
          validDaysOfWeek: validDaysArray,
          validTime: validTimeObj,
        };
      } else if (voucherTypeValue === 'new') {
        // For new sign up voucher, check expiry type
        if (expiryType === 'never') {
          requestBody = {
            ...requestBody,
            expiry: {
              type: 'never',
            },
          };
        } else {
          requestBody = {
            ...requestBody,
            expiry: {
              type: 'validFromTo',
              validFrom: startDate
                ? new Date(startDate + 'T00:00:00.000Z').toISOString()
                : new Date().toISOString(),
              validTo: endDate
                ? new Date(endDate + 'T23:59:59.000Z').toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          };
        }
      }
      // No additional properties needed for birthday voucher type

      console.log('Update Request Body:', requestBody);

      const token = localStorage.getItem('token');

      // Make the PUT request
      const response = await fetch(
        `${baseUrl}/offer/update?offerId=${selectedOffer._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log('API Response:', data);
      if (response.ok && data.success) {
        // clear any previous toasts, then show a fresh one (will auto-close via your <ToastContainer autoClose={3000} />)
        // show a single, auto-closing toast (no duplicates, no manual dismiss)
        const id = toast.success(
          data.message || 'Offer updated successfully!',
          {
            containerId: 'offerActions',
            containerId: 'offerActions', // ← tie this toast to your single container
            autoClose: false,
            pauseOnHover: false,
            pauseOnFocusLoss: false,
          }
        );

        window.setTimeout(() => {
          if (toast.isActive(id)) {
            toast.dismiss(id);
          }
        }, 3000);

        // preserve a proper expiryDate so your UI’s “Valid to {expiryDate}” still prints
        const newExpiryDate =
          data.data.expiry?.validTo || selectedOffer.expiryDate;
        const updatedOffers = offers.map((offer) =>
          offer._id === selectedOffer._id
            ? {
                ...data.data,
                image: data.data.image || selectedOffer.image,
                expiryDate: newExpiryDate,
              }
            : offer
        );
        setOffers(updatedOffers);

        // Update the selected offer with the new data
        const updatedOffer = {
          ...data.data,
          image: data.data.image || selectedOffer.image,
          expiryDate: newExpiryDate,
        };
        setTriggerValue(updatedOffer.triggerValue?.toString() || '');
        setSelectedOffer(updatedOffer);

        // Update form state with the new dates
        if (updatedOffer.expiry?.type === 'validFromTo') {
          const formatDate = (dateString) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            } catch (error) {
              console.error('Error formatting date:', error);
              return '';
            }
          };

          const validFrom = formatDate(updatedOffer.expiry.validFrom);
          const validTo = formatDate(updatedOffer.expiry.validTo);

          setStartDate(validFrom);
          setEndDate(validTo);

          // Update the date inputs directly
          setTimeout(() => {
            const dateInputs = document.querySelectorAll(
              '.target-market-panel input[type="date"]'
            );

            if (dateInputs.length >= 2) {
              dateInputs[0].value = validFrom;
              dateInputs[1].value = validTo;
            }
          }, 100);
        }

        // Toggle deleteSuccess to trigger any necessary re-renders
        setDeleteSuccess((prev) => !prev);
      } else {
        throw new Error(data.message || 'Failed to update offer');
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer. Please try again.');
    }
  };

  // Add an onChange handler for the voucher type dropdown
  const handleVoucherTypeChange = (e) => {
    const selectedValue = e.target.value;
    // Map the select value to the corresponding voucher type
    setSelectedVoucherType(
      selectedValue === 'type1'
        ? 'birthdayOffer'
        : selectedValue === 'type2'
        ? 'newSignUp'
        : 'standard'
    );
  };

  // Update trigger value when selected offer changes
  useEffect(() => {
    if (selectedOffer) {
      setTriggerValue(selectedOffer.triggerValue?.toString() || '');
    }
  }, [selectedOffer?._id]); // Only run when selected offer ID changes

  useEffect(() => {
    console.log('addMode updated to:', addMode);
  }, [addMode]);

  // Add effect to check for selected image from Art Gallery
  useEffect(() => {
    // Check if we're coming back from Art Gallery with an image
    if (location.state?.selectedImageFromGallery) {
      const imageUrl = location.state.selectedImageFromGallery;
      setUploadedImage(imageUrl);

      // Preserve addMode state if it was set when navigating to Art Gallery
      if (location.state.isAddingNew !== undefined) {
        setAddMode(location.state.isAddingNew);
      }

      // If we have form values from Art Gallery, restore them
      if (location.state.formValues) {
        console.log(
          'Restoring form values from Art Gallery:',
          location.state.formValues
        );

        const {
          id,
          headingText: savedHeading,
          descriptionText: savedDescription,
          voucherTypeValue,
          ratingLevelValue,
          expiryType: savedExpiryType,
          expiryDays: savedExpiryDays,
          startDate: savedStartDate,
          endDate: savedEndDate,
          validDays: savedValidDays,
          timeValid: savedTimeValid,
          triggerValue: savedTriggerValue,
          oneTimeUse: savedOneTimeUse,
        } = location.state.formValues;

        // Preserve the current offer selection when returning from Art Gallery
        if (id) {
          // If we have an ID in formValues, try to find the offer in our offers array
          const existingOffer = offers.find((offer) => offer._id === id);

          if (existingOffer && !addMode) {
            // Update the found offer with the new image
            setSelectedOffer({
              ...existingOffer,
              image: imageUrl,
            });

            // Also make sure heading and description are preserved
            // setHeadingText(savedHeading || "");
            // setDescriptionText(savedDescription || "");
          }
        } else if (selectedOffer && !addMode) {
          // If no ID in formValues but we have a selectedOffer, just update its image
          setSelectedOffer({
            ...selectedOffer,
            image: imageUrl,
          });
        }

        // Only update heading and description if we're in add mode
        // if (addMode) {
        //   setHeadingText(savedHeading || "");
        //   setDescriptionText(savedDescription || "");
        // }

        // Reset form value processing to avoid any interference
        setTimeout(() => {
          // Restore other form values if they exist
          if (savedHeading) setHeadingText(savedHeading);
          if (savedDescription) setDescriptionText(savedDescription);
          if (savedExpiryType) setExpiryType(savedExpiryType);
          if (savedExpiryDays) setExpiryDays(savedExpiryDays);
          if (savedStartDate) setStartDate(savedStartDate);
          if (savedEndDate) setEndDate(savedEndDate);
          if (savedValidDays) setValidDays(savedValidDays);
          if (savedTimeValid) setTimeValid(savedTimeValid);
          if (savedTriggerValue) setTriggerValue(savedTriggerValue);
          if (savedOneTimeUse !== undefined) setOneTimeUse(savedOneTimeUse);

          // Set select elements - moved into the same setTimeout to ensure order
          // Set voucher type select
          if (voucherTypeValue) {
            const voucherTypeSelect = document.querySelector(
              '.target-market-panel select:first-of-type'
            );
            if (voucherTypeSelect) {
              voucherTypeSelect.value = voucherTypeValue;
              // Trigger change event
              const event = new Event('change', { bubbles: true });
              voucherTypeSelect.dispatchEvent(event);
            }
          }

          // Set rating level select
          if (ratingLevelValue) {
            const ratingLevelSelect = document.querySelector(
              '.target-market-panel select[name="rating-level"]'
            );
            if (ratingLevelSelect) {
              ratingLevelSelect.value = ratingLevelValue;
              // Trigger change event
              const event = new Event('change', { bubbles: true });
              ratingLevelSelect.dispatchEvent(event);
            }
          }
        }, 0);
      }

      // Clear location state to avoid reapplying when component re-renders
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state, addMode, offers]);

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

  const handleCardClick = async (accessItem, navigateTo) => {
    try {
      const result = await trackMenuAccess(accessItem);
      // Only navigate if the API call was successful
      if (result.success && navigateTo) {
        navigate(navigateTo, { state: { email } });
      }
      // No need for else if here since trackMenuAccess already shows the error toast
    } catch (error) {
      console.error('Error in handleCardClick:', error);
      // Error toast is already shown by trackMenuAccess
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

  return (
    <div className="digital-app-container-so">
      <header className="app-header">
        <div className="s2w-logo" onClick={async () => await handleLock()}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>
        <div className="header-buttons">
          {userType === 'admin' ? (
            <>
              <button
                className="digital-app-btn"
                onClick={() => handleCardClick('digital', '/digital-app')}
              >
                Digital App
              </button>
              <button
                className="market-to-members-btn"
                onClick={() => handleCardClick('m2m', '/market-to-members')}
              >
                Market to Members
              </button>
              {/* <button
                className="displays-btn"
                onClick={() => handleNavigation('/displays')}
              >
                Displays
              </button> */}
            </>
          ) : (
            <>
              {access.includes('digital') && (
                <button
                  className="digital-app-btn"
                  onClick={() => handleCardClick('digital', '/digital-app')}
                >
                  Digital App
                </button>
              )}
              {access.includes('m2m') && (
                <button
                  className="market-to-members-btn"
                  onClick={() => handleCardClick('m2m', '/market-to-members')}
                >
                  Market to Members
                </button>
              )}
              {/* {access.includes('displays') && (
                <button
                  className="displays-btn"
                  onClick={() => handleNavigation('/displays')}
                >
                  Displays
                </button>
              )} */}
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
                  // Reset all form state when switching venues
                  setSelectedAudiences([]);
                  setIsEveryone(false); // Reset the everyone state
                  setSelectedOffer(null);
                  setHeadingText('');
                  setDescriptionText('');
                  setUploadedImage(null);
                  setTriggerValue('');
                  setVoucherType({ value: '', label: 'Select from list' });
                  setRatingLevel({ value: '', label: 'Select from list' });
                  setExpiryType('never');
                  setExpiryDays('');
                  setStartDate('');
                  setEndDate('');
                  setValidDays({
                    everyday: true,
                    mon: false,
                    tue: false,
                    wed: false,
                    thu: false,
                    fri: false,
                    sat: false,
                    sun: false,
                  });
                  setTimeValid({
                    allTimes: true,
                    start: '--:--',
                    end: '--:--',
                  });
                  setOneTimeUse(false);

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

                      await handleLock();
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
        {selectedVenue === 'Ace' && (
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
        )}
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

      {offers.length === 0 && !addMode && activeTab === 'live' ? (
        <div className="btn-sp-offer" style={{ marginTop: '400px' }}>
          <button
            className="add-offer-button"
            onClick={handleAddNewOffer}
            style={{ width: '12%' }}
          >
            <FaPlus /> ADD YOUR FIRST OFFER
          </button>
        </div>
      ) : (
        <div className="page-container">
          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <div className="nav-tabs-so">
              <button
                className={`live-offers-btn ${
                  activeTab === 'live' ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveTab('live');
                  setAddMode(false);
                  setHeadingError('');
                  setDescriptionError('');
                  setImageError('');
                  setDateError('');
                  setTimeError('');
                  setExpiryDaysError('');
                  setTriggerValueError('');
                }}
              >
                Live Offers
              </button>
              <button
                className={`expired-offers-btn ${
                  activeTab === 'expired' ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveTab('expired');
                  setAddMode(false);
                  setHeadingError('');
                  setDescriptionError('');
                  setImageError('');
                  setDateError('');
                  setTimeError('');
                  setExpiryDaysError('');
                  setTriggerValueError('');
                }}
              >
                Expired Offers
              </button>
            </div>
            <button
              className="publish-button"
              onClick={addMode ? submitNewOffer : handleUpdateVoucher}
            >
              <FaUpload /> Publish
            </button>
          </div>

          <div className="special-offers-page">
            {/* Left Panel - Offers List */}
            <div className="offers-panel responsive-panel">
              <button
                className="nav-arrow up-arrow"
                aria-label="Scroll up"
                onClick={() => handleScroll('up')}
              >
                <IoIosArrowUp />
              </button>
              <div className="offers-list responsive-list">
                {offers.map((offer) => (
                  <div
                    key={offer._id}
                    className={`offer-card ${
                      selectedOffer?._id === offer._id ? 'selected' : ''
                    }`}
                    onClick={() => handleOfferSelect(offer)}
                  >
                    <img src={offer.image} alt={offer.header} />
                    <div className="offer-info">
                      <h3
                        style={{
                          fontWeight: 'bold',
                          color: 'black',
                          fontSize: '10px',
                          marginBottom: '0px',
                          // whiteSpace: 'nowrap',
                        }}
                      >
                        {offer.header}
                      </h3>

                      <p
                        style={{
                          color: 'black',
                          fontSize: '9px',
                          // textOverflow: 'ellipsis',
                          overflow: 'auto',
                          // display: '-webkit-box',
                          // WebkitLineClamp: 2,
                          // WebkitBoxOrient: 'vertical',
                          // marginBottom: '4px',
                          height: '30px',
                        }}
                      >
                        {offer.description}
                      </p>
                      <span
                        className="view-to-date"
                        style={{ fontSize: '8px', display: 'block' }}
                      >
                        Valid to{' '}
                        {offer.expiryDate
                          ? new Date(offer.expiryDate)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              .replace(/\//g, '-')
                          : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="nav-arrow down-arrow"
                aria-label="Scroll down"
                onClick={() => handleScroll('down')}
              >
                <IoIosArrowDown />
              </button>
            </div>

            {/* Center Panel - Current Post */}
            <div className="current-post-panel responsive-panel">
              <h2>Current post</h2>

              {addMode ? (
                <>
                  <div className="selected-offer-preview">
                    <div className="preview-image-container gray-placeholder">
                      {uploadedImage && (
                        <img src={uploadedImage} alt="Preview" />
                      )}
                    </div>
                    <div className="preview-details">
                      <h3>{headingText || 'Heading'}</h3>
                      <p>{descriptionText || 'Description'}</p>
                      <span className="view-to-date">Valid to date</span>
                    </div>
                  </div>

                  <div className="form-row">
                    <label>
                      <strong style={{ color: 'black' }}>Image</strong>
                      {/* <div className="image-ratio-note">
                      <span>
                        Recommended <br /> image ratio is 4:3
                      </span>
                    </div> */}
                    </label>
                    <div className="wh-bg">
                      <div className="image-input-container">
                        <div className="preview-image-container">
                          {uploadedImage ? (
                            <img src={uploadedImage} alt="Preview" />
                          ) : (
                            <button
                              className="upload-image-btn"
                              onClick={handleUploadFromArtGallery}
                            >
                              <IoMdImage /> UPLOAD IMAGE
                            </button>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>
                      {imageError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                          }}
                        >
                          {imageError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <label>
                      <strong>Heading</strong>
                    </label>
                    <div className="wh-bg1">
                      <input
                        type="text"
                        value={headingText}
                        onChange={handleHeadingChange}
                        placeholder=""
                        className={headingError ? 'error-input' : ''}
                      />
                      {headingError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                          }}
                        >
                          {headingError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <label>
                      <strong>Description</strong>
                    </label>
                    <div className="wh-bg2">
                      <textarea
                        value={descriptionText}
                        onChange={handleDescriptionChange}
                        placeholder=""
                        className={descriptionError ? 'error-input' : ''}
                      />
                      {descriptionError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                          }}
                        >
                          {descriptionError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="media-buttons">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <button
                      className="media-btn"
                      onClick={handleUploadFromArtGallery}
                    >
                      <IoMdImage />
                      UPLOAD IMAGE
                    </button>
                    <button
                      className="delete-post-btn"
                      onClick={() => setAddMode(false)}
                    >
                      <FaTrashAlt /> DELETE POST
                    </button>
                  </div>
                </>
              ) : (
                selectedOffer && (
                  <>
                    <div className="selected-offer-preview">
                      <div className="preview-image-container">
                        <img
                          src={uploadedImage || selectedOffer.image}
                          alt={selectedOffer.header}
                        />
                      </div>
                      <div className="preview-details">
                        <h3>{selectedOffer.header}</h3>
                        <p>{selectedOffer.description}</p>
                        <span className="view-to-date">
                          Valid to{' '}
                          {selectedOffer.expiryDate
                            ? new Date(selectedOffer.expiryDate)
                                .toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                                .replace(/\//g, '-')
                            : ''}
                        </span>
                      </div>
                    </div>

                    <div className="form-row">
                      <label>
                        <strong style={{ color: 'black' }}> Image</strong>
                        {/* <div className="image-ratio-note">
                        <span style={{ color: "black" }}>
                          Recommended <br /> image ratio is 4:3
                        </span>
                      </div> */}
                      </label>
                      <div className="wh-bg">
                        <div className="image-input-container">
                          <div className="preview-image-container">
                            <img
                              src={uploadedImage || selectedOffer.image}
                              alt="Preview"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <label>
                        <strong style={{ color: 'black' }}>Heading</strong>
                      </label>
                      <div className="wh-bg1">
                        <input
                          type="text"
                          value={headingText}
                          onChange={handleHeadingChange}
                          placeholder=""
                          className={headingError ? 'error-input' : ''}
                        />
                        {headingError && (
                          <div
                            className="error-message"
                            style={{
                              color: 'red',
                              fontSize: '12px',
                              marginTop: '5px',
                            }}
                          >
                            {headingError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <label>
                        <strong style={{ color: 'black' }}>Description</strong>
                      </label>
                      <div className="wh-bg2">
                        <textarea
                          value={descriptionText}
                          onChange={handleDescriptionChange}
                          placeholder=""
                          className={descriptionError ? 'error-input' : ''}
                        />
                        {descriptionError && (
                          <div
                            className="error-message"
                            style={{
                              color: 'red',
                              fontSize: '12px',
                              marginTop: '5px',
                            }}
                          >
                            {descriptionError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="media-buttons">
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                      <button
                        className="media-btn"
                        onClick={handleUploadFromArtGallery}
                      >
                        <IoMdImage />
                        UPLOAD IMAGE
                      </button>
                      <button
                        className="delete-post-btn"
                        onClick={() => handleDeleteVoucher(selectedOffer._id)}
                      >
                        <FaTrashAlt /> DELETE POST
                      </button>
                    </div>
                  </>
                )
              )}
            </div>

            {/* Right Panel - Target Market - Modified to match the image */}
            <div
              className="target-market-panel responsive-panel"
              style={
                selectedVoucherType === 'standard'
                  ? {
                      maxHeight: 'none',
                      height: 'auto',
                      overflowY: 'hidden',
                      paddingBottom: '30px',
                    }
                  : {}
              }
            >
              <div
                className="scrollable-content"
                style={
                  selectedVoucherType === 'standard'
                    ? { overflow: 'hidden' }
                    : {}
                }
              >
                <h2>Target market</h2>

                <div className="form-group inline-form-group">
                  <label>
                    <strong>Voucher type</strong>
                  </label>
                  <div className="select-wrapper">
                    <select defaultValue="" onChange={handleVoucherTypeChange}>
                      <option value="" disabled>
                        Select from list
                      </option>
                      <option value="type1">Birthday Offer</option>
                      <option value="type2">New Sign Up</option>
                      <option value="type3">Standard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group inline-form-group">
                  <label>
                    <strong>Audience</strong>
                  </label>
                  <div
                    className="select-wrapper"
                    style={{ position: 'relative' }}
                    ref={audienceWrapperRef}
                  >
                    <div
                      className="multiselect-display"
                      onClick={toggleAudienceDropdown}
                      style={{
                        cursor: isEveryone ? 'not-allowed' : 'pointer',
                        lineHeight: '35px',
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
                          zIndex: 10,
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
                              onChange={() =>
                                handleAudienceChange(option.value)
                              }
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

                {selectedVoucherType === 'standard' && (
                  <>
                    {/* One time use option */}
                    <div className="day-item">
                      <input
                        type="checkbox"
                        id="oneTimeUse"
                        name="oneTimeUse"
                        checked={oneTimeUse}
                        onChange={() => setOneTimeUse(!oneTimeUse)}
                      />
                      <label htmlFor="oneTimeUse">One time use</label>
                    </div>

                    <div className="form-group expiry-section">
                      <label>
                        <strong>Expiry</strong>
                      </label>
                      <div className="expiry-options">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                          }}
                        >
                          <div className="radio-group" style={{ margin: 0 }}>
                            <input
                              type="radio"
                              id="never"
                              name="expiry"
                              value="never"
                              checked={expiryType === 'never'}
                              onChange={() => handleExpiryChange('never')}
                            />
                            <label htmlFor="never">Never</label>
                          </div>

                          <div className="expiry-row" style={{ margin: 0 }}>
                            <input
                              type="radio"
                              id="expiresIn"
                              name="expiry"
                              value="expiresIn"
                              checked={expiryType === 'expiresIn'}
                              onChange={() => handleExpiryChange('expiresIn')}
                            />
                            <label htmlFor="expiresIn">Expires in</label>
                            <input
                              type="text"
                              placeholder=""
                              className="days-input"
                              value={expiryDays}
                              onChange={(e) => setExpiryDays(e.target.value)}
                            />
                            <span>days</span>
                          </div>
                        </div>
                        {expiryDaysError && (
                          <div
                            className="error-message"
                            style={{
                              color: 'red',
                              fontSize: '12px',
                              marginTop: '5px',
                            }}
                          >
                            {expiryDaysError}
                          </div>
                        )}

                        <div className="expiry-row dates-row">
                          <div className="validFrom-label">
                            <input
                              type="radio"
                              id="validFrom"
                              name="expiry"
                              value="validFrom"
                              checked={expiryType === 'validFrom'}
                              onChange={() => handleExpiryChange('validFrom')}
                            />
                            <label htmlFor="validFrom">Valid from</label>
                          </div>
                          <div className="time-input-fields">
                            <div className="time-field">
                              <label>START DATE</label>
                              <input
                                type="date"
                                className="time-input"
                                value={startDate}
                                onChange={(e) =>
                                  handleDateChange('start', e.target.value)
                                }
                                onClick={(e) => {
                                  // Ensure expiry type is set to validFrom when clicking on date input
                                  if (expiryType !== 'validFrom') {
                                    setExpiryType('validFrom');

                                    // Also select the validFrom radio
                                    const validFromRadio =
                                      document.getElementById('validFrom');
                                    if (validFromRadio) {
                                      validFromRadio.checked = true;
                                    }
                                  }
                                }}
                                disabled={expiryType !== 'validFrom'}
                              />
                            </div>
                            <div className="time-field">
                              <label>END DATE</label>
                              <input
                                type="date"
                                className="time-input"
                                value={endDate}
                                onChange={(e) =>
                                  handleDateChange('end', e.target.value)
                                }
                                onClick={(e) => {
                                  // Ensure expiry type is set to validFrom when clicking on date input
                                  if (expiryType !== 'validFrom') {
                                    setExpiryType('validFrom');

                                    // Also select the validFrom radio
                                    const validFromRadio =
                                      document.getElementById('validFrom');
                                    if (validFromRadio) {
                                      validFromRadio.checked = true;
                                    }
                                  }
                                }}
                                disabled={expiryType !== 'validFrom'}
                              />
                            </div>
                          </div>
                        </div>
                        {dateError && (
                          <div
                            className="error-message"
                            style={{
                              color: 'red',
                              fontSize: '12px',
                              marginTop: '5px',
                            }}
                          >
                            {dateError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group days-section">
                      <label>
                        <strong>Valid on Days of the Week</strong>
                      </label>
                      <div className="days-options">
                        <div className="days-selector">
                          <div className="day-item">
                            <input
                              type="checkbox"
                              id="everyday"
                              name="everyday"
                              checked={validDays.everyday}
                              onChange={() => handleDayChange('everyday')}
                            />
                            <label
                              htmlFor="everyday"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDayChange('everyday');
                              }}
                            >
                              Everyday
                            </label>
                          </div>
                          {[
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat',
                            'Sun',
                          ].map((day) => (
                            <div key={day} className="day-item">
                              <input
                                type="checkbox"
                                id={day.toLowerCase()}
                                name={day.toLowerCase()}
                                checked={validDays[day.toLowerCase()]}
                                onChange={() =>
                                  handleDayChange(day.toLowerCase())
                                }
                                disabled={validDays.everyday}
                              />
                              <label
                                htmlFor={day.toLowerCase()}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!validDays.everyday) {
                                    handleDayChange(day.toLowerCase());
                                  }
                                }}
                                style={{
                                  opacity: validDays.everyday ? 0.5 : 1,
                                }}
                              >
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {validDaysError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                          }}
                        >
                          {validDaysError}
                        </div>
                      )}
                    </div>

                    <div className="form-group time-section">
                      <label>
                        <strong>Valid on follow Time</strong>
                      </label>
                      <div className="time-options">
                        <div className="radio-group">
                          <input
                            type="radio"
                            id="allTimes"
                            name="time"
                            value="allTimes"
                            checked={timeValid.allTimes}
                            onChange={() => handleTimeChange('allTimes')}
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
                              checked={!timeValid.allTimes}
                              onChange={() => handleTimeChange('onlyBetween')}
                            />
                            <label htmlFor="onlyBetween">Only between</label>
                          </div>
                          <div className="time-input-fields">
                            <div className="time-field">
                              <label>START TIME</label>
                              <input
                                type="time"
                                className="time-input"
                                value={timeValid.start}
                                onChange={(e) =>
                                  handleTimeInputChange('start', e.target.value)
                                }
                                disabled={timeValid.allTimes}
                              />
                            </div>
                            <div className="time-field">
                              <label>END TIME</label>
                              <input
                                type="time"
                                className="time-input"
                                value={timeValid.end}
                                onChange={(e) =>
                                  handleTimeInputChange('end', e.target.value)
                                }
                                disabled={timeValid.allTimes}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {timeError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                          }}
                        >
                          {timeError}
                        </div>
                      )}
                    </div>

                    <div className="form-group inline-form-group">
                      <label>
                        <strong>Enter trigger value</strong>
                      </label>
                      <div style={{ marginBottom: '0' }}>
                        <input
                          type="text"
                          className="trigger-input"
                          placeholder=""
                          value={triggerValue}
                          onChange={(e) => setTriggerValue(e.target.value)}
                          style={{ height: '25px' }}
                        />
                      </div>
                      {triggerValueError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                            marginLeft: '20px',
                            width: '100%',
                          }}
                        >
                          {triggerValueError}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedVoucherType === 'birthdayOffer' && (
                  <>
                    <div style={{ marginTop: '50px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          textAlign: 'center',
                        }}
                      >
                        PLEASE NOTE
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '15px',
                          textAlign: 'center',
                        }}
                      >
                        Birthday offers will appear in the member's account on{' '}
                        <br />
                        the 1st day of the member's birth month.
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '30px',
                          textAlign: 'center',
                        }}
                      >
                        The vouchers will automatically remove themselves <br />
                        at the end of that month.
                      </p>
                    </div>

                    <div
                      className="form-group inline-form-group"
                      style={{ marginTop: '100px' }}
                    >
                      <label>
                        <strong>Enter trigger value</strong>
                      </label>
                      <div style={{ marginBottom: '0' }}>
                        <input
                          type="text"
                          className="trigger-input"
                          placeholder=""
                          value={triggerValue}
                          onChange={(e) => setTriggerValue(e.target.value)}
                          style={{ height: '25px' }}
                        />
                      </div>
                      {triggerValueError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                            marginLeft: '20px',
                            width: '100%',
                          }}
                        >
                          {triggerValueError}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedVoucherType === 'newSignUp' && (
                  <>
                    <div className="form-group expiry-section">
                      <label>
                        <strong>Expiry</strong>
                      </label>
                      <div className="expiry-options">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                          }}
                        >
                          <div className="radio-group" style={{ margin: 0 }}>
                            <input
                              type="radio"
                              id="never"
                              name="expiry"
                              value="never"
                              checked={expiryType === 'never'}
                              onChange={() => handleExpiryChange('never')}
                            />
                            <label htmlFor="never">Never</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="expiry-row dates-row">
                      <div className="validFrom-label">
                        <input
                          type="radio"
                          id="validFrom"
                          name="expiry"
                          value="validFrom"
                          checked={expiryType === 'validFrom'}
                          onChange={() => handleExpiryChange('validFrom')}
                        />
                        <label htmlFor="validFrom">Valid from</label>
                      </div>
                      <div className="time-input-fields">
                        <div className="time-field">
                          <label>START DATE</label>
                          <input
                            type="date"
                            className="time-input"
                            value={startDate}
                            onChange={(e) =>
                              handleDateChange('start', e.target.value)
                            }
                          />
                        </div>
                        <div className="time-field">
                          <label>END DATE</label>
                          <input
                            type="date"
                            className="time-input"
                            value={endDate}
                            onChange={(e) =>
                              handleDateChange('end', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          textAlign: 'center',
                        }}
                      >
                        PLEASE NOTE
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '30px',
                          textAlign: 'center',
                        }}
                      >
                        Any new member will receive this offer on signing up{' '}
                        <br />
                        for the 1st time.
                      </p>
                    </div>

                    <div
                      className="form-group inline-form-group"
                      style={{ marginTop: '60px' }}
                    >
                      <label>
                        <strong>Enter trigger value</strong>
                      </label>
                      <div style={{ marginBottom: '0' }}>
                        <input
                          type="text"
                          className="trigger-input"
                          placeholder=""
                          value={triggerValue}
                          onChange={(e) => setTriggerValue(e.target.value)}
                          style={{ height: '25px' }}
                        />
                      </div>
                      {triggerValueError && (
                        <div
                          className="error-message"
                          style={{
                            color: 'red',
                            fontSize: '12px',
                            marginTop: '5px',
                            marginLeft: '20px',
                            width: '100%',
                          }}
                        >
                          {triggerValueError}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!addMode && (
            <div className="btn-sp-offer">
              <button className="add-offer-button" onClick={handleAddNewOffer}>
                <FaPlus /> ADD NEW OFFER
              </button>
            </div>
          )}
        </div>
      )}

      <ToastContainer
        containerId="offerActions"
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        draggable
        pauseOnFocusLoss={false}
        pauseOnHover={false}
      />
    </div>
  );
};

export default SpecialOffers;
