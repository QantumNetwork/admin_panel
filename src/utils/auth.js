export const logout = (navigate) => {
  // Clear all items from localStorage
  localStorage.removeItem('token');
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
};
