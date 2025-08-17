const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function monitorPhotoUploads() {
  console.log('📊 Student Photo Upload Monitoring Dashboard\n');
  console.log('=' .repeat(50));

  try {
    // Get all student registrations
    const registrationsRef = collection(db, 'student-registrations');
    const snapshot = await getDocs(registrationsRef);
    
    const stats = {
      total: 0,
      withPhotos: 0,
      withoutPhotos: 0,
      uploadFailed: 0,
      needsReupload: 0,
      recentFailures: []
    };

    const studentsNeedingContact = [];
    const recentFailures = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Skip test records
      if (data.registrationNumber?.startsWith('REG') || 
          data.registrationNumber?.startsWith('WKD') ||
          data.status === 'draft') {
        return;
      }
      
      stats.total++;
      
      if (data.status === 'image_upload_failed') {
        stats.uploadFailed++;
        
        const failure = {
          name: `${data.surname || 'Unknown'} ${data.otherNames || 'Unknown'}`,
          email: data.email,
          regNumber: data.registrationNumber,
          error: data.uploadError,
          timestamp: data.uploadErrorDetails?.timestamp?.toDate?.() || 'Unknown'
        };
        
        recentFailures.push(failure);
      } else if (data.needsPhotoReupload) {
        stats.needsReupload++;
      } else if (data.profilePictureUrl) {
        stats.withPhotos++;
      } else {
        stats.withoutPhotos++;
        
        // Real students without photos who need to be contacted
        if (data.surname && data.otherNames && data.email && 
            data.status !== 'draft' && !data.needsPhotoReupload) {
          studentsNeedingContact.push({
            name: `${data.surname} ${data.otherNames}`,
            email: data.email,
            regNumber: data.registrationNumber,
            status: data.status
          });
        }
      }
    });

    // Calculate success rate
    const successRate = stats.total > 0 ? ((stats.withPhotos / stats.total) * 100).toFixed(1) : '0';

    // Display dashboard
    console.log('📈 OVERALL STATISTICS');
    console.log('-'.repeat(25));
    console.log(`Total Students: ${stats.total}`);
    console.log(`✅ With Photos: ${stats.withPhotos} (${successRate}%)`);
    console.log(`❌ Without Photos: ${stats.withoutPhotos}`);
    console.log(`🚨 Upload Failed: ${stats.uploadFailed}`);
    console.log(`🔄 Needs Re-upload: ${stats.needsReupload}`);
    
    // Status indicator
    if (parseFloat(successRate) >= 90) {
      console.log(`🟢 Status: EXCELLENT (${successRate}%)`);
    } else if (parseFloat(successRate) >= 75) {
      console.log(`🟡 Status: GOOD (${successRate}%)`);
    } else if (parseFloat(successRate) >= 50) {
      console.log(`🟠 Status: NEEDS ATTENTION (${successRate}%)`);
    } else {
      console.log(`🔴 Status: CRITICAL (${successRate}%)`);
    }

    // Recent upload failures
    if (recentFailures.length > 0) {
      console.log('\n🚨 RECENT UPLOAD FAILURES');
      console.log('-'.repeat(30));
      recentFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.name}`);
        console.log(`   📧 Email: ${failure.email}`);
        console.log(`   📋 Registration: ${failure.regNumber}`);
        console.log(`   ❌ Error: ${failure.error}`);
        console.log(`   🕒 Time: ${failure.timestamp}`);
        console.log('');
      });
    }

    // Students needing contact
    if (studentsNeedingContact.length > 0) {
      console.log('\n👥 STUDENTS TO CONTACT (Missing Photos)');
      console.log('-'.repeat(40));
      studentsNeedingContact.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   📋 Registration: ${student.regNumber}`);
        console.log(`   📊 Status: ${student.status}`);
        console.log('');
      });
      
      console.log('📝 EMAIL TEMPLATE FOR MISSING PHOTOS:');
      console.log('-'.repeat(35));
      console.log(`Subject: Action Required: Upload Your Passport Photo`);
      console.log('');
      console.log('Dear [Student Name],');
      console.log('');
      console.log('We notice that your passport photo is missing from your student registration.');
      console.log('To complete your registration, please:');
      console.log('');
      console.log('1. Visit the registration portal');
      console.log('2. Upload a clear passport-style photo (JPG/PNG, under 2MB)');
      console.log('3. Ensure the photo meets our requirements');
      console.log('');
      console.log('If you need assistance, please contact the registrar office.');
      console.log('');
      console.log('Best regards,');
      console.log('UCAES Registration Team');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(20));
    
    if (parseFloat(successRate) < 75) {
      console.log('🚨 URGENT: Photo upload success rate is below 75%');
      console.log('   - Check Cloudinary configuration immediately');
      console.log('   - Review network connectivity during peak times');
      console.log('   - Consider increasing retry attempts');
    }
    
    if (stats.uploadFailed > 0) {
      console.log('⚠️ Monitor upload failures and contact affected students');
    }
    
    if (studentsNeedingContact.length > 5) {
      console.log('📧 Bulk email campaign needed for photo uploads');
    }
    
    console.log('🔍 Regular monitoring recommended:');
    console.log('   - Run this script daily during registration periods');
    console.log('   - Alert when success rate drops below 80%');
    console.log('   - Track improvement after system changes');

  } catch (error) {
    console.error('❌ Error during monitoring:', error.message);
  }
}

// Run the monitoring
monitorPhotoUploads().then(() => {
  console.log('\n✅ Monitoring completed');
  console.log('\n📋 NEXT ACTIONS:');
  console.log('   1. Contact students without photos');
  console.log('   2. Investigate recent upload failures');
  console.log('   3. Monitor success rate trends');
  console.log('   4. Schedule regular monitoring checks');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});











