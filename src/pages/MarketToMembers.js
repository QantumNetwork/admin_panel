import { useLocation, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaMobileAlt } from 'react-icons/fa';
import { IoPushOutline } from 'react-icons/io5';
import { BiTargetLock } from 'react-icons/bi';
import { logout } from '../utils/auth';
import { IoIosSend } from 'react-icons/io';
import axios from 'axios';
import Select from 'react-select';
import { useState, useEffect, useRef } from 'react';
import { uploadFileToS3 } from '../s3/config';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { trackMenuAccess, handleLogout } from '../utils/api';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

import '../styles/marketTomembers.css';

const MarketToMembers = () => {
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState('Push');
  const [selectedTargetMarket, setSelectedTargetMarket] =
    useState('Send to All');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [memberReach, setMemberReach] = useState('0');
  const [image, setImage] = useState(null);
  const [displayType, setDisplayType] = useState('immediate');
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [jobId, setJobId] = useState(null);

  // Add loading state
  const [isCalculating, setIsCalculating] = useState(false);
  const [filterRows, setFilterRows] = useState([
    {
      id: 1,
      field: 'Select Category',
      operator: 'Contains',
      value: '',
      options: [],
    },
  ]);
  const [filterValueOptions, setFilterValueOptions] = useState({});
  const [filteredOptions, setFilteredOptions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});

  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');
  const [isReusing, setIsReusing] = useState(false);
  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);

  const [sendingNow, setSendingNow] = useState(false);

  const navigate = useNavigate();

  const handleSuggestionToggle = (id, state) => {
    if (state) {
      setShowSuggestions({ [id]: true }); // Only one open at a time
    } else {
      setShowSuggestions((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Fields that require API call when selected
  const apiCallFields = [
    'Date Of Birth',
    'Age',
    'Postcode',
    'State',
    'Gender',
    'Mobile Number',
    'Card Number',
    'Membership Type',
    'Membership Category',
    'Rating Tier',
  ];

  // Fields that require new API endpoint
  const newApiCallFields = [
    'Meals',
    'Drinks',
    'Last Visit Date',
    'Venue',
    'Retail',
    'On Premise',
    'Gaming',
    'Date Joined',
    'Location Brand',
    'Product Category',
    'Drink Category',
  ];

  // Mapping for field names to API query parameters
  const fieldToApiParam = {
    Meals: 'Food',
    Drinks: 'Drinks',
    'Last Visit Date': 'LastVisitDate',
    Venue: 'VenueName',
    Retail: 'Retail',
    'On Premise': 'OnPremise',
    Gaming: 'Gaming',
    'Date Joined': 'DateJoined',
    'Location Brand': 'LocationBrands',
    'Product Category': 'ProductType',
    'Date Of Birth': 'DateOfBirth',
    Age: 'Age',
    Postcode: 'PostCode',
    State: 'State',
    Gender: 'Gender',
    'Mobile Number': 'Mobile',
    'Card Number': 'CardNumber',
    'Membership Type': 'MembershipType',
    'Membership Category': 'MembershipCategory',
    'Rating Tier': 'StatusTier',
    'Drink Category': 'DrinkCategory',
  };

  // Get email from localStorage or use a default
  const email = localStorage.getItem('userEmail') || 'user@example.com';
  const userInitial = email.charAt(0).toUpperCase();

  // Effect to handle proper filtering of options based on input value
  useEffect(() => {
    // Create filtered options for each filter row
    const newFilteredOptions = {};

    filterRows.forEach((row) => {
      if (apiCallFields.includes(row.field) && filterValueOptions[row.id]) {
        // If there's user input, filter the options
        if (row.value && row.value.length > 0) {
          // Filter based on operator type for getUserAPI endpoint
          if (apiCallFields.includes(row.field)) {
            if (row.operator === 'Contains') {
              // For Contains: substring match anywhere in the string
              newFilteredOptions[row.id] = filterValueOptions[row.id].filter(
                (option) =>
                  option
                    .toString()
                    .toLowerCase()
                    .includes(row.value.toLowerCase())
              );
            } else if (row.operator === 'Exactly Matches') {
              // For Exactly Matches: exact match at beginning of string
              newFilteredOptions[row.id] = filterValueOptions[row.id].filter(
                (option) =>
                  option
                    .toString()
                    .toLowerCase()
                    .indexOf(row.value.toLowerCase()) === 0
              );
            } else {
              // Default for other operators
              newFilteredOptions[row.id] = filterValueOptions[row.id];
            }
          } else {
            // Legacy behavior for backward compatibility
            newFilteredOptions[row.id] = filterValueOptions[row.id].filter(
              (option) =>
                option
                  .toString()
                  .toLowerCase()
                  .indexOf(row.value.toLowerCase()) === 0
            );
          }
        } else {
          // If no input, don't show any options
          newFilteredOptions[row.id] = [];
        }
      }

      // Handle get API endpoint (newApiCallFields)
      if (newApiCallFields.includes(row.field) && filterValueOptions[row.id]) {
        if (row.value && row.value.length > 0) {
          if (row.operator === 'Contains') {
            // For Contains: substring match anywhere in the string (existing behavior)
            // Also limit to 10 results
            newFilteredOptions[row.id] = filterValueOptions[row.id]
              .filter((option) =>
                option
                  .toString()
                  .toLowerCase()
                  .includes(row.value.toLowerCase())
              )
              .slice(0, 10);
          } else if (row.operator === 'Exactly Matches') {
            // For Exactly Matches: exact match at beginning of string
            // Also limit to 10 results
            newFilteredOptions[row.id] = filterValueOptions[row.id]
              .filter(
                (option) =>
                  option
                    .toString()
                    .toLowerCase()
                    .indexOf(row.value.toLowerCase()) === 0
              )
              .slice(0, 10);
          } else {
            // Default for other operators
            // Also limit to 10 results
            newFilteredOptions[row.id] = filterValueOptions[row.id].slice(
              0,
              10
            );
          }
        } else {
          // If no input, don't show any options
          newFilteredOptions[row.id] = [];
        }
      }
    });

    setFilteredOptions(newFilteredOptions);
  }, [filterRows, filterValueOptions]);

  // Effect to fetch notification details when component mounts if id is in URL query params (for Reuse functionality)
  useEffect(() => {
    const notificationId = searchParams.get('id');
    const usersCount = searchParams.get('usersCount');

    if (!notificationId) {
      // If not reusing, fetch total user count immediately
      if (selectedTargetMarket === 'Send to All') {
        fetchTotalUserCount();
      }
      return;
    }

    const fetchNotificationDetails = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/notification/detail?id=${notificationId}`,
          {
            headers: {
              Authorization: token
                ? `Bearer ${localStorage.getItem('token')}`
                : '', // Pass token in headers
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.success && data.data) {
          // Set the reusing flag to true to prevent fetchTotalUserCount useEffect from running

          const notification = data.data;

          // Set heading and description
          setHeading(notification.heading || '');
          setDescription(notification.description || '');

          // Set display type and related fields
          {notification.isScheduled && notification.scheduledAt ? setDisplayType('schedule') : setDisplayType('immediate')}
          if (notification.isScheduled && notification.scheduledAt) {
            const dateString = notification.scheduledAt.substring(0, 10);
            setSendDate(dateString);
            // Extract time in HH:MM format from ISO string directly
            const timeString = notification.scheduledAt.substring(11, 16);
            setSendTime(timeString);
          }

          // Set notification type
          setSelectedTab(
            notification.notificationType === 'richPush' ? 'Rich Push' : 'Push'
          );

          // Set image for Rich Push notifications
          if (
            notification.notificationType === 'richPush' &&
            notification.image
          ) {
            setImage(notification.image);
          }

          if (notification.jobId) {
              setJobId(notification.jobId);
            } else {
              setJobId(null);
          }

          // Set target market
          if (notification.sendType === 'target') {
            setSelectedTargetMarket('Target');

            // Set member reach if not already set from URL
            if (!usersCount && notification.usersCount) {
              setMemberReach(notification.usersCount.toString());
            } else {
              setMemberReach(usersCount);
              setIsReusing(true);
            }

            // Set filters if available
            if (notification.filters && notification.filters.length > 0) {
              // Create filter rows from the API response filters
              const newFilterRows = notification.filters.map(
                (filter, index) => {
                  // Get the display-friendly field name from API category
                  let fieldName = 'Select Category';

                  // Reverse lookup the field name from the API parameter
                  Object.entries(fieldToApiParam).forEach(([key, value]) => {
                    if (value === filter.category) {
                      fieldName = key;
                    }
                  });

                  // Special case handling for fields that don't have mappings
                  if (filter.category === 'Food') {
                    fieldName = 'Meals';
                  } else if (filter.category === 'DateOfBirth') {
                    fieldName = 'Date Of Birth';
                  } else if (filter.category === 'DrinkCategory') {
                    fieldName = 'Drink Category';
                  } else if (filter.category === 'CardNumber') {
                    fieldName = 'Card Number';
                  } else if (filter.category === 'Mobile') {
                    fieldName = 'Mobile Number';
                  } else if (filter.category === 'MembershipType') {
                    fieldName = 'Membership Type';
                  } else if (filter.category === 'MembershipCategory') {
                    fieldName = 'Membership Category';
                  } else if (filter.category === 'PostCode') {
                    fieldName = 'Postcode';
                  }

                  // Map API match operator to UI operator
                  let matchOperator;
                  if (
                    filter.match === 'exact' ||
                    filter.match === 'exactly matches'
                  ) {
                    matchOperator = 'Exactly Matches';
                  } else if (
                    filter.match === 'isBefore' ||
                    filter.match === 'is before'
                  ) {
                    matchOperator = 'Is before';
                  } else if (
                    filter.match === 'isAfter' ||
                    filter.match === 'is after'
                  ) {
                    matchOperator = 'Is after';
                  } else if (
                    filter.match === 'IsNot' ||
                    filter.match === 'is not'
                  ) {
                    matchOperator = 'Is not';
                  } else {
                    matchOperator = 'Contains';
                  }

                  return {
                    id: index + 1,
                    field: fieldName,
                    operator: matchOperator,
                    value: filter.market || '',
                    type: filter.type || 'none', // Store the filter type (none, OR, NOT)
                    options: [],
                  };
                }
              );

              setFilterRows(newFilterRows);

              // Load filter options for each selected field while preserving the original values
              newFilterRows.forEach(async (row) => {
                if (row.field !== 'Select Category') {
                  try {
                    // Format the field for the API query parameter
                    let fieldParam;

                    // Use the mapping if available, otherwise remove spaces
                    if (fieldToApiParam[row.field]) {
                      fieldParam = fieldToApiParam[row.field];
                    } else {
                      fieldParam = row.field.replace(/ /g, '');
                    }

                    // Determine which API endpoint to use
                    const apiEndpoint = newApiCallFields.includes(row.field)
                      ? `${baseUrl}/notification/getnew?type=${fieldParam}`
                      : `${baseUrl}/notification/getusernew?type=${fieldParam}`;

                    const response = await fetch(apiEndpoint, {
                      headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                      },
                    });

                    const data = await response.json();

                    if (Array.isArray(data)) {
                      // Update the options for this specific filter row WITHOUT changing its value
                      setFilterValueOptions((prev) => ({
                        ...prev,
                        [row.id]: data,
                      }));
                    }
                  } catch (error) {
                    console.error(
                      `Error fetching options for ${row.field}:`,
                      error
                    );
                  }
                }
              });
            }
          } else {
            setSelectedTargetMarket('Send to All');
            // Don't fetch total user count if we already have the usersCount from notification
            // This prevents overriding the specific notification's reach count
            // Set member reach if not already set from URL
            if (!usersCount && notification.usersCount) {
              setMemberReach(notification.usersCount.toString());
            } else {
              setMemberReach(usersCount);
              setIsReusing(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching notification details:', error);
        toast.error('Failed to load notification details. Please try again.');
      }
    };

    fetchNotificationDetails();
  }, [searchParams, token]);

  // Function to fetch total user count
  // const fetchTotalUserCount = async () => {

  //   if (selectedTargetMarket === 'Send to All' && !isReusing) {
  //     try {
  //       const response = await fetch(`${baseUrl}/notification/total-user`, {
  //         headers: {
  //           Authorization: token ? `Bearer ${token}` : '',
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       const data = await response.json();

  //       if (data && data.data && data.data.count) {
  //         setMemberReach(data.data.count.toString());
  //       }
  //     } catch (error) {
  //       console.error('Error fetching total user count:', error);
  //     }
  //   }
  // };

  // Effect to load initial filter options when component mounts
  useEffect(() => {
    // Only run once when component mounts
    const loadInitialOptions = async () => {
      // Get the initial field and its API parameter
      const initialField = filterRows[0].field;

      // If the initialField is "Select Category", don't load any options
      if (initialField === 'Select Category') {
        return;
      }

      let fieldParam;

      // Use the mapping if available, otherwise remove spaces
      if (fieldToApiParam[initialField]) {
        fieldParam = fieldToApiParam[initialField];
      } else {
        fieldParam = initialField.replace(/ /g, '');
      }

      // Determine which API endpoint to use
      const apiEndpoint = newApiCallFields.includes(initialField)
        ? `${baseUrl}/notification/getnew?type=${fieldParam}`
        : `${baseUrl}/notification/getusernew?type=${fieldParam}`;

      try {
        const response = await fetch(apiEndpoint, {
          headers: {
            Authorization: token
              ? `Bearer ${localStorage.getItem('token')}`
              : '',
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          // Update the options for this specific filter row
          setFilterValueOptions((prev) => ({
            ...prev,
            [1]: data,
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching initial options for ${initialField}:`,
          error
        );
      }
    };

    loadInitialOptions();
  }, [selectedVenue]);

  // Effect to fetch total user count when component mounts or when selectedTargetMarket changes to "Send to All"
  // useEffect(() => {

  //   const fetchTotalUserCount = async () => {
  //     if (selectedTargetMarket === 'Send to All' && !isReusing) {
  //       try {
  //         const response = await fetch(`${baseUrl}/notification/total-user`, {
  //           headers: {
  //             Authorization: token ? `Bearer ${token}` : '',
  //             'Content-Type': 'application/json',
  //           },
  //         });

  //         const data = await response.json();

  //         if (data && data.data && data.data.count) {
  //           setMemberReach(data.data.count.toString());
  //         }
  //         console.log('ftuc');
  //       } catch (error) {
  //         console.error('Error fetching total user count:', error);
  //       }
  //     }
  //   };

  //   fetchTotalUserCount();
  // }, [selectedTargetMarket, token]);

  // Move fetchTotalUserCount outside of useEffect since we'll call it manually
  const fetchTotalUserCount = async () => {
    try {
      const response = await fetch(`${baseUrl}/notification/total-user`, {
        headers: {
          Authorization: token ? `Bearer ${localStorage.getItem('token')}` : '',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data && data.data && data.data.count) {
        setMemberReach(data.data.count.toString());
      }
      console.log('ftuc');
    } catch (error) {
      console.error('Error fetching total user count:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/push-messaging') {
      return true; // Always return true for Push Messaging to make it active by default
    }
    return location.pathname === path;
  };

  // Fix for sidebar navigation - ensure we have the state when navigating
  const handleNavigation = (path) => {
    // For sidebar buttons, always stay on market-to-members
    if (
      path === '/push-messaging' ||
      path === '/sms-email' ||
      path === '/geo-targeting'
    ) {
      navigate('/market-to-members');
    } else {
      // For header buttons, navigate as before
      navigate(path);
    }
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const s3Url = await uploadFileToS3(file);
        console.log(s3Url);
        setImage(s3Url);
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        toast.error('Failed to upload image. Please try again.');
      }
    }
  };

  //utility func for handlePublish
  const calculateReach = async () => {
    if (selectedTargetMarket === 'Target') {
      // Create filters array from filterRows
      const filters = filterRows.map((row, index) => {
        // For the first row, type is "none", for subsequent rows, use the selected operator (OR/NOT)
        // We need to handle the operator value differently since it's part of the row state
        let type = 'none';
        if (index > 0) {
          // Find the filter condition dropdown value for this row
          const selectElements = document.querySelectorAll(
            '.filter-select-first'
          );
          if (selectElements && selectElements.length >= index) {
            type = selectElements[index - 1].value;
          }
        }

        // Map field names to API category names using fieldToApiParam or remove spaces
        let category;

        if (fieldToApiParam[row.field]) {
          category = fieldToApiParam[row.field];
        } else if (row.field === 'Card Number') {
          category = 'CardNumber';
        } else if (row.field === 'Mobile Number') {
          category = 'Mobile';
        } else if (row.field === 'Date Of Birth') {
          category = 'DateOfBirth';
        } else if (row.field === 'Membership Type') {
          category = 'MembershipType';
        } else if (row.field === 'Membership Category') {
          category = 'MembershipCategory';
        } else if (row.field === 'Postcode') {
          category = 'PostCode';
        } else if (row.field === 'Drink Category') {
          category = 'DrinkCategory';
        } else {
          // Remove spaces for other fields
          category = row.field.replace(/ /g, '');
        }

        let match = row.operator;

        if (row.operator === 'Exactly Matches') {
          match = 'exact';
        } else if (row.operator === 'Is before') {
          match = 'isBefore';
        } else if (row.operator === 'Is after') {
          match = 'isAfter';
        } else if (row.operator === 'Contains') {
          match = 'contains';
        } else if (row.operator === 'Is not') {
          match = 'IsNot';
        }

        return {
          type: type,
          category: category,
          market: row.value,
          match: match,
        };
      });

      const requestBody = {
        heading: heading,
        description: description,
        notificationType: selectedTab === 'Rich Push' ? 'richPush' : 'push',
        displayType: displayType,
        sendType: 'target',
        filters: filters,
      };

      // Add image to request body only if Rich Push is selected
      if (selectedTab === 'Rich Push' && image) {
        requestBody.image = image;
      }

      // Add date and time if schedule is selected
      if (displayType === 'schedule') {
        requestBody.sendDate = sendDate;
        requestBody.sendTime = sendTime;
      }

      try {
        const response = await fetch(`${baseUrl}/notification/count`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('body', requestBody);
        console.log('data', data);

        if (data.data.usersWithDeviceToken) {
          return data.data.usersWithDeviceToken;
        } else if (data.data.totalUsers) {
          return data.data.totalUsers;
        } else {
          return 0;
        }
      } catch (error) {
        console.error('Error calculating reach:', error);
        toast.error('Failed to calculate reach. Please try again.');
      }
    }
  };

  //calculate handlereach function

  const handleCalculateReach = async () => {
    setIsCalculating(true);

    if (selectedTargetMarket === 'Target') {
      // Create filters array from filterRows
      const filters = filterRows.map((row, index) => {
        // For the first row, type is "none", for subsequent rows, use the selected operator (OR/NOT)
        // We need to handle the operator value differently since it's part of the row state
        let type = 'none';
        if (index > 0) {
          // Find the filter condition dropdown value for this row
          const selectElements = document.querySelectorAll(
            '.filter-select-first'
          );
          if (selectElements && selectElements.length >= index) {
            type = selectElements[index - 1].value;
          }
        }

        // Map field names to API category names using fieldToApiParam or remove spaces
        let category;

        if (fieldToApiParam[row.field]) {
          category = fieldToApiParam[row.field];
        } else if (row.field === 'Card Number') {
          category = 'CardNumber';
        } else if (row.field === 'Mobile Number') {
          category = 'Mobile';
        } else if (row.field === 'Date Of Birth') {
          category = 'DateOfBirth';
        } else if (row.field === 'Membership Type') {
          category = 'MembershipType';
        } else if (row.field === 'Membership Category') {
          category = 'MembershipCategory';
        } else if (row.field === 'Postcode') {
          category = 'PostCode';
        } else if (row.field === 'Drink Category') {
          category = 'DrinkCategory';
        } else {
          // Remove spaces for other fields
          category = row.field.replace(/ /g, '');
        }

        let match = row.operator;

        if (row.operator === 'Exactly Matches') {
          match = 'exact';
        } else if (row.operator === 'Is before') {
          match = 'isBefore';
        } else if (row.operator === 'Is after') {
          match = 'isAfter';
        } else if (row.operator === 'Contains') {
          match = 'contains';
        } else if (row.operator === 'Is not') {
          match = 'IsNot';
        }

        return {
          type: type,
          category: category,
          market: row.value,
          match: match,
        };
      });

      const requestBody = {
        heading: heading,
        description: description,
        notificationType: selectedTab === 'Rich Push' ? 'richPush' : 'push',
        displayType: displayType,
        sendType: 'target',
        filters: filters,
      };

      // Add image to request body only if Rich Push is selected
      if (selectedTab === 'Rich Push' && image) {
        requestBody.image = image;
      }

      // Add date and time if schedule is selected
      if (displayType === 'schedule') {
        requestBody.sendDate = sendDate;
        requestBody.sendTime = sendTime;
      }

      try {
        const response = await fetch(`${baseUrl}/notification/count`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('body', requestBody);
        console.log('data', data);

        if (data.data.usersWithDeviceToken) {
          setMemberReach(data.data.usersWithDeviceToken.toString());
          console.log(
            'About to show success toast with message:',
            data.message
          );
          toast.success(data.message);
        } else if (data.data.totalUsers) {
          setMemberReach(data.data.totalUsers.toString());
          console.log(
            'About to show success toast with message:',
            data.message
          );
          toast.success(data.message);
        } else {
          setMemberReach('0');
          console.log(
            'About to show info toast: No members match the selected criteria.'
          );
          toast.info('No members match the selected criteria.');
        }
      } catch (error) {
        console.error('Error calculating reach:', error);
        toast.error('Failed to calculate reach. Please try again.');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const calculateReachSendToAll = async () => {
    try {
      const response = await fetch(`${baseUrl}/notification/countss`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      console.log('data', data);

      if (data.count) {
        return data.count;
      } else {
        return '0';
      }
    } catch (error) {
      console.error('Error calculating reach:', error);
      toast.error('Failed to calculate reach. Please try again.');
    }
  };

  const handleCalculateReachSendToAll = async () => {
    setIsCalculating(true);

    try {
      const response = await fetch(`${baseUrl}/notification/countss`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      console.log('data', data);

      if (data.count) {
        setMemberReach(data.count.toString());
        toast.success('Target user count fetched successfully');
      } else {
        setMemberReach('0');
        toast.info('No members match the selected criteria.');
      }
    } catch (error) {
      console.error('Error calculating reach:', error);
      toast.error('Failed to calculate reach. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePublish = async () => {
    if (!description || description.trim() === '') {
      toast.error('Cannot Send as Message is Empty');
      return;
    }

    // Prevent multiple clicks while sending
    if (isSending) return;

    // Check if schedule is selected but date or time is missing
    if (displayType === 'schedule' && (!sendDate || !sendTime)) {
      toast.error('Please enter a Send Date and Send Time');
      return;
    }

    const notificationId = searchParams.get('id');

    let url = `https://betaapi.s2w.com.au/notification/send-notification`;

    if (jobId !== null && jobId !== undefined && jobId !== '') {
      url = `https://betaapi.s2w.com.au/notification/update-notification?id=${notificationId}`;
    }

    if (selectedTargetMarket === 'Send to All') {
      const memberNum = await calculateReachSendToAll();
      console.log('memberNum', memberNum);
      const requestBody = {
        notificationType: selectedTab === 'Rich Push' ? 'richPush' : 'push',
        displayType: displayType,
        sendType: 'all',
        heading: heading,
        description: description,
        market: memberNum,
      };

      // Add image to request body only if Rich Push is selected
      if (selectedTab === 'Rich Push' && image) {
        requestBody.image = image;
      }

      // Add date and time if schedule is selected
      if (displayType === 'schedule') {
        requestBody.sendDate = sendDate;
        requestBody.sendTime = sendTime;
      }

      try {
        // Set sending state and disable button
        setIsSending(true);
        setSendingNow(true);
        // Automatically hide the overlay after 5 seconds irrespective of API response time
        setTimeout(() => setSendingNow(false), 5000);

        const response = await fetch(url, {
          method: jobId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('body', requestBody);
        console.log('data', data);

        setMemberReach(memberNum);

        displayType === 'immediate'
          ? toast.success('Notification sent successfully!')
          : toast.success('Notification has been scheduled');
        setIsSending(false);
      } catch (error) {
        console.error('Error sending notification:', error);
        displayType === 'immediate'
          ? toast.error('Failed to send notification. Please try again.')
          : toast.error('Failed to schedule notification. Please try again.');
        setIsSending(false);
      }
    } else if (selectedTargetMarket === 'Target') {
      // Create filters array from filterRows
      const filters = filterRows.map((row, index) => {
        // For the first row, type is "none", for subsequent rows, use the selected operator (OR/NOT)
        // We need to handle the operator value differently since it's part of the row state
        let type = 'none';
        if (index > 0) {
          // Find the filter condition dropdown value for this row
          const selectElements = document.querySelectorAll(
            '.filter-select-first'
          );
          if (selectElements && selectElements.length >= index) {
            type = selectElements[index - 1].value;
          }
        }

        // Map field names to API category names using fieldToApiParam or remove spaces
        let category;

        if (fieldToApiParam[row.field]) {
          category = fieldToApiParam[row.field];
        } else if (row.field === 'Card Number') {
          category = 'CardNumber';
        } else if (row.field === 'Mobile Number') {
          category = 'Mobile';
        } else if (row.field === 'Date Of Birth') {
          category = 'DateOfBirth';
        } else if (row.field === 'Membership Type') {
          category = 'MembershipType';
        } else if (row.field === 'Membership Category') {
          category = 'MembershipCategory';
        } else if (row.field === 'Postcode') {
          category = 'PostCode';
        } else if (row.field === 'Drink Category') {
          category = 'DrinkCategory';
        } else {
          // Remove spaces for other fields
          category = row.field.replace(/ /g, '');
        }

        let match = row.operator;

        if (row.operator === 'Exactly Matches') {
          match = 'exact';
        } else if (row.operator === 'Is before') {
          match = 'isBefore';
        } else if (row.operator === 'Is after') {
          match = 'isAfter';
        } else if (row.operator === 'Contains') {
          match = 'contains';
        } else if (row.operator === 'Is not') {
          match = 'IsNot';
        }

        return {
          type: type,
          category: category,
          market: row.value,
          match: match,
        };
      });

      const reachNum = await calculateReach();
      console.log('reachNum', reachNum);

      const requestBody = {
        heading: heading,
        description: description,
        notificationType: selectedTab === 'Rich Push' ? 'richPush' : 'push',
        displayType: displayType,
        sendType: 'target',
        filters: filters,
        market: reachNum,
      };

      // Add image to request body only if Rich Push is selected
      if (selectedTab === 'Rich Push' && image) {
        requestBody.image = image;
      }

      // Add date and time if schedule is selected
      if (displayType === 'schedule') {
        requestBody.sendDate = sendDate;
        requestBody.sendTime = sendTime;
      }

      try {
        // Set sending state and disable button
        setIsSending(true);
        const response = await fetch(url, {
          method: jobId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('body', requestBody);
        console.log('data', data);
        console.log('json req body', JSON.stringify(requestBody));

        setMemberReach(reachNum);

        displayType === 'immediate'
          ? toast.success('Notification sent successfully!')
          : toast.success('Notification has been scheduled');

        setTimeout(() => {
          setIsSending(false);
        }, 5000);
      } catch (error) {
        console.error('Error sending notification:', error);
        displayType === 'immediate'
          ? toast.error('Failed to send notification. Please try again.')
          : toast.error('Failed to schedule notification. Please try again.');
        setIsSending(false); // Re-enable button on error
      }
    }
  };

  const addFilterRow = async () => {
    const newId = filterRows.length + 1;
    const newField = 'Select Category'; // default field
    const defaultValue = '';

    const updatedFilterRow = {
      id: newId,
      field: newField,
      operator: 'Contains',
      value: defaultValue,
      options: [],
    };

    setFilterRows((prev) => [...prev, updatedFilterRow]);
  };

  const removeFilterRow = (id) => {
    setFilterRows(filterRows.filter((row) => row.id !== id));
  };

  // Handle field change and make API call if needed
  const handleFieldChange = async (id, field) => {
    // Update the filter row with the new field
    const updatedRows = filterRows.map((row) => {
      if (row.id === id) {
        return { ...row, field, value: '' };
      }
      return row;
    });
    setFilterRows(updatedRows);

    // Check which API endpoint to use based on field type
    if (apiCallFields.includes(field) || newApiCallFields.includes(field)) {
      try {
        // Format the field for the API query parameter
        let fieldParam;

        // Use the mapping if available, otherwise remove spaces
        if (fieldToApiParam[field]) {
          fieldParam = fieldToApiParam[field];
        } else {
          fieldParam = field.replace(/ /g, '');
        }

        // Determine which API endpoint to use
        const apiEndpoint = newApiCallFields.includes(field)
          ? `${baseUrl}/notification/getnew?type=${fieldParam}&match=contains&search=`
          : `${baseUrl}/notification/getusernew?type=${fieldParam}&match=contains&search=`;

        const response = await fetch(apiEndpoint, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          // Update the options for this specific filter row
          setFilterValueOptions((prev) => ({
            ...prev,
            [id]: data,
          }));

          // Keep the filter value field blank, don't pre-populate with the first item
          // Options will appear only when user starts typing
        }
      } catch (error) {
        console.error(`Error fetching options for ${field}:`, error);
        toast.error(`Failed to fetch options for ${field}. Please try again.`);
      }
    }
  };

  // Handle value change for a specific filter row
  const handleValueChange = async (id, value) => {
    const updatedRows = filterRows.map((row) => {
      if (row.id === id) {
        return { ...row, value };
      }
      return row;
    });
    setFilterRows(updatedRows);

    const row = updatedRows.find((r) => r.id === id);
    if (!row) return;

    // Determine API type
    let fieldParam = fieldToApiParam[row.field]
      ? fieldToApiParam[row.field]
      : row.field.replace(/ /g, '');

    // Convert operator to API match param
    let match =
      row.operator === 'Exactly Matches'
        ? 'exact'
        : row.operator === 'Contains'
          ? 'contains'
          : row.operator === 'Is not'
            ? 'IsNot'
            : row.operator === 'Is before'
              ? 'isBefore'
              : row.operator === 'Is after'
                ? 'isAfter'
                : 'contains';

    if (!value || value.length < 1) {
      setFilteredOptions((prev) => ({ ...prev, [id]: [] }));
      return;
    }

    // Choose correct endpoint
    const isNew = newApiCallFields.includes(row.field);
    const apiEndpoint = isNew
      ? `${baseUrl}/notification/getnew?type=${fieldParam}&match=${match}&search=${value}`
      : `${baseUrl}/notification/getusernew?type=${fieldParam}&match=${match}&search=${value}`;

    try {
      const response = await fetch(apiEndpoint, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setFilterValueOptions((prev) => ({ ...prev, [id]: data }));
        setFilteredOptions((prev) => ({ ...prev, [id]: data }));
      }
    } catch (err) {
      console.error('Suggestion fetch error:', err);
    } // setShowSuggestions((prev) => ({ ...prev, [id]: true }));
  };

  // Show all options when input is clicked
  const handleInputClick = (id) => {
    const input = document.getElementById(`filter-value-${id}`);
    if (input) {
      // Don't clear the input value, just focus to show all options
      setTimeout(() => {
        input.focus();
      }, 10);
    }
  };

  const fieldOptions = [
    { value: 'Meals', label: 'Meals' },
    { value: 'Drinks', label: 'Drinks' },
    { value: 'Drink Category', label: 'Drink Category' },
    { value: 'Rating Tier', label: 'Rating Tier' },
    { value: 'Date Of Birth', label: 'Date Of Birth' },
    { value: 'Age', label: 'Age' },
    { value: 'Last Visit Date', label: 'Last Visit Date' },
    { value: 'Venue', label: 'Venue' },
    { value: 'Postcode', label: 'Postcode' },
    { value: 'State', label: 'State' },
    { value: 'Retail', label: 'Retail' },
    { value: 'On Premise', label: 'On Premise' },
    { value: 'Gaming', label: 'Gaming' },
    { value: 'Gender', label: 'Gender' },
    { value: 'Date Joined', label: 'Date Joined' },
    { value: 'Mobile Number', label: 'Mobile Number' },
    { value: 'Card Number', label: 'Card Number' },
    { value: 'Product Category', label: 'Product Category' },
    { value: 'Location Brand', label: 'Location Brand' },
    { value: 'Membership Type', label: 'Membership Type' },
    { value: 'Membership Category', label: 'Membership Category' },
    { value: 'Points Balance', label: 'Points Balance' },
  ];

  const defaultOperatorOptions = [
    { value: 'Contains', label: 'Contains' },
    { value: 'Exactly Matches', label: 'Exactly Matches' },
    { value: 'Is not', label: 'Is not' },
  ];

  const dateOperatorOptions = [
    ...defaultOperatorOptions,
    { value: 'Is before', label: 'Is before' },
    { value: 'Is after', label: 'Is after' },
  ];

  const dateFields = ['Date Of Birth', 'Last Visit Date', 'Date Joined'];

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '28px',
      backgroundColor: 'white',
      fontSize: '10px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
      color: 'black',
      fontSize: '10px',
    }),
    dropdownIndicator: (base) => ({ ...base, padding: 4 }),
    indicatorSeparator: () => ({ display: 'none' }),
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
      case 'Drinks':
        return 'Drinks HQ';
      default:
        return appType;
    }
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
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
        <div className="s2w-logo" onClick={async () => await handleLock()}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>
        <div className="header-buttons">
          {userType === 'admin' ? (
            <>
              <button
                className="digitalApp-btn"
                onClick={() => handleCardClick('digital', '/digital-app')}
              >
                Digital App
              </button>
              <button
                className="marketTomembers-btn"
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
                  className="digitalApp-btn"
                  onClick={() => handleCardClick('digital', '/digital-app')}
                >
                  Digital App
                </button>
              )}
              {access.includes('m2m') && (
                <button
                  className="marketTomembers-btn"
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
          className={`sidebar-btn ${
            isActive('/push-messaging') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/push-messaging')}
        >
          <IoPushOutline
            className={`sidebar-icon ${
              isActive('/push-messaging') ? '' : 'navy-icon'
            }`}
          />
          Push Messaging
        </button>

        <button
          className={`sidebar-btn ${
            isActive('/scheduled-&-sent') ? 'active' : ''
          }`}
          onClick={() => handleNavigation('/scheduled-&-sent')}
        >
          <IoIosSend
            className={`sidebar-icon ${
              isActive('/scheduled-&-sent') ? '' : 'navy-icon'
            }`}
          />
          Scheduled & Sent
        </button>
      </aside>

      {sendingNow && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          Sending Now...
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <div className="tabs-container">
            <button
              className={`tab-btn ${
                selectedTab === 'Push' ? 'active-tab' : ''
              }`}
              onClick={() => setSelectedTab('Push')}
            >
              Push
            </button>
            <button
              className={`tab-btn ${
                selectedTab === 'Rich Push' ? 'active-tab' : ''
              }`}
              onClick={() => setSelectedTab('Rich Push')}
            >
              Rich Push
            </button>
            <div
              className={
                selectedTargetMarket === 'Target'
                  ? 'tabs-container-target-market'
                  : 'tabs-container-send-to-all'
              }
            >
              <button
                className={`tab-btn ${
                  selectedTargetMarket === 'Send to All' ? 'active-tab' : ''
                }`}
                onClick={async () => {
                  setSelectedTargetMarket('Send to All');
                  try {
                    const response = await fetch(
                      `${baseUrl}/notification/total-user`,
                      {
                        headers: {
                          Authorization: token ? `Bearer ${token}` : '',
                          'Content-Type': 'application/json',
                        },
                      }
                    );

                    const data = await response.json();

                    if (data && data.data && data.data.count) {
                      setMemberReach(data.data.count.toString());
                    }
                  } catch (error) {
                    console.error('Error fetching total user count:', error);
                  }
                }}
              >
                Send to All
              </button>
              <button
                className={`tab-btn ${
                  selectedTargetMarket === 'Target' ? 'active-tab' : ''
                }`}
                onClick={() => {
                  setSelectedTargetMarket('Target');
                  // Reset filter rows to have Select Category as default with empty value
                  setFilterRows([
                    {
                      id: 1,
                      field: 'Select Category',
                      operator: 'Contains',
                      value: '',
                      options: [],
                    },
                  ]);
                  // Reset memberReach to default state
                  setMemberReach('0');
                }}
              >
                Target
              </button>
              {/* <button
                className={`tab-btn ${
                  selectedTargetMarket === 'Geo Location' ? 'active-tab' : ''
                }`}
                onClick={() => setSelectedTargetMarket('Geo Location')}
              >
                Geo Location
              </button> */}
            </div>
          </div>
          <button
            className={`publish-btn-m2m ${isSending ? 'sending' : ''}`}
            onClick={handlePublish}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Publish'}
          </button>
        </div>

        {/* Content Sections */}
        <div className="content-sections">
          {/* Current Post Section */}
          <div className="section-card-cp">
            <h2 className="section-title">Current post</h2>

            <div className="form-layout">
              <div className="labels-column">
                {selectedTab === 'Rich Push' && (
                  <div className="form-label image-label">Image</div>
                )}
                {selectedTab === 'Rich Push' ? (
                  <div className="form-label heading-label">Heading</div>
                ) : (
                  <div className="form-label">Heading</div>
                )}
                {/*description changed to message*/}
                {selectedTab === 'Rich Push' ? (
                  <div className="form-label description-label">Message</div>
                ) : (
                  <div className="form-label">Message</div>
                )}
              </div>

              <div className="post-content-container">
                {selectedTab === 'Rich Push' && (
                  <div
                    className={
                      selectedTargetMarket === 'Target'
                        ? 'image-input-container-m2m'
                        : 'image-input-container-sendtoall-m2m'
                    }
                  >
                    {image ? (
                      <img
                        src={image}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '80px' }}
                      />
                    ) : (
                      <div
                        className="image-placeholder"
                        style={{
                          border: '1px dashed #ccc',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ color: '#999' }}>Image</span>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="text-input"
                  placeholder="Enter heading"
                  maxLength={28}
                />

                {/* added div for textarea */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      // Limit to 128 total characters
                      const newValue = e.target.value.substring(0, 128);
                      setDescription(newValue);
                    }}
                    className="textarea-input"
                    placeholder="Enter message"
                    maxLength={128}
                    style={{
                      width: '100%',
                      resize: 'none',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      // Set columns to limit visible width
                      cols: '32',
                      // Set a fixed width that accommodates approximately 32 characters
                      maxWidth: '280px',
                    }}
                  />
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: 'black',
                    userSelect: 'none',
                  }}
                >
                  {description.length}/128
                </div>
              </div>
            </div>

            <div className="form-layout">
              <div className="labels-column">
                <div className="form-label-display">Send</div>
              </div>

              <div className="options-container">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="immediate"
                    name="display"
                    checked={displayType === 'immediate'}
                    onChange={() => setDisplayType('immediate')}
                  />
                  <label htmlFor="immediate">Immediate</label>
                </div>
                <div className="radio-group">
                  <input
                    type="radio"
                    id="schedule"
                    name="display"
                    checked={displayType === 'schedule'}
                    onChange={() => setDisplayType('schedule')}
                  />
                  <label htmlFor="schedule">Schedule</label>
                </div>

                <div className="date-time-inputs">
                  <div className="date-inputs">
                    <span>SEND DATE</span>
                    <input
                      type="date"
                      // placeholder="dd/mm/yyyy"
                      value={sendDate}
                      onChange={(e) => setSendDate(e.target.value)}
                      disabled={displayType !== 'schedule'}
                      style={{ height: '19px', width: '105px' }}
                    />
                  </div>
                  <div className="time-inputs">
                    <span style={{ fontSize: '9px', color: '#666' }}>
                      SEND TIME
                    </span>
                    <input
                      type="time"
                      className="timepicker-24hr"
                      value={sendTime || ''}
                      onChange={(e) => setSendTime(e.target.value)}
                      disabled={displayType !== 'schedule'}
                    />
                    {/* <TimePicker
                      value={sendTime || ''}
                      onChange={setSendTime}
                      disableClock={true}
                      format="HH:mm"
                      clearIcon={null}
                      disabled={displayType !== 'schedule'}
                      className="timepicker-24hr"
                    /> */}
                  </div>
                </div>
              </div>
            </div>

            {selectedTab === 'Rich Push' ? (
              <div
                className="button-container"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '20px',
                  gap: '20px',
                }}
              >
                <label
                  htmlFor="image-upload"
                  className="upload-btn-m2m"
                  style={{
                    padding: '14px 20px',
                    backgroundColor: '#5396D1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}
                >
                  UPLOAD IMAGE
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            ) : null}
          </div>

          {/* Target Market Section */}
          <div
            className="section-card"
            style={{ width: '420px', position: 'relative' }}
          >
            {selectedTargetMarket === 'Target' ? (
              <>
                <h2 className="section-title">Target market</h2>
                <span className="categories-span">Categories</span>
                <span className="target-span">Target</span>

                {/* First filter row (always visible) */}
                <div
                  className="filter-scroll-container"
                  style={{
                    maxHeight: filterRows.length >= 6 ? '350px' : 'none',
                    overflowY: filterRows.length >= 6 ? 'auto' : 'visible',
                    paddingRight: filterRows.length >= 6 ? '8px' : '0',
                  }}
                >
                  <div className="filter-row-first">
                    <div className="filter-condition">
                      {/* No dropdown for first row */}
                    </div>
                    <div className="filter-field">
                      <div style={{ width: '110px' }}>
                        <Select
                          options={fieldOptions}
                          value={
                            filterRows[0].field === 'Select Category'
                              ? null
                              : fieldOptions.find(
                                  (o) => o.value === filterRows[0].field
                                )
                          }
                          onChange={(opt) => handleFieldChange(1, opt.value)}
                          styles={selectStyles}
                          isSearchable={false}
                          menuPlacement="auto"
                          menuShouldScrollIntoView
                          placeholder="Select Category"
                        />
                      </div>
                    </div>
                    <div className="filter-operator">
                      <div style={{ width: '90px' }}>
                        <Select
                          options={
                            dateFields.includes(filterRows[0].field)
                              ? dateOperatorOptions
                              : defaultOperatorOptions
                          }
                          value={
                            dateFields.includes(filterRows[0].field)
                              ? dateOperatorOptions.find(
                                  (o) => o.value === filterRows[0].operator
                                )
                              : defaultOperatorOptions.find(
                                  (o) => o.value === filterRows[0].operator
                                )
                          }
                          onChange={(opt) => {
                            setFilterRows((rs) =>
                              rs.map((r) =>
                                r.id === 1 ? { ...r, operator: opt.value } : r
                              )
                            );
                          }}
                          styles={selectStyles}
                          isSearchable={false}
                          menuPlacement="auto"
                          menuShouldScrollIntoView
                        />
                      </div>
                    </div>
                    <div
                      className="filter-value"
                      style={{
                        position: 'relative',
                        zIndex: showSuggestions[1] ? 1000 : 1,
                      }}
                    >
                      <input
                        id="filter-value-1"
                        className="filter-select-first-value"
                        style={{ width: '90px' }}
                        value={filterRows[0].value}
                        onChange={(e) => handleValueChange(1, e.target.value)}
                        onFocus={() => handleSuggestionToggle(1, true)}
                        onBlur={() =>
                          setTimeout(
                            () => handleSuggestionToggle(1, false),
                            150
                          )
                        }
                        autoComplete="off"
                      />
                      {showSuggestions[1] && filterRows[0].value && (
                        <div className="suggestions-dropdown">
                          {(filteredOptions[1] || []).map((option, idx) => (
                            <div
                              key={idx}
                              className="suggestion-item"
                              onMouseDown={(e) => {
                                e.preventDefault(); // prevents blur before click is processed
                                handleValueChange(1, option);
                                handleSuggestionToggle(1, false);
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="add-filter-btn" onClick={addFilterRow}>
                    +
                  </button>

                  {/* Additional filter rows (only visible when added) */}
                  {filterRows.slice(1).map((row) => (
                    <div key={row.id}>
                      <div className="filter-row">
                        <div className="filter-condition">
                          <select
                            className="filter-select-first"
                            value={
                              row.type && row.type.toUpperCase() === 'OR'
                                ? 'OR'
                                : 'AND'
                            }
                            onChange={(e) => {
                              const updated = filterRows.map((r) =>
                                r.id === row.id
                                  ? { ...r, type: e.target.value }
                                  : r
                              );
                              setFilterRows(updated);
                            }}
                          >
                            <option>AND</option>
                            <option>OR</option>
                          </select>
                        </div>
                        <div className="filter-field">
                          <div style={{ width: '110px' }}>
                            <Select
                              options={fieldOptions}
                              value={
                                row.field === 'Select Category'
                                  ? null
                                  : fieldOptions.find(
                                      (o) => o.value === row.field
                                    )
                              }
                              onChange={(opt) =>
                                handleFieldChange(row.id, opt.value)
                              }
                              styles={selectStyles}
                              isSearchable={false}
                              menuPlacement="auto"
                              menuShouldScrollIntoView
                              placeholder="Select Category"
                            />
                          </div>
                        </div>
                        <div className="filter-operator">
                          <div style={{ width: '90px' }}>
                            <Select
                              options={
                                dateFields.includes(row.field)
                                  ? dateOperatorOptions
                                  : defaultOperatorOptions
                              }
                              value={
                                dateFields.includes(row.field)
                                  ? dateOperatorOptions.find(
                                      (o) => o.value === row.operator
                                    )
                                  : defaultOperatorOptions.find(
                                      (o) => o.value === row.operator
                                    )
                              }
                              onChange={(opt) => {
                                const updated = filterRows.map((r) =>
                                  r.id === row.id
                                    ? { ...r, operator: opt.value }
                                    : r
                                );
                                setFilterRows(updated);
                              }}
                              styles={selectStyles}
                              isSearchable={false}
                              menuPlacement="auto"
                              menuShouldScrollIntoView
                            />
                          </div>
                        </div>
                        <div
                          className="filter-value"
                          style={{
                            position: 'relative',
                            zIndex: showSuggestions[row.id] ? 1000 : 1,
                          }}
                        >
                          <input
                            id={`filter-value-${row.id}`}
                            className="filter-select-value"
                            style={{ width: '90px' }}
                            value={row.value}
                            onChange={(e) =>
                              handleValueChange(row.id, e.target.value)
                            }
                            onFocus={() => handleSuggestionToggle(row.id, true)}
                            onBlur={() =>
                              setTimeout(
                                () => handleSuggestionToggle(row.id, false),
                                150
                              )
                            }
                            autoComplete="off"
                          />
                          {showSuggestions[row.id] && (
                            <div className="suggestions-dropdown">
                              {(filteredOptions[row.id] || []).map(
                                (option, idx) => (
                                  <div
                                    key={idx}
                                    className="suggestion-item"
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // prevents blur before click is processed
                                      handleValueChange(row.id, option);
                                      handleSuggestionToggle(row.id, false);
                                    }}
                                  >
                                    {option}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          className="filter-remove-btn"
                          onClick={() => removeFilterRow(row.id)}
                        >
                          ×
                        </button>
                      </div>
                      <button className="add-filter-btn" onClick={addFilterRow}>
                        +
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="save-filter-btn"
                  onClick={handleCalculateReach}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'CALCULATING...' : 'CALCULATE REACH'}
                </button>
              </>
            ) : (
              <>
                <h2 className="section-title">Send to All</h2>
                <br /> <br />
                <p style={{ textAlign: 'center', fontFamily: 'cambria' }}>
                  You are sending this message to <br />
                  all contacts in the Database
                </p>
                <button
                  className="save-filter-btn"
                  onClick={handleCalculateReachSendToAll}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'CALCULATING...' : 'CALCULATE REACH'}
                </button>
              </>
            )}
          </div>

          {/* Preview Section */}
          <div className="section-card preview-card">
            <h2 className="section-title">Preview</h2>
            <div className="preview-content">
              <div className="preview-voucher-container">
                {selectedTab === 'Rich Push' && image ? (
                  <div style={{ display: 'flex' }}>
                    <div
                      className="preview-image-container-m2m"
                      style={{ width: '30%', marginRight: '10px' }}
                    >
                      <img
                        src={image}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{ width: '70%' }}>
                      <h1
                        className="preview-heading"
                        style={{
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {heading}
                      </h1>
                      <p
                        className="preview-description"
                        style={{
                          maxWidth: '280px',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {(() => {
                          // Format description to wrap at 32 characters per line
                          const formattedText = [];
                          let charCount = 0;
                          let currentLineIndex = 0;

                          // Process the entire description as one continuous string
                          const flatText = description.replace(/\n/g, ' ');

                          for (let i = 0; i < flatText.length; i++) {
                            if (charCount === 0) {
                              formattedText.push([]);
                            }

                            formattedText[currentLineIndex].push(flatText[i]);
                            charCount++;

                            // When we reach 32 characters, start a new line
                            if (charCount === 32) {
                              charCount = 0;
                              currentLineIndex++;
                            }
                          }

                          // Return the formatted text with proper line breaks
                          return formattedText.map((lineChars, lineIndex) => (
                            <span key={lineIndex}>
                              {lineChars.join('')}
                              {lineIndex < formattedText.length - 1 && <br />}
                            </span>
                          ));
                        })()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3
                      className="preview-heading"
                      style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {heading}
                    </h3>
                    <p
                      className="preview-description"
                      style={{
                        maxWidth: '280px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {(() => {
                        // Format description to wrap at 32 characters per line
                        const formattedText = [];
                        let charCount = 0;
                        let currentLineIndex = 0;

                        // Process the entire description as one continuous string
                        const flatText = description.replace(/\n/g, ' ');

                        for (let i = 0; i < flatText.length; i++) {
                          if (charCount === 0) {
                            formattedText.push([]);
                          }

                          formattedText[currentLineIndex].push(flatText[i]);
                          charCount++;

                          // When we reach 32 characters, start a new line
                          if (charCount === 32) {
                            charCount = 0;
                            currentLineIndex++;
                          }
                        }

                        // Return the formatted text with proper line breaks
                        return formattedText.map((lineChars, lineIndex) => (
                          <span key={lineIndex}>
                            {lineChars.join('')}
                            {lineIndex < formattedText.length - 1 && <br />}
                          </span>
                        ));
                      })()}
                    </p>
                  </>
                )}
              </div>

              <div
                className="member-reach-box"
                style={{ width: '190px', height: '135px' }}
              >
                <h3>Member Reach</h3>
                <div className="reach-number">{memberReach}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCalculating && (
        <div
          style={{
            position: 'fixed',
            top: '5%',
            left: '70%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 9999,
          }}
        >
          <div>Calculating reach...</div>
        </div>
      )}
    </div>
  );
};

export default MarketToMembers;
