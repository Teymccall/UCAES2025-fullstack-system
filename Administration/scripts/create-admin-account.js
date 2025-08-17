// Create admin account for Administration system
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

async function createAdminAccount() {
  try {
    console.log('👤 CREATING ADMIN ACCOUNT FOR ADMINISTRATION SYSTEM');
    console.log('=' .repeat(60));
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    // Admin account details
    const adminEmail = 'admin@ucaes.edu.gh';
    const adminPassword = 'admin2025';
    
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔐 Admin Password:', adminPassword);
    
    console.log('\n🔍 Checking if admin account exists...');
    
    try {
      // Try to sign in first to check if account exists
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Admin account already exists and password is correct!');
      console.log('\n🎯 LOGIN CREDENTIALS:');
      console.log('   Email: admin@ucaes.edu.gh');
      console.log('   Password: admin2025');
      console.log('\nYou can now login to the Administration system!');
      return;
    } catch (signInError) {
      console.log('ℹ️  Account doesn\'t exist or password is different, creating new account...');
    }
    
    console.log('\n🔐 Creating new admin account...');
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('=' .repeat(50));
    console.log('📋 Account Details:');
    console.log('   User ID:', userCredential.user.uid);
    console.log('   Email:', userCredential.user.email);
    console.log('   Email Verified:', userCredential.user.emailVerified);
    
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('   Email: admin@ucaes.edu.gh');
    console.log('   Password: admin2025');
    
    console.log('\n🔧 WHAT TO DO NEXT:');
    console.log('1. Go to Administration login page');
    console.log('2. Enter email: admin@ucaes.edu.gh');
    console.log('3. Enter password: admin2025');
    console.log('4. Click Sign In');
    
    console.log('\n⚠️  SECURITY NOTES:');
    console.log('• This account has admin privileges');
    console.log('• Change the password after first login');
    console.log('• Keep login credentials secure');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 Account already exists. Try logging in with:');
      console.log('   Email: admin@ucaes.edu.gh');
      console.log('   Password: admin2025');
    }
  }
}

createAdminAccount();














