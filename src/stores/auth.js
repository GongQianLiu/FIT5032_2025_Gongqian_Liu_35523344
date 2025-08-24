import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref(null);
  const isAuthenticated = ref(false);

  // Getters
  const user = computed(() => currentUser.value);
  const isLoggedIn = computed(() => isAuthenticated.value);

  // Actions
  const setUser = (userData) => {
    currentUser.value = userData;
    isAuthenticated.value = !!userData;
    
    // Save to localStorage
    if (userData) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('currentUser');
  };

  const initializeAuth = () => {
    // Check localStorage for existing user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        currentUser.value = userData;
        isAuthenticated.value = true;
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  };

  // Initialize on store creation
  initializeAuth();

  return {
    // State
    currentUser,
    isAuthenticated,
    
    // Getters
    user,
    isLoggedIn,
    
    // Actions
    setUser,
    logout,
    initializeAuth
  };
});
