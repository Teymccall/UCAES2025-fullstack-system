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

async function debugApplicantIdGeneration() {
  console.log('🔍 DEBUGGING APPLICANT ID GENERATION ISSUE');
  console.log('=' .repeat(60));
  console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));

  try {
    // Step 1: Check current academic year configuration
    console.log('\n1️⃣ CHECKING ACADEMIC YEAR CONFIGURATION');
    console.log('-' .repeat(40));
    
    // Check centralized system
    const systemConfigRef = db.doc('systemConfig/academicPeriod');
    const systemConfigDoc = await systemConfigRef.get();
    
    let currentYear = null;
    let admissionYear = null;
    
    if (systemConfigDoc.exists) {
      const systemData = systemConfigDoc.data();
      console.log('✅ Found centralized system config:');
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`);
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`);
      
      if (systemData.currentAcademicYearId) {
        const yearRef = db.doc(`academic-years/${systemData.currentAcademicYearId}`);
        const yearDoc = await yearRef.get();
        
        if (yearDoc.exists) {
          const yearData = yearDoc.data();
          console.log('✅ Found academic year document:');
          console.log(`   Year: ${yearData.year}`);
          console.log(`   Display Name: ${yearData.displayName}`);
          console.log(`   Admission Status: ${yearData.admissionStatus}`);
          
          // Extract admission year
          if (yearData.year) {
            const yearMatch = yearData.year.match(/(\d{4})/);
            if (yearMatch) {
              admissionYear = yearMatch[1];
            }
          }
          
          // Fallback: Extract from display name
          if (!admissionYear && systemData.currentAcademicYear) {
            const yearMatch = systemData.currentAcademicYear.match(/\d{4}\/(\d{4})/);
            if (yearMatch) {
              admissionYear = yearMatch[1]; // Use second year for admissions
            }
          }
        }
      }
    } else {
      console.log('⚠️ No centralized system config found');
    }
    
    // Check legacy system
    const settingsRef = db.doc('academic-settings/current-year');
    const settingsDoc = await settingsRef.get();
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      console.log('✅ Found legacy system config:');
      console.log(`   Current Year: ${data.currentYear}`);
      
      if (!admissionYear) {
        admissionYear = data.currentYear;
      }
    }
    
    if (!admissionYear) {
      admissionYear = new Date().getFullYear().toString();
      console.log(`⚠️ Using fallback year: ${admissionYear}`);
    }
    
    console.log(`🎯 Final admission year for ID generation: ${admissionYear}`);

    // Step 2: Check application counters
    console.log('\n2️⃣ CHECKING APPLICATION COUNTERS');
    console.log('-' .repeat(40));
    
    const yearKey = `UCAES${admissionYear}`;
    const counterRef = db.doc(`application-counters/${yearKey}`);
    const counterDoc = await counterRef.get();
    
    if (counterDoc.exists) {
      const counterData = counterDoc.data();
      console.log(`✅ Found application counter for ${yearKey}:`);
      console.log(`   Last Number: ${counterData.lastNumber}`);
      console.log(`   Created At: ${counterData.createdAt?.toDate()}`);
      console.log(`   Last Updated: ${counterData.lastUpdated?.toDate()}`);
      
      const nextNumber = (counterData.lastNumber || 0) + 1;
      const nextId = `${yearKey}${nextNumber.toString().padStart(4, '0')}`;
      console.log(`🔮 Next Application ID would be: ${nextId}`);
    } else {
      console.log(`⚠️ No application counter found for ${yearKey}`);
      console.log(`🔮 First Application ID would be: ${yearKey}0001`);
    }

    // Step 3: Check recent applications
    console.log('\n3️⃣ CHECKING RECENT APPLICATIONS');
    console.log('-' .repeat(40));
    
    const applicationsRef = db.collection('admission-applications');
    const recentAppsQuery = applicationsRef.orderBy('createdAt', 'desc').limit(10);
    const recentAppsSnapshot = await recentAppsQuery.get();
    
    console.log(`📊 Found ${recentAppsSnapshot.size} recent applications:`);
    
    recentAppsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. Application ID: ${data.applicationId || 'MISSING!'}`);
      console.log(`      User: ${data.name} (${data.email})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Created: ${data.createdAt?.toDate()}`);
      console.log(`      Registration Number: ${data.registrationNumber || 'Not set'}`);
      console.log('');
    });

    // Step 4: Test ID generation process
    console.log('\n4️⃣ TESTING ID GENERATION PROCESS');
    console.log('-' .repeat(40));
    
    console.log('🧪 Simulating new applicant registration...');
    
    // Simulate the generation process
    try {
      let testCounter = 0;
      if (counterDoc.exists) {
        testCounter = counterDoc.data().lastNumber || 0;
      }
      
      const nextNumber = testCounter + 1;
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      const testApplicationId = `${yearKey}${paddedNumber}`;
      
      console.log(`✅ Test Application ID: ${testApplicationId}`);
      console.log(`   Year Key: ${yearKey}`);
      console.log(`   Next Number: ${nextNumber}`);
      console.log(`   Padded: ${paddedNumber}`);
      
      // Check if this ID already exists
      const existingQuery = applicationsRef.where('applicationId', '==', testApplicationId).limit(1);
      const existingSnapshot = await existingQuery.get();
      
      if (existingSnapshot.empty) {
        console.log('✅ Test ID is unique - no conflicts found');
      } else {
        console.log('❌ Test ID already exists - this indicates a problem!');
        const existingDoc = existingSnapshot.docs[0];
        const existingData = existingDoc.data();
        console.log(`   Existing application: ${existingData.name} (${existingData.email})`);
      }
      
    } catch (error) {
      console.error('❌ Error in test generation:', error);
    }

    // Step 5: Check for common issues
    console.log('\n5️⃣ CHECKING FOR COMMON ISSUES');
    console.log('-' .repeat(40));
    
    // Check for applications without applicationId
    const missingIdQuery = applicationsRef.where('applicationId', '==', null).limit(5);
    const missingIdSnapshot = await missingIdQuery.get();
    
    if (!missingIdSnapshot.empty) {
      console.log(`❌ Found ${missingIdSnapshot.size} applications without applicationId:`);
      missingIdSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.name} (${data.email}) - Created: ${data.createdAt?.toDate()}`);
      });
    } else {
      console.log('✅ All applications have applicationId field');
    }
    
    // Check for duplicate applicationIds
    const allAppsSnapshot = await applicationsRef.get();
    const applicationIds = [];
    const duplicates = [];
    
    allAppsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.applicationId) {
        if (applicationIds.includes(data.applicationId)) {
          duplicates.push(data.applicationId);
        } else {
          applicationIds.push(data.applicationId);
        }
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate application IDs:`);
      duplicates.forEach(id => console.log(`   - ${id}`));
    } else {
      console.log('✅ No duplicate application IDs found');
    }

    // Step 6: Recommendations
    console.log('\n6️⃣ RECOMMENDATIONS');
    console.log('-' .repeat(40));
    
    if (!counterDoc.exists) {
      console.log('🔧 ISSUE: Application counter not initialized');
      console.log('   SOLUTION: Initialize counter document');
      console.log(`   Command: Create document at application-counters/${yearKey} with {lastNumber: 0}`);
    }
    
    if (missingIdSnapshot.size > 0) {
      console.log('🔧 ISSUE: Some applications missing applicationId');
      console.log('   SOLUTION: Update existing applications with proper IDs');
    }
    
    if (duplicates.length > 0) {
      console.log('🔧 ISSUE: Duplicate application IDs found');
      console.log('   SOLUTION: Fix duplicates and ensure counter is accurate');
    }
    
    console.log('\n📋 DEBUGGING SUMMARY');
    console.log('=' .repeat(40));
    console.log(`✅ Admission Year: ${admissionYear}`);
    console.log(`�� Year Key: ${yearKey}`);
    console.log(`✅ Counter Exists: ${counterDoc.exists ? 'Yes' : 'No'}`);
    console.log(`✅ Recent Applications: ${recentAppsSnapshot.size}`);
    console.log(`✅ Missing IDs: ${missingIdSnapshot.size}`);
    console.log(`✅ Duplicate IDs: ${duplicates.length}`);
    
    if (counterDoc.exists && missingIdSnapshot.size === 0 && duplicates.length === 0) {
      console.log('\n🎉 SYSTEM APPEARS TO BE WORKING CORRECTLY');
      console.log('   If new applicants are not getting IDs, check:');
      console.log('   1. Frontend code is calling generateSequentialApplicationId()');
      console.log('   2. Firebase permissions allow counter updates');
      console.log('   3. Network connectivity during registration');
    } else {
      console.log('\n⚠️ ISSUES FOUND - SEE RECOMMENDATIONS ABOVE');
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  } finally {
    process.exit(0);
  }
}

debugApplicantIdGeneration();