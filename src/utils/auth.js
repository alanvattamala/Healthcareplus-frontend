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
 * Get user role
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || user?.userType || null;
};

/**
 * Check if user has required role
 * @param {string} requiredRole - Required role to access resource
 * @returns {boolean} Whether user has the required role
 */
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

/**
 * Get user verification status
 * @returns {string|null} Verification status or null if not applicable
 */
export const getVerificationStatus = () => {
  const user = getCurrentUser();
  return user?.verificationStatus || null;
};

/**
 * Check if user verification is pending
 * @returns {boolean} Whether user has pending verification
 */
export const isPendingVerification = () => {
  const user = getCurrentUser();
  return user?.userType === 'doctor' && user?.verificationStatus === 'pending';
};

/**
 * Check if user verification is rejected
 * @returns {boolean} Whether user verification was rejected
 */
export const isVerificationRejected = () => {
  const user = getCurrentUser();
  return user?.userType === 'doctor' && user?.verificationStatus === 'rejected';
};

/**
 * Check if doctor is verified
 * @returns {boolean} Whether doctor is verified
 */
export const isDoctorVerified = () => {
  const user = getCurrentUser();
  return user?.userType === 'doctor' && user?.verificationStatus === 'verified';
};

/**
 * Handle verification status redirect
 * @param {function} navigate - React Router navigate function
 * @returns {boolean} Whether redirect was necessary
 */
export const handleVerificationStatus = (navigate) => {
  const user = getCurrentUser();
  
  if (!user || user.userType !== 'doctor') {
    return false; // No verification needed for non-doctors
  }

  switch (user.verificationStatus) {
    case 'pending':
      toast.info('Your account is pending verification. Redirecting...');
      navigate('/verification-pending');
      return true;
    case 'rejected':
      toast.error('Your verification request has been rejected. Redirecting...');
      navigate('/verification-pending');
      return true;
    case 'verified':
      return false; // Doctor is verified, no redirect needed
    default:
      // If no verification status, treat as pending
      toast.info('Your account requires verification. Redirecting...');
      navigate('/verification-pending');
      return true;
  }
};

/**
 * Protected route guard - redirect to login if not authenticated
 * @param {function} navigate - React Router navigate function
 * @returns {boolean} Whether user is authenticated
 */
export const requireAuth = (navigate) => {
  if (!isAuthenticated()) {
    toast.error('Please log in to access this page');
    navigate('/auth/signin');
    return false;
  }
  return true;
};

/**
 * Role-based access control guard
 * @param {function} navigate - React Router navigate function
 * @param {string} requiredRole - Required role to access the resource
 * @returns {boolean} Whether user has access
 */
export const requireRole = (navigate, requiredRole) => {
  // First check if user is authenticated
  if (!requireAuth(navigate)) {
    return false;
  }

  // Check if user has the required role
  if (!hasRole(requiredRole)) {
    toast.error(`Access denied. This page is only accessible to ${requiredRole}s.`);
    
    // Redirect based on user's actual role
    const userRole = getUserRole();
    switch (userRole) {
      case 'patient':
        navigate('/dashboards/patient');
        break;
      case 'doctor':
        navigate('/dashboards/doctor');
        break;
      case 'admin':
        navigate('/dashboards/admin');
        break;
      default:
        navigate('/auth/signin');
        break;
    }
    return false;
  }

  return true;
};

/**
 * Get dashboard route based on user role
 * @returns {string} Dashboard route for user's role
 */
export const getDashboardRoute = () => {
  const userRole = getUserRole();
  switch (userRole) {
    case 'patient':
      return '/dashboards/patient';
    case 'doctor':
      return '/dashboards/doctor';
    case 'admin':
      return '/dashboards/admin';
    default:
      return '/auth/signin';
  }
};

/**
 * Authenticate user with credentials and role
 * @param {object} userData - User data including role
 * @param {string} token - JWT token
 */
export const authenticateUser = (userData, token) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
  toast.success(`Welcome ${userData.name || userData.firstName || 'User'}!`);
};

/**
 * Check authentication and redirect to appropriate dashboard
 * @param {function} navigate - React Router navigate function
 * @returns {object|null} User data if authenticated, null otherwise
 */
export const checkAuthAndRedirect = (navigate) => {
  if (!isAuthenticated()) {
    toast.error('Please log in to access this page');
    navigate('/auth/signin');
    return null;
  }

  const user = getCurrentUser();
  const currentPath = window.location.pathname;
  const expectedPath = getDashboardRoute();

  // If user is on wrong dashboard, redirect to correct one
  if (currentPath !== expectedPath && currentPath.includes('/dashboards/')) {
    toast.info(`Redirecting to your ${getUserRole()} dashboard...`);
    navigate(expectedPath);
    return null;
  }

  return user;
};
