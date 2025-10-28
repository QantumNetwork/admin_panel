// src/utils/api.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        }
      }
    );
    
    if (response.data?.success) {
      console.log(response.data.message);
      localStorage.setItem("accessItem", accessItem);
      return { success: true, data: response.data };
    } else {
      console.warn('Menu access tracking failed:', response.data?.message);
      const errorMessage = response.data?.message || 'Failed to track menu access';
      toast.error(errorMessage, {
        position: "top-center",  // Match this with App.js
  autoClose: 3000,         // Match this with App.js
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",          // Match this with App.js
  transition: Slide        // Match this with App.js
      });
      return { 
        success: false, 
        message: errorMessage
      };
    }
  } catch (error) {
   const errorMessage = error.response?.data?.response?.message || 'This resource is currently in use by another user. Please try again later.';
    
    // Show error toast
    toast.error(errorMessage, {
        position: "top-center",  // Match this with App.js
  autoClose: 3000,         // Match this with App.js
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",          // Match this with App.js
  transition: Slide        // Match this with App.js
      });
    
    console.error('Error tracking menu access:', errorMessage);
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