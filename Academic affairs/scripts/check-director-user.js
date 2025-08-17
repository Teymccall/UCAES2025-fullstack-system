// Check if director user exists and fix authentication
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } = require('firebase/firestore');
const bcrypt = require('bcryptjs');

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

async function checkDirectorUser() {
  try {
    console.log('🔍 CHECKING DIRECTOR USER AUTHENTICATION');
    console.log('=' .repeat(50));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Check for director user
    const username = 'teymccall';
    console.log(`\n🔍 Looking for user: ${username}`);
    
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ Director user not found, creating...');
      
      // Hash the password
      const password = 'password123'; // Default password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create director user
      const newUser = {
        username: 'teymccall',
        email: 'teymccall@gmail.com',
        name: 'Mr.Mccall',
        role: 'director',
        department: 'Academic Affairs',
        permissions: ['manage_admissions', 'view_analytics', 'approve_registrations', 'manage_staff'],
        status: 'active',
        password: hashedPassword,
        createdAt: new Date(),
        uid: '18qwWLSM2QQH374aByGBH8nv8vg1'
      };
      
      const docRef = await addDoc(usersRef, newUser);
      console.log('✅ Director user created with ID:', docRef.id);
      console.log('   Username: teymccall');
      console.log('   Password: password123');
      console.log('   Role: director');
      
    } else {
      const userData = snapshot.docs[0].data();
      const userId = snapshot.docs[0].id;
      
      console.log('✅ Director user found:');
      console.log('   ID:', userId);
      console.log('   Username:', userData.username);
      console.log('   Email:', userData.email);
      console.log('   Name:', userData.name);
      console.log('   Role:', userData.role);
      console.log('   Status:', userData.status);
      console.log('   Has Password:', !!userData.password);
      
      // If no password, add one
      if (!userData.password) {
        console.log('\n🔧 Adding password to existing user...');
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          password: hashedPassword,
          updatedAt: new Date()
        });
        
        console.log('✅ Password added to user');
        console.log('   Password: password123');
      }
    }
    
    console.log('\n🎯 AUTHENTICATION SETUP COMPLETE');
    console.log('You can now login with:');
    console.log('Username: teymccall');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDirectorUser();














