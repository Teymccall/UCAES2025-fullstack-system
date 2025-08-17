// Monitoring script to detect duplicate transactions
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit, updateDoc, doc, deleteDoc } = require('firebase/firestore');

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

async function monitorDuplicates() {
  try {
    console.log('🔍 Monitoring for duplicate transactions...');
    console.log('Timestamp:', new Date().toISOString());
    
    // Get all transactions
    const transactionsSnapshot = await getDocs(collection(db, 'wallet-transactions'));
    
    if (transactionsSnapshot.size === 0) {
      console.log('✅ No transactions found - system is clean');
      return;
    }
    
    // Group transactions by reference
    const transactionsByReference = {};
    
    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      const reference = transaction.reference;
      
      if (!transactionsByReference[reference]) {
        transactionsByReference[reference] = [];
      }
      
      transactionsByReference[reference].push({
        id: doc.id,
        ...transaction
      });
    });
    
    // Find duplicates
    const duplicates = Object.entries(transactionsByReference)
      .filter(([reference, transactions]) => transactions.length > 1)
      .map(([reference, transactions]) => ({ reference, transactions }));
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate transactions detected');
    } else {
      console.log(`❌ CRITICAL: Found ${duplicates.length} duplicate references!`);
      
      duplicates.forEach(({ reference, transactions }, index) => {
        console.log(`\n${index + 1}. Duplicate Reference: ${reference}`);
        console.log(`   Found ${transactions.length} transactions:`);
        
        transactions.forEach((transaction, tIndex) => {
          console.log(`   ${tIndex + 1}. ID: ${transaction.id}`);
          console.log(`      Student: ${transaction.studentId}`);
          console.log(`      Amount: ¢${transaction.amount / 100}`);
          console.log(`      Status: ${transaction.status}`);
          console.log(`      Created: ${transaction.createdAt}`);
          console.log(`      Type: ${transaction.type}`);
        });
      });
      
      // Alert: This should not happen after the fix
      console.log('\n🚨 ALERT: Duplicates detected after fix implementation!');
      console.log('This indicates the fix may not be working properly.');
      console.log('Please investigate immediately.');
    }
    
    // Check for recent transactions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTransactions = transactionsSnapshot.docs.filter(doc => {
      const transaction = doc.data();
      return new Date(transaction.createdAt) > oneDayAgo;
    });
    
    console.log(`\n📊 Recent Activity (last 24 hours):`);
    console.log(`   Total transactions: ${recentTransactions.length}`);
    
    if (recentTransactions.length > 0) {
      console.log('   Recent transactions:');
      recentTransactions.forEach((doc, index) => {
        const transaction = doc.data();
        console.log(`   ${index + 1}. ${transaction.studentId} - ¢${transaction.amount / 100} - ${transaction.createdAt}`);
      });
    }
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Total transactions in system: ${transactionsSnapshot.size}`);
    console.log(`   Unique references: ${Object.keys(transactionsByReference).length}`);
    console.log(`   Duplicate references: ${duplicates.length}`);
    console.log(`   System status: ${duplicates.length === 0 ? '✅ HEALTHY' : '❌ CRITICAL ISSUE'}`);
    
  } catch (error) {
    console.error('❌ Error monitoring duplicates:', error);
  }
}

// Run the monitoring
monitorDuplicates().then(() => {
  console.log('\n✅ Monitoring completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Monitoring failed:', error);
  process.exit(1);
});

