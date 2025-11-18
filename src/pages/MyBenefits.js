import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import { Editor } from '@tinymce/tinymce-react';
import {
  FaRegStar,
  FaUpload,
  FaBullhorn,
  FaGift,
  FaUtensils,
  FaPaintBrush,
} from 'react-icons/fa';
import '../styles/my-benefits.css';
import { trackMenuAccess, handleLogout } from '../utils/api';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { uploadFileToS3 } from '../s3/config';

const MyBenefits = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const defaultContent = `<ul><li>50% off all Meals</li>
<li>$2 off Drinks</li>
<li>Double F&amp;B Points</li>
<li>Complimentary Coffee</li>
<li>Premium Offers</li>
<li>Discounted Events</li></ul>`;
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(true);
  const [previewContent, setPreviewContent] = useState(content);
  const [benefitId, setBenefitId] = useState(null);
  const access = localStorage.getItem('access');
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  // Change the initial state for selectedLevel to:
  const [selectedLevel, setSelectedLevel] = useState(() => {
    const savedVenue = localStorage.getItem('selectedVenue');
    if(savedVenue === 'Manly') return 'Commodore';
    if(savedVenue === 'Hogan') return 'Bronze';
    if(savedVenue === 'North') return 'Gold';
    if(savedVenue === 'StarReward') return 'Valued';
    if(savedVenue === 'Queens') return 'Queens';
    if(savedVenue === 'Ace') return 'Staff';
    if(savedVenue === 'Montauk' || savedVenue === 'Central') return 'Premium Member';
    if(savedVenue === 'Brisbane') return 'Brew Crew';
    if(savedVenue === 'Bluewater') return 'Deckhand';
    return 'Platinum Black';
  });

  // Map level to corresponding image path based on venue
  const getLevelImagePath = (level) => {
    const venue = selectedVenue?.toLowerCase() || '';
    const levelLower = level.toLowerCase().replace(/\s+/g, '_');
    return `/${venue}_${levelLower}.png`;
  };

  // Map level to corresponding bullet point color
  const getBulletColor = (level) => {
    switch (level) {
      case 'Gold':
      case 'Captain':
        if(selectedVenue === 'Manly') return '#D4AF37'; // Gold color
        if(selectedVenue === 'Bluewater') return '#26AEB1';        
      case 'Queens':
      case 'Silver':
        return '#C0C0C0'; // Silver color
      case 'Pre Staff':
        return '#C0C0C0'; // Silver color
      case 'Valued':
        if (selectedVenue === 'Montauk') return '#006D88';
        if (selectedVenue === 'Central') return '#FF0000';
        if (selectedVenue === 'Qantum') return '#4CAF50';
        if (selectedVenue === 'StarReward' || selectedVenue === 'MaxGaming') return '#FF0000';
        if (selectedVenue === 'North') return '#29364a';
      case 'Staff Pre 3Mth':
        return '#FF0000';
      case 'Star Staff':
        return '#FF0000';
      case 'Platinum':
        return '#B0B0B0'; // Platinum color
      case 'Platinum Black':
        return '#333333'; // Dark gray/black color
      case 'Premium':
        if (selectedVenue === 'Montauk') return '#26AEB1';
        if (selectedVenue === 'Central') return '#333333';
      case 'Member':
        if (selectedVenue === 'Montauk') return '#344361';
        if (selectedVenue === 'Central') return '#602373';
        if (selectedVenue === 'Brisbane') return '#376cc3ff'
      case 'Commodore':
        if(selectedVenue === 'Manly') return '#B0B0B0';
        if(selectedVenue === 'Bluewater') return '#333333';
      case 'Commander':
        return '#C0C0C0';
      case 'Lieutenant':
        return '#9D5F2D';
      case 'Staff':
        if (selectedVenue === 'Hogan') return '#45d4e1ff';
        if (selectedVenue === 'Ace') return '#dedadabd';
        return '#9D5F2D';
      case 'Crewmate':
        return '#344361';
      case 'Non Financial':
        return '#b8cbe2';
      case 'Pearl':
        return '#E8EDEE';
      case 'Opal':
        return '#aec7fc';
      case 'Ruby':
        return '#FF0000';
      case 'Sapphire':
        return '#4d8be3';
      case 'Diamond':
        return '#22D7FF';
      case 'Directors':
        return '#040e0fff';
      case 'Family':
      case 'Deckhand':
        return '#3783d4ff';
      case 'Emerald':
      case 'Management':
        return '#29610fff';
      case 'Jacks':
      case 'Bronze':
        return '#9D5F2D';
      case 'Diamond+':
        return '#7ed9edff';
      case 'Ace':
      case 'Ace Plus':
        return '#3d80a4ff';
      case 'Tens':
        return '#969393e4'
      case 'Curtis Coast':
        return '#c7e957ff';
      case 'Brew Crew':
        return '#090606ff';
      case 'Regular':
        return '#9fd8e9ff';
      case 'Champion':
        return '#3313d5ff';
      case 'Legend':
        return '#f8f5f5c3';
      case 'Firstmate':
        return '#c14810ff'
      case 'Admiral':
        return '#23a5ec';
      default:
        return '#D4AF37'; // Default gold color
    }
  };

  let audienceOptions = [];

  if (
    selectedVenue === 'Qantum' ||
    selectedVenue === 'MaxGaming' 
  ) {
    // Options for audience selection
    audienceOptions = [
      { value: 'Platinum Black', label: 'Platinum Black' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ];
  } else if (selectedVenue === 'Manly') {
    // Options for audience selection

    audienceOptions = [
      { value: 'Commodore', label: 'Commodore' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commander', label: 'Commander' },
      { value: 'Lieutenant', label: 'Lieutenant' },
      { value: 'Crewmate', label: 'Crewmate' },
      { value: 'Non Financial', label: 'Non Financial' },
    ];
  } else if (selectedVenue === 'Montauk' || selectedVenue === 'Central') {
    audienceOptions = [
      { value: 'Premium Member', label: 'Premium Member' },
      { value: 'Member', label: 'Member' },
    ];
  } else if (selectedVenue === 'Hogan') {
    audienceOptions = [
      {value: 'Bronze', label: 'Bronze'},
      {value: 'Silver', label: 'Silver'},
      {value: 'Gold', label: 'Gold'},
      {value: 'Platinum', label: 'Platinum'},
      {value: 'Staff', label: 'Staff'},
      {value: 'Management', label: 'Management'},
      {value: 'Family', label: 'Family'},
      {value: 'Directors', label: 'Directors'},
    ];
  } else if (selectedVenue === 'North') {
    audienceOptions = [
      {value: 'Gold', label: 'Gold'},
      {value: 'Platinum', label: 'Platinum'},
      {value: 'Pre Staff', label: 'Pre Staff'},
      {value: 'Silver', label: 'Silver'},
      {value: 'Staff', label: 'Staff'},
      {value: 'Valued', label: 'Valued'}
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
  } else if (selectedVenue === 'Bluewater') {
    audienceOptions = [  
      { value: 'Deckhand', label: 'Deckhand' },
      { value: 'Firstmate', label: 'Firstmate' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commodore', label: 'Commodore' },
      { value: 'Admiral', label: 'Admiral' },
    ];
  }

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

  // Convert level name to the API expected format
  const formatLevelForApi = (level) => {
    return level;
  };

  // Fetch benefits content for the selected level
  const fetchBenefitsContent = async (level) => {
    try {
      const token = localStorage.getItem('token');
      const formattedLevel = formatLevelForApi(level);

      const response = await axios.get(
        `${baseUrl}/benefits/all?type=${formattedLevel}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data.data) {
        setContent(response.data.data.htmlcontent || content);
        setPreviewContent(response.data.data.htmlcontent || content);
        setBenefitId(response.data.data._id || null);
      }
    } catch (error) {
      console.error('Error fetching benefits:', error);
      setContent('');
      setPreviewContent('');
      setBenefitId(null);
      // toast.error("No benefits found for this level.");
    }
  };

  // Fetch benefits when component mounts
  useEffect(() => {
    fetchBenefitsContent(selectedLevel);
  }, []);

  const handleSave = () => {
    if (editorRef.current) {
      let newContent = editorRef.current.getContent();

      // Ensure content is formatted as bullet points if not already
      if (!newContent.includes('<ul>')) {
        // Convert paragraph-based content to bullet list
        newContent = newContent.replace(/<p>(.*?)<\/p>/g, '<li>$1</li>');
        if (newContent.includes('<li>')) {
          newContent = '<ul>' + newContent + '</ul>';
        }
      }

      setContent(newContent);
      setIsEditing(false);
      toast.success('Benefits saved successfully!');
      setTimeout(() => {
        toast.dismiss();
      }, 10000);
    }
  };

  const handlePublish = async () => {
    if (isEditing) {
      toast.warning('Please save your changes before publishing!');
      setTimeout(() => {
        toast.dismiss();
      }, 10000);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Convert level name to the API expected format
      let typeValue = formatLevelForApi(selectedLevel);

      let response;

      if (benefitId) {
        // If benefit ID exists, use UPDATE API
        response = await axios.put(
          `${baseUrl}/benefits/edit?id=${benefitId}`,
          {
            htmlcontent: content,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // If no benefit ID, use CREATE API
        response = await axios.post(
          `${baseUrl}/benefits/create`,
          {
            type: typeValue,
            htmlcontent: content,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        console.log(response.data);
        toast.success('Benefits published successfully!');
        setTimeout(() => {
          toast.dismiss();
        }, 10000);

        // Refresh the benefits data to get the ID if it was a create operation
        if (!benefitId) {
          fetchBenefitsContent(selectedLevel);
        }
      } else {
        toast.error('Failed to publish benefits. Please try again.');
        setTimeout(() => {
          toast.dismiss();
        }, 10000);
      }
    } catch (error) {
      console.error('Error publishing benefits:', error);
      toast.error('Error publishing benefits. Please try again.');
      setTimeout(() => {
        toast.dismiss();
      }, 10000);
    }
    setIsEditing(true);
  };

  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setSelectedLevel(newLevel);
    fetchBenefitsContent(newLevel);
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
    // <div className="my-benefits-container">
    <div className="digital-app-container-so">
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
                      marginTop: '90px',
                      fontSize: '14px',
                      minWidth: '300px',
                      textAlign: 'center' }}
                        />
      <header className="app-header">
        <div
          className="s2w-logo"
          onClick={async () => await handleLock()}
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

                  // Reset the level based on the new venue
                  const newLevel =
                    selectedValue === 'Manly' ? 'Commodore' : 'Gold';
                  setSelectedLevel(newLevel);

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
                  // Fetch benefits for the new level
                  fetchBenefitsContent(newLevel);
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
      <div className="page-container-mb benefits-page">
        <div className="page-header">
          <h1 style={{ color: '#002977' }}>My Benefits</h1>
          <button className="publish-button-mb" onClick={handlePublish}>
            <FaUpload /> Publish
          </button>
        </div>

        <div className="benefits-content">
          <div className="editor-section">
            <div className="level-selector">
              <select value={selectedLevel} onChange={handleLevelChange}>
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {isEditing ? (
              <Editor
                apiKey="w4ovbh419s7ro991pcvugbe4jg7r7h7xq33ai8n5mdsk1yqu"
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                  // Set up editor to format content as bullet points automatically
                  editor.on('keydown', function (e) {
                    if (e.keyCode === 13) {
                      // Enter key
                      const selection = editor.selection;
                      const node = selection.getNode();

                      // If we're not already in a list, create one
                      if (node.nodeName !== 'LI') {
                        editor.execCommand('InsertUnorderedList');
                      }
                    }
                  });

                  // Initialize with bullet points if not already
                  setTimeout(() => {
                    const content = editor.getContent();
                    if (!content.includes('<ul>')) {
                      editor.execCommand('SelectAll');
                      editor.execCommand('InsertUnorderedList');
                    }
                    setPreviewContent(editor.getContent());
                  }, 100);

                  editor.on('input', () => {
                    setPreviewContent(editor.getContent());
                  });
                }}
                initialValue={content}
                init={{
                  height: 300,
                  menubar: 'edit insert view format table tools',
                  plugins: 'lists link image help wordcount',
                  toolbar:
                    'bold italic underline | image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  content_style:
                    'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  forced_root_block: 'li',
                  force_br_newlines: false,
                  force_p_newlines: false,
                }}
              />
            ) : (
              <div
                className="content-preview"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            <div className="button-container">
              {isEditing ? (
                <button className="save-button" onClick={handleSave}>
                  SAVE
                </button>
              ) : (
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  EDIT
                </button>
              )}
            </div>
          </div>

          <div className="preview-section">
            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Preview</h2>
            <div className="phone-container">
              <div className="preview-image-mb" style={{ filter: 'blur(6px)' }}>
                <div className="bg-img-mb">
                  <img src="/mobile-img.png" alt="PREVIEW" />
                </div>
              </div>
              <div className="benefits-popup">
                <div className="gold-card-container">
                  <img
                    src={getLevelImagePath(selectedLevel)}
                    alt={`${selectedLevel} Card`}
                    className="gold-card-image"
                  />
                  <div className="gold-card-content">
                    <div
                      className="benefits-list"
                      dangerouslySetInnerHTML={{
                        __html: isEditing
                          ? previewContent
                              .replace(
                                /<li>/g,
                                `<li style="position: relative; padding-left: 20px;"><span style="position: absolute; left: 0; top: 2px; display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; border-radius: 50%; background-color: ${getBulletColor(
                                  selectedLevel
                                )}; color: white; font-size: 8px;">✓</span>`
                              )
                              .replace(
                                /<ul>/g,
                                '<ul style="list-style-type: none; padding-left: 0;">'
                              )
                          : content
                              .replace(
                                /<li>/g,
                                `<li style="position: relative; padding-left: 20px;"><span style="position: absolute; left: 0; top: 2px; display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; border-radius: 50%; background-color: ${getBulletColor(
                                  selectedLevel
                                )}; color: white; font-size: 8px;">✓</span>`
                              )
                              .replace(
                                /<ul>/g,
                                '<ul style="list-style-type: none; padding-left: 0;">'
                              ),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    // </div>
  );
};

export default MyBenefits;
