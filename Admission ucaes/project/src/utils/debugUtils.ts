// Debug utilities that can be run from browser console

// Clear all local storage data
export const clearAllData = () => {
  console.log("🧹 Clearing all local storage data...");
  
  // Clear all localStorage
  localStorage.clear();
  
  console.log("✅ All localStorage cleared");
  console.log("🔄 Please refresh the page to see the changes");
};

// Check current localStorage contents
export const checkLocalStorage = () => {
  console.log("📋 Current localStorage contents:");
  
  if (localStorage.length === 0) {
    console.log("✅ localStorage is empty");
    return;
  }
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }
  }
};

// Check Firebase auth state
export const checkFirebaseAuth = async () => {
  console.log("🔥 Checking Firebase auth state...");
  
  try {
    const { auth } = await import('../firebase');
    const user = auth.currentUser;
    
    if (user) {
      console.log("✅ User is signed in:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
    } else {
      console.log("❌ No user signed in");
    }
  } catch (error) {
    console.error("❌ Error checking Firebase auth:", error);
  }
};

// Force logout and clear all data
export const forceLogout = async () => {
  console.log("🚪 Force logging out and clearing all data...");
  
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Sign out from Firebase
    const { auth } = await import('../firebase');
    await auth.signOut();
    
    console.log("✅ Force logout completed");
    console.log("🔄 Refreshing page...");
    
    // Refresh the page
    window.location.reload();
  } catch (error) {
    console.error("❌ Error during force logout:", error);
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).clearAllData = clearAllData;
  (window as any).checkLocalStorage = checkLocalStorage;
  (window as any).checkFirebaseAuth = checkFirebaseAuth;
  (window as any).forceLogout = forceLogout;
  
  console.log("🔧 Debug utilities loaded. Available commands:");
  console.log("  - clearAllData() - Clear all localStorage");
  console.log("  - checkLocalStorage() - Show current localStorage contents");
  console.log("  - checkFirebaseAuth() - Check Firebase auth state");
  console.log("  - forceLogout() - Force logout and clear all data");
} 