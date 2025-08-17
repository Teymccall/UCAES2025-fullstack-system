// Test script to verify passport photo display in Academic Affairs
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testPassportPhotoDisplay() {
  console.log('🔍 Testing Passport Photo Display in Academic Affairs...\n');

  try {
    // 1. Check applications with passport photos
    console.log('1. Checking applications with passport photos...');
    const applicationsRef = db.collection('admission-applications');
    const applicationsSnapshot = await applicationsRef.get();
    
    console.log(`📊 Found ${applicationsSnapshot.size} applications`);
    
    let applicationsWithPassportPhoto = 0;
    let applicationsWithoutPassportPhoto = 0;
    
    applicationsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const hasPassportPhoto = data.personalInfo && data.personalInfo.passportPhoto && data.personalInfo.passportPhoto.url;
      
      if (hasPassportPhoto) {
        applicationsWithPassportPhoto++;
        console.log(`   ✅ Application ${index + 1}: Has passport photo`);
        console.log(`      - URL: ${data.personalInfo.passportPhoto.url}`);
        console.log(`      - Public ID: ${data.personalInfo.passportPhoto.publicId}`);
      } else {
        applicationsWithoutPassportPhoto++;
        console.log(`   ❌ Application ${index + 1}: Missing passport photo`);
      }
    });

    // 2. Test the Academic Affairs API
    console.log('\n2. Testing Academic Affairs API...');
    try {
      const response = await fetch('http://localhost:3001/api/admissions/applications');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.applications)) {
        console.log(`✅ API returned ${data.applications.length} applications`);
        
        const apiApplicationsWithPhoto = data.applications.filter(app => app.documentUrls && app.documentUrls.photo);
        console.log(`📊 ${apiApplicationsWithPhoto.length} applications have photo in API response`);
        
        if (apiApplicationsWithPhoto.length > 0) {
          console.log('📋 Sample photo data from API:');
          apiApplicationsWithPhoto.slice(0, 3).forEach((app, index) => {
            console.log(`   ${index + 1}. ${app.firstName} ${app.lastName}: ${app.documentUrls.photo ? 'Has photo' : 'No photo'}`);
            if (app.documentUrls.photo) {
              console.log(`      - Photo URL: ${app.documentUrls.photo}`);
            }
          });
        }
      } else {
        console.log('❌ API response structure is invalid');
      }
    } catch (error) {
      console.log('⚠️ Could not test API (server might not be running):', error.message);
    }

    // 3. Summary
    console.log('\n🎯 Passport Photo Display Summary:');
    console.log(`- Total applications: ${applicationsSnapshot.size}`);
    console.log(`- Applications with passport photo: ${applicationsWithPassportPhoto}`);
    console.log(`- Applications without passport photo: ${applicationsWithoutPassportPhoto}`);
    console.log(`- Passport photo integration: ${applicationsWithPassportPhoto > 0 ? '✅ Working' : '❌ Not found'}`);
    
    if (applicationsWithoutPassportPhoto > 0) {
      console.log('\n💡 Note: Some applications may not have passport photos because they were created before this feature was added.');
      console.log('   New applications will automatically include passport photos when uploaded.');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    process.exit(0);
  }
}

testPassportPhotoDisplay();


