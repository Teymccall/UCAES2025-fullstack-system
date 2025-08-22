const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function investigateDuplicates() {
  try {
    console.log('🔍 Investigating duplicate transactions in Firebase...');
    console.log('Timestamp:', new Date().toISOString());
    
    // Get all wallet transactions
    const transactionsSnapshot = await getDocs(collection(db, 'wallet-transactions'));
    
    if (transactionsSnapshot.size === 0) {
      console.log('✅ No transactions found');
      return;
    }
    
    console.log(`📊 Total transactions found: ${transactionsSnapshot.size}`);
    
    // Group transactions by reference
    const transactionsByReference = {};
    const transactionsByStudent = {};
    
    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      const reference = transaction.reference;
      const studentId = transaction.studentId;
      
      // Group by reference
      if (!transactionsByReference[reference]) {
        transactionsByReference[reference] = [];
      }
      transactionsByReference[reference].push({
        id: doc.id,
        ...transaction
      });
      
      // Group by student
      if (!transactionsByStudent[studentId]) {
        transactionsByStudent[studentId] = [];
      }
      transactionsByStudent[studentId].push({
        id: doc.id,
        ...transaction
      });
    });
    
    // Find duplicate references
    const duplicateReferences = Object.entries(transactionsByReference)
      .filter(([reference, transactions]) => transactions.length > 1)
      .map(([reference, transactions]) => ({ reference, transactions }));
    
    console.log(`\n🚨 DUPLICATE REFERENCES FOUND: ${duplicateReferences.length}`);
    
    if (duplicateReferences.length > 0) {
      duplicateReferences.forEach(({ reference, transactions }) => {
        console.log(`\n📋 Reference: ${reference}`);
        console.log(`   Count: ${transactions.length}`);
        console.log(`   Type: ${transactions[0].type}`);
        console.log(`   Amount: ¢${transactions[0].amount / 100}`);
        
        transactions.forEach((transaction, index) => {
          console.log(`   ${index + 1}. ID: ${transaction.id}`);
          console.log(`      Student: ${transaction.studentId}`);
          console.log(`      Created: ${transaction.createdAt}`);
          console.log(`      Status: ${transaction.status}`);
          console.log(`      Payment Method: ${transaction.paymentMethod}`);
        });
      });
    }
    
    // Find duplicate transactions for specific students
    console.log(`\n👥 ANALYZING STUDENT TRANSACTIONS:`);
    
    Object.entries(transactionsByStudent).forEach(([studentId, transactions]) => {
      const deposits = transactions.filter(t => t.type === 'deposit');
      const feeDeductions = transactions.filter(t => t.type === 'fee_deduction');
      
      if (deposits.length > 1) {
        console.log(`\n💰 Student ${studentId} has ${deposits.length} deposits:`);
        deposits.forEach((deposit, index) => {
          console.log(`   ${index + 1}. Amount: ¢${deposit.amount / 100}, Reference: ${deposit.reference}, Date: ${deposit.createdAt}`);
        });
      }
      
      if (feeDeductions.length > 1) {
        console.log(`\n💸 Student ${studentId} has ${feeDeductions.length} fee deductions:`);
        feeDeductions.forEach((deduction, index) => {
          console.log(`   ${index + 1}. Amount: ¢${deduction.amount / 100}, Reference: ${deduction.reference}, Date: ${deduction.createdAt}`);
        });
      }
    });
    
    // Check for transactions with same amount and timestamp
    console.log(`\n⏰ CHECKING FOR TIMESTAMP DUPLICATES:`);
    
    const transactionsByAmountAndTime = {};
    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      const key = `${transaction.amount}-${transaction.createdAt}`;
      
      if (!transactionsByAmountAndTime[key]) {
        transactionsByAmountAndTime[key] = [];
      }
      transactionsByAmountAndTime[key].push({
        id: doc.id,
        ...transaction
      });
    });
    
    const timeDuplicates = Object.entries(transactionsByAmountAndTime)
      .filter(([key, transactions]) => transactions.length > 1)
      .map(([key, transactions]) => ({ key, transactions }));
    
    if (timeDuplicates.length > 0) {
      console.log(`🚨 Found ${timeDuplicates.length} groups of transactions with same amount and timestamp`);
      timeDuplicates.forEach(({ key, transactions }) => {
        const [amount, timestamp] = key.split('-');
        console.log(`\n   Amount: ¢${amount / 100}, Timestamp: ${timestamp}`);
        transactions.forEach((transaction, index) => {
          console.log(`   ${index + 1}. ID: ${transaction.id}, Reference: ${transaction.reference}, Student: ${transaction.studentId}`);
        });
      });
    }
    
    // Summary
    console.log(`\n📊 INVESTIGATION SUMMARY:`);
    console.log(`Total Transactions: ${transactionsSnapshot.size}`);
    console.log(`Duplicate References: ${duplicateReferences.length}`);
    console.log(`Time-based Duplicates: ${timeDuplicates.length}`);
    
    if (duplicateReferences.length > 0 || timeDuplicates.length > 0) {
      console.log(`\n🚨 ISSUES DETECTED:`);
      console.log(`1. Check if webhook is still processing wallet deposits`);
      console.log(`2. Verify callback page is not being called multiple times`);
      console.log(`3. Check if reference field is being generated correctly`);
      console.log(`4. Verify duplicate prevention logic is working`);
    } else {
      console.log(`\n✅ No obvious duplicates found in this investigation`);
    }
    
  } catch (error) {
    console.error('❌ Error investigating duplicates:', error);
  }
}

// Run the investigation
investigateDuplicates()
  .then(() => {
    console.log('\n🔍 Investigation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Investigation failed:', error);
    process.exit(1);
  });
