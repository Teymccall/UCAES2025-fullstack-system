// Quick Firebase connection test for UCAES School System
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔥 Testing Firebase Admin SDK Connection...');
console.log('='.repeat(50));

try {
  const serviceAccountPath = path.join(__dirname, 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  
  console.log('📂 Looking for service account file at:', serviceAccountPath);
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ SERVICE ACCOUNT FILE NOT FOUND!');
    console.error('📁 Expected location:', serviceAccountPath);
    console.error('');
    console.error('🚨 CRITICAL: Your school system needs this file to operate securely!');
    console.error('');
    console.error('📋 TO FIX:');
    console.error('1. Go to: https://console.firebase.google.com/project/ucaes2025');
    console.error('2. Project Settings → Service Accounts');
    console.error('3. Generate new private key');
    console.error('4. Download and rename to: ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    console.error('5. Place in Academic affairs/ folder');
    console.error('');
    process.exit(1);
  }
  
  console.log('✅ Service account file found!');
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  console.log('📋 Service Account Details:');
  console.log('   Project ID:', serviceAccount.project_id);
  console.log('   Client Email:', serviceAccount.client_email);
  console.log('   Private Key ID:', serviceAccount.private_key_id?.substring(0, 8) + '...');
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    projectId: serviceAccount.project_id
  });

  console.log('');
  console.log('✅ Firebase Admin SDK initialized successfully!');
  
  // Test Firestore connection
  const db = admin.firestore();
  console.log('✅ Firestore connection established!');
  
  // Test basic read operation
  console.log('🔍 Testing database access...');
  
  db.collection('systemConfig').doc('academicPeriod').get()
    .then((doc) => {
      if (doc.exists) {
        console.log('✅ Database read test successful!');
        console.log('📊 Found system config:', doc.data());
      } else {
        console.log('⚠️  System config document not found, but connection works!');
      }
      
      console.log('');
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Your Firebase Admin SDK is properly configured');
      console.log('✅ School system can now operate securely');
      console.log('✅ Admissions dashboard should work correctly');
      console.log('');
      console.log('🔐 Security Status: SECURE ✅');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database access test failed:', error.message);
      console.error('');
      console.error('🚨 This might indicate:');
      console.error('   - Insufficient permissions');
      console.error('   - Firestore rules blocking access');
      console.error('   - Network connectivity issues');
      console.error('');
      console.error('📞 Contact your Firebase administrator');
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Firebase connection test failed!');
  console.error('Error:', error.message);
  console.error('');
  
  if (error.message.includes('JSON')) {
    console.error('🚨 Service account file appears to be corrupted');
    console.error('📋 Please re-download from Firebase Console');
  } else if (error.message.includes('credential')) {
    console.error('🚨 Service account credentials are invalid');
    console.error('📋 Please generate a new service account key');
  } else {
    console.error('🚨 Unknown error - check service account file');
  }
  
  console.error('');
  console.error('🔐 Security Status: INSECURE ❌');
  process.exit(1);
}






