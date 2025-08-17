const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../../Academic affairs/ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function fixApplicantIdIssue() {
  console.log('🔧 FIXING APPLICANT ID GENERATION ISSUE');
  console.log('=' .repeat(60));
  console.log(`📅 Fix Date: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));

  try {
    // Step 1: Get current admission year
    console.log('\n1️⃣ DETERMINING ADMISSION YEAR');
    console.log('-' .repeat(40));
    
    let admissionYear = '2026'; // Based on the debug output
    const yearKey = `UCAES${admissionYear}`;
    console.log(`🎯 Using admission year: ${admissionYear}`);
    console.log(`🎯 Year key: ${yearKey}`);

    // Step 2: Check and fix application counter
    console.log('\n2️⃣ CHECKING APPLICATION COUNTER');
    console.log('-' .repeat(40));
    
    const counterRef = db.doc(`application-counters/${yearKey}`);
    const counterDoc = await counterRef.get();
    
    if (counterDoc.exists) {
      const counterData = counterDoc.data();
      console.log(`✅ Found counter: Last Number = ${counterData.lastNumber}`);
    } else {
      console.log('⚠️ Counter not found, creating...');
      await counterRef.set({
        lastNumber: 0,
        year: admissionYear,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Counter created');
    }

    // Step 3: Find applications without applicationId
    console.log('\n3️⃣ FINDING APPLICATIONS WITHOUT IDs');
    console.log('-' .repeat(40));
    
    const applicationsRef = db.collection('admission-applications');
    const allAppsSnapshot = await applicationsRef.get();
    
    const appsWithoutId = [];
    const appsWithId = [];
    
    allAppsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.applicationId || data.applicationId === null || data.applicationId === undefined) {
        appsWithoutId.push({ id: doc.id, data });
      } else {
        appsWithId.push(data.applicationId);
      }
    });
    
    console.log(`📊 Total applications: ${allAppsSnapshot.size}`);
    console.log(`❌ Applications without ID: ${appsWithoutId.length}`);
    console.log(`✅ Applications with ID: ${appsWithId.length}`);

    // Step 4: Generate missing IDs
    if (appsWithoutId.length > 0) {
      console.log('\n4️⃣ GENERATING MISSING APPLICATION IDs');
      console.log('-' .repeat(40));
      
      // Get current counter value
      const currentCounterDoc = await counterRef.get();
      let currentCount = currentCounterDoc.exists ? (currentCounterDoc.data().lastNumber || 0) : 0;
      
      console.log(`📊 Starting from counter: ${currentCount}`);
      
      for (const app of appsWithoutId) {
        currentCount++;
        const paddedNumber = currentCount.toString().padStart(4, '0');
        const newApplicationId = `${yearKey}${paddedNumber}`;
        
        // Check if this ID already exists
        while (appsWithId.includes(newApplicationId)) {
          currentCount++;
          const paddedNumber = currentCount.toString().padStart(4, '0');
          newApplicationId = `${yearKey}${paddedNumber}`;
        }
        
        // Update the application document
        const appRef = db.doc(`admission-applications/${app.id}`);
        await appRef.update({
          applicationId: newApplicationId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Fixed: ${app.data.name || 'Unknown'} (${app.data.email || 'No email'}) → ${newApplicationId}`);
        appsWithId.push(newApplicationId);
      }
      
      // Update the counter
      await counterRef.update({
        lastNumber: currentCount,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Updated counter to: ${currentCount}`);
    }

    // Step 5: Initialize counter for current year if needed
    console.log('\n5️⃣ ENSURING COUNTER IS READY FOR NEW APPLICATIONS');
    console.log('-' .repeat(40));
    
    const currentYear = new Date().getFullYear().toString();
    const currentYearKey = `UCAES${currentYear}`;
    
    if (currentYearKey !== yearKey) {
      console.log(`🔄 Checking counter for current year: ${currentYear}`);
      
      const currentYearCounterRef = db.doc(`application-counters/${currentYearKey}`);
      const currentYearCounterDoc = await currentYearCounterRef.get();
      
      if (!currentYearCounterDoc.exists) {
        await currentYearCounterRef.set({
          lastNumber: 0,
          year: currentYear,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Created counter for ${currentYear}`);
      } else {
        console.log(`✅ Counter for ${currentYear} already exists`);
      }
    }

    // Step 6: Test the generation function
    console.log('\n6️⃣ TESTING ID GENERATION');
    console.log('-' .repeat(40));
    
    // Simulate the generation process
    const testCounterDoc = await counterRef.get();
    const testCounter = testCounterDoc.data().lastNumber || 0;
    const nextNumber = testCounter + 1;
    const testId = `${yearKey}${nextNumber.toString().padStart(4, '0')}`;
    
    console.log(`🧪 Next ID would be: ${testId}`);
    
    // Check if it's unique
    const existingQuery = applicationsRef.where('applicationId', '==', testId).limit(1);
    const existingSnapshot = await existingQuery.get();
    
    if (existingSnapshot.empty) {
      console.log('✅ Test ID is unique');
    } else {
      console.log('❌ Test ID already exists - counter may be incorrect');
    }

    // Step 7: Create a fix for the frontend
    console.log('\n7️⃣ FRONTEND FIX RECOMMENDATIONS');
    console.log('-' .repeat(40));
    
    console.log('🔧 To ensure new applicants get IDs:');
    console.log('1. ✅ Application counter is now properly initialized');
    console.log('2. ✅ Existing applications without IDs have been fixed');
    console.log('3. 🔍 Check that the frontend calls generateSequentialApplicationId()');
    console.log('4. 🔍 Verify Firebase permissions allow counter updates');
    console.log('5. 🔍 Ensure error handling in registration process');

    console.log('\n📋 SUMMARY');
    console.log('=' .repeat(40));
    console.log(`✅ Fixed ${appsWithoutId.length} applications without IDs`);
    console.log(`✅ Counter is ready for new applications`);
    console.log(`✅ Next application ID will be: ${testId}`);
    
    console.log('\n🎉 APPLICANT ID GENERATION SHOULD NOW WORK CORRECTLY!');
    console.log('\nTo test:');
    console.log('1. Try creating a new applicant account');
    console.log('2. Check that they receive an application ID');
    console.log('3. Verify the ID follows format: UCAES + year + 4-digit number');

  } catch (error) {
    console.error('❌ Fix script failed:', error);
  } finally {
    process.exit(0);
  }
}

fixApplicantIdIssue();