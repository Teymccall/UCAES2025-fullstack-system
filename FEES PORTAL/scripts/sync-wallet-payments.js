// Script to sync wallet transactions to student-payments collection for fee calculation
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, setDoc, doc, orderBy } = require('firebase/firestore');

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

async function syncWalletPaymentsToStudentPayments(studentId) {
  try {
    console.log(`🔄 Syncing wallet payments for student: ${studentId}`);

    // Get all fee deduction transactions for this student
    const transactionQuery = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', studentId),
      where('type', '==', 'fee_deduction'),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    const transactionSnapshot = await getDocs(transactionQuery);

    if (transactionSnapshot.empty) {
      console.log(`ℹ️ No fee deduction transactions found for student: ${studentId}`);
      return;
    }

    console.log(`📋 Found ${transactionSnapshot.size} fee deduction transactions`);

    let syncedCount = 0;

    for (const docSnapshot of transactionSnapshot.docs) {
      const transaction = docSnapshot.data();
      
      // Check if this transaction already exists in student-payments
      const existingPaymentQuery = query(
        collection(db, 'student-payments'),
        where('studentId', '==', studentId),
        where('reference', '==', transaction.reference)
      );
      const existingPaymentSnapshot = await getDocs(existingPaymentQuery);

      if (!existingPaymentSnapshot.empty) {
        console.log(`⏭️ Payment already exists in student-payments: ${transaction.reference}`);
        continue;
      }

      // Create student payment record
      const paymentRecord = {
        studentId: studentId,
        studentName: transaction.studentName || '',
        amount: transaction.amount / 100, // Convert from pesewas to cedis
        category: 'tuition',
        status: 'completed',
        method: transaction.paymentMethod || 'wallet',
        reference: transaction.reference,
        description: transaction.description || 'Fee payment via wallet',
        paymentDate: transaction.createdAt ? transaction.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        submittedAt: transaction.createdAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        paymentPeriod: transaction.metadata?.paymentPeriod || 'semester2',
        paymentFor: [transaction.metadata?.paymentPeriod || 'semester2'],
        academicYear: transaction.metadata?.academicYear || new Date().getFullYear().toString(),
        semester: transaction.metadata?.semester || 'Current Semester',
        verifiedBy: 'system',
        reviewedAt: new Date().toISOString()
      };

      // Add to student-payments collection
      const paymentDocRef = doc(collection(db, 'student-payments'));
      await setDoc(paymentDocRef, paymentRecord);
      
      syncedCount++;
      console.log(`✅ Synced transaction: ${transaction.reference} (¢${transaction.amount / 100})`);
    }

    console.log(`🎉 Successfully synced ${syncedCount} transactions for student: ${studentId}`);

  } catch (error) {
    console.error('❌ Error syncing wallet payments:', error);
  }
}

async function syncAllStudents() {
  try {
    console.log('🔄 Syncing wallet payments for all students...');

    // Get unique student IDs from wallet transactions
    const walletQuery = query(
      collection(db, 'wallet-transactions'),
      where('type', '==', 'fee_deduction'),
      where('status', '==', 'completed')
    );
    const walletSnapshot = await getDocs(walletQuery);

    const uniqueStudents = new Set();
    walletSnapshot.forEach(doc => {
      uniqueStudents.add(doc.data().studentId);
    });

    console.log(`📊 Found ${uniqueStudents.size} unique students with fee payments`);

    let totalSynced = 0;
    for (const studentId of uniqueStudents) {
      await syncWalletPaymentsToStudentPayments(studentId);
      totalSynced++;
    }

    console.log(`🎉 Completed syncing all ${totalSynced} students`);

  } catch (error) {
    console.error('❌ Error syncing all students:', error);
  }
}

// Usage: node sync-wallet-payments.js [studentId]
const studentId = process.argv[2];
if (studentId) {
  syncWalletPaymentsToStudentPayments(studentId);
} else {
  syncAllStudents();
}