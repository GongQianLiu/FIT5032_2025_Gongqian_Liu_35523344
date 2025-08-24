// Authentication utilities for Evergreen Way
// Simple replacement for auth store using localStorage

export const useAuthStore = () => {
  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  // Set current user in localStorage
  const setCurrentUser = (user) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  // Clear current user from localStorage
  const clearCurrentUser = () => {
    localStorage.removeItem('currentUser');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const user = getCurrentUser();
    return user && user.id;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
  };

  // Check if user has permission (role hierarchy)
  const hasPermission = (requiredRole) => {
    const user = getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      'elderly': 1,
      'volunteer': 2,
      'admin': 3
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return {
    user: getCurrentUser(),
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    isAuthenticated,
    hasRole,
    hasPermission
  };
};

export default useAuthStore;
