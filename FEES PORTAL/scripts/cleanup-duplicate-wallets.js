// Script to clean up duplicate wallets
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit, addDoc, updateDoc, doc, deleteDoc } = require('firebase/firestore');

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

async function cleanupDuplicateWallets() {
  try {
    console.log('🧹 Starting duplicate wallet cleanup...');
    
    const studentId = 'UCAES20250008';
    
    // 1. Find all wallets for this student
    console.log(`\n1. Finding all wallets for student: ${studentId}`);
    const walletQuery = query(
      collection(db, 'student-wallets'),
      where('studentId', '==', studentId)
    );
    const walletSnapshot = await getDocs(walletQuery);
    
    if (walletSnapshot.size <= 1) {
      console.log('No duplicate wallets found');
      return;
    }
    
    console.log(`Found ${walletSnapshot.size} wallets for this student:`);
    const wallets = [];
    walletSnapshot.forEach(doc => {
      const wallet = { id: doc.id, ...doc.data() };
      wallets.push(wallet);
      console.log(`- Wallet ID: ${wallet.id}, Balance: ¢${wallet.balance / 100}, Created: ${wallet.createdAt}`);
    });
    
    // 2. Find the wallet with the highest balance (or most recent if equal)
    const primaryWallet = wallets.reduce((primary, current) => {
      if (current.balance > primary.balance) {
        return current;
      } else if (current.balance === primary.balance) {
        // If balances are equal, choose the one created first
        return new Date(current.createdAt) < new Date(primary.createdAt) ? current : primary;
      }
      return primary;
    });
    
    console.log(`\n2. Primary wallet selected: ${primaryWallet.id} with balance ¢${primaryWallet.balance / 100}`);
    
    // 3. Calculate total balance from all wallets
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    console.log(`Total balance across all wallets: ¢${totalBalance / 100}`);
    
    // 4. Update primary wallet with total balance
    if (primaryWallet.balance !== totalBalance) {
      console.log(`\n3. Updating primary wallet balance to ¢${totalBalance / 100}`);
      await updateDoc(doc(db, 'student-wallets', primaryWallet.id), {
        balance: totalBalance,
        updatedAt: new Date().toISOString(),
        lastTransactionDate: new Date().toISOString()
      });
      console.log('✅ Primary wallet balance updated');
    }
    
    // 5. Delete duplicate wallets
    console.log(`\n4. Deleting ${wallets.length - 1} duplicate wallets...`);
    for (const wallet of wallets) {
      if (wallet.id !== primaryWallet.id) {
        console.log(`Deleting wallet: ${wallet.id}`);
        await deleteDoc(doc(db, 'student-wallets', wallet.id));
      }
    }
    console.log('✅ Duplicate wallets deleted');
    
    // 6. Verify cleanup
    console.log(`\n5. Verifying cleanup...`);
    const finalWalletQuery = query(
      collection(db, 'student-wallets'),
      where('studentId', '==', studentId)
    );
    const finalWalletSnapshot = await getDocs(finalWalletQuery);
    console.log(`Final wallet count: ${finalWalletSnapshot.size}`);
    
    if (finalWalletSnapshot.size === 1) {
      const finalWallet = finalWalletSnapshot.docs[0].data();
      console.log(`Final wallet balance: ¢${finalWallet.balance / 100}`);
      console.log('✅ Cleanup completed successfully!');
    } else {
      console.log('❌ Cleanup verification failed');
    }
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Run the cleanup
cleanupDuplicateWallets().then(() => {
  console.log('\n✅ Cleanup completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});

