import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadFileToS3 } from '../s3/config';
import {
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaCalendarAlt,
  FaPaintBrush,
  FaRegStar,
} from 'react-icons/fa';
import axios from 'axios';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import AppLayout from '../components/AppLayout';
import {trackMenuAccess, handleLogout} from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

import {
  FaCheck,
  FaCloudUploadAlt,
  FaTrashAlt,
  FaPlusCircle,
  FaEdit,
  FaImages,
} from 'react-icons/fa';

import { Editor } from '@tinymce/tinymce-react';

import Select, { components } from 'react-select';
import '../styles/digital-app.css';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const DigitalApp = () => {
  const location = useLocation();
  const email = localStorage.getItem('userEmail');
  const userInitial = email.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);

  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);

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
    navigate(path);
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
      { value: 'Platinum Black', label: 'Platinum Black'}
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
  } else if(selectedVenue === 'Hogan') {
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
  } else if(selectedVenue === 'North') {
    audienceOptions = [
      {value: 'Gold', label: 'Gold'},
      {value: 'Platinum', label: 'Platinum'},
      {value: 'Pre Staff', label: 'Pre Staff'},
      {value: 'Silver', label: 'Silver'},
      {value: 'Staff', label: 'Staff'},
      {value: 'Valued', label: 'Valued'}
    ];
  } else if (selectedVenue === 'Montauk' || selectedVenue === 'Central') {
      audienceOptions = [
        { value: 'Premium Member', label: 'Premium Member' },
        { value: 'Member', label: 'Member' },
      ];
    } else if (selectedVenue === 'Ace') {
    audienceOptions = [
      { value: 'Staff', label: 'Staff' },
      { value: 'Tens', label: 'Tens' },
      { value: 'Jacks', label: 'Jacks' },
      { value: 'Queens', label: 'Queens' },
      { value: 'Kings', label: 'Kings' },
      { value: 'Ace', label: 'Ace' },
      { value: 'Ace Plus', label: 'Ace Plus'}
    ];
  } else if (selectedVenue === 'Queens') {
    audienceOptions = [
      { value: 'Queens', label: 'Queens' },
      { value: 'Ruby', label: 'Ruby' },
      { value: 'Emerald', label: 'Emerald' },
      { value: 'Sapphire', label: 'Sapphire' },
      { value: 'Diamond', label: 'Diamond' },
      { value: 'Diamond Plus', label: 'Diamond Plus' },
      { value: 'Curtis Coast', label: 'Curtis Coast' }
    ];
  } else if (selectedVenue === 'Brisbane') {
    audienceOptions = [
      { value: 'Brew Crew', label: 'Brew Crew' },
      { value: 'Member', label: 'Member' },
      { value: 'Regular', label: 'Regular' },
      { value: 'Champion', label: 'Champion' },
      { value: 'Legend', label: 'Legend' },
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

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  // Determine advert type based on current route
  const advertType = location.pathname === '/small-advert' ? 'small' : 'large';

  // Handler to navigate to Small Advert
  const handleSubmit = () => {
    navigate('/small-advert', { state: { email } });
  };

  const CustomMultiValue = () => null; // Hides selected values in the input field

  const CustomValueContainer = ({ children, ...props }) => {
    const { getValue } = props;
    const selectedOptions = getValue();
    let displayText = 'None selected';

    if (selectedOptions.length > 0) {
      displayText =
        selectedOptions.length === audienceOptions.length
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

  // Track if user clicked "Add New Promotion"
  const [isAddingNew, setIsAddingNew] = useState(false);
  // Track if user clicked Edit (to open the TinyMCE editor)
  const [isEditing, setIsEditing] = useState(false);
  // Track if the audience field is being edited in current posts
  const [isAudienceEditing, setIsAudienceEditing] = useState(false);

  // TinyMCE Editor states
  const [editorContent, setEditorContent] = useState('');
  const [savedContent, setSavedContent] = useState('');

  // Additional states for new promotion
  const [position, setPosition] = useState('');
  // For non-adding-new, audience remains an array of strings
  const [audience, setAudience] = useState([]);
  const [displayType, setDisplayType] = useState('immediate');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isEveryone, setIsEveryone] = useState(false);
  // State for More Information content
  const [moreInfo, setMoreInfo] = useState('');

  // State variables for carousel images
  const [advertImages, setAdvertImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // State for upload options modal
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const audienceSelectRef = useRef(null);
  const [isAudienceMenuOpen, setIsAudienceMenuOpen] = useState(false);
  const [isFormRestored, setIsFormRestored] = useState(false);
  const [id, setId] = useState('');
  const [publish, setPublish] = useState(false);

  // Helper to convert audience (array of strings) into ReactSelect option objects
  // Uses case-insensitive matching.
  const convertAudienceToObjects = (audienceArray) => {
    if (!Array.isArray(audienceArray)) return [];
    return audienceOptions.filter((opt) =>
      audienceArray.some((aud) => aud.toLowerCase() === opt.value.toLowerCase())
    );
  };

  useEffect(() => {
    function handleOutsideClick(e) {
      // Check if the audience menu is open
      if (isAudienceMenuOpen) {
        // Check if click is outside the select or on the checkbox
        const isClickInsideSelect =
          audienceSelectRef.current &&
          audienceSelectRef.current.contains(e.target);
        const isClickOnCheckbox =
          e.target.classList.contains('audience-checkbox') ||
          (e.target.parentElement &&
            e.target.parentElement.classList.contains('audience-checkbox'));

        // Close dropdown if click is outside the select or on the checkbox
        if (!isClickInsideSelect || isClickOnCheckbox) {
          setIsAudienceMenuOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAudienceMenuOpen]);

  useEffect(() => {
    if (!isAddingNew) return; // Only proceed if isAddingNew is true

    // Skip fetching position if we're returning from Art Gallery with form values
    if (
      location.state?.selectedImageFromGallery &&
      location.state?.formValues
    ) {
      return; // Don't fetch position if we already have form values from Art Gallery
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/promotion/getPosition?type=${advertType}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
              'Content-Type': 'application/json',
            },
          }
        );
        const result = await response.json();
        if (result.success && result.data?.upcomingPosition) {
          setPosition(result.data.upcomingPosition);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isAddingNew, location.state, publish]);
  // Fetch images for current posts based on advertType
  const fetchAdvertisements = async (
    advertType,
    setAdvertImages,
    setActiveImageIndex
  ) => {
    try {
      const currentToken = localStorage.getItem('token'); // Get fresh token

      const url = `${baseUrl}/promotion/getAll?types=${advertType}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${currentToken}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAdvertImages(data.data.allPromotion);
      setActiveImageIndex(0);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchAdvertisements(advertType, setAdvertImages, setActiveImageIndex);
    console.log('fetchAdvertisements');
  }, [advertType, publish, selectedVenue, token]);

  // Disable audience fields when isAddingNew is true and isEveryone is true
  useEffect(() => {
    if (isAddingNew && isEveryone) {
      // Force disable the audience input fields
      const audienceFields = document.querySelectorAll('.audience-field');
      audienceFields.forEach((field) => {
        field.disabled = true;
        field.classList.add('disabled-field');
      });
    }
  }, [isAddingNew, isEveryone]);

  // On each carousel image change, update the dynamic values from the current API response
  useEffect(() => {
    if (isAddingNew) return;
    if (isFormRestored) return;
    if (
      advertImages &&
      advertImages.length > 0 &&
      advertImages[activeImageIndex]
    ) {
      const current = advertImages[activeImageIndex];
      setPosition(current.position || '');

      // Check if audience is "everyone" or if all options are selected
      if (
        current.audience === 'everyone' ||
        (Array.isArray(current.audience) &&
          current.audience.length === audienceOptions.length)
      ) {
        setIsEveryone(true);
        setAudience(audienceOptions.map((option) => option.value));
      } else if (Array.isArray(current.audience)) {
        setIsEveryone(false);
        setAudience(current.audience);
      } else {
        setIsEveryone(false);
        setAudience([]);
      }

      setDisplayType(current.displayType || 'immediate');
      if (current.displayType === 'schedule') {
        setStartDate(current.startDate ? current.startDate.split('T')[0] : '');
        setEndDate(current.endDate ? current.endDate.split('T')[0] : '');
      } else {
        setStartDate('');
        setEndDate('');
      }
      setMoreInfo(current.htmlContent || '');
      setSavedContent(current.htmlContent || '');
      setEditorContent(current.htmlContent || '');
      setIsEditing(false);
    } else {
      // Reset values if no valid image is selected
      setMoreInfo('');
      setSavedContent('');
      setEditorContent('');
      setPosition('');
      setAudience([]);
      setIsEveryone(false);
      setDisplayType('immediate');
      setStartDate('');
      setEndDate('');
    }
    console.log('advertImage');
  }, [activeImageIndex, advertImages, isAddingNew, isFormRestored]);

  // Check if an image was selected from the Art Gallery
  useEffect(() => {
    if (location.state?.selectedImageFromGallery) {
      const imageUrl = location.state.selectedImageFromGallery;
      console.log('Setting selected image from Art Gallery:', imageUrl);
      setSelectedImage(imageUrl);

      // This is the key difference - we need to set isAddingNew based on location state
      if (location.state.isAddingNew !== undefined) {
        setIsAddingNew(location.state.isAddingNew);
      }

      if (location.state.formValues) {
        const {
          position: savedPosition,
          audience: savedAudience,
          isEveryone: savedIsEveryone,
          displayType: savedDisplayType,
          startDate: savedStartDate,
          endDate: savedEndDate,
          moreInfo: savedMoreInfo,
          id: savedId,
        } = location.state.formValues;

        if (savedPosition) setPosition(savedPosition);
        if (savedIsEveryone !== undefined) setIsEveryone(savedIsEveryone);
        if (savedAudience) setAudience(savedAudience);
        if (savedDisplayType) setDisplayType(savedDisplayType);
        if (savedStartDate) setStartDate(savedStartDate);
        if (savedEndDate) setEndDate(savedEndDate);
        if (savedMoreInfo) {
          setMoreInfo(savedMoreInfo);
          setSavedContent(savedMoreInfo);
        }
        if (savedId) {
          setId(savedId);
          console.log('saved', savedId);
        }
      }

      // Clear location state after processing
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsFormRestored(true);
      console.log('art gallery');
    }
  }, [location.state]);

  // Make sure isAddingNew useEffect doesn't override our form values
  useEffect(() => {
    if (!isAddingNew) return; // Only proceed if isAddingNew is true

    // Skip fetching position if we're returning from Art Gallery with form values
    if (
      location.state?.selectedImageFromGallery &&
      location.state?.formValues
    ) {
      // Don't do anything if coming from Art Gallery with form values
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/promotion/getPosition?type=${advertType}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();
        if (result.success && result.data?.upcomingPosition) {
          setPosition(result.data.upcomingPosition);
          console.log('publish', publish, position);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isAddingNew, location.state, publish]);

  // Handler for "Add New Promotion"
  const handleAddPromotion = () => {
    setPublish((prevState) => !prevState);
    setIsAddingNew(true);
    setIsEveryone(true); // Set to false by default
    setAudience(audienceOptions.map((option) => option.value)); // Start with empty audience
    setMoreInfo('');
    setEditorContent(''); // <-- Clears the live editor
    setSavedContent('');
    setPosition(advertImages.length + 1);
  };

  // Checkbox for "Everyone"
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    console.log('Everyone checkbox changed:', checked);

    // This is the key change - only update isEveryone when the checkbox is clicked
    setIsEveryone(checked);

    if (checked) {
      // When "Everyone" is checked, set audience to include all available options
      setAudience(audienceOptions.map((option) => option.value));

      // Force disable the audience input fields
      const audienceFields = document.querySelectorAll('.audience-field');
      audienceFields.forEach((field) => {
        field.disabled = true;
        field.classList.add('disabled-field');
      });

      // Close and disable the audience dropdown if it's open
      setIsAudienceEditing(false);
      setIsAudienceMenuOpen(false);

      // Force update the Select component's disabled state
      setTimeout(() => {
        const selectContainer = document.querySelector(
          '.audience-select-container'
        );
        if (selectContainer) {
          selectContainer.classList.add('disabled-select');
        }
      }, 0);
    } else {
      // When "Everyone" is unchecked, set audience to empty array
      setAudience([]);

      // Enable the audience input fields
      const audienceFields = document.querySelectorAll('.audience-field');
      audienceFields.forEach((field) => {
        field.disabled = false;
        field.classList.remove('disabled-field');
      });

      // Enable the Select component
      const selectContainer = document.querySelector(
        '.audience-select-container'
      );
      if (selectContainer) {
        selectContainer.classList.remove('disabled-select');
      }
    }
  };

  // File Upload
  const triggerFileInput = () => {
    const current = advertImages[activeImageIndex];
    //console.log("trigger", current._id);

    if (current) {
      setId(current._id);
    } else {
      setId(0);
    }

    handleUploadFromArtGallery(current ? current._id : id);

    //setShowUploadOptions(true);
  };

  // Handle upload from device
  const handleUploadFromDevice = () => {
    setShowUploadOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle upload from Art Gallery
  const handleUploadFromArtGallery = (tempId) => {
    setShowUploadOptions(false);
    console.log('art', tempId);

    // Save current form values to preserve them when returning from Art Gallery
    const formValues = {
      position,
      audience,
      isEveryone,
      displayType,
      startDate,
      endDate,
      moreInfo,
      id: tempId || id,
    };

    navigate('/art-gallery', {
      state: {
        email,
        returnTo: '/digital-app',
        advertType: 'large',
        isAddingNew: isAddingNew,
        formValues, // Pass the form values to preserve them
      },
    });
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

  // Save Editor content (for editing More Information)
  const handleSaveContent = async () => {
    try {
      // If isAddingNew is true AND this is the first time saving (button says "LET AI WRITE THE COPY")
      if (isAddingNew && !isEditing) {
        // Make POST request to AI promotion API
        const response = await fetch(
          'https://imagegenapi.happysmoke-9d58d4d7.australiaeast.azurecontainerapps.io/api/aipromotion',
          {
            method: 'POST',
            headers: {
              Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: editorContent,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Editor response', data);

        // Display message in toaster
        toast.success(data.message || 'Content processed successfully.');

        // Save the promotion_text from response
        const formattedText = parsePromotionText(data.promotion_text);
        setSavedContent(formattedText);
        setMoreInfo(formattedText);
        setEditorContent(formattedText);

        // Set isEditing to true to change button to SAVE
        setIsEditing(true);
      } else {
        // Regular save for both existing posts and after AI content generation
        // Save the current editor content directly
        setSavedContent(editorContent);
        setMoreInfo(editorContent);

        // Display success message
        toast.success('Promotion saved successfully!');

        // Exit editing mode for both new and existing posts
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error processing content:', error);
      toast.error('Failed to process content. Please try again.');
    }
  };

  // Publish
  const handlePublishPromotion = async () => {
    // Always use the latest content, whether it's from editing or saved content
    if (isEditing) {
      setSavedContent(editorContent);
      setMoreInfo(editorContent);
    }

    // For manually entered text in new posts without saving first
    const finalContent = editorContent || savedContent;

    if (!finalContent) {
      toast.error('Please add content before publishing.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('User is not authenticated. Please log in.');
      return;
    }

    if (displayType === 'schedule') {
      const now = new Date();
      const selectedStartDate = new Date(startDate);
      const selectedEndDate = new Date(endDate);

      // if (!startDate || selectedStartDate < now) {
      //   toast.error("Start date must be today or a future date.");
      //   return;
      // }

      // if (!endDate || selectedEndDate < selectedStartDate) {
      //   toast.error("End date must be after the start date.");
      //   return;
      // }
    }

    // Always use selectedImage as the primary image source
    let finalImageUrl = selectedImage;

    // Only fall back to existing image if not adding new and no image selected
    if (!finalImageUrl && advertImages.length > 0 && !isAddingNew) {
      const current = advertImages[activeImageIndex];
      if (current && current.imageUrl) {
        finalImageUrl = current.imageUrl;
      }
    }

    // Validate that we have an image when adding a new promotion
    if (isAddingNew && !finalImageUrl) {
      toast.error('Please upload an image for the promotion.');
      return;
    }

    console.log('Publishing with image URL:', finalImageUrl);
    const payload = {
      type: advertType,
      displayType,
      ...(displayType === 'schedule' && {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }),
      audience: isEveryone
        ? 'everyone'
        : audience.map((item) => item.value || item),
      position: position ? Number(position) : 0,
      imageUrl: finalImageUrl,
      htmlContent: finalContent, // Use the finalContent which prioritizes editorContent
    };

    console.log('Publishing payload:', payload);

    let url = `${baseUrl}/promotion/create`;
    let method = 'POST';

    if (!isAddingNew) {
      const current = advertImages[activeImageIndex];
      let finalId = id; // Keep the existing id

      if (!id) {
        finalId = current._id; // Assign current._id only if id is falsy
      }
      console.log('hey', id);

      url = `${baseUrl}/promotion/edit?_id=${finalId}`;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server Response:', responseData);
        throw new Error(
          responseData.message || `HTTP error! Status: ${response.status}`
        );
      }
      await fetchAdvertisements(
        advertType,
        setAdvertImages,
        setActiveImageIndex
      );
      setId('');
      setIsAddingNew(false);
      setSelectedImage(null);
      setIsFormRestored(false);
      setPublish((prevState) => !prevState);
      console.log('Promotion published (or edited)', responseData);
      toast.success(
        responseData.message || 'Promotion published successfully!'
      );

      if (!isAddingNew) {
        const updatedPost = responseData.data;
        setAdvertImages((prev) =>
          prev.map((post, index) =>
            index === activeImageIndex ? updatedPost : post
          )
        );
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error publishing promotion:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    }
  };

  const deletePromotion = async () => {
    const current = advertImages[activeImageIndex];

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this promotion?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      const url = `${baseUrl}/promotion/delete?id=${current._id}`;
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setPosition('');
          setAudience([]);
          setDisplayType('immediate');
          setStartDate('');
          setEndDate('');
          setMoreInfo('');
          setSavedContent('');
          setEditorContent('');
          setSelectedImage(null);

          await fetchAdvertisements(
            advertType,
            setAdvertImages,
            setActiveImageIndex
          );

          if (advertImages.length <= 1) {
            setActiveImageIndex(0);
          }

          // Swal.fire('Deleted!', 'Promotion deleted successfully.', 'success');
        } else {
          throw new Error('Failed to delete promotion');
        }
      } catch (error) {
        console.error('Error while deleting promotion:', error);
        Swal.fire('Error!', error.message || 'Something went wrong.', 'error');
      }
    }
  };
  // useEffect(() => {
  //   if (position <= 1) {
  //     setPublish((prevState) => !prevState);
  //     setIsAddingNew(true);
  //     setIsEveryone(true);
  //     setAudience(audienceOptions.map((option) => option.value)); // Set audience to include all options
  //     setMoreInfo("");
  //     setEditorContent(""); // <-- Clears the live editor
  //     setSavedContent("");
  //     setPosition(advertImages.length + 1);
  //   }
  // });
  const defaultLargeImage = '/win-img.png';
  const defaultSmallImage = '/nye-img.png';
  const defaultImage =
    advertType === 'small' ? defaultSmallImage : defaultLargeImage;

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
  const parsePromotionText = (rawText) => {
    if (!rawText) return '';

    // If the text contains HTML tags, return it as is
    if (/<[a-z][\s\S]*>/i.test(rawText)) {
      return rawText;
    }

    try {
      // Decode Unicode and keep all special characters safe
      const decoded = decodeURIComponent(
        JSON.parse(`"${rawText.replace(/"/g, '\\"')}"`)
          .split('')
          .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );

      // Replace all \n with two <br /> tags for double space
      return decoded.replace(/\n/g, '<br />');
    } catch (err) {
      console.error('Failed to parse promotion text:', err);
      return rawText.replace(/\n/g, '<br />');
    }
  };

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
              style={{ zIndex: 9999, 
                marginTop: '90px',
                fontSize: '14px',
                minWidth: '300px',
                textAlign: 'center' }}
                  />
      <header className="app-header">
        <div
          className="s2w-logo"
          onClick={() => handleLock()}
        >
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
                  if (!selectedValue) return;

                  try {
                    const response = await axios.post(
                      `${baseUrl}/admin/token`,
                      { appType: selectedValue },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            'token'
                          )}`,
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

                      // Reset any venue-specific state here
                      setAdvertImages([]);
                      setActiveImageIndex(0);
                      setIsAddingNew(false);
                      setAudience([]);
                      setIsEveryone(false);
                      
                      handleLock();
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
        {/* <button
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
        </button> */}
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
      <button className="large-advert-btns">Large Advert</button>
      <button className="small-advert-btns" onClick={handleSubmit}>
        Small Advert
      </button>
      <div className="content-wrapper">
        <section className="current-posts">
          <h2>Current posts</h2>
          <div className="post-card">
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
          <div className="post-details">
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
              <label className="field-label">Audience</label>
              {isAddingNew ? (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div
                    style={{ flex: 1 }}
                    ref={audienceSelectRef}
                    className={`audience-select-container ${
                      isEveryone ? 'disabled-select' : ''
                    }`}
                  >
                    <Select
                      isMulti
                      options={audienceOptions}
                      value={convertAudienceToObjects(audience)}
                      onChange={(e) => {
                        const selectedOptions = Array.isArray(e)
                          ? e.map((x) => x.value)
                          : [];
                        setAudience(selectedOptions);

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
                      // marginLeft: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isEveryone}
                      onChange={handleCheckboxChange}
                      className="audience-checkbox"
                    />
                    &nbsp;Everyone
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{ flex: 1 }}
                    ref={audienceSelectRef}
                    className={`audience-select-container ${
                      isEveryone ? 'disabled-select' : ''
                    }`}
                  >
                    <Select
                      isMulti
                      options={audienceOptions}
                      value={convertAudienceToObjects(audience)}
                      onChange={(e) => {
                        const selectedOptions = Array.isArray(e)
                          ? e.map((x) => x.value)
                          : [];
                        setAudience(selectedOptions);

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
                    &nbsp;Everyone
                  </div>
                </div>
              )}
            </div>

            <div className="field-row display-inline">
              <label className="field-label">Display</label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="displayType"
                  value="immediate"
                  checked={displayType === 'immediate'}
                  onChange={(e) => setDisplayType(e.target.value)}
                  style={{ accentColor: '#002977' }}
                />
                Immediate
              </label>
            </div>

            <div className="field-row schedule-row">
              <label className="field-label"></label>
              <div className="schedule-inline">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="displayType"
                    value="schedule"
                    checked={displayType === 'schedule'}
                    onChange={(e) => setDisplayType(e.target.value)}
                    style={{ accentColor: '#002977' }}
                  />
                  Schedule
                </label>
                <div className="date-fields">
                  <label className="date-label">
                    Start Date
                    <input
                      type="date"
                      className="date-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </label>
                  <label className="date-label">
                    End Date
                    <input
                      type="date"
                      className="date-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MORE INFORMATION */}
        <section className="more-info">
          <h2>More Information</h2>
          <div
            style={{
              maxHeight: '330px',
              overflowY: 'auto',
              paddingBottom: '1rem',
            }}
          >
            {isAddingNew || isEditing ? (
              <Editor
                apiKey="w4ovbh419s7ro991pcvugbe4jg7r7h7xq33ai8n5mdsk1yqu"
                value={editorContent}
                onEditorChange={(newValue) => setEditorContent(newValue)}
                init={{
                  height: 330,
                  menubar: 'edit insert view format table tools',
                  plugins: 'lists link image help wordcount',
                  toolbar:
                    'bold italic underline | image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  branding: false,
                  resize: false,
                  automatic_uploads: true,
                  images_reuse_filename: true, // Keeps original filename
                  convert_urls: false, // Prevents TinyMCE from modifying the image URL

                  images_upload_handler: function (blobInfo, success, failure) {
                    // Build the form data for Cloudinary
                    const formData = new FormData();
                    formData.append('file', blobInfo.blob());
                    formData.append('upload_preset', 'tinyMCE_uploads'); // Replace with your actual upload preset

                    // IMPORTANT: Return the promise chain!
                    return fetch(
                      'https://api.cloudinary.com/v1_1/djxzqns2o/image/upload',
                      {
                        method: 'POST',
                        body: formData,
                        // headers: {
                        //   Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
                        //   'Content-Type': 'application/json',
                        // },
                      }
                    )
                      .then((response) => {
                        // Check if the response is OK; if not, throw an error
                        if (!response.ok) {
                          throw new Error(
                            'Upload failed with status ' + response.status
                          );
                        }
                        return response.json();
                      })
                      .then((result) => {
                        console.log('Cloudinary Upload Result:', result);
                        if (result.secure_url) {
                          // Log and call the success callback so TinyMCE can insert the image
                          console.log('Final Image URL:', result.secure_url);
                          success({
                            src: result.secure_url, // Must be a string
                            alt: '', // Optional alt text
                            meta: {}, // Optional additional metadata
                          });
                        } else {
                          throw new Error(
                            'Cloudinary did not return a secure_url'
                          );
                        }
                        // Return data so that the promise chain is maintained
                        return result.secure_url;
                      })
                      .catch((error) => {
                        console.error('Upload Error:', error);
                        // If the failure callback exists, call it with the error message
                        if (typeof failure === 'function') {
                          failure(error.message);
                        }
                        // Also return a rejected promise to maintain the chain
                        return Promise.reject(error);
                      });
                  },
                }}
              />
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    parsePromotionText(moreInfo) ||
                    '<p>No additional information available.</p>',
                }}
              />
            )}
          </div>
        </section>

        {/* PREVIEW */}
        <section className="preview">
          <h2>Preview</h2>
          <div style={{ position: 'relative' }}>
            <div
              className="preview-image"
              style={
                isEditing && !isAddingNew ? { filter: 'blur(6px)' } : undefined
              }
            >
              <div className="bg-img">
                <img
                  src="/mobile-img.png"
                  alt="PREVIEW"
                  style={{ height: 'auto' }}
                />
              </div>
              <div className="phone-screen">
                {/* If not editing or if adding new, show the overlay image */}
                {!isEditing || isAddingNew ? (
                  <>
                    {isAddingNew ? (
                      <>
                        {selectedImage && (
                          <img
                            className="overlay-image"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            src={selectedImage}
                            alt="Uploaded Preview"
                          />
                        )}
                      </>
                    ) : selectedImage ? (
                      <img
                        className="overlay-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        src={selectedImage}
                        alt={`POST ${activeImageIndex + 1}`}
                      />
                    ) : advertImages.length > 0 ? (
                      <img
                        className="overlay-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        src={
                          advertImages[activeImageIndex].imageUrl ||
                          advertImages[activeImageIndex]
                        }
                        alt={`POST ${activeImageIndex + 1}`}
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            {/* Pop-out preview if editing existing */}
            {isEditing && !isAddingNew && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '65%',
                  maxWidth: '70%',
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  zIndex: 999,
                  marginTop: '85px',
                  maxHeight: '70%',
                  overflowY: 'auto',
                }}
              >
                <img
                  style={{
                    width: '100%',
                    borderRadius: '8px 8px 0 0',
                    objectFit: 'cover',
                  }}
                  src={
                    selectedImage
                      ? selectedImage
                      : advertImages.length > 0
                      ? advertImages[activeImageIndex].imageUrl ||
                        advertImages[activeImageIndex]
                      : defaultImage
                  }
                  alt="Pop Out"
                />
                <div
                  style={{ padding: '1rem' }}
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========== CONTROL BUTTONS ========== */}
      <button
        className="publish-btn icon-button"
        onClick={handlePublishPromotion}
      >
        <FaCheck className="button-icon" />
        PUBLISH
      </button>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      {!isAddingNew ? (
        <>
          <button className="upload-btn icon-button" onClick={triggerFileInput}>
            <FaCloudUploadAlt className="button-icon" />
            CHANGE IMAGE
          </button>
          <button onClick={deletePromotion} className="delete-btn icon-button">
            <FaTrashAlt className="button-icon" />
            DELETE POST
          </button>
        </>
      ) : (
        <>
          <button
            className="upload-btn-add-new icon-button"
            onClick={triggerFileInput}
          >
            <FaCloudUploadAlt className="button-icon" />
            UPLOAD NEW IMAGE
          </button>
        </>
      )}

      {!isAddingNew ? (
        <>
          <button
            className="add-promotion-btn icon-button"
            onClick={handleAddPromotion}
          >
            <FaPlusCircle className="button-icon" />
            ADD NEW PROMOTION
          </button>
          {isEditing ? (
            <button
              className="edit-btn icon-button"
              onClick={handleSaveContent}
              style={{ marginTop: '1.5rem' }}
            >
              <FaEdit className="button-icon" />
              SAVE
            </button>
          ) : (
            <button
              className="edit-btn icon-button"
              style={{ marginTop: '1.5rem' }}
              onClick={() => {
                setEditorContent(moreInfo);
                setIsEditing(true);
              }}
            >
              <FaEdit className="button-icon" />
              EDIT
            </button>
          )}
        </>
      ) : (
        <>
          {isEditing ? (
            <button
              className="edit-btn icon-button"
              onClick={handleSaveContent}
              style={{ marginTop: '1.5rem' }}
            >
              <FaEdit className="button-icon" />
              SAVE
            </button>
          ) : (
            <button
              className="edit-btn icon-button"
              onClick={handleSaveContent}
              style={{ marginTop: '1.5rem' }}
            >
              LET AI WRITE THE COPY
            </button>
          )}
        </>
      )}
      
      <style>{`
        .bg-img {
          position: relative;
          margin: 0 auto;
        }
        .top-image {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          max-width: 300px;
        }
        @media (max-width: 600px) {
          .top-image {
            width: 60%;
          }
        }
      `}</style>

      {/* Upload Options Modal */}
      {showUploadOptions && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90%',
            }}
          >
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
              Choose Upload Option
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <button
                className="modal-btn"
                onClick={handleUploadFromDevice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#002977',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                <FaCloudUploadAlt /> UPLOAD FROM DEVICE
              </button>
              <button
                className="modal-btn"
                onClick={handleUploadFromArtGallery}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#002977',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                <FaImages /> UPLOAD FROM ART GALLERY
              </button>
              <button
                className="modal-btn"
                onClick={() => setShowUploadOptions(false)}
                style={{
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalApp;
