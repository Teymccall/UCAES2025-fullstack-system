// Script to list all students in the system
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit, addDoc, updateDoc, doc } = require('firebase/firestore');

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

async function listAllStudents() {
  try {
    console.log('👥 Listing all students in the system...');
    
    // 1. Get all student registrations
    console.log('\n1. Student Registrations:');
    const studentsSnapshot = await getDocs(collection(db, 'student-registrations'));
    console.log(`Found ${studentsSnapshot.size} registered students:`);
    
    studentsSnapshot.forEach(doc => {
      const student = doc.data();
      console.log(`- ${student.registrationNumber || student.studentIndexNumber || 'Unknown ID'}`);
      console.log(`  Name: ${student.surname || ''} ${student.otherNames || ''}`);
      console.log(`  Programme: ${student.programme || 'Not specified'}`);
      console.log(`  Level: ${student.currentLevel || 'Not specified'}`);
      console.log(`  Email: ${student.email || 'Not provided'}`);
      console.log('');
    });
    
    // 2. Get all student wallets
    console.log('\n2. Student Wallets:');
    const walletsSnapshot = await getDocs(collection(db, 'student-wallets'));
    console.log(`Found ${walletsSnapshot.size} student wallets:`);
    
    walletsSnapshot.forEach(doc => {
      const wallet = doc.data();
      console.log(`- Student ID: ${wallet.studentId}`);
      console.log(`  Balance: ¢${wallet.balance / 100}`);
      console.log(`  Status: ${wallet.status}`);
      console.log(`  Created: ${wallet.createdAt}`);
      console.log('');
    });
    
    // 3. Get all wallet transactions
    console.log('\n3. Wallet Transactions:');
    const transactionsSnapshot = await getDocs(collection(db, 'wallet-transactions'));
    console.log(`Found ${transactionsSnapshot.size} wallet transactions:`);
    
    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      console.log(`- Student: ${transaction.studentId}`);
      console.log(`  Type: ${transaction.type}`);
      console.log(`  Amount: ¢${transaction.amount / 100}`);
      console.log(`  Status: ${transaction.status}`);
      console.log(`  Description: ${transaction.description}`);
      console.log(`  Date: ${transaction.createdAt}`);
      console.log('');
    });
    
    // 4. Summary
    console.log('\n4. System Summary:');
    console.log(`📊 Total Students Registered: ${studentsSnapshot.size}`);
    console.log(`💰 Students with Wallets: ${walletsSnapshot.size}`);
    console.log(`💳 Total Transactions: ${transactionsSnapshot.size}`);
    
    // 5. Show example login scenarios
    console.log('\n5. Example Student Login Scenarios:');
    console.log('Each student can log in with their unique credentials:');
    console.log('- Student ID/Index Number');
    console.log('- Date of Birth');
    console.log('');
    console.log('After login, each student sees:');
    console.log('- Their personal fee structure');
    console.log('- Their payment history');
    console.log('- Their wallet balance (if they have one)');
    console.log('- Their outstanding balances');
    console.log('');
    console.log('Each student can:');
    console.log('- Make direct fee payments');
    console.log('- Add money to their wallet');
    console.log('- Use wallet funds to pay fees');
    console.log('- View their transaction history');
    
  } catch (error) {
    console.error('❌ Error listing students:', error);
  }
}

// Run the script
listAllStudents().then(() => {
  console.log('\n✅ Student listing completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Student listing failed:', error);
  process.exit(1);
});

