// Cloud Function for Automatic Student Migration
// This should be deployed as a Firebase Cloud Function

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Generate registration number
async function generateRegistrationNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `UCAES${currentYear}`;
  
  try {
    // Get the highest existing registration number for this year
    const registrationsQuery = db.collection('student-registrations')
      .where('registrationNumber', '>=', prefix)
      .where('registrationNumber', '<=', prefix + '9999')
      .orderBy('registrationNumber', 'desc')
      .limit(1);
    
    const snapshot = await registrationsQuery.get();
    let maxNumber = 0;
    
    if (!snapshot.empty) {
      const regNumber = snapshot.docs[0].data().registrationNumber;
      if (regNumber && regNumber.startsWith(prefix)) {
        const number = parseInt(regNumber.substring(prefix.length));
        if (!isNaN(number)) {
          maxNumber = number;
        }
      }
    }
    
    const nextNumber = maxNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    
  } catch (error) {
    console.error('Error generating registration number:', error);
    // Fallback to timestamp-based number
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

// Map admission data to registration format
function mapAdmissionToRegistration(admissionData, registrationNumber, applicationId) {
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
    registrationDate: admin.firestore.FieldValue.serverTimestamp(),
    
    // Migration tracking
    transferredFromAdmission: true,
    originalApplicationId: applicationId,
    originalAdmissionId: applicationId,
    migrationDate: admin.firestore.FieldValue.serverTimestamp(),
    
    // Metadata
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    sourceCollection: 'admission-applications'
  };
}

// Send notification email (placeholder - implement with your email service)
async function sendMigrationNotification(studentData) {
  try {
    // TODO: Implement email notification
    // This could use SendGrid, Firebase Extensions Email, or another service
    console.log(`📧 Should send welcome email to: ${studentData.email}`);
    console.log(`   Student: ${studentData.surname} ${studentData.otherNames}`);
    console.log(`   Registration Number: ${studentData.registrationNumber}`);
    
    // Example email content:
    // Subject: Welcome to UCAES - Your Registration is Complete
    // Body: Dear [Name], congratulations! Your admission has been approved and you've been registered as student [RegNumber]...
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Cloud Function: Triggered when admission application is updated
exports.onAdmissionStatusChange = functions.firestore
  .document('admission-applications/{applicationId}')
  .onUpdate(async (change, context) => {
    const applicationId = context.params.applicationId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    console.log(`🔔 Admission status change detected for: ${applicationId}`);
    
    try {
      // Check if status changed to accepted
      const beforeStatus = beforeData.applicationStatus || beforeData.status || '';
      const afterStatus = afterData.applicationStatus || afterData.status || '';
      
      const wasApproved = beforeStatus.toLowerCase().includes('accept') || beforeStatus.toLowerCase().includes('approv');
      const isNowApproved = afterStatus.toLowerCase().includes('accept') || afterStatus.toLowerCase().includes('approv');
      
      // Only proceed if newly approved
      if (!wasApproved && isNowApproved) {
        console.log(`✅ Application ${applicationId} newly approved, initiating migration...`);
        
        // Check if already migrated
        const existingQuery = await db.collection('student-registrations')
          .where('originalApplicationId', '==', applicationId)
          .limit(1)
          .get();
        
        if (!existingQuery.empty) {
          console.log(`⚠️  Application ${applicationId} already migrated`);
          return null;
        }
        
        // Generate registration number
        const registrationNumber = await generateRegistrationNumber();
        
        // Map admission data to registration format
        const registrationData = mapAdmissionToRegistration(afterData, registrationNumber, applicationId);
        
        // Create student registration
        const registrationRef = await db.collection('student-registrations').add(registrationData);
        
        // Update admission application to mark as migrated
        await change.after.ref.update({
          migrationStatus: 'completed',
          migratedToRegistrationId: registrationRef.id,
          migrationDate: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user account if exists
        if (afterData.userId && registrationData.email) {
          try {
            await db.collection('users').doc(afterData.userId).set({
              email: registrationData.email,
              name: `${registrationData.surname} ${registrationData.otherNames}`.trim(),
              registrationNumber: registrationNumber,
              programme: registrationData.programme,
              currentLevel: registrationData.currentLevel,
              role: 'student',
              status: 'active',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log(`✅ Updated user account: ${afterData.userId}`);
          } catch (userError) {
            console.warn(`⚠️  Could not update user account: ${userError.message}`);
          }
        }
        
        // Send notification email
        await sendMigrationNotification(registrationData);
        
        // Log successful migration
        await db.collection('migration-logs').add({
          applicationId: applicationId,
          registrationId: registrationRef.id,
          registrationNumber: registrationNumber,
          status: 'success',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          studentEmail: registrationData.email,
          studentName: `${registrationData.surname} ${registrationData.otherNames}`.trim()
        });
        
        console.log(`✅ Successfully migrated ${applicationId} → ${registrationNumber}`);
        
        return {
          success: true,
          registrationNumber: registrationNumber,
          registrationId: registrationRef.id
        };
        
      } else {
        console.log(`ℹ️  Status change not relevant for migration: ${beforeStatus} → ${afterStatus}`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ Migration failed for ${applicationId}:`, error);
      
      // Log the failure
      try {
        await change.after.ref.update({
          migrationStatus: 'failed',
          migrationError: error.message,
          migrationAttemptDate: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Log failed migration
        await db.collection('migration-logs').add({
          applicationId: applicationId,
          status: 'failed',
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
      } catch (logError) {
        console.error('Failed to log migration error:', logError);
      }
      
      throw error;
    }
  });

// Cloud Function: Manual trigger for batch migration
exports.batchMigrateApprovedStudents = functions.https.onCall(async (data, context) => {
  // Check if user is authorized (admin or director)
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can trigger batch migration');
  }
  
  console.log('🚀 Manual batch migration triggered by:', context.auth.uid);
  
  try {
    // Find all approved applications that haven't been migrated
    const approvedQuery = await db.collection('admission-applications')
      .where('applicationStatus', '==', 'accepted')
      .where('migrationStatus', '==', null)
      .get();
    
    console.log(`📊 Found ${approvedQuery.size} approved applications to migrate`);
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    // Process each application
    for (const doc of approvedQuery.docs) {
      try {
        const applicationId = doc.id;
        const applicationData = doc.data();
        
        // Generate registration number
        const registrationNumber = await generateRegistrationNumber();
        
        // Map data
        const registrationData = mapAdmissionToRegistration(applicationData, registrationNumber, applicationId);
        
        // Create registration
        const registrationRef = await db.collection('student-registrations').add(registrationData);
        
        // Update application
        await doc.ref.update({
          migrationStatus: 'completed',
          migratedToRegistrationId: registrationRef.id,
          migrationDate: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user account if exists
        if (applicationData.userId) {
          await db.collection('users').doc(applicationData.userId).set({
            email: registrationData.email,
            name: `${registrationData.surname} ${registrationData.otherNames}`.trim(),
            registrationNumber: registrationNumber,
            programme: registrationData.programme,
            currentLevel: registrationData.currentLevel,
            role: 'student',
            status: 'active',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        results.push({
          applicationId: applicationId,
          registrationNumber: registrationNumber,
          success: true
        });
        
        successCount++;
        console.log(`✅ Migrated ${applicationId} → ${registrationNumber}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${doc.id}:`, error);
        results.push({
          applicationId: doc.id,
          success: false,
          error: error.message
        });
        failureCount++;
      }
    }
    
    console.log(`📊 Batch migration completed: ${successCount} success, ${failureCount} failures`);
    
    return {
      success: true,
      totalProcessed: approvedQuery.size,
      successCount: successCount,
      failureCount: failureCount,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Batch migration failed:', error);
    throw new functions.https.HttpsError('internal', 'Batch migration failed: ' + error.message);
  }
});

// Cloud Function: Get migration statistics
exports.getMigrationStats = functions.https.onCall(async (data, context) => {
  try {
    const [admissionSnapshot, registrationSnapshot, migrationLogsSnapshot] = await Promise.all([
      db.collection('admission-applications').get(),
      db.collection('student-registrations').get(),
      db.collection('migration-logs').get()
    ]);
    
    // Count statuses
    const admissionStats = {};
    admissionSnapshot.forEach(doc => {
      const status = doc.data().applicationStatus || 'unknown';
      admissionStats[status] = (admissionStats[status] || 0) + 1;
    });
    
    // Count migrations
    const migratedCount = registrationSnapshot.docs.filter(doc => 
      doc.data().transferredFromAdmission === true
    ).length;
    
    return {
      totalApplications: admissionSnapshot.size,
      totalRegistrations: registrationSnapshot.size,
      migratedStudents: migratedCount,
      admissionStatusBreakdown: admissionStats,
      migrationLogs: migrationLogsSnapshot.size
    };
    
  } catch (error) {
    console.error('Error getting migration stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get migration statistics');
  }
});