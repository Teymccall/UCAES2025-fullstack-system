// Script to check payment periods for a student
const { initializeApp } = require('firebase/app');
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkPaymentPeriod() {
  try {
    console.log(`🔍 Checking payment records for student: UCAES20250004`);

    // Check student-payments
    const paymentsQuery = query(
      collection(db, 'student-payments'),
      where('studentId', '==', 'UCAES20250004')
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    console.log(`📋 Found ${paymentsSnapshot.size} payment records in student-payments:`);
    paymentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log({
        id: doc.id,
        amount: data.amount,
        paymentPeriod: data.paymentPeriod,
        paymentFor: data.paymentFor,
        reference: data.reference,
        status: data.status
      });
    });

    // Check wallet-transactions
    const walletQuery = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', 'UCAES20250004'),
      where('type', '==', 'fee_deduction'),
      where('status', '==', 'completed')
    );
    const walletSnapshot = await getDocs(walletQuery);
    
    console.log(`\n💰 Found ${walletSnapshot.size} fee deduction transactions in wallet-transactions:`);
    walletSnapshot.forEach(doc => {
      const data = doc.data();
      console.log({
        id: doc.id,
        amount: data.amount / 100,
        metadata: data.metadata,
        reference: data.reference,
        createdAt: data.createdAt
      });
    });

  } catch (error) {
    console.error('❌ Error checking payment records:', error);
  }
}

checkPaymentPeriod();