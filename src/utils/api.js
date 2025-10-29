// src/utils/api.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Store the last error message and timestamp for each menu item to prevent duplicate toasts
const menuAccessErrors = {};

// Helper to compute a stable toast id per access item
const getToastId = (accessItem, suffix = '') => `menu-access-${accessItem}${suffix ? `-${suffix}` : ''}`;

export const trackMenuAccess = async (accessItem) => {
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${baseUrl}/menu/enter`,
      { accessItem },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Add timestamp to prevent caching
        params: { _: new Date().getTime() }
      }
    );
    
if (response.data?.status === true || response.data?.success === true) {
      console.log(response.data.message);
      localStorage.setItem("accessItem", accessItem);
      // Clear any error for this menu item on successful access
      if (menuAccessErrors[accessItem]) {
        delete menuAccessErrors[accessItem];
      }
      return { success: true, data: response.data };
    } else {
      const errorMessage = response.data?.message || 'Failed to track menu access';
      const now = Date.now();
      const toastId = getToastId(accessItem);

      const lastError = menuAccessErrors[accessItem];
       // Only show error if it's a different message or if it's been more than 5 seconds since the last error
      if (!lastError || lastError.message !== errorMessage || (now - lastError.timestamp) > 2000) {
        console.warn('Menu access tracking failed:', errorMessage);
  toast.error(errorMessage, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    transition: Slide,
  });

        
        // Update last error for this specific menu item
        menuAccessErrors[accessItem] = {
          message: errorMessage,
          timestamp: now
        };
      }
      return { 
        success: false, 
        message: errorMessage
      };
    }
  } catch (error) {
   const errorMessage = error.response?.data?.message || error.response?.data?.response?.message || 'This resource is currently in use by another user. Please try again later.';
    const now = Date.now();
    const lastError = menuAccessErrors[accessItem];
    console.log('Toast container found?', document.querySelector('.Toastify__toast-container'));

    
    // Only show error if it's a different message or if it's been more than 1 seconds since the last error for this specific menu item
    if (!lastError || lastError.message !== errorMessage || (now - lastError.timestamp) > 1000) {
      console.error('Error tracking menu access:', errorMessage);
  toast.error(errorMessage, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    transition: Slide,
  });
      
      // Update last error for this specific menu item
      menuAccessErrors[accessItem] = {
        message: errorMessage,
        timestamp: now
      };
    }
    return { 
      success: false, 
      message: errorMessage,
      error: error 
    };
  }
};


let refreshTimer = null;

export const setupRefreshLock = () => {
  // Clear any existing interval
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Set up new interval
  refreshTimer = setInterval(() => {
    refreshLock();
  }, 15 * 60 * 1000); // 15 minutes in milliseconds

  // Initial call
  refreshLock();
};

export const clearRefreshLock = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const refreshLock = async () => {
  const accessItem = localStorage.getItem('accessItem');
  if (!accessItem) return;

  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem('token');
    
    await axios.patch(
      `${baseUrl}/menu/refresh-lock`,
      { accessItem },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Refresh lock updated for:', accessItem);
  } catch (error) {
    console.error('Error refreshing lock:', error.response?.data?.message || error.message);
    // Optionally clear the interval on error
    clearRefreshLock();
  }
};

// Add at the bottom of src/utils/api.js
export const resetMenuAccessErrors = () => {
  Object.keys(menuAccessErrors).forEach((key) => delete menuAccessErrors[key]);
};