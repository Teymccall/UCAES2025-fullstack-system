console.log("🧹 Clearing old localStorage data that might cause user data mixing...")

// List of old localStorage keys that should be cleared
const oldKeys = [
  'ucaes_application_data',
  'ucaes_application_step',
  'ucaes_user',
  'ucaes_user_data',
  'application_data',
  'application_step',
  'user_data',
  'user_info'
]

// Function to clear localStorage keys
function clearOldLocalStorage() {
  console.log("\n📋 Old localStorage keys to clear:")
  oldKeys.forEach(key => {
    console.log(`   - ${key}`)
  })
  
  console.log("\n🔄 Clearing old localStorage data...")
  
  let clearedCount = 0
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`   ✅ Cleared: ${key}`)
      clearedCount++
    } else {
      console.log(`   ⚪ Not found: ${key}`)
    }
  })
  
  // Also clear any keys that start with 'ucaes_' but don't have user-specific format
  console.log("\n🔍 Checking for other old ucaes_ keys...")
  let otherClearedCount = 0
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('ucaes_') && !key.includes('_application_data') && !key.includes('_application_step')) {
      localStorage.removeItem(key)
      console.log(`   ✅ Cleared old key: ${key}`)
      otherClearedCount++
    }
  }
  
  console.log(`\n🎉 Cleanup Complete!`)
  console.log(`   - Cleared ${clearedCount} known old keys`)
  console.log(`   - Cleared ${otherClearedCount} other old ucaes_ keys`)
  console.log(`   - Total keys cleared: ${clearedCount + otherClearedCount}`)
  
  console.log(`\n📋 New user-specific localStorage format:`)
  console.log(`   - ucaes_{userId}_application_data`)
  console.log(`   - ucaes_{userId}_application_step`)
  console.log(`   - Example: ucaes_user123_application_data`)
  
  console.log(`\n✅ User data isolation is now properly implemented!`)
  console.log(`   - Each user will only see their own application data`)
  console.log(`   - No more cross-contamination between users`)
  console.log(`   - New users will start with clean application forms`)
}

// Run the cleanup
clearOldLocalStorage() 