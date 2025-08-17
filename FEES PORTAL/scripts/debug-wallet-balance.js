// Debug script to check wallet balance update issue
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

async function debugWalletBalance() {
  try {
    console.log('🔍 Starting wallet balance debug...');
    
    const studentId = 'UCAES20250008';
    
    // 1. Check wallet details
    console.log(`\n1. Checking wallet for student: ${studentId}`);
    const walletQuery = query(
      collection(db, 'student-wallets'),
      where('studentId', '==', studentId),
      limit(1)
    );
    const walletSnapshot = await getDocs(walletQuery);
    
    if (!walletSnapshot.empty) {
      const walletDoc = walletSnapshot.docs[0];
      const wallet = walletDoc.data();
      console.log(`Wallet ID: ${walletDoc.id}`);
      console.log(`Current Balance: ¢${wallet.balance / 100}`);
      console.log(`Currency: ${wallet.currency}`);
      console.log(`Status: ${wallet.status}`);
      console.log(`Created: ${wallet.createdAt}`);
      console.log(`Updated: ${wallet.updatedAt}`);
      console.log(`Last Transaction: ${wallet.lastTransactionDate || 'None'}`);
      
      // 2. Check all transactions for this student
      console.log(`\n2. Checking all transactions for student: ${studentId}`);
      const transactionQuery = query(
        collection(db, 'wallet-transactions'),
        where('studentId', '==', studentId)
      );
      const transactionSnapshot = await getDocs(transactionQuery);
      
      console.log(`Found ${transactionSnapshot.size} transactions:`);
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let totalPayments = 0;
      
      transactionSnapshot.forEach(doc => {
        const transaction = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Type: ${transaction.type}`);
        console.log(`  Amount: ¢${transaction.amount / 100}`);
        console.log(`  Status: ${transaction.status}`);
        console.log(`  Description: ${transaction.description}`);
        console.log(`  Created: ${transaction.createdAt}`);
        console.log(`  Reference: ${transaction.reference}`);
        console.log('');
        
        if (transaction.status === 'completed') {
          if (transaction.type === 'deposit') {
            totalDeposits += transaction.amount;
          } else if (transaction.type === 'withdrawal') {
            totalWithdrawals += transaction.amount;
          } else if (transaction.type === 'payment' || transaction.type === 'fee_deduction') {
            totalPayments += transaction.amount;
          }
        }
      });
      
      console.log(`\n3. Transaction Summary:`);
      console.log(`Total Deposits: ¢${totalDeposits / 100}`);
      console.log(`Total Withdrawals: ¢${totalWithdrawals / 100}`);
      console.log(`Total Payments: ¢${totalPayments / 100}`);
      console.log(`Expected Balance: ¢${(totalDeposits - totalWithdrawals - totalPayments) / 100}`);
      console.log(`Actual Balance: ¢${wallet.balance / 100}`);
      
      // 4. Check if there's a balance mismatch
      const expectedBalance = totalDeposits - totalWithdrawals - totalPayments;
      if (wallet.balance !== expectedBalance) {
        console.log(`\n❌ BALANCE MISMATCH DETECTED!`);
        console.log(`Expected: ¢${expectedBalance / 100}`);
        console.log(`Actual: ¢${wallet.balance / 100}`);
        console.log(`Difference: ¢${(expectedBalance - wallet.balance) / 100}`);
        
        // 5. Try to fix the balance
        console.log(`\n4. Attempting to fix wallet balance...`);
        try {
          await updateDoc(doc(db, 'student-wallets', walletDoc.id), {
            balance: expectedBalance,
            updatedAt: new Date().toISOString(),
            lastTransactionDate: new Date().toISOString()
          });
          console.log(`✅ Wallet balance updated to ¢${expectedBalance / 100}`);
        } catch (error) {
          console.error(`❌ Failed to update wallet balance:`, error);
        }
      } else {
        console.log(`\n✅ Balance is correct!`);
      }
      
    } else {
      console.log('No wallet found for this student');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
debugWalletBalance().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});

