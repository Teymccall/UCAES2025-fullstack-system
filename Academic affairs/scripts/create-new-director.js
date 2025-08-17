// Create a new director account
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

async function createNewDirector() {
  try {
    console.log('👤 CREATING NEW DIRECTOR ACCOUNT');
    console.log('=' .repeat(50));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    
    // New director details
    const newDirector = {
      username: 'director2025',  // New username
      email: 'director@ucaes.edu.gh',
      name: 'Academic Director',
      password: 'ucaes2025',  // Simple password
    };
    
    console.log('🔍 Checking if username already exists...');
    const usersRef = collection(db, 'users');
    const existingQuery = query(usersRef, where('username', '==', newDirector.username));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('❌ Username already exists:', newDirector.username);
      console.log('💡 Try a different username or use the existing account');
      return;
    }
    
    console.log('✅ Username available');
    
    // Hash the password
    console.log('🔐 Generating password hash...');
    const hashedPassword = await bcrypt.hash(newDirector.password, 10);
    
    // Verify hash works
    const testVerification = await bcrypt.compare(newDirector.password, hashedPassword);
    console.log('✅ Password hash verified:', testVerification);
    
    // Create the new director user
    const directorData = {
      username: newDirector.username,
      email: newDirector.email,
      name: newDirector.name,
      role: 'director',
      department: 'Academic Affairs',
      permissions: [
        'manage_admissions',
        'view_analytics', 
        'approve_registrations',
        'manage_staff',
        'view_transcripts',
        'manage_courses',
        'approve_grades'
      ],
      status: 'active',
      password: hashedPassword,
      createdAt: new Date(),
      uid: uuidv4()
    };
    
    console.log('💾 Creating director account...');
    const docRef = await addDoc(usersRef, directorData);
    
    console.log('✅ NEW DIRECTOR ACCOUNT CREATED!');
    console.log('=' .repeat(50));
    console.log('📋 Account Details:');
    console.log('   Document ID:', docRef.id);
    console.log('   Username:', newDirector.username);
    console.log('   Password:', newDirector.password);
    console.log('   Email:', newDirector.email);
    console.log('   Name:', newDirector.name);
    console.log('   Role: director');
    console.log('   Status: active');
    
    console.log('\n🎯 LOGIN INSTRUCTIONS:');
    console.log('1. Go to Academic Affairs login page');
    console.log('2. Enter username:', newDirector.username);
    console.log('3. Enter password:', newDirector.password);
    console.log('4. Click Sign In');
    
    console.log('\n🔧 WHAT THIS ACCOUNT CAN DO:');
    console.log('✅ Access director dashboard');
    console.log('✅ Manage student admissions');
    console.log('✅ View and generate transcripts');
    console.log('✅ Approve grade submissions');
    console.log('✅ Manage academic staff');
    console.log('✅ View analytics and reports');
    console.log('✅ Manage courses and programs');
    
    console.log('\n⚠️  SECURITY NOTES:');
    console.log('• Change the password after first login');
    console.log('• This account has full director privileges');
    console.log('• Keep login credentials secure');
    
  } catch (error) {
    console.error('❌ Error creating director:', error);
  }
}

createNewDirector();














