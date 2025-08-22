// Script to check if student JUDITH STLYES has paid fees
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase configuration (using the same config from the fees portal)
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

async function checkStudentPayments() {
  try {
    const studentId = 'iJ5wJl9oW6rbMVHMZJzP';
    const registrationNumber = 'UCAES20250022';
    
    console.log(`🔍 Checking payments for student: JUDITH STLYES`);
    console.log(`📋 Student ID: ${studentId}`);
    console.log(`📋 Registration: ${registrationNumber}`);
    console.log("=".repeat(60));

    // Check student-payments by studentId
    console.log(`\n💰 Checking student-payments collection by studentId...`);
    const paymentsQuery1 = query(
      collection(db, 'student-payments'),
      where('studentId', '==', studentId)
    );
    const paymentsSnapshot1 = await getDocs(paymentsQuery1);
    console.log(`📋 Found ${paymentsSnapshot1.size} payment records by studentId`);
    
    paymentsSnapshot1.forEach(doc => {
      const data = doc.data();
      console.log(`  💳 Payment ID: ${doc.id}`);
      console.log(`  💰 Amount: ¢${data.amount}`);
      console.log(`  📅 Status: ${data.status}`);
      console.log(`  🎯 Payment Period: ${data.paymentPeriod}`);
      console.log(`  📝 Reference: ${data.reference}`);
      console.log(`  ---`);
    });

    // Check student-payments by registration number
    console.log(`\n💰 Checking student-payments collection by registrationNumber...`);
    const paymentsQuery2 = query(
      collection(db, 'student-payments'),
      where('studentId', '==', registrationNumber)
    );
    const paymentsSnapshot2 = await getDocs(paymentsQuery2);
    console.log(`📋 Found ${paymentsSnapshot2.size} payment records by registrationNumber`);
    
    paymentsSnapshot2.forEach(doc => {
      const data = doc.data();
      console.log(`  💳 Payment ID: ${doc.id}`);
      console.log(`  💰 Amount: ¢${data.amount}`);
      console.log(`  📅 Status: ${data.status}`);
      console.log(`  🎯 Payment Period: ${data.paymentPeriod}`);
      console.log(`  📝 Reference: ${data.reference}`);
      console.log(`  ---`);
    });

    // Check wallet-transactions by studentId
    console.log(`\n🏦 Checking wallet-transactions collection by studentId...`);
    const walletQuery1 = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', studentId),
      where('type', '==', 'fee_deduction')
    );
    const walletSnapshot1 = await getDocs(walletQuery1);
    console.log(`📋 Found ${walletSnapshot1.size} wallet fee deduction transactions by studentId`);
    
    walletSnapshot1.forEach(doc => {
      const data = doc.data();
      console.log(`  🏦 Transaction ID: ${doc.id}`);
      console.log(`  💰 Amount: ¢${data.amount / 100} (${data.amount} pesewas)`);
      console.log(`  📅 Status: ${data.status}`);
      console.log(`  🎯 Payment Period: ${data.metadata?.paymentPeriod}`);
      console.log(`  📝 Description: ${data.description}`);
      console.log(`  ---`);
    });

    // Check wallet-transactions by registration number
    console.log(`\n🏦 Checking wallet-transactions collection by registrationNumber...`);
    const walletQuery2 = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', registrationNumber),
      where('type', '==', 'fee_deduction')
    );
    const walletSnapshot2 = await getDocs(walletQuery2);
    console.log(`📋 Found ${walletSnapshot2.size} wallet fee deduction transactions by registrationNumber`);
    
    walletSnapshot2.forEach(doc => {
      const data = doc.data();
      console.log(`  🏦 Transaction ID: ${doc.id}`);
      console.log(`  💰 Amount: ¢${data.amount / 100} (${data.amount} pesewas)`);
      console.log(`  📅 Status: ${data.status}`);
      console.log(`  🎯 Payment Period: ${data.metadata?.paymentPeriod}`);
      console.log(`  📝 Description: ${data.description}`);
      console.log(`  ---`);
    });

    // Summary
    const totalPaymentRecords = paymentsSnapshot1.size + paymentsSnapshot2.size;
    const totalWalletTransactions = walletSnapshot1.size + walletSnapshot2.size;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`💰 Total payment records: ${totalPaymentRecords}`);
    console.log(`🏦 Total wallet transactions: ${totalWalletTransactions}`);
    
    if (totalPaymentRecords === 0 && totalWalletTransactions === 0) {
      console.log(`🚨 NO PAYMENTS FOUND - This explains why the tab is not locked!`);
      console.log(`🔒 The student has not paid any fees, so registration should be blocked.`);
    } else {
      console.log(`✅ Payments found - need to check if they cover current semester fees.`);
    }

    console.log("=".repeat(60));

  } catch (error) {
    console.error('❌ Error checking student payments:', error);
  }
}

checkStudentPayments();

