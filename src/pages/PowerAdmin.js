import React, { useState, useEffect } from 'react';
import {
  FaRegCheckCircle,
  FaExclamationCircle,
  FaSearch,
} from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { handleLogout } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/dashboard.css';
import '../styles/standard-admin.css';
import '../styles/power-admin.css';

// Add axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const PowerAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail'); // default if missing
  const userInitial = email.charAt(0).toUpperCase();

  const [showDropdown, setShowDropdown] = useState(false);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('new-group');
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const userType = 'admin';
  const [groupNames, setGroupNames] = useState(['']);
  const [appNames, setAppNames] = useState([]);
  const [showAppDropdown, setShowAppDropdown] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRefs = React.useRef({});

  const getAppName = (appName) => {
    switch (appName) {
      case 'Max Gaming':
        return 'MaxGaming';
      case 'Manly Harbour Boat Club':
        return 'Manly';
      case 'Montauk Tavern':
        return 'Montauk';
      case 'Star Reward':
        return 'StarReward';
      case 'Central Lane Hotel':
        return 'Central';
      case 'Sense Of Taste':
        return 'Sense';
      case 'North Shore Tavern':
        return 'North';
      case "Hogan's":
        return 'Hogan';
      case 'Ace Rewards':
        return 'Ace';
      case 'Queens Hotel':
        return 'Queens';
      case 'Brisbane Brewing Co':
        return 'Brisbane';
      case 'Bluewater Captains Club':
        return 'Bluewater';
      case 'Flinders Street Wharves':
        return 'Flinders';
      case 'Drinks HQ':
        return 'Drinks';
      default:
        return appName;
    }
  };

  const getAppNameSummary = (appType) => {
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

  const getIconVenue = (appType) => {
    switch (appType) {
      case 'MaxGaming':
        return '/max_gaming.png';
      case 'Manly':
        return '/mhbc.png';
      case 'Montauk':
        return '/montauk.png';
      case 'StarReward':
        return '/star.png';
      case 'Central':
        return '/central.png';
      case 'Sense':
        return '/star.png';
      case 'Qantum':
        return '/qantum.png';
      case 'North':
        return '/north.png';
      case 'Hogan':
        return '/hogan.png';
      case 'Ace':
        return '/ace.png';
      case 'Queens':
        return '/queens.png';
      case 'Brisbane':
        return '/brisbane.png';
      case 'Bluewater':
        return '/bluewater.png';
      case 'Flinders':
        return '/flinders.png';
      case 'Drinks':
        return '/drinks.png';
      default:
        return appType;
    }
  };

  const appNameList = [
    'Star Reward',
    'Max Gaming',
    'Qantum',
    'Central Lane Hotel',
    'Manly Harbour Boat Club',
    'North Shore Tavern',
    // 'Montauk Tavern',
    'Sense Of Taste',
    "Hogan's",
    'Ace Rewards',
    'Queens Hotel',
    'Brisbane Brewing Co',
    'Bluewater Captains Club',
    'Flinders Street Wharves',
    'Drinks HQ',
  ];

  const handleAddGroup = (index) => {
    const newGroupNames = [...groupNames];
    newGroupNames.splice(index + 1, 0, '');
    setGroupNames(newGroupNames);
  };

  const handleRemoveGroup = (index) => {
    if (groupNames.length <= 1) return;

    // Get the app name being removed
    const removedApp = groupNames[index];

    // Remove the group at the specified index
    const newGroupNames = groupNames.filter((_, i) => i !== index);
    setGroupNames(newGroupNames);

    // Update selectedApps by filtering out the removed app if it's not present in remaining groups
    const remainingApps = newGroupNames.map((app) => getAppName(app));
    setSelectedApps((prevSelected) => {
      // Only keep apps that are still in the group names or were not the removed app
      return prevSelected.filter(
        (app) => remainingApps.includes(app) || getAppName(removedApp) !== app
      );
    });
  };

  const handleGroupNameChange = (index, value) => {
    const newGroupNames = [...groupNames];
    newGroupNames[index] = value;
    setGroupNames(newGroupNames);
  };

  // Close dropdown when clicking outside
  // Fetch groups when the component mounts and when activeTab changes to 'edit-group'
  useEffect(() => {
    const fetchGroups = async () => {
      if (activeTab === 'edit-group') {
        setLoading1(true);
        try {
          const response = await api.get('/admin/app-registries');
          if (response.data && Array.isArray(response.data.data)) {
            setGroups(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching groups:', error);
          toast.error('Failed to fetch groups');
        } finally {
          setLoading1(false);
        }
      }
    };

    fetchGroups();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideAll = Object.values(dropdownRefs.current).every(
        (ref) => !ref?.current?.contains(event.target)
      );

      if (clickedOutsideAll) {
        setShowAppDropdown(null);
      }
    };

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [groupNames.length]); // Re-run when number of inputs changes

  const handleAppInputClick = (index) => {
    // Only show apps that haven't been selected yet
    const selectedAppsSet = new Set(
      selectedApps.map((app) => getAppNameSummary(app))
    );
    const availableApps = appNameList.filter(
      (app) => !selectedAppsSet.has(app)
    );
    setAppNames(availableApps);
    setShowAppDropdown(index);
  };

  const handleAppSelect = (index, appName) => {
    // Convert to internal app name for storage
    const internalAppName = getAppName(appName);

    // Create a new array without the current index to prevent duplicates
    const updatedGroupNames = groupNames.filter((_, i) => i !== index);

    // Add the new selection
    updatedGroupNames.splice(index, 0, appName);

    // Update state
    setGroupNames(updatedGroupNames);

    // Update selected apps - map to internal names and remove duplicates
    const uniqueSelections = [
      ...new Set(
        updatedGroupNames.filter(Boolean).map((app) => getAppName(app))
      ),
    ];

    setSelectedApps(uniqueSelections);
    setShowAppDropdown(null);
  };

  const handleEditGroup = async (id) => {
    try {
      const response = await api.get(`/admin/app-registry-byId?id=${id}`);
      const data = response.data.data;

      if (data) {
        // Set the group name
        setGroupName(data.appType);

        // Convert internal app names to display names and ensure uniqueness
        const appDisplayNames = [];
        const uniqueAppNames = [];

        data.appName.forEach((app) => {
          // Skip if already added (handle duplicates from backend)
          if (uniqueAppNames.includes(app)) return;

          uniqueAppNames.push(app);

          // Convert to display name
          switch (app) {
            case 'MaxGaming':
              appDisplayNames.push('Max Gaming');
              break;
            case 'Manly':
              appDisplayNames.push('Manly Harbour Boat Club');
              break;
            // case 'Montauk':
            //   appDisplayNames.push('Montauk Tavern');
            //   break;
            case 'StarReward':
              appDisplayNames.push('Star Reward');
              break;
            case 'Central':
              appDisplayNames.push('Central Lane Hotel');
              break;
            case 'Sense':
              appDisplayNames.push('Sense Of Taste');
              break;
            case 'North':
              appDisplayNames.push('North Shore Tavern');
              break;
            case 'Hogan':
              appDisplayNames.push("Hogan's");
              break;
            case 'Ace':
              appDisplayNames.push("Ace Rewards");
              break;
            case 'Queens':
              appDisplayNames.push("Queens Hotel");
              break;
            case 'Brisbane':
              appDisplayNames.push("Brisbane Brewing Co");
              break;
            case 'Bluewater':
              appDisplayNames.push("Bluewater Captains Club");
            case 'Flinders':
              appDisplayNames.push("Flinders Street Wharves");
              break;
            case 'Drinks':
              appDisplayNames.push("Drinks HQ");
              break;
            default:
              appDisplayNames.push(app);
          }
        });

        // Update group names and selected apps
        setGroupNames(appDisplayNames);
        setSelectedApps(uniqueAppNames);

        // Set the current user ID for update operations
        setCurrentUserId(id);

        // Switch to the new-group tab
        setActiveTab('new-group');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error('Failed to load group details');
    }
  };

  const handleActivate = async () => {
    if (selectedApps.length === 0) {
      toast.error('Please select at least one app');
      return;
    }

    if (!groupName) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const payload = {
        appType: groupName,
        appName: selectedApps,
      };

      console.log('Sending payload:', payload);

      if (currentUserId) {
        // Update existing group
        const response = await api.put(
          `/admin/app-registry-byId?id=${currentUserId}`,
          payload
        );
        toast.success('Group updated successfully!');
      } else {
        // Create new group
        const response = await api.post('/admin/app-registry', payload);
        toast.success('Group created successfully!');
      }

      // Reset form
      setGroupName('');
      setSelectedApps([]);
      setGroupNames(['']);
      setCurrentUserId(null);

      // Refresh groups list if we're in edit mode
      if (activeTab === 'edit-group') {
        const response = await api.get('/admin/app-registries');
        if (response.data && Array.isArray(response.data.data)) {
          setGroups(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error saving group:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (currentUserId ? 'Failed to update group' : 'Failed to create group');
      toast.error(`Error: ${errorMessage}`);
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
                Power Admin
              </p>
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
      <aside className="sidebar-pa">
        <button
          style={{ fontSize: '12px' }}
          className={`sidebar-btn active`}
          onClick={() => (window.location.href = '/standard-admin')}
        >
          <MdGroups className={`sidebar-icon-pa`} /> &nbsp; Grouping
        </button>
      </aside>

      <div className="sa-filter-buttons">
        <button
          className={`user-btn ${activeTab === 'new-group' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-group')}
        >
          New Group
        </button>
        <button
          className={`user-btn ${activeTab === 'edit-group' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit-group')}
        >
          Edit Group(s)
        </button>
      </div>

      {activeTab === 'new-group' && (
        <button
          className="activate-btn icon-button"
          style={{ backgroundColor: '#5396D1' }}
          onClick={handleActivate}
        >
          <FaRegCheckCircle className="button-icon" />
          ACTIVATE
        </button>
      )}

      <div className="content-wrapper-sa">
        {activeTab === 'new-group' ? (
          <>
            <section className="new-user-sa">
              <h2>New Group Name</h2>
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Group Name</label>
                <input
                  type="text"
                  name="groupname"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            </section>
            <section className="access-sa">
              <h2>Connected to</h2>
              <div className="group-names-container">
                {groupNames.map((groupName, index) => (
                  <div key={index} className="group-name-input-container">
                    {index === 0 && <label>Group Name</label>}
                    <div
                      className={`input-wrapper ${
                        index > 0 ? 'subsequent-row' : ''
                      }`}
                    >
                      <div
                        style={{ position: 'relative', width: '100%' }}
                        ref={(el) =>
                          (dropdownRefs.current[index] = { current: el })
                        }
                      >
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) =>
                            handleGroupNameChange(index, e.target.value)
                          }
                          onClick={() => handleAppInputClick(index)}
                          readOnly
                        />
                        {showAppDropdown === index && appNames.length > 0 && (
                          <div className="app-dropdown">
                            {appNames.map((app, i) => (
                              <div
                                key={i}
                                className="app-dropdown-item"
                                onClick={() => handleAppSelect(index, app)}
                              >
                                {app}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          className="remove-group-btn"
                          onClick={() => handleRemoveGroup(index)}
                        >
                          ×
                        </button>
                      )}
                      <button
                        type="button"
                        className="add-group-btn"
                        onClick={() => handleAddGroup(index)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="connected-sa">
              <h2>Connected Summary</h2>
              <div className="connected-summary">
                {selectedApps.length > 0 ? (
                  <div className="selected-apps-list">
                    {selectedApps.map((app, index) => (
                      <p key={index} className="connected-item">
                        <img src={getIconVenue(app)} alt="Play Store" />
                        <span className="app-name">
                          {getAppNameSummary(app)}
                        </span>
                      </p>
                      //   <div className="connected-item">
                      //   <img src={getIconVenue(selectedVenue)} alt="Play Store" />
                      //   <span>{selectedVenue ? getAppType(selectedVenue) : 'Select Venue'}</span>
                      // </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-apps-selected">No apps selected yet</div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="edit-groups-container">
            <div className="search-bar">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search group"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
            </div>
            <div className="groups-list">
              {loading1 ? (
                <div className="loading">Loading groups...</div>
              ) : groups.length > 0 ? (
                <ul className="group-list">
                  <span className="group-item" style={{ fontWeight: 'bold' }}>
                    Groups
                  </span>
                  {groups
                    .filter((g) =>
                      g.appType.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((group, index) => (
                      <li key={index} className="group-item">
                        <span className="group-name">{group.appType}</span>
                        <a
                          href="#"
                          className="edit-link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditGroup(group._id);
                          }}
                        >
                          <span className="check-icon">✓</span> Edit
                        </a>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="no-groups">No groups found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add these styles at the end of the file, before the export statement
const styles = `
  .app-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 2px;
  }
  
  .app-dropdown-item {
    padding: 6px 10px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .app-dropdown-item:hover {
    background-color: #f5f5f5;
  }
  
  .app-dropdown-item:not(:last-child) {
    border-bottom: 1px solid #eee;
  }

  .edit-groups-container {
    width: 100%;
    max-width: 600px;
    margin: 0;
    padding: 20px;
    padding-left: 0;
    background-color: #fff;       /* make the whole panel white */  
}

  .search-bar {
    margin-bottom: 20px;
    background: transparent;      /* remove that grey “box” entirely */
  }

  .search-input {
    width: 97%;
    padding: 12px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .groups-list h3 {
    color: #333;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 600;
  }

  .group-list {
    list-style: none;
    padding: 0;
    margin: 0;
    // border: 1px solid #eee;
    // border-radius: 4px;
    // overflow: hidden;
  }

  .group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #D3D3D3;
    background-color: #F2F2F2;
  }

  .group-item:last-child {
    border-bottom: 1px solid #eee;
  }

  .group-name {
    font-size: 14px;
    color: #333;
  }

  .edit-link {
    display: flex;
    align-items: center;
    color: #002977;
    text-decoration: none;
    font-size: 14px;
  }

  .check-icon {
    margin-right: 5px;
    font-weight: bold;
  }

  .loading,
  .no-groups,
  .no-apps-selected {
    text-align: center;
    padding: 20px;
    color: #666;
    font-size: 14px;
  }

  .selected-apps-list {
    padding: 0;
    margin: 0;
    display: block;
    text-align: center;
    font-weight: bold;
  }
`;

// Add the styles to the document head
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default PowerAdmin;
