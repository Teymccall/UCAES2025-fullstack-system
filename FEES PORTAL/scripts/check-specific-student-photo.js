// Targeted script to check a specific student's photo data
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-786e076637.json');
let serviceAccount = null;

try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('🔑 Using service account from file');
  } else {
    console.log('⚠️ Service account file not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading service account:', error);
  process.exit(1);
}

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore(adminApp);

async function checkSpecificStudentPhoto(studentId = 'UCAES20240003') {
  try {
    console.log(`🔍 Checking photo data for student: ${studentId}\n`);
    
    // Check student-registrations collection (limit to 1 to avoid quota)
    console.log('📚 Checking student-registrations collection...');
    const studentsRef = db.collection('student-registrations');
    const studentQuery = studentsRef.where('registrationNumber', '==', studentId).limit(1);
    const studentSnapshot = await studentQuery.get();
    
    if (studentSnapshot.empty) {
      console.log(`❌ Student ${studentId} not found in student-registrations`);
      return;
    }
    
    const studentDoc = studentSnapshot.docs[0];
    const studentData = studentDoc.data();
    
    console.log(`✅ Found student: ${studentData.surname || ''} ${studentData.otherNames || ''}`);
    console.log(`📧 Email: ${studentData.email || 'N/A'}`);
    console.log(`🎓 Programme: ${studentData.programme || 'N/A'}`);
    console.log(`📊 Level: ${studentData.currentLevel || 'N/A'}\n`);
    
    // Check all possible photo fields
    const photoFields = [
      'profilePictureUrl',
      'passportPhotoUrl',
      'photoUrl',
      'imageUrl',
      'passport_photo',
      'photo',
      'image',
      'passportPhoto'
    ];
    
    console.log('🔍 Photo field analysis:');
    let foundPhotos = [];
    let missingPhotos = [];
    
    photoFields.forEach(field => {
      const photoUrl = studentData[field];
      if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
        foundPhotos.push({ field, url: photoUrl });
        console.log(`✅ ${field}: ${photoUrl}`);
      } else {
        missingPhotos.push(field);
        console.log(`❌ ${field}: Not found`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`- Photos found: ${foundPhotos.length}`);
    console.log(`- Missing fields: ${missingPhotos.length}`);
    
    if (foundPhotos.length > 0) {
      console.log(`\n🎯 Primary photo URL: ${foundPhotos[0].url}`);
      
      // Test if the URL is accessible
      console.log(`\n🔗 Testing photo URL accessibility...`);
      try {
        const response = await fetch(foundPhotos[0].url, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        console.log('✅ Photo URL appears to be accessible');
      } catch (error) {
        console.log('❌ Photo URL accessibility test failed:', error.message);
      }
    } else {
      console.log(`\n❌ No photos found for this student`);
      console.log(`💡 This explains why the photo isn't showing in the student portal`);
    }
    
    // Check if there are any nested photo fields
    console.log(`\n🔍 Checking for nested photo fields...`);
    const nestedFields = [
      'personalInfo.passportPhoto.url',
      'documents.photo.url',
      'applicationData.personalInfo.passportPhoto.url'
    ];
    
    nestedFields.forEach(nestedField => {
      const photoUrl = getNestedValue(studentData, nestedField);
      if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
        console.log(`✅ ${nestedField}: ${photoUrl}`);
        foundPhotos.push({ field: nestedField, url: photoUrl });
      } else {
        console.log(`❌ ${nestedField}: Not found`);
      }
    });
    
    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (foundPhotos.length === 0) {
      console.log('1. Student needs to upload a photo during registration');
      console.log('2. Check if photo upload component is working');
      console.log('3. Verify photo storage configuration');
    } else if (foundPhotos.length > 1) {
      console.log('1. Multiple photo fields found - consider standardizing');
      console.log('2. Use the new photo-utils.ts for consistent resolution');
    } else {
      console.log('1. Photo found but may have accessibility issues');
      console.log('2. Check if photo URL is still valid');
      console.log('3. Verify CORS settings for external photo URLs');
    }
    
  } catch (error) {
    console.error('❌ Error checking student photo:', error);
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// Get student ID from command line argument or use default
const studentId = process.argv[2] || 'UCAES20240003';

// Run the check
checkSpecificStudentPhoto(studentId)
  .then(() => {
    console.log('\n✅ Photo check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Photo check failed:', error);
    process.exit(1);
  });











