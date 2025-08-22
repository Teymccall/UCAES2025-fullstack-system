// Script to fix the payment period for student UCAES20250004
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

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

async function fixPaymentPeriod() {
  try {
    console.log(`🔧 Fixing payment period for student: UCAES20250004`);

    // Find existing payment records for this student
    const paymentsQuery = query(
      collection(db, 'student-payments'),
      where('studentId', '==', 'UCAES20250004'),
      where('status', '==', 'completed')
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    let updatedCount = 0;
    
    paymentsSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      
      // Update payment period to semester2 for Second Semester
      if (data.paymentPeriod === 'semester1' || !data.paymentPeriod) {
        updateDoc(docSnapshot.ref, {
          paymentPeriod: 'semester2',
          paymentFor: ['semester2']
        });
        
        console.log(`✅ Updated payment ${data.reference}: period changed to semester2`);
        updatedCount++;
      }
    });

    console.log(`🎉 Updated ${updatedCount} payment records for semester2`);

    // Also run sync to ensure any new transactions are properly handled
    const syncScript = require('./sync-wallet-payments.js');
    await syncScript.syncWalletPaymentsToStudentPayments('UCAES20250004');

  } catch (error) {
    console.error('❌ Error fixing payment period:', error);
  }
}

fixPaymentPeriod();