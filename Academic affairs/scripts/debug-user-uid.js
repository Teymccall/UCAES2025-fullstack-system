// Debug the UID mismatch issue
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

async function debugUserUID() {
  try {
    console.log('🔍 DEBUGGING UID MISMATCH');
    console.log('=' .repeat(40));
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    const username = 'mccall123';
    
    console.log('🔍 Looking up user:', username);
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(userQuery);
    
    if (snapshot.empty) {
      console.log('❌ User not found:', username);
      return;
    }
    
    const userData = snapshot.docs[0].data();
    const docId = snapshot.docs[0].id;
    
    console.log('📊 UID COMPARISON:');
    console.log('   Document ID (Firestore):', docId);
    console.log('   User.uid (stored in doc):', userData.uid);
    console.log('   Username:', userData.username);
    console.log('   Status:', userData.status);
    
    console.log('\n🎯 ANALYSIS:');
    if (docId === userData.uid) {
      console.log('✅ Document ID matches stored UID');
    } else {
      console.log('❌ MISMATCH: Document ID does NOT match stored UID');
      console.log('   This is why the real-time listener fails!');
      console.log('   The auth context tries to listen to doc:', userData.uid);
      console.log('   But the actual document ID is:', docId);
    }
    
    console.log('\n🔧 SOLUTION:');
    console.log('The auth context should use the document ID, not the stored uid');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugUserUID();














