// Analyze Registration ID Changes Script
// This script will help identify what's causing registration ID changes

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function analyzeRegistrationIds() {
  try {
    console.log('🔍 Analyzing Registration ID Changes...\n');

    // 1. Check application counters
    console.log('📊 1. Checking Application Counters:');
    console.log('=====================================');
    
    const countersRef = collection(db, 'application-counters');
    const countersSnapshot = await getDocs(countersRef);
    
    if (countersSnapshot.empty) {
      console.log('❌ No application counters found');
    } else {
      countersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`📈 Counter: ${doc.id}`);
        console.log(`   Last Number: ${data.lastNumber || 'N/A'}`);
        console.log(`   Year: ${data.year || 'N/A'}`);
        console.log(`   Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        console.log(`   Updated: ${data.lastUpdated?.toDate?.() || data.lastUpdated || 'N/A'}`);
        console.log('');
      });
    }

    // 2. Check registration counters
    console.log('📊 2. Checking Registration Counters:');
    console.log('=====================================');
    
    const regCountersRef = collection(db, 'registration-counters');
    const regCountersSnapshot = await getDocs(regCountersRef);
    
    if (regCountersSnapshot.empty) {
      console.log('❌ No registration counters found');
    } else {
      regCountersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`📈 Counter: ${doc.id}`);
        console.log(`   Last Number: ${data.lastNumber || 'N/A'}`);
        console.log(`   Year: ${data.year || 'N/A'}`);
        console.log(`   Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        console.log(`   Updated: ${data.lastUpdated?.toDate?.() || data.lastUpdated || 'N/A'}`);
        console.log('');
      });
    }

    // 3. Check recent applications
    console.log('📊 3. Checking Recent Applications:');
    console.log('=====================================');
    
    const applicationsRef = collection(db, 'admission-applications');
    const applicationsQuery = query(applicationsRef, orderBy('createdAt', 'desc'));
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    if (applicationsSnapshot.empty) {
      console.log('❌ No applications found');
    } else {
      console.log(`📋 Found ${applicationsSnapshot.size} applications`);
      console.log('Recent applications (last 10):');
      
      let count = 0;
      applicationsSnapshot.forEach(doc => {
        if (count < 10) {
          const data = doc.data();
          console.log(`\n📄 Application: ${doc.id}`);
          console.log(`   Application ID: ${data.applicationId || 'N/A'}`);
          console.log(`   Registration Number: ${data.registrationNumber || 'N/A'}`);
          console.log(`   User ID: ${data.userId || 'N/A'}`);
          console.log(`   Name: ${data.name || 'N/A'}`);
          console.log(`   Status: ${data.status || 'N/A'}`);
          console.log(`   Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
          count++;
        }
      });
    }

    // 4. Check for duplicate application IDs
    console.log('\n📊 4. Checking for Duplicate Application IDs:');
    console.log('==============================================');
    
    const allApplications = [];
    applicationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.applicationId) {
        allApplications.push({
          docId: doc.id,
          applicationId: data.applicationId,
          name: data.name || 'N/A'
        });
      }
    });

    const applicationIdCounts = {};
    allApplications.forEach(app => {
      applicationIdCounts[app.applicationId] = (applicationIdCounts[app.applicationId] || 0) + 1;
    });

    const duplicates = Object.entries(applicationIdCounts).filter(([id, count]) => count > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate application IDs found');
    } else {
      console.log(`❌ Found ${duplicates.length} duplicate application IDs:`);
      duplicates.forEach(([id, count]) => {
        console.log(`   ${id}: ${count} occurrences`);
        const appsWithId = allApplications.filter(app => app.applicationId === id);
        appsWithId.forEach(app => {
          console.log(`     - ${app.name} (${app.docId})`);
        });
      });
    }

    // 5. Check system configuration
    console.log('\n📊 5. Checking System Configuration:');
    console.log('=====================================');
    
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod');
    const systemConfigDoc = await getDoc(systemConfigRef);
    
    if (systemConfigDoc.exists()) {
      const data = systemConfigDoc.data();
      console.log('✅ Centralized system configuration found:');
      console.log(`   Current Academic Year ID: ${data.currentAcademicYearId || 'N/A'}`);
      console.log(`   Current Academic Year: ${data.currentAcademicYear || 'N/A'}`);
      console.log(`   Last Updated: ${data.lastUpdated?.toDate?.() || data.lastUpdated || 'N/A'}`);
    } else {
      console.log('❌ No centralized system configuration found');
    }

    // 6. Check legacy academic settings
    console.log('\n📊 6. Checking Legacy Academic Settings:');
    console.log('=========================================');
    
    const legacySettingsRef = doc(db, 'academic-settings', 'current-year');
    const legacySettingsDoc = await getDoc(legacySettingsRef);
    
    if (legacySettingsDoc.exists()) {
      const data = legacySettingsDoc.data();
      console.log('✅ Legacy academic settings found:');
      console.log(`   Current Year: ${data.currentYear || 'N/A'}`);
      console.log(`   Last Updated: ${data.lastUpdated?.toDate?.() || data.lastUpdated || 'N/A'}`);
    } else {
      console.log('❌ No legacy academic settings found');
    }

    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Error analyzing registration IDs:', error);
  }
}

// Run the analysis
if (require.main === module) {
  console.log('🚀 Starting Registration ID Analysis...\n');
  analyzeRegistrationIds()
    .then(() => {
      console.log('\n✅ Analysis completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { analyzeRegistrationIds };
