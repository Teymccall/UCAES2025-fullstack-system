// Import Firebase Admin using CommonJS
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);

// Generate application ID using the same logic as the admissions system
async function generateApplicationId() {
  try {
    // Get current academic year from Firebase
    const settingsRef = adminDb.collection('academic-settings').doc('current-year');
    const settingsDoc = await settingsRef.get();
    
    let academicYear = new Date().getFullYear().toString();
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      academicYear = data.currentYear || academicYear;
    }
    
    // Generate sequential number for this academic year
    const yearKey = `UCAES${academicYear}`;
    const counterRef = adminDb.collection("application-counters").doc(yearKey);
    
    try {
      // Try to get the existing counter
      const counterDoc = await counterRef.get();
      
      if (counterDoc.exists) {
        // Counter exists, increment it
        const currentCount = counterDoc.data().lastNumber;
        const nextNumber = currentCount + 1;
        const paddedNumber = nextNumber.toString().padStart(4, "0");
        
        // Update the counter
        await counterRef.update({
          lastNumber: nextNumber,
          lastUpdated: new Date()
        });
        
        const applicationId = `${yearKey}${paddedNumber}`;
        console.log(`✅ Generated sequential application ID: ${applicationId} (incremented from ${currentCount})`);
        return applicationId;
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1;
        const paddedNumber = firstNumber.toString().padStart(4, "0");
        
        // Create the counter document
        await counterRef.set({
          lastNumber: firstNumber,
          year: academicYear,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        
        const applicationId = `${yearKey}${paddedNumber}`;
        console.log(`✅ Generated first application ID for year: ${applicationId}`);
        return applicationId;
      }
      
    } catch (error) {
      console.error("❌ Error accessing application counter:", error);
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0");
      const applicationId = `${yearKey}${fallbackNumber}`;
      console.log(`⚠️ Using fallback application ID: ${applicationId}`);
      return applicationId;
    }
  } catch (error) {
    console.error("❌ Error generating application ID:", error);
    
    // Ultimate fallback
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const fallbackId = `UCAES${year}${timestamp.toString().slice(-4)}${random}`;

    return fallbackId;
  }
}

async function fixApplicationIds() {
  console.log('🔧 Fixing application IDs for all existing applications...');
  
  try {
    const applicationsRef = adminDb.collection('admission-applications');
    const snapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${snapshot.docs.length} applications to fix`);
    
    let fixedCount = 0;
    let alreadyProperCount = 0;
    
    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();
      
      console.log(`\n📄 Processing Application ${i + 1}:`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Name: ${data.personalInfo?.firstName || 'N/A'} ${data.personalInfo?.lastName || 'N/A'}`);
      console.log(`   Email: ${data.contactInfo?.email || 'N/A'}`);
      
      if (data.applicationId && data.applicationId.startsWith('UCAES')) {
        console.log(`   ✅ Already has proper ID: ${data.applicationId}`);
        alreadyProperCount++;
      } else {
        // Generate a new application ID
        const newApplicationId = await generateApplicationId();
        
        // Update the document with the new application ID
        await doc.ref.update({
          applicationId: newApplicationId,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`   🔧 Fixed: ${data.applicationId || 'Missing'} → ${newApplicationId}`);
        fixedCount++;
      }
    }
    
    console.log('\n🎉 Application ID fix completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Fixed: ${fixedCount} applications`);
    console.log(`   - Already proper: ${alreadyProperCount} applications`);
    console.log(`   - Total processed: ${snapshot.docs.length} applications`);
    
    // Now test the Academic Affairs API
    console.log('\n🧪 Testing Academic Affairs API with fixed IDs...');
    
    try {
      const response = await fetch('http://localhost:3001/api/admissions/applications');
      const apiData = await response.json();
      
      if (apiData.success) {
        console.log(`✅ API returned ${apiData.applications.length} applications`);
        
        // Show first few applications with their IDs
        apiData.applications.slice(0, 3).forEach((app, index) => {
          console.log(`   Application ${index + 1}: ID = ${app.applicationId}, Name = ${app.firstName} ${app.lastName}`);
        });
      } else {
        console.log(`❌ API error: ${apiData.error}`);
      }
    } catch (fetchError) {
      console.log(`⚠️ Could not test API: ${fetchError.message}`);
    }
    
    return { success: true, fixed: fixedCount, alreadyProper: alreadyProperCount };
    
  } catch (error) {
    console.error('❌ Error fixing application IDs:', error);
    return { success: false, error: error.message };
  }
}

// Run the fix
fixApplicationIds()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Fix completed successfully!');
      console.log('🎯 The Academic Affairs system will now show proper UCAES application IDs.');
      console.log('🔄 Please refresh the browser to see the updated IDs.');
    } else {
      console.log('\n❌ Fix failed!');
      console.log(`🚨 Error: ${result.error}`);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });


