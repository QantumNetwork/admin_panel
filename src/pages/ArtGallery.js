import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
// import AppLayout from "../components/AppLayout";
// import Select from "react-select";
// import { Editor } from "@tinymce/tinymce-react";
import {
  FaRegStar,
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaPaintBrush,
  FaTrash,
} from 'react-icons/fa';
import '../styles/art-gallery.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { uploadFileToS3, uploadImageToS3 } from '../s3/config';

const ArtGallery = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  // Get data from navigation state if available
  const email = localStorage.getItem('userEmail');
  const returnTo = location.state?.returnTo || null;
  const advertType = location.state?.advertType || 'large';
  const isAddingNew = location.state?.isAddingNew || false;
  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');
  const [isEditMode, setIsEditMode] = useState(false);

  // Default to 'A' if userInitial is not provided
  const userInitial = email.charAt(0).toUpperCase() || 'A';

  const [activeTab, setActiveTab] = useState(
    advertType === 'small'
      ? 'Small'
      : advertType === 'Special-Offers'
      ? 'Special-Offers'
      : 'Large'
  );
  const [allImage, setAllImage] = useState('');
  const [prompt, setPromot] = useState('');
  const [size, setSize] = useState(
    advertType === 'small'
      ? 'Small'
      : advertType === 'Special-Offers'
      ? 'Voucher'
      : 'Large'
  );
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState('');
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Track upload state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [imageSize, setImageSize] = useState(
    advertType === 'Large'
      ? 'Large'
      : advertType === 'small'
      ? 'Small'
      : advertType === 'Special-Offers'
      ? 'Voucher'
      : 'Large'
  );
  // Add state to track selected images
  const [selectedImages, setSelectedImages] = useState([]);

  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [canEdit, setCanEdit] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSize(tab === 'Special-Offers' ? 'Small' : tab);
    setImageSize(
      tab === 'Large' ? 'Large' : tab === 'Small' ? 'Small' : 'Voucher'
    );
    setImage('');
    setPromot('');
    setShowImage('');
    setSelectedImages([]); // Clear selected images on tab change
    setIsEditMode(false);
    setCanEdit(true);
    console.log(size);
    // Update size based on the selected tab
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage

        if (!token) {
          toast.error('No authentication token found!');
          return;
        }

        const url = `${baseUrl}/image/get?size=${imageSize}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
            'Content-Type': 'application/json',
          },
        });

        if (response.data && response.data.success) {
          setAllImage(response.data.data); // Store images in state
        } else {
          throw new Error(response.data.message || 'Failed to fetch images');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error(error.message || 'Something went wrong!');
      }
    };

    fetchImages(); // Call the function when the component mounts
  }, [
    size,
    showImage,
    imageUploaded,
    deleted,
    imageSize,
    selectedVenue,
    token,
  ]);

  useEffect(() => {
    if (!isAddingNew) return; // Only proceed if isAddingNew is true

    // IMPORTANT: Skip ALL processing if we're returning from Art Gallery
    if (
      location.state?.selectedImageFromGallery ||
      location.state?.artGalleryProcessed
    ) {
      console.log(
        'SKIPPING default initialization - Art Gallery image detected'
      );
      return;
    }

    // ALSO skip if we already have an image selected (from device upload or elsewhere)
    if (selectedImage) {
      console.log('SKIPPING default initialization - image already selected');
      return;
    }

    console.log('Running default initialization for new promotion');

    // Only fetch position when initially setting up a new promotion
    const fetchData = async () => {
      try {
        // Fetch data logic here
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isAddingNew, location.state, selectedImage]);

  const generateImage = async (prompt, size) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      if (!token) {
        toast.error('No authentication token found!');
        return;
      }

      const response = await axios.post(
        'https://imagegenapi.happysmoke-9d58d4d7.australiaeast.azurecontainerapps.io/api/generatenewimage',
        {
          prompt,
          size,
          headers: {
            Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
            'Content-Type': 'application/json',
          },
        }
      );
      localStorage.setItem('ai', response.data.dalleprompt);
      console.log(response.data.dalleprompt);

      setImage(response.data.image_url);
      return response.data.dalleprompt;
    } catch (error) {
      console.error('Error generating image:', error.message);
      throw error;
    }
  };

  const updateImage = async (dalleprompt, context_prompt, size) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      if (!token) {
        toast.error('No authentication token found!');
        return;
      }

      const response = await axios.post(
        'https://imagegenapi.happysmoke-9d58d4d7.australiaeast.azurecontainerapps.io/api/generatecontextimage',
        {
          dalleprompt,
          context_prompt,
          size,
          headers: {
            Authorization: token ? `Bearer ${token}` : '', // Pass token in headers
            'Content-Type': 'application/json',
          },
        }
      );
      localStorage.setItem('ai', response.data.dalleprompt);
      setImage(response.data.image_url);
      return response.data.dalleprompt;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  };

  const uploadImage = async (token, image, size) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      if (!token) {
        toast.error('No authentication token found!');
        return;
      }
      const response = await axios.post(
        `${baseUrl}/image/create`,
        { image, size }, // Send correct payload
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '', // Pass token as Bearer Token
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);

      throw error;
    }
  };

  const handleCreateImage = async () => {
    try {
      setIsLoading(true);
      const imageData = await generateImage(prompt, size);
      console.log('Image Generated:', imageData);
      setShowImage(true);
    } catch (error) {
      console.error('Failed to generate image', error);
    } finally {
      setIsLoading(false); // Hide loader after generation is done
    }
  };

  const handleStart = async () => {
    try {
      localStorage.removeItem('ai');
      setPromot('');
      setShowImage(false);
      setIsEditMode(false);
      setCanEdit(true);
    } catch (error) {
      console.error('Failed to generate image');
    }
  };

  const handleUpdateImage = async () => {
    try {
      if (!image || !prompt) {
        toast.error('Image or prompt missing');
        return;
      }

      setIsUpdating(true);

      // 1️⃣ Prepare FormData
      const formData = new FormData();
      formData.append('prompt', prompt);

      // Download current image (which is already PNG from Edit step)
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: 'image/png' });

      formData.append('image', file);
      formData.append('username', 'Venkatasai'); // Replace with dynamic username if needed

      // 2️⃣ Call Image Editing API
      const editResponse = await axios.post(
        'https://imageeditingapi.delightfulbay-e55c1ce2.australiaeast.azurecontainerapps.io/edit',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (editResponse.data.astatus !== 'Success') {
        throw new Error('Image editing failed');
      }

      // 3️⃣ Convert Base64 → File
      const base64Data = editResponse.data.image;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const editedBlob = new Blob([byteArray], { type: 'image/png' });
      const editedFile = new File([editedBlob], 'edited-image.png', {
        type: 'image/png',
      });

      // 4️⃣ Upload to S3
      const s3Url = await uploadImageToS3(editedFile);

      // 5️⃣ Save new image in state
      setImage(s3Url);
      setUploadedImages((prev) => [...prev, s3Url]);
      setShowImage(true);
      setIsEditMode(false);
      setCanEdit(true);
      
      if(!returnTo){
        toast.success('Image updated successfully!');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadImage = async () => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');

      // Save last image
      const response = await uploadImage(token, image, imageSize);

      if (response && response.success && !returnTo) {
        toast.success('Image saved to gallery');

        // 🧹 Clear prompt & AI state
        setPromot('');
        localStorage.removeItem('ai');
        setShowImage(false);

        // Delete all previous images except the last one
        if (uploadedImages.length > 1) {
          const oldImages = uploadedImages.slice(0, -1); // all except last
          await axios.post(
            `${baseUrl}/image/delete-from-s3`,
            { urls: oldImages },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Deleted old images:', oldImages);
        }

        // Reset array to keep only last one
        setUploadedImages([image]);

        // 🔄 Trigger gallery reload
        setImageUploaded((prev) => !prev);
      }
    } catch (error) {
      console.error('Failed to save image', error);
      toast.error('Failed to save image');
    } finally {
      setIsUploading(false);
    }
  };
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (!selectedFiles.length) return;

    try {
      setIsUploading(true); // Show loader
      setFilesToUpload(selectedFiles); // Store the files for progress tracking
      const token = localStorage.getItem('token');

      // Upload all files in parallel
      const uploadPromises = selectedFiles.map(async (file) => {
        const imageUrl = await uploadFileToS3(file);
        console.log('Uploaded Image URL:', imageUrl);

        const response = await uploadImage(token, imageUrl, imageSize);
        return {
          url: response.data.image,
          originalUrl: imageUrl,
        };
      });

      const results = await Promise.all(uploadPromises);

      // Update state with the last uploaded image (to maintain backward compatibility)
      if (results.length > 0) {
        const lastUpload = results[results.length - 1];
        setImage(lastUpload.url);
        setSelectedImage(lastUpload.originalUrl);
      }

      // Update the list of all selected images
      const newImageUrls = results.map((r) => r.url);
      setSelectedImages((prev) => [...prev, ...newImageUrls]);
      setImageUploaded((prev) => !prev);
      setFilesToUpload([]); // Clear the files after upload

      //toast.success(`Successfully uploaded ${selectedFiles.length} image(s)`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed', {
        autoClose: 3000,
        position: 'top-center',
      });
    } finally {
      setIsUploading(false);
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
    window.location.href = path;
  };

  // New function to handle selecting an image from gallery
  const handleSelectImage = (imageUrl) => {
    if (!returnTo) {
      toast.error('No return destination specified');
      return;
    }

    // Get the original form values from location state
    const formValues = location.state?.formValues || {};

    console.log('Returning to Special Offers with form values:', formValues);

    // Navigate back to the advert page with the selected image URL
    navigate(returnTo, {
      state: {
        email,
        selectedImageFromGallery: imageUrl,
        isAddingNew: isAddingNew,
        formValues, // Pass back the exact form values that were sent from the promotion page
      },
    });
  };

  // New function to handle image selection (for multi-select)
  const handleImageSelection = (imageUrl) => {
    // Toggle selection - if already selected, remove it, otherwise add it
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageUrl));
    } else {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  // New function to handle image click
  const handleImageClick = (imageUrl) => {
    if (returnTo) {
      // If in returnTo mode, use the existing handleSelectImage function
      handleSelectImage(imageUrl);
    } else {
      // Otherwise, use the multi-select functionality
      handleImageSelection(imageUrl);
    }
  };
  const handleDeleteImage = async (imgId) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage

      // Remove the image from the frontend state first
      setSelectedImages((prev) => prev.filter((image) => image !== imgId));

      // Call API to delete the image from the backend
      await axios.delete(`${baseUrl}/image/delete?id=${imgId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', // Attach token in headers
        },
      });
      setDeleted((prevDeleted) => !prevDeleted);
      console.log('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
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

  const handleEditImageUpload = async () => {
    try {
      if (!image) {
        toast.error('No image selected');
        return;
      }

      setIsEditing(true);
      const response = await axios.post(
        `${baseUrl}/image/move-to-s3`,
        { imageUrl: image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const s3Url = response.data.s3Url;

        setImage(s3Url);
        setUploadedImages((prev) => [...prev, s3Url]);
        setIsEditMode(true);
        setShowImage(true);
        setCanEdit(false); // 👈 Hide Edit, show Update

        setPromot(''); // 👈 Clear textarea so user starts fresh
        //toast.success('Image moved to S3 and saved locally as PNG');
      } else {
        toast.error(response.data.message || 'Failed to move image');
      }
    } catch (err) {
      console.error('Error during edit upload:', err);
      toast.error('Error processing image');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="digital-app-container-ag">
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
      {/* <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}

      <div
        className="page-container-ag"
        // style={{ overflow: "auto", height: "100vh" }}
      >
        {/* Navigation Buttons */}
        <div className="navigation-buttons-ag">
          <div className="nav-tabs-ag">
            <button
              className={`${
                activeTab === 'Large'
                  ? 'live-offers-ag-btn'
                  : 'expired-offers-ag-btn'
              } ${activeTab === 'Large' ? 'active' : ''}`}
              onClick={() => handleTabClick('Large')}
            >
              Large Advert
            </button>

            <button
              className={`${
                activeTab === 'Small'
                  ? 'live-offers-ag-btn'
                  : 'expired-offers-ag-btn'
              } ${activeTab === 'Small' ? 'active' : ''}`}
              onClick={() => handleTabClick('Small')}
            >
              Small Advert
            </button>

            <button
              className={`${
                activeTab === 'Special-Offers'
                  ? 'live-offers-ag-btn'
                  : 'expired-offers-ag-btn'
              } ${activeTab === 'Special-Offers' ? 'active' : ''}`}
              onClick={() => handleTabClick('Special-Offers')}
            >
              Special Offers
            </button>
          </div>
        </div>
        {/* Start */}
        <div className="d-flex">
          <div className="column-image">
            <h6>Gallery</h6>
            <div className="gallery">
              {allImage.length > 0 ? (
                allImage.map((img) => (
                  <figure
                    className={`gallery-item ${
                      img.size.includes('Small') || img.size.includes('Voucher')
                        ? 'gallery-items'
                        : ''
                    } ${
                      selectedImages.includes(img.image) ? 'selected-image' : ''
                    }`}
                    key={img._id}
                    onClick={() => handleImageClick(img.image)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      border: selectedImages.includes(img.image)
                        ? '3px solid #5396D1'
                        : 'none',
                    }}
                  >
                    {selectedImages.includes(img.image) && (
                      <div
                        className="trash-icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the image selection
                          handleDeleteImage(img._id);
                        }}
                      >
                        <FaTrash color="white" />
                      </div>
                    )}
                    <img
                      className="thumbnail"
                      src={img.image}
                      alt="Generated"
                    />
                    {returnTo && (
                      <div
                        className="image-overlay"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0, 41, 119, 0.3)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        <span>Click to select</span>
                      </div>
                    )}
                  </figure>
                ))
              ) : (
                <p>No images found</p>
              )}
              <input
                type="file"
                ref={fileInputRef} // Use ref instead of id
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
            </div>

            <button
              class="sky-btn icon-button"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 640 512"
                class="button-icon"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"></path>
              </svg>{' '}
              UPLOAD NEW IMAGE
            </button>
          </div>
          {/* {isUploading && filesToUpload.length > 0 && (
              <div className="upload-progress">
                Uploading {filesToUpload.length} file{filesToUpload.length !== 1 ? 's' : ''}...
              </div>
            )} */}
          {/* image part End */}

          <div className="ai-column d-flex">
            <div className="w-100">
              <h2>AI Image Creation</h2>
              <h6
                // style={{
                //   paddingBottom:
                //     activeTab === 'Small' || activeTab === 'Special-Offers'
                //       ? '50px'
                //       : '30px', // Change padding conditionally
                // }}
              >
                Create an image in seconds
              </h6>
            </div>
            <div className="w-100">
              {!showImage &&
                (isLoading ? (
                  <div className="video-container">
                    <div
                      className={`video-wrapper ${
                        activeTab === 'Small' || activeTab === 'Special-Offers'
                          ? 'small-video'
                          : ''
                      }`}
                    >
                      <video autoPlay loop muted className="video-player">
                        <source src="/S2W_Image LoadLT.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                ) : (
                  <p className="space-text-ai">
                    Type what image you would like in the box below and let AI
                    do the rest
                  </p>
                ))}

              {showImage && (
                <figure className="ai-item" style={{ position: 'relative' }}>
                  {activeTab === 'Large' ? (
                    <img className="thumbnail" src={image} />
                  ) : (
                    <img className="thumbnail1" src={image} />
                  )}

                  {isUploading && (
                    <div className="loader-overlay">
                      <div className="spinner"></div>
                    </div>
                  )}
                </figure>
              )}
            </div>

            <div className="d-flex w-100">
              <div className="w-100">
                <textarea
                  className="text-area-ai-text"
                  rows="4"
                  cols="50"
                  style={{ paddingTop: '40px',
                    marginBottom: activeTab === 'Small' || activeTab === 'Special-Offers' ? '0px' : '0px'}}
                  placeholder={
                    isEditMode
                      ? 'Edit your changes here and select Update button'
                      : 'Type a description of the image here'
                  }
                  value={prompt}
                  onChange={(e) => setPromot(e.target.value)}
                ></textarea>
              </div>
            </div>

            {showImage && !isEditMode && (
              <div className="d-flex align-items-end w-100 justify-content-center">
                <button
                  className="sky-btn save-gallery-btn"
                  onClick={handleUploadImage}
                >
                  SAVE IMAGE TO GALLERY
                </button>
              </div>
            )}

            {showImage && isEditMode && (
              <div className="d-flex align-items-end w-100 justify-content-center">
                <button className="sky-border-btn" onClick={handleUpdateImage}>
                  Update Image
                </button>
              </div>
            )}

            {!showImage && (
              <div
                className="d-flex w-100 justify-content-center"
                style={{ marginTop: '0px' }} // 👈 pushes button up relative to bottom
              >
                <button className="sky-btn" onClick={handleCreateImage}>
                  CREATE IMAGE
                </button>
              </div>
            )}

            {showImage && (
              <div className="d-flex align-items-end btn-gap">
                <button className="sky-border-btn" onClick={handleStart}>
                  Start Over
                </button>
                {showImage && canEdit && !isEditMode && (
                  <button
                    className="sky-border-btn"
                    onClick={handleEditImageUpload}
                  >
                    Edit Image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {isUploading && !isEditing && (
          <div className="loaders-overlay-gallery">
            <div className="spinner"></div>
            <p className="uploading-text">Uploading...</p>
          </div>
        )}
        {isUpdating && (
          <div className="loaders-overlay-gallery">
            <div className="spinner"></div>
            <p className="uploading-text">Updating...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtGallery;
