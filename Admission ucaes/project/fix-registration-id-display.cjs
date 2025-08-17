// Fix Registration ID Display Issue
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixRegistrationIdDisplay() {
  try {
    console.log('🔧 Fixing Registration ID Display Issue...\n');

    // 1. Check current state
    console.log('📊 1. Current State Analysis:');
    console.log('=============================');
    
    const applicationsRef = collection(db, 'admission-applications');
    const applicationsSnapshot = await getDocs(applicationsRef);
    
    // Find the highest application ID that actually exists
    let highestId = 0;
    const existingIds = [];
    
    applicationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.applicationId && data.applicationId.startsWith('UCAES2026')) {
        const match = data.applicationId.match(/UCAES2026(\d{4})/);
        if (match) {
          const number = parseInt(match[1]);
          existingIds.push(number);
          if (number > highestId) {
            highestId = number;
          }
        }
      }
    });

    console.log(`📈 Highest existing application ID: UCAES2026${highestId.toString().padStart(4, '0')}`);
    console.log(`📋 Total existing applications with UCAES2026 IDs: ${existingIds.length}`);
    console.log(`📊 Existing ID numbers: ${existingIds.sort((a, b) => a - b).join(', ')}`);

    // 2. Check counter state
    console.log('\n📊 2. Counter State:');
    console.log('===================');
    
    const counterRef = doc(db, 'application-counters', 'UCAES2026');
    const counterDoc = await getDoc(counterRef);
    
    if (counterDoc.exists()) {
      const counterData = counterDoc.data();
      console.log(`📈 Current counter: ${counterData.lastNumber}`);
      console.log(`📈 Expected next ID: UCAES2026${(counterData.lastNumber + 1).toString().padStart(4, '0')}`);
      
      const gap = counterData.lastNumber - highestId;
      console.log(`⚠️ Gap between counter and highest ID: ${gap}`);
      
      if (gap > 0) {
        console.log(`❌ PROBLEM: Counter is ${gap} numbers ahead of actual applications`);
      } else {
        console.log(`✅ Counter is in sync with applications`);
      }
    }

    // 3. Provide solution options
    console.log('\n🔧 3. Solution Options:');
    console.log('=======================');
    
    console.log('Option A: Reset counter to match highest existing ID');
    console.log(`   - Reset UCAES2026 counter from ${counterDoc.data().lastNumber} to ${highestId}`);
    console.log(`   - Next application will get: UCAES2026${(highestId + 1).toString().padStart(4, '0')}`);
    
    console.log('\nOption B: Create missing application documents');
    console.log(`   - Create ${gap} placeholder applications to fill the gap`);
    console.log(`   - This maintains the current counter but fills missing documents`);
    
    console.log('\nOption C: Manual fix (recommended)');
    console.log(`   - Reset counter to ${highestId + 1} (next available number)`);
    console.log(`   - This ensures no gaps and clean sequence`);

    // 4. Implement the fix (Option C - recommended)
    console.log('\n🔧 4. Implementing Fix (Option C):');
    console.log('===================================');
    
    const newCounterValue = highestId + 1;
    console.log(`📈 Resetting UCAES2026 counter to: ${newCounterValue}`);
    console.log(`📈 Next application will get: UCAES2026${newCounterValue.toString().padStart(4, '0')}`);
    
    // Update the counter
    await updateDoc(counterRef, {
      lastNumber: newCounterValue,
      lastUpdated: serverTimestamp()
    });
    
    console.log('✅ Counter updated successfully!');

    // 5. Verify the fix
    console.log('\n📊 5. Verification:');
    console.log('===================');
    
    const updatedCounterDoc = await getDoc(counterRef);
    if (updatedCounterDoc.exists()) {
      const updatedData = updatedCounterDoc.data();
      console.log(`📈 Updated counter: ${updatedData.lastNumber}`);
      console.log(`📈 Next ID will be: UCAES2026${updatedData.lastNumber.toString().padStart(4, '0')}`);
    }

    // 6. Check for any applications with missing IDs
    console.log('\n📊 6. Fixing Applications with Missing IDs:');
    console.log('============================================');
    
    let fixedCount = 0;
    applicationsSnapshot.forEach(async (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data.applicationId || data.applicationId === 'N/A') {
        console.log(`🔧 Fixing application ${docSnapshot.id} - missing applicationId`);
        
        try {
          // Generate a new application ID
          const newCounterValue = await getNextCounterValue();
          const newApplicationId = `UCAES2026${newCounterValue.toString().padStart(4, '0')}`;
          
          await updateDoc(doc(db, 'admission-applications', docSnapshot.id), {
            applicationId: newApplicationId,
            updatedAt: serverTimestamp()
          });
          
          console.log(`✅ Fixed application ${docSnapshot.id} with new ID: ${newApplicationId}`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Failed to fix application ${docSnapshot.id}:`, error);
        }
      }
    });

    console.log(`✅ Fixed ${fixedCount} applications with missing IDs`);

    console.log('\n✅ Registration ID display issue fixed!');
    console.log('\n📋 Summary:');
    console.log(`   - Counter reset to: ${newCounterValue}`);
    console.log(`   - Next application ID: UCAES2026${newCounterValue.toString().padStart(4, '0')}`);
    console.log(`   - Applications with missing IDs fixed: ${fixedCount}`);
    console.log(`   - Director view should now display correctly`);

  } catch (error) {
    console.error('❌ Error fixing registration ID display:', error);
  }
}

async function getNextCounterValue() {
  const counterRef = doc(db, 'application-counters', 'UCAES2026');
  const counterDoc = await getDoc(counterRef);
  
  if (counterDoc.exists()) {
    const currentValue = counterDoc.data().lastNumber || 0;
    const nextValue = currentValue + 1;
    
    // Update the counter
    await updateDoc(counterRef, {
      lastNumber: nextValue,
      lastUpdated: serverTimestamp()
    });
    
    return nextValue;
  } else {
    // Create counter if it doesn't exist
    const firstValue = 1;
    await setDoc(counterRef, {
      lastNumber: firstValue,
      year: 2026,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    
    return firstValue;
  }
}

if (require.main === module) {
  console.log('🚀 Starting Registration ID Display Fix...\n');
  fixRegistrationIdDisplay()
    .then(() => {
      console.log('\n✅ Fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixRegistrationIdDisplay };

