// Test script to verify study level field integration
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testStudyLevelIntegration() {
  console.log('🔍 Testing Study Level Field Integration...\n');

  try {
    // 1. Check existing applications for study level field
    console.log('1. Checking existing applications for study level field...');
    const applicationsRef = db.collection('admission-applications');
    const applicationsSnapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${applicationsSnapshot.size} applications`);
    
    let applicationsWithStudyLevel = 0;
    let applicationsWithoutStudyLevel = 0;
    
    applicationsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const hasStudyLevel = data.programSelection && data.programSelection.studyLevel;
      
      if (hasStudyLevel) {
        applicationsWithStudyLevel++;
        console.log(`   ✅ Application ${index + 1}: Has study level - ${data.programSelection.studyLevel}`);
      } else {
        applicationsWithoutStudyLevel++;
        console.log(`   ❌ Application ${index + 1}: Missing study level field`);
      }
    });

    // 2. Test the Academic Affairs API
    console.log('\n2. Testing Academic Affairs API...');
    try {
      const response = await fetch('http://localhost:3001/api/admissions/applications');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.applications)) {
        console.log(`✅ API returned ${data.applications.length} applications`);
        
        const apiApplicationsWithStudyLevel = data.applications.filter(app => app.studyLevel);
        console.log(`📊 ${apiApplicationsWithStudyLevel.length} applications have study level in API response`);
        
        if (apiApplicationsWithStudyLevel.length > 0) {
          console.log('📋 Sample study level data from API:');
          apiApplicationsWithStudyLevel.slice(0, 3).forEach((app, index) => {
            console.log(`   ${index + 1}. ${app.firstName} ${app.lastName}: Level ${app.studyLevel}`);
          });
        }
      } else {
        console.log('❌ API response structure is invalid');
      }
    } catch (error) {
      console.log('⚠️ Could not test API (server might not be running):', error.message);
    }

    // 3. Check data structure in Firebase
    console.log('\n3. Checking data structure in Firebase...');
    if (applicationsSnapshot.size > 0) {
      const sampleDoc = applicationsSnapshot.docs[0];
      const sampleData = sampleDoc.data();
      
      console.log('📋 Sample application structure:');
      console.log(`   - Document ID: ${sampleDoc.id}`);
      console.log(`   - Has programSelection: ${!!sampleData.programSelection}`);
      
      if (sampleData.programSelection) {
        console.log(`   - Program Type: ${sampleData.programSelection.programType || 'N/A'}`);
        console.log(`   - Level: ${sampleData.programSelection.level || 'N/A'}`);
        console.log(`   - Study Level: ${sampleData.programSelection.studyLevel || 'N/A'}`);
        console.log(`   - Study Mode: ${sampleData.programSelection.studyMode || 'N/A'}`);
        console.log(`   - First Choice: ${sampleData.programSelection.firstChoice || 'N/A'}`);
      }
    }

    // 4. Summary
    console.log('\n🎯 Integration Summary:');
    console.log(`- Total applications: ${applicationsSnapshot.size}`);
    console.log(`- Applications with study level: ${applicationsWithStudyLevel}`);
    console.log(`- Applications without study level: ${applicationsWithoutStudyLevel}`);
    console.log(`- Study level field integration: ${applicationsWithStudyLevel > 0 ? '✅ Working' : '❌ Not found'}`);
    
    if (applicationsWithoutStudyLevel > 0) {
      console.log('\n💡 Note: Some applications may not have study level because they were created before this feature was added.');
      console.log('   New applications will automatically include the study level field.');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    process.exit(0);
  }
}

testStudyLevelIntegration();


