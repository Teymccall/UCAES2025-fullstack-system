// Fix Missing Application IDs Script
// Run this script to fix applications that don't have proper UCAES application IDs

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, getDoc, setDoc } = require('firebase/firestore');

// Your Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from your .env file or Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to generate sequential application ID
async function generateSequentialApplicationId() {
  try {
    const year = new Date().getFullYear();
    const yearKey = `UCAES${year}`;
    
    // Get the counter document for this year
    const counterRef = doc(db, "application-counters", yearKey);
    
    try {
      // Try to get the existing counter
      const counterDoc = await getDoc(counterRef);
      
      if (counterDoc.exists()) {
        // Counter exists, increment it
        const currentCount = counterDoc.data().lastNumber || 0;
        const nextNumber = currentCount + 1;
        const paddedNumber = nextNumber.toString().padStart(4, "0");
        
        // Update the counter
        await updateDoc(counterRef, {
          lastNumber: nextNumber,
          lastUpdated: new Date()
        });
        
        const applicationId = `${yearKey}${paddedNumber}`;
        console.log("✅ Generated sequential application ID:", applicationId);
        return applicationId;
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1;
        const paddedNumber = firstNumber.toString().padStart(4, "0");
        
        // Create the counter document
        await setDoc(counterRef, {
          lastNumber: firstNumber,
          year: year,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        
        const applicationId = `${yearKey}${paddedNumber}`;
        console.log("✅ Generated first application ID for year:", applicationId);
        return applicationId;
      }
      
    } catch (error) {
      console.error("❌ Error accessing application counter:", error);
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0");
      const applicationId = `${yearKey}${fallbackNumber}`;
      console.log("⚠️ Using fallback application ID:", applicationId);
      return applicationId;
    }
  } catch (error) {
    console.error("❌ Error generating application ID:", error);
    
    // Ultimate fallback
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const fallbackId = `UCAES${year}${timestamp.toString().slice(-4)}${random}`;
    console.log("⚠️ Using ultimate fallback application ID:", fallbackId);
    return fallbackId;
  }
}

// Function to fix missing application IDs
async function fixMissingApplicationIds() {
  try {
    console.log('🔧 Starting to fix missing application IDs...');
    
    const applicationsRef = collection(db, "admission-applications");
    const querySnapshot = await getDocs(applicationsRef);
    
    let fixedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      if (!data.applicationId || !data.applicationId.startsWith('UCAES')) {
        console.log(`🔧 Fixing application ${docSnapshot.id} - missing proper applicationId`);
        
        try {
          const newApplicationId = await generateSequentialApplicationId();
          await updateDoc(doc(db, "admission-applications", docSnapshot.id), {
            applicationId: newApplicationId,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Fixed application ${docSnapshot.id} with new ID: ${newApplicationId}`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Failed to fix application ${docSnapshot.id}:`, error);
        }
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} applications with missing application IDs`);
  } catch (error) {
    console.error('❌ Error fixing missing application IDs:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  console.log('🚀 Running Application ID Fix Script...');
  fixMissingApplicationIds()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMissingApplicationIds, generateSequentialApplicationId };
