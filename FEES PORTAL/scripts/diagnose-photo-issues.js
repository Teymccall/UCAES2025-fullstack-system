// Diagnostic script to identify and fix passport picture issues
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

async function diagnosePhotoIssues() {
  try {
    console.log('🔍 Starting photo diagnosis...\n');
    
    // Check student-registrations collection
    console.log('📚 Checking student-registrations collection...');
    const studentsRef = db.collection('student-registrations');
    const studentsSnapshot = await studentsRef.limit(10).get();
    
    const photoIssues = [];
    
    studentsSnapshot.forEach(doc => {
      const studentData = doc.data();
      const studentId = studentData.registrationNumber || studentData.studentIndexNumber || doc.id;
      
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
      
      const foundPhotos = [];
      const missingPhotos = [];
      
      photoFields.forEach(field => {
        const photoUrl = studentData[field];
        if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
          foundPhotos.push({ field, url: photoUrl });
        } else {
          missingPhotos.push(field);
        }
      });
      
      if (foundPhotos.length === 0) {
        photoIssues.push({
          studentId,
          name: `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim(),
          issue: 'No photos found',
          missingFields: missingPhotos,
          foundPhotos: []
        });
      } else if (foundPhotos.length > 1) {
        photoIssues.push({
          studentId,
          name: `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim(),
          issue: 'Multiple photo fields found',
          missingFields: missingPhotos,
          foundPhotos: foundPhotos
        });
      } else {
        console.log(`✅ Student ${studentId}: Photo found in ${foundPhotos[0].field}`);
      }
    });
    
    // Check students collection
    console.log('\n📚 Checking students collection...');
    const studentsCollectionRef = db.collection('students');
    const studentsCollectionSnapshot = await studentsCollectionRef.limit(10).get();
    
    studentsCollectionSnapshot.forEach(doc => {
      const studentData = doc.data();
      const email = studentData.email;
      
      if (email) {
        const photoFields = ['profilePictureUrl', 'passportPhotoUrl', 'photoUrl'];
        const foundPhotos = [];
        
        photoFields.forEach(field => {
          const photoUrl = studentData[field];
          if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
            foundPhotos.push({ field, url: photoUrl });
          }
        });
        
        if (foundPhotos.length > 0) {
          console.log(`✅ Students collection: Photo found for ${email} in ${foundPhotos[0].field}`);
        }
      }
    });
    
    // Check applications collection
    console.log('\n📚 Checking applications collection...');
    const applicationsRef = db.collection('applications');
    const applicationsSnapshot = await applicationsRef.limit(10).get();
    
    applicationsSnapshot.forEach(doc => {
      const appData = doc.data();
      const email = appData.contactInfo?.email;
      
      if (email) {
        const nestedPhotoFields = [
          'personalInfo.passportPhoto.url',
          'documents.photo.url'
        ];
        
        const foundPhotos = [];
        
        nestedPhotoFields.forEach(field => {
          const photoUrl = getNestedValue(appData, field);
          if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
            foundPhotos.push({ field, url: photoUrl });
          }
        });
        
        if (foundPhotos.length > 0) {
          console.log(`✅ Applications collection: Photo found for ${email} in ${foundPhotos[0].field}`);
        }
      }
    });
    
    // Report issues
    if (photoIssues.length > 0) {
      console.log('\n❌ PHOTO ISSUES FOUND:');
      photoIssues.forEach((issue, index) => {
        console.log(`\n${index + 1}. Student: ${issue.name} (${issue.studentId})`);
        console.log(`   Issue: ${issue.issue}`);
        if (issue.foundPhotos.length > 0) {
          console.log(`   Found photos: ${issue.foundPhotos.map(p => `${p.field}: ${p.url}`).join(', ')}`);
        }
        if (issue.missingFields.length > 0) {
          console.log(`   Missing fields: ${issue.missingFields.join(', ')}`);
        }
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Ensure all students have photos uploaded during registration');
      console.log('2. Standardize photo field names across collections');
      console.log('3. Use the new photo-utils.ts for consistent photo resolution');
      console.log('4. Check if photo URLs are still valid (not expired)');
      console.log('5. Consider implementing photo fallbacks with student initials');
      
    } else {
      console.log('\n✅ No photo issues found!');
    }
    
    // Generate summary report
    const summary = {
      totalStudentsChecked: studentsSnapshot.size,
      studentsWithPhotos: studentsSnapshot.size - photoIssues.length,
      studentsWithoutPhotos: photoIssues.length,
      issues: photoIssues,
      timestamp: new Date().toISOString()
    };
    
    const reportPath = path.join(process.cwd(), 'photo-diagnosis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    console.log(`\n📊 Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// Run the diagnosis
diagnosePhotoIssues()
  .then(() => {
    console.log('\n✅ Photo diagnosis completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Photo diagnosis failed:', error);
    process.exit(1);
  });
