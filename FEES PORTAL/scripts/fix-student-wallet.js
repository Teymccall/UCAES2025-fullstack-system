// Script to fix duplicate wallet transactions for specific student
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy } = require('firebase/firestore');

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

async function fixStudentWallet(studentId) {
  try {
    console.log(`🔍 Analyzing wallet for student: ${studentId}`);

    // 1. Find the student's wallet
    const walletQuery = query(
      collection(db, 'student-wallets'),
      where('studentId', '==', studentId)
    );
    const walletSnapshot = await getDocs(walletQuery);

    if (walletSnapshot.empty) {
      console.log(`❌ No wallet found for student: ${studentId}`);
      return;
    }

    const walletDoc = walletSnapshot.docs[0];
    const wallet = walletDoc.data();
    console.log(`\n📊 Current Wallet Status:`);
    console.log(`Wallet ID: ${walletDoc.id}`);
    console.log(`Current Balance: ¢${wallet.balance / 100}`);
    console.log(`Status: ${wallet.status}`);

    // 2. Get all transactions for this student
    const transactionQuery = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', studentId)
    );
    const transactionSnapshot = await getDocs(transactionQuery);

    console.log(`\n📋 Found ${transactionSnapshot.size} transactions:`);
    
    const transactions = [];
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let duplicateTransactions = [];

    transactionSnapshot.forEach(doc => {
      const transaction = { id: doc.id, ...doc.data() };
      transactions.push(transaction);
      
      console.log(`- ${transaction.type}: ¢${transaction.amount / 100} (${transaction.status})`);
      console.log(`  Reference: ${transaction.reference}`);
      console.log(`  Created: ${transaction.createdAt}`);

      if (transaction.type === 'deposit' && transaction.status === 'completed') {
        totalDeposits += transaction.amount;
      } else if (transaction.type === 'fee_deduction' && transaction.status === 'completed') {
        totalWithdrawals += transaction.amount;
      }
    });

    // 3. Find duplicate transactions
    const seenReferences = new Map();
    transactions.forEach(transaction => {
      const ref = transaction.reference;
      if (seenReferences.has(ref)) {
        if (transaction.type === 'deposit' && transaction.status === 'completed') {
          duplicateTransactions.push(transaction);
          console.log(`\n🚨 Duplicate found: Transaction ${transaction.id} has duplicate reference ${ref}`);
        }
      } else {
        seenReferences.set(ref, transaction);
      }
    });

    console.log(`\n💰 Calculated Totals:`);
    console.log(`Total Deposits: ¢${totalDeposits / 100}`);
    console.log(`Total Withdrawals: ¢${totalWithdrawals / 100}`);
    console.log(`Expected Balance: ¢${(totalDeposits - totalWithdrawals) / 100}`);
    console.log(`Actual Balance: ¢${wallet.balance / 100}`);

    // 4. Fix the balance if there are duplicates
    if (duplicateTransactions.length > 0) {
      console.log(`\n🛠️ Fixing duplicate transactions...`);
      
      let duplicateAmount = 0;
      duplicateTransactions.forEach(t => {
        duplicateAmount += t.amount;
        console.log(`- Removing duplicate: ${t.id} (¢${t.amount / 100})`);
      });

      const correctBalance = totalDeposits - totalWithdrawals - duplicateAmount;
      console.log(`\n✅ Setting correct balance: ¢${correctBalance / 100}`);

      // Update wallet balance
      await updateDoc(doc(db, 'student-wallets', walletDoc.id), {
        balance: correctBalance,
        updatedAt: new Date().toISOString()
      });

      // Remove duplicate transactions
      for (const transaction of duplicateTransactions) {
        await deleteDoc(doc(db, 'wallet-transactions', transaction.id));
        console.log(`✅ Deleted duplicate transaction: ${transaction.id}`);
      }

      console.log(`\n🎉 Wallet fixed successfully!`);
      console.log(`New balance: ¢${correctBalance / 100}`);
    } else {
      console.log(`\n✅ No duplicate transactions found. Wallet appears correct.`);
    }

  } catch (error) {
    console.error('❌ Error fixing student wallet:', error);
  }
}

// Run the fix for the specific student
const studentId = process.argv[2] || 'UCAES20250004';
console.log(`🚀 Starting wallet fix for student: ${studentId}`);
fixStudentWallet(studentId);