// Frontend Test Script for Registration Restrictions
// Run this in the browser console on the course registration page

console.log('🧪 Testing Frontend Registration Restriction System...\n');

// Test 1: Check if the registration restriction UI elements exist
function testUIElements() {
  console.log('📋 Test 1: Checking UI Elements');
  
  // Check for registration restriction alert
  const restrictionAlert = document.querySelector('[data-testid="registration-restriction-alert"]') || 
                          document.querySelector('.alert[role="alert"]');
  
  if (restrictionAlert) {
    console.log('✅ Registration restriction alert found');
    console.log('   Content:', restrictionAlert.textContent);
  } else {
    console.log('❌ Registration restriction alert not found');
  }
  
  // Check for disabled submit button
  const submitButton = document.querySelector('button[disabled]');
  if (submitButton) {
    console.log('✅ Disabled submit button found');
    console.log('   Button text:', submitButton.textContent);
  } else {
    console.log('❌ Disabled submit button not found');
  }
  
  // Check for existing registration display
  const existingRegistration = document.querySelector('[data-testid="existing-registration"]') ||
                              document.querySelector('.bg-blue-50');
  
  if (existingRegistration) {
    console.log('✅ Existing registration display found');
  } else {
    console.log('❌ Existing registration display not found');
  }
  
  console.log('');
}

// Test 2: Simulate registration attempt
function testRegistrationAttempt() {
  console.log('📋 Test 2: Simulating Registration Attempt');
  
  const submitButton = document.querySelector('button:not([disabled])');
  if (submitButton) {
    console.log('✅ Submit button is enabled - attempting registration');
    
    // Try to click the button
    submitButton.click();
    console.log('   Button clicked');
    
    // Check for any error messages that appear
    setTimeout(() => {
      const errorMessages = document.querySelectorAll('.alert, .error, [role="alert"]');
      if (errorMessages.length > 0) {
        console.log('✅ Error messages found after registration attempt:');
        errorMessages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg.textContent}`);
        });
      } else {
        console.log('❌ No error messages found after registration attempt');
      }
    }, 1000);
    
  } else {
    console.log('❌ Submit button is disabled - cannot test registration');
  }
  
  console.log('');
}

// Test 3: Check course selection functionality
function testCourseSelection() {
  console.log('📋 Test 3: Testing Course Selection');
  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  if (checkboxes.length > 0) {
    console.log(`✅ Found ${checkboxes.length} course checkboxes`);
    
    // Try to select a course
    const firstCheckbox = checkboxes[0];
    if (!firstCheckbox.disabled) {
      firstCheckbox.click();
      console.log('   Selected first course');
      
      // Check if total credits updated
      const creditDisplay = document.querySelector('[data-testid="total-credits"]') ||
                           document.querySelector('.text-sm.text-gray-600');
      
      if (creditDisplay) {
        console.log('   Total credits display found:', creditDisplay.textContent);
      }
    } else {
      console.log('   Course selection is disabled');
    }
  } else {
    console.log('❌ No course checkboxes found');
  }
  
  console.log('');
}

// Test 4: Check filtering functionality
function testFiltering() {
  console.log('📋 Test 4: Testing Filtering Functionality');
  
  // Check for search input
  const searchInput = document.querySelector('input[placeholder*="search" i]') ||
                     document.querySelector('input[placeholder*="Search" i]');
  
  if (searchInput) {
    console.log('✅ Search input found');
    
    // Try to search for a course
    searchInput.value = 'AGR';
    searchInput.dispatchEvent(new Event('input'));
    console.log('   Searched for "AGR"');
    
    // Check if results filtered
    setTimeout(() => {
      const visibleCourses = document.querySelectorAll('tr:not([style*="display: none"])');
      console.log(`   Visible courses after search: ${visibleCourses.length}`);
    }, 500);
    
  } else {
    console.log('❌ Search input not found');
  }
  
  // Check for course type filter
  const typeFilter = document.querySelector('select');
  if (typeFilter) {
    console.log('✅ Course type filter found');
  } else {
    console.log('❌ Course type filter not found');
  }
  
  console.log('');
}

// Test 5: Check tab functionality
function testTabs() {
  console.log('📋 Test 5: Testing Tab Functionality');
  
  const tabs = document.querySelectorAll('[role="tab"]') ||
               document.querySelectorAll('.tabs-trigger') ||
               document.querySelectorAll('[data-state="inactive"]');
  
  if (tabs.length > 0) {
    console.log(`✅ Found ${tabs.length} tabs`);
    
    // Try to switch to elective tab
    const electiveTab = Array.from(tabs).find(tab => 
      tab.textContent.toLowerCase().includes('elective')
    );
    
    if (electiveTab) {
      electiveTab.click();
      console.log('   Switched to elective tab');
    } else {
      console.log('   Elective tab not found');
    }
    
  } else {
    console.log('❌ No tabs found');
  }
  
  console.log('');
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Frontend Registration Tests...\n');
  
  testUIElements();
  testCourseSelection();
  testFiltering();
  testTabs();
  testRegistrationAttempt();
  
  console.log('✅ All frontend tests completed!');
  console.log('\n📝 Test Summary:');
  console.log('- Check the console output above for test results');
  console.log('- Look for ✅ (success) and ❌ (failure) indicators');
  console.log('- If tests fail, check that you are on the course registration page');
  console.log('- Ensure the student has proper permissions and data');
}

// Auto-run tests after a short delay
setTimeout(runAllTests, 2000);

// Export for manual testing
window.testRegistrationRestrictions = runAllTests;
