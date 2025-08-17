// Debug script to check wallet deposit issues
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

async function debugWalletDeposit() {
  try {
    console.log('🔍 Starting wallet deposit debug...');
    
    // 1. Check if student wallets exist
    console.log('\n1. Checking student wallets...');
    const walletsSnapshot = await getDocs(collection(db, 'student-wallets'));
    console.log(`Found ${walletsSnapshot.size} student wallets`);
    
    walletsSnapshot.forEach(doc => {
      const wallet = doc.data();
      console.log(`- Student ID: ${wallet.studentId}, Balance: ¢${wallet.balance / 100}`);
    });
    
    // 2. Check wallet transactions
    console.log('\n2. Checking wallet transactions...');
    const transactionsSnapshot = await getDocs(collection(db, 'wallet-transactions'));
    console.log(`Found ${transactionsSnapshot.size} wallet transactions`);
    
    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      console.log(`- ${transaction.type}: ¢${transaction.amount / 100} for ${transaction.studentId} (${transaction.status})`);
    });
    
    // 3. Check for specific student (replace with actual student ID)
    const testStudentId = 'UCAES2025001'; // Replace with actual student ID
    console.log(`\n3. Checking specific student: ${testStudentId}`);
    
    // Check wallet
    const walletQuery = query(
      collection(db, 'student-wallets'),
      where('studentId', '==', testStudentId),
      limit(1)
    );
    const walletSnapshot = await getDocs(walletQuery);
    
    if (!walletSnapshot.empty) {
      const wallet = walletSnapshot.docs[0].data();
      console.log(`Wallet found: Balance = ¢${wallet.balance / 100}`);
    } else {
      console.log('No wallet found for this student');
    }
    
    // Check transactions
    const transactionQuery = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', testStudentId)
    );
    const studentTransactionsSnapshot = await getDocs(transactionQuery);
    console.log(`Found ${studentTransactionsSnapshot.size} transactions for this student`);
    
    studentTransactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      console.log(`- ${transaction.type}: ¢${transaction.amount / 100} (${transaction.status}) - ${transaction.description}`);
    });
    
    // 4. Check Paystack payments
    console.log('\n4. Checking Paystack payments...');
    const paystackQuery = query(
      collection(db, 'wallet-transactions'),
      where('paymentMethod', '==', 'paystack')
    );
    const paystackSnapshot = await getDocs(paystackQuery);
    console.log(`Found ${paystackSnapshot.size} Paystack transactions`);
    
    paystackSnapshot.forEach(doc => {
      const transaction = doc.data();
      console.log(`- Paystack: ¢${transaction.amount / 100} for ${transaction.studentId} (${transaction.status})`);
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
debugWalletDeposit().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});

