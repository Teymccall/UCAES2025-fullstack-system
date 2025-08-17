// Utility function to clear all local storage data
export const clearAllLocalData = () => {
  console.log("🧹 Clearing all local storage data...");
  
  // Clear all UCAES-related localStorage items
  const keysToRemove = [
    'ucaes_user',
    'ucaes_application_data',
    'registrationFormInProgress',
    'registrationActiveTab'
  ];
  
  // Also clear any year-based application counters
  const currentYear = new Date().getFullYear();
  keysToRemove.push(`ucaes_applications_${currentYear}`);
  keysToRemove.push(`ucaes_applications_${currentYear - 1}`);
  keysToRemove.push(`ucaes_applications_${currentYear + 1}`);
  
  // Remove each key
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed localStorage key: ${key}`);
    }
  });
  
  // Clear any other localStorage items that might contain UCAES data
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('ucaes') || 
        key.toLowerCase().includes('application') || 
        key.toLowerCase().includes('registration')) {
      localStorage.removeItem(key);
      console.log(`✅ Removed localStorage key: ${key}`);
    }
  });
  
  console.log("✅ All local storage data cleared successfully");
};

// Function to clear only user-related data
export const clearUserData = () => {
  console.log("🧹 Clearing user-related local storage data...");
  
  localStorage.removeItem('ucaes_user');
  console.log("✅ User data cleared");
};

// Function to clear only application-related data
export const clearApplicationData = () => {
  console.log("🧹 Clearing application-related local storage data...");
  
  const keysToRemove = [
    'ucaes_application_data',
    'registrationFormInProgress',
    'registrationActiveTab'
  ];
  
  const currentYear = new Date().getFullYear();
  keysToRemove.push(`ucaes_applications_${currentYear}`);
  keysToRemove.push(`ucaes_applications_${currentYear - 1}`);
  keysToRemove.push(`ucaes_applications_${currentYear + 1}`);
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed application data: ${key}`);
    }
  });
  
  console.log("✅ Application data cleared");
}; 