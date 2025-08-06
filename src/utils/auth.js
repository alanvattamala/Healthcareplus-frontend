import { toast } from 'react-toastify';

/**
 * Utility function to handle user logout
 * @param {function} navigate - React Router navigate function
 */
export const handleLogout = async (navigate) => {
  // Note: Confirmation is now handled by SweetAlert in dashboards before calling this function
  
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.warn('Backend logout failed, continuing with local logout:', error);
      }
    }

    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userType');

    // Clear any other session data
    sessionStorage.clear();

    // Show success message
    toast.success('Logged out successfully!');

    // Navigate to login page
    navigate('/signin');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Error during logout. Please try again.');
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Whether user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user data
 * @returns {object|null} User data or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get user token
 * @returns {string|null} JWT token or null if not authenticated
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Protected route guard - redirect to login if not authenticated
 * @param {function} navigate - React Router navigate function
 * @returns {boolean} Whether user is authenticated
 */
export const requireAuth = (navigate) => {
  if (!isAuthenticated()) {
    toast.error('Please log in to access this page');
    navigate('/signin');
    return false;
  }
  return true;
};
