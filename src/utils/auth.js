import { handleLogout } from './api';
import { toast } from 'react-toastify';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const logout = async (navigate) => {
  try {
    const result = await handleLogout();
    if (result.success) {
      // Clear all items from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('accessItem');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userType');
      localStorage.removeItem('appGroup');
      localStorage.removeItem('access');
      localStorage.removeItem('selectedVenue');

      // Navigate to login page
      if (navigate) {
        navigate('/');
      } else {
        // If navigate function is not provided, do a full page reload to login
        window.location.href = '/';
      }
    } else {
      // Show error message if logout failed
      toast.error(result.message || 'Failed to logout. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('An error occurred during logout. Please try again.');
  }
};
