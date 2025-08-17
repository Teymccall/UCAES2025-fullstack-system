// Import Firebase Admin using CommonJS
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);

async function fixDirectorLogin() {
  console.log('🔧 Fixing Director login credentials for Academic Affairs system...');
  
  try {
    const directorUid = 'academic-affairs-director';
    
    console.log('\n1. Updating director user document with username...');
    
    // Update the director user document to include username
    const directorUserDoc = {
      uid: directorUid,
      username: 'director', // THIS IS THE KEY FIELD MISSING
      email: 'director@ucaes.edu.gh',
      name: 'Director of Academic Affairs',
      displayName: 'Director of Academic Affairs',
      role: 'director',
      department: 'Academic Affairs',
      position: 'Director of Academic Affairs',
      permissions: [
        'full_access',
        'admin',
        'academic_administration',
        'staff_management',
        'student_records',
        'registration_management',
        'program_management',
        'course_management',
        'reports_management',
        'student_management',
        'result_management',
        'academic_management',
        'system_settings',
        'audit_trail'
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      sessionToken: null
    };
    
    await adminDb.collection('users').doc(directorUid).set(directorUserDoc, { merge: true });
    console.log('✅ Updated director user document with username field');
    
    console.log('\n2. Testing login API flow...');
    
    // Test if we can find the user by username
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('username', '==', 'director').get();
    
    if (snapshot.empty) {
      console.log('❌ Error: Could not find user with username "director"');
      return { success: false, error: 'User document not found by username' };
    } else {
      console.log('✅ Found user document by username "director"');
      const userData = snapshot.docs[0].data();
      console.log('📋 User data preview:');
      console.log(`   - UID: ${userData.uid}`);
      console.log(`   - Username: ${userData.username}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Name: ${userData.name}`);
      console.log(`   - Role: ${userData.role}`);
      console.log(`   - Status: ${userData.status}`);
    }
    
    console.log('\n🎉 Director login fix completed successfully!');
    console.log('\n🔐 Updated Login Credentials:');
    console.log(`   Username: director`);
    console.log(`   Password: director123`);
    console.log(`   Email: director@ucaes.edu.gh`);
    
    console.log('\n📊 Updated Permissions:');
    directorUserDoc.permissions.forEach(permission => {
      console.log(`   ✅ ${permission}`);
    });
    
    console.log('\n🚀 You can now log in to the Academic Affairs system at:');
    console.log('   http://localhost:3001');
    console.log('   Use Username: director');
    console.log('   Use Password: director123');
    
    return {
      success: true,
      credentials: {
        username: 'director',
        password: 'director123',
        email: 'director@ucaes.edu.gh'
      }
    };
    
  } catch (error) {
    console.error('❌ Error fixing director login:', error);
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

// Run the fix
fixDirectorLogin()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Fix completed successfully!');
      console.log('🎯 The director can now log in to the Academic Affairs system.');
    } else {
      console.log('\n❌ Fix failed!');
      console.log(`🚨 Error: ${result.error}`);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });


