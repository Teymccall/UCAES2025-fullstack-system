// Automatic Student Migration System
// This script creates the infrastructure for automatically migrating approved students
// from admission-applications to student-registrations

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, serverTimestamp, addDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate registration number
async function generateRegistrationNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `UCAES${currentYear}`;
  
  try {
    // Get the highest existing registration number for this year
    const registrationsQuery = query(
      collection(db, "student-registrations"),
      where("registrationNumber", ">=", prefix),
      where("registrationNumber", "<=", prefix + "9999")
    );
    
    const snapshot = await getDocs(registrationsQuery);
    let maxNumber = 0;
    
    snapshot.forEach(doc => {
      const regNumber = doc.data().registrationNumber;
      if (regNumber && regNumber.startsWith(prefix)) {
        const number = parseInt(regNumber.substring(prefix.length));
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    
  } catch (error) {
    console.error('Error generating registration number:', error);
    // Fallback to timestamp-based number
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

// Map admission data to registration format
function mapAdmissionToRegistration(admissionData, registrationNumber) {
  const personalInfo = admissionData.personalInfo || {};
  const contactInfo = admissionData.contactInfo || {};
  const programSelection = admissionData.programSelection || {};
  
  return {
    // Basic identification
    registrationNumber: registrationNumber,
    authUid: admissionData.userId || '',
    
    // Personal information
    surname: personalInfo.surname || '',
    otherNames: personalInfo.otherNames || personalInfo.firstName || '',
    dateOfBirth: personalInfo.dateOfBirth || '',
    gender: personalInfo.gender || '',
    nationality: personalInfo.nationality || '',
    
    // Contact information
    email: contactInfo.email || '',
    phone: contactInfo.phone || contactInfo.phoneNumber || '',
    address: contactInfo.address || '',
    city: contactInfo.city || '',
    region: contactInfo.region || '',
    country: contactInfo.country || 'Ghana',
    
    // Guardian information (if available)
    guardianName: contactInfo.guardianName || '',
    guardianPhone: contactInfo.guardianPhone || '',
    guardianEmail: contactInfo.guardianEmail || '',
    relationship: contactInfo.relationship || '',
    
    // Academic information
    programme: programSelection.name || programSelection.title || 'Not specified',
    currentLevel: 100, // New students start at Level 100
    entryLevel: 100,
    yearOfEntry: new Date().getFullYear().toString(),
    studyMode: programSelection.studyMode || 'Regular',
    scheduleType: programSelection.studyMode || 'Regular',
    
    // Status and tracking
    status: 'active',
    registrationDate: serverTimestamp(),
    
    // Migration tracking
    transferredFromAdmission: true,
    originalApplicationId: admissionData.applicationId || '',
    originalAdmissionId: '', // Will be set to the document ID
    migrationDate: serverTimestamp(),
    
    // Metadata
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    sourceCollection: 'admission-applications'
  };
}

// Migrate a single approved application
async function migrateApprovedApplication(applicationId) {
  console.log(`🔄 Migrating application: ${applicationId}`);
  
  try {
    // 1. Get the admission application
    const admissionDoc = await getDoc(doc(db, 'admission-applications', applicationId));
    
    if (!admissionDoc.exists()) {
      throw new Error(`Application ${applicationId} not found`);
    }
    
    const admissionData = admissionDoc.data();
    
    // 2. Check if application is approved
    const status = admissionData.applicationStatus || admissionData.status || '';
    if (!status.toLowerCase().includes('accept') && !status.toLowerCase().includes('approv')) {
      throw new Error(`Application ${applicationId} is not approved (status: ${status})`);
    }
    
    // 3. Check if already migrated
    const existingQuery = query(
      collection(db, 'student-registrations'),
      where('originalApplicationId', '==', applicationId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log(`⚠️  Application ${applicationId} already migrated`);
      return { success: true, alreadyMigrated: true };
    }
    
    // 4. Generate registration number
    const registrationNumber = await generateRegistrationNumber();
    
    // 5. Map admission data to registration format
    const registrationData = mapAdmissionToRegistration(admissionData, registrationNumber);
    registrationData.originalAdmissionId = applicationId;
    
    // 6. Create student registration
    const registrationRef = await addDoc(collection(db, 'student-registrations'), registrationData);
    
    // 7. Update admission application to mark as migrated
    await updateDoc(doc(db, 'admission-applications', applicationId), {
      migrationStatus: 'completed',
      migratedToRegistrationId: registrationRef.id,
      migrationDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 8. Create user account if needed
    if (admissionData.userId && registrationData.email) {
      try {
        // Update user document with student information
        await setDoc(doc(db, 'users', admissionData.userId), {
          email: registrationData.email,
          name: `${registrationData.surname} ${registrationData.otherNames}`.trim(),
          registrationNumber: registrationNumber,
          programme: registrationData.programme,
          currentLevel: registrationData.currentLevel,
          role: 'student',
          status: 'active',
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ Updated user account: ${admissionData.userId}`);
      } catch (userError) {
        console.warn(`⚠️  Could not update user account: ${userError.message}`);
      }
    }
    
    console.log(`✅ Successfully migrated ${applicationId} → ${registrationNumber}`);
    
    return {
      success: true,
      registrationId: registrationRef.id,
      registrationNumber: registrationNumber,
      studentData: registrationData
    };
    
  } catch (error) {
    console.error(`❌ Migration failed for ${applicationId}:`, error.message);
    
    // Log the failure
    try {
      await updateDoc(doc(db, 'admission-applications', applicationId), {
        migrationStatus: 'failed',
        migrationError: error.message,
        migrationAttemptDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (logError) {
      console.error('Failed to log migration error:', logError);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Migrate all approved applications (batch migration)
async function migrateAllApprovedApplications() {
  console.log('🚀 STARTING BATCH MIGRATION OF APPROVED APPLICATIONS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Find all approved applications
    const approvedQuery = query(
      collection(db, 'admission-applications'),
      where('applicationStatus', '==', 'accepted')
    );
    
    const approvedSnapshot = await getDocs(approvedQuery);
    console.log(`📊 Found ${approvedSnapshot.size} approved applications`);
    
    if (approvedSnapshot.empty) {
      console.log('✅ No approved applications to migrate');
      return { success: true, migratedCount: 0 };
    }
    
    // 2. Migrate each approved application
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    let alreadyMigratedCount = 0;
    
    for (const doc of approvedSnapshot.docs) {
      const result = await migrateApprovedApplication(doc.id);
      results.push({ applicationId: doc.id, ...result });
      
      if (result.success) {
        if (result.alreadyMigrated) {
          alreadyMigratedCount++;
        } else {
          successCount++;
        }
      } else {
        failureCount++;
      }
      
      // Add small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 3. Summary
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⚠️  Already migrated: ${alreadyMigratedCount}`);
    console.log(`   ❌ Failed migrations: ${failureCount}`);
    console.log(`   📊 Total processed: ${results.length}`);
    
    if (failureCount > 0) {
      console.log('\n❌ FAILED MIGRATIONS:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   ${r.applicationId}: ${r.error}`);
      });
    }
    
    if (successCount > 0) {
      console.log('\n✅ SUCCESSFUL MIGRATIONS:');
      results.filter(r => r.success && !r.alreadyMigrated).forEach(r => {
        console.log(`   ${r.applicationId} → ${r.registrationNumber}`);
      });
    }
    
    return {
      success: true,
      migratedCount: successCount,
      alreadyMigratedCount: alreadyMigratedCount,
      failureCount: failureCount,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Batch migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Test migration with a single application
async function testMigration() {
  console.log('🧪 TESTING MIGRATION SYSTEM');
  console.log('=' .repeat(40));
  
  try {
    // Find one approved application for testing
    const testQuery = query(
      collection(db, 'admission-applications'),
      where('applicationStatus', '==', 'accepted')
    );
    
    const testSnapshot = await getDocs(testQuery);
    
    if (testSnapshot.empty) {
      console.log('❌ No approved applications found for testing');
      return;
    }
    
    const testAppId = testSnapshot.docs[0].id;
    console.log(`🧪 Testing with application: ${testAppId}`);
    
    const result = await migrateApprovedApplication(testAppId);
    
    if (result.success) {
      console.log('✅ Test migration successful!');
      console.log(`   Registration Number: ${result.registrationNumber}`);
    } else {
      console.log('❌ Test migration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Main execution
async function main() {
  console.log('🎓 AUTOMATIC STUDENT MIGRATION SYSTEM');
  console.log('=' .repeat(50));
  
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate-all';
  
  switch (command) {
    case 'test':
      await testMigration();
      break;
      
    case 'migrate-all':
      await migrateAllApprovedApplications();
      break;
      
    case 'migrate-single':
      const applicationId = args[1];
      if (!applicationId) {
        console.log('❌ Please provide application ID: node script.js migrate-single <applicationId>');
        return;
      }
      const result = await migrateApprovedApplication(applicationId);
      console.log('Migration result:', result);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node automatic-student-migration.js migrate-all    # Migrate all approved applications');
      console.log('  node automatic-student-migration.js test           # Test migration with one application');
      console.log('  node automatic-student-migration.js migrate-single <id>  # Migrate specific application');
  }
  
  console.log('\n🏁 Migration system completed');
}

// Export functions for use in Cloud Functions
module.exports = {
  migrateApprovedApplication,
  migrateAllApprovedApplications,
  generateRegistrationNumber,
  mapAdmissionToRegistration
};

// Run if called directly
if (require.main === module) {
  main();
}