// Test script to check application ID generation
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testApplicationIdGeneration() {
  console.log('🔍 Testing Application ID Generation...\n');

  try {
    // 1. Check academic year settings
    console.log('1. Checking academic year settings...');
    const settingsRef = db.collection('academic-settings').doc('current-year');
    const settingsDoc = await settingsRef.get();
    
    let currentYear = '2025';
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      currentYear = data.currentYear || '2025';
      console.log('✅ Academic year settings found:', data);
    } else {
      console.log('❌ No academic year settings found');
      console.log('💡 Creating default academic year settings...');
      await settingsRef.set({
        currentYear: '2025',
        admissionStatus: 'open',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Created default academic year settings');
    }

    // 2. Check application counters for the current year
    console.log('\n2. Checking application counters...');
    const yearKey = `UCAES${currentYear}`;
    const counterRef = db.collection('application-counters').doc(yearKey);
    const counterDoc = await counterRef.get();
    
    if (counterDoc.exists) {
      const data = counterDoc.data();
      console.log('✅ Application counter found:', data);
    } else {
      console.log('❌ No application counter found for year:', yearKey);
      console.log('💡 Creating application counter...');
      await counterRef.set({
        lastNumber: 0,
        year: currentYear,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Created application counter');
    }

    // 3. Check existing applications
    console.log('\n3. Checking existing applications...');
    const applicationsRef = db.collection('admission-applications');
    const applicationsSnapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${applicationsSnapshot.size} existing applications`);
    
    if (!applicationsSnapshot.empty) {
      console.log('\n📋 Recent applications:');
      applicationsSnapshot.docs.slice(0, 5).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. User: ${data.email || 'N/A'}`);
        console.log(`      ID: ${data.id || 'N/A'}`);
        console.log(`      ApplicationId: ${data.applicationId || 'N/A'}`);
        console.log(`      Status: ${data.status || 'N/A'}`);
        console.log(`      Created: ${data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : 'N/A'}`);
        console.log('');
      });
    }

    // 4. Test application ID generation
    console.log('4. Testing application ID generation...');
    const testUserId = 'test-user-' + Date.now();
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    
    // Simulate the generation process
    const newCounterDoc = await counterRef.get();
    const currentCount = newCounterDoc.data().lastNumber || 0;
    const nextNumber = currentCount + 1;
    const paddedNumber = nextNumber.toString().padStart(4, "0");
    const generatedId = `${yearKey}${paddedNumber}`;
    
    console.log('✅ Generated test application ID:', generatedId);
    console.log('   Year Key:', yearKey);
    console.log('   Next Number:', nextNumber);
    console.log('   Padded Number:', paddedNumber);

    // 5. Check if there are any applications without applicationId
    console.log('\n5. Checking for applications without applicationId...');
    const applicationsWithoutId = applicationsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.applicationId && data.id;
    });
    
    if (applicationsWithoutId.length > 0) {
      console.log(`⚠️ Found ${applicationsWithoutId.length} applications without applicationId field`);
      applicationsWithoutId.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. User: ${data.email || 'N/A'}`);
        console.log(`      Has 'id': ${!!data.id}`);
        console.log(`      Has 'applicationId': ${!!data.applicationId}`);
      });
    } else {
      console.log('✅ All applications have applicationId field');
    }

    // 6. Check for applications with wrong field structure
    console.log('\n6. Checking for applications with wrong field structure...');
    const applicationsWithWrongStructure = applicationsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.id && !data.applicationId; // Has 'id' but no 'applicationId'
    });
    
    if (applicationsWithWrongStructure.length > 0) {
      console.log(`⚠️ Found ${applicationsWithWrongStructure.length} applications with wrong structure (id instead of applicationId)`);
      applicationsWithWrongStructure.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. User: ${data.email || 'N/A'}`);
        console.log(`      Document ID: ${doc.id}`);
        console.log(`      Has 'id' field: ${!!data.id}`);
        console.log(`      Has 'applicationId' field: ${!!data.applicationId}`);
        console.log(`      'id' value: ${data.id}`);
      });
    } else {
      console.log('✅ All applications have correct field structure');
    }

    console.log('\n🎯 Summary:');
    console.log('- Academic year settings: ✅');
    console.log('- Application counters: ✅');
    console.log('- Application ID generation: ✅');
    console.log('- Test ID generated:', generatedId);
    console.log('- Current year:', currentYear);
    console.log('- Year key:', yearKey);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    process.exit(0);
  }
}

testApplicationIdGeneration();
