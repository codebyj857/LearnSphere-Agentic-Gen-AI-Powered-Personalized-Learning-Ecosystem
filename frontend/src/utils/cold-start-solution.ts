/**
 * COLD START PROBLEM SOLUTION
 * Handles initialization issues and prevents blank screens
 */

export const initializeApp = () => {
  // Clear corrupted localStorage data
  const keysToCheck = ['authToken', 'userData', 'selectedRole'];
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        JSON.parse(value);
      } catch (e) {
        localStorage.removeItem(key);
      }
    }
  });

  // Validate existing auth data
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    try {
      JSON.parse(user);
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};
