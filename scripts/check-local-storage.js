// This script is meant to be run in the browser console to check localStorage data

// Function to check localStorage for student session
function checkLocalStorage() {
  console.log('Checking localStorage for student session...');
  
  try {
    const sessionData = localStorage.getItem('studentSession');
    
    if (sessionData) {
      console.log('Found student session data in localStorage');
      
      try {
        const parsedData = JSON.parse(sessionData);
        console.log('Parsed session data:', parsedData);
        
        if (parsedData.studentData) {
          console.log('\nStudent data from localStorage:');
          console.log('Name:', parsedData.studentData.surname, parsedData.studentData.otherNames);
          console.log('Programme:', parsedData.studentData.programme);
          console.log('Registration Number:', parsedData.studentData.registrationNumber);
          
          // Check if there's any hardcoded TEST STUDENT value
          if (parsedData.studentData.surname === 'TEST' && parsedData.studentData.otherNames === 'STUDENT') {
            console.log('\nWARNING: Student name is "TEST STUDENT" in localStorage!');
            
            // Fix the data
            console.log('\nAttempting to fix the data...');
            parsedData.studentData.surname = 'HANAMEL';
            parsedData.studentData.otherNames = 'ACHUMBORO';
            parsedData.studentData.programme = 'B.Sc. Environmental Science and Management';
            
            // Save back to localStorage
            localStorage.setItem('studentSession', JSON.stringify(parsedData));
            console.log('Fixed data saved to localStorage. Please refresh the page.');
          }
        } else {
          console.log('No student data found in session');
        }
      } catch (parseError) {
        console.error('Error parsing session data:', parseError);
      }
    } else {
      console.log('No student session found in localStorage');
    }
  } catch (error) {
    console.error('Error checking localStorage:', error);
  }
}

// Instructions for using this script
console.log('============================================');
console.log('INSTRUCTIONS:');
console.log('1. Copy this entire script');
console.log('2. Open your browser console (F12 or Ctrl+Shift+I)');
console.log('3. Paste the script and press Enter');
console.log('4. Then type: checkLocalStorage()');
console.log('============================================');

// Export the function for browser use
if (typeof window !== 'undefined') {
  window.checkLocalStorage = checkLocalStorage;
}

// If running in Node.js, show instructions
if (typeof window === 'undefined') {
  console.log('This script is meant to be run in a browser environment.');
  console.log('Please copy the script and run it in your browser console.');
} 