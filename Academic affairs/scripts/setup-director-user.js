// Import Firebase Admin using CommonJS since the script runs in CommonJS context
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

async function setupDirectorUser() {
  console.log('🔧 Setting up Director user for Academic Affairs system...');
  
  try {
    // Director account details
    const directorData = {
      email: 'director@ucaes.edu.gh',
      password: 'director123',
      displayName: 'Director of Academic Affairs',
      uid: 'academic-affairs-director'
    };
    
    console.log('\n1. Creating Firebase Auth user...');
    
    let authUser;
    try {
      // Try to get existing user first
      authUser = await adminAuth.getUser(directorData.uid);
      console.log('✅ Director auth user already exists:', authUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        authUser = await adminAuth.createUser({
          uid: directorData.uid,
          email: directorData.email,
          password: directorData.password,
          displayName: directorData.displayName,
          emailVerified: true
        });
        console.log('✅ Created new director auth user:', authUser.uid);
      } else {
        throw error;
      }
    }
    
    console.log('\n2. Creating/updating Firestore user document...');
    
    const userDoc = {
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
      role: 'director',
      department: 'Academic Affairs',
      permissions: [
        'admin',
        'academic_administration',
        'staff_management',
        'student_records',
        'registration_management',
        'program_management',
        'course_management',
        'reports_management'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true
    };
    
    await adminDb.collection('users').doc(authUser.uid).set(userDoc, { merge: true });
    console.log('✅ Created/updated director user document in Firestore');
    
    console.log('\n3. Creating academic staff record...');
    
    const staffDoc = {
      uid: authUser.uid,
      email: authUser.email,
      firstName: 'Director',
      lastName: 'Academic Affairs',
      displayName: authUser.displayName,
      position: 'Director of Academic Affairs',
      department: 'Academic Affairs',
      role: 'director',
      permissions: [
        'admin',
        'academic_administration',
        'staff_management',
        'student_records',
        'registration_management',
        'program_management',
        'course_management',
        'reports_management'
      ],
      contactInfo: {
        email: authUser.email,
        phone: '+233-XX-XXX-XXXX',
        office: 'Administration Block, Room 101'
      },
      employeeId: 'DIR-001',
      dateOfJoining: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await adminDb.collection('academic-staff').doc(authUser.uid).set(staffDoc, { merge: true });
    console.log('✅ Created/updated academic staff record');
    
    console.log('\n4. Testing database access...');
    
    // Test reading admission-applications collection
    const applicationsSnapshot = await adminDb.collection('admission-applications').limit(1).get();
    console.log(`✅ Successfully accessed admission-applications collection. Found ${applicationsSnapshot.docs.length} documents.`);
    
    console.log('\n🎉 Director user setup completed successfully!');
    console.log('\n📋 Director Login Credentials:');
    console.log(`   Email: ${directorData.email}`);
    console.log(`   Password: ${directorData.password}`);
    console.log(`   UID: ${authUser.uid}`);
    console.log('\n🔒 Security Note: Change the password after first login in a production environment.');
    
    console.log('\n📊 Permissions granted:');
    userDoc.permissions.forEach(permission => {
      console.log(`   ✅ ${permission}`);
    });
    
    return {
      success: true,
      user: authUser,
      credentials: {
        email: directorData.email,
        password: directorData.password,
        uid: authUser.uid
      }
    };
    
  } catch (error) {
    console.error('❌ Error setting up director user:', error);
    console.log('\n💡 Error details:');
    console.log(`   Code: ${error.code}`);
    console.log(`   Message: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Run the setup
setupDirectorUser()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Setup completed successfully!');
      console.log('🚀 The director can now log in to the Academic Affairs system.');
    } else {
      console.log('\n❌ Setup failed!');
      console.log(`🚨 Error: ${result.error}`);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
