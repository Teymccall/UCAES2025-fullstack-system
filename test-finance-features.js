// Test Finance Features and Firebase Connection
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} = require('firebase/firestore');

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

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection to ucaes2025...\n');
  
  try {
    // Test 1: Check if we can read from fee-services collection
    console.log('1️⃣ Testing fee-services collection...');
    const servicesRef = collection(db, 'fee-services');
    const servicesSnapshot = await getDocs(servicesRef);
    console.log(`   ✅ Found ${servicesSnapshot.size} services in database`);
    
    servicesSnapshot.forEach((doc) => {
      const service = doc.data();
      console.log(`   📋 Service: ${service.name} - ¢${service.amount} (${service.type})`);
    });
    
    // Test 2: Check student-wallets collection
    console.log('\n2️⃣ Testing student-wallets collection...');
    const walletsRef = collection(db, 'student-wallets');
    const walletsSnapshot = await getDocs(walletsRef);
    console.log(`   ✅ Found ${walletsSnapshot.size} wallets in database`);
    
    // Test 3: Check wallet-transactions collection
    console.log('\n3️⃣ Testing wallet-transactions collection...');
    const transactionsRef = collection(db, 'wallet-transactions');
    const transactionsSnapshot = await getDocs(transactionsRef);
    console.log(`   ✅ Found ${transactionsSnapshot.size} transactions in database`);
    
    // Test 4: Check academic-years collection
    console.log('\n4️⃣ Testing academic-years collection...');
    const yearsRef = collection(db, 'academic-years');
    const yearsSnapshot = await getDocs(yearsRef);
    console.log(`   ✅ Found ${yearsSnapshot.size} academic years in database`);
    
    yearsSnapshot.forEach((doc) => {
      const year = doc.data();
      console.log(`   📅 Academic Year: ${year.year} (Status: ${year.status})`);
    });
    
    // Test 5: Check student-payments collection
    console.log('\n5️⃣ Testing student-payments collection...');
    const paymentsRef = collection(db, 'student-payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    console.log(`   ✅ Found ${paymentsSnapshot.size} payments in database`);
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
}

async function createTestService() {
  console.log('\n🛠️ Creating test service...');
  
  try {
    const serviceData = {
      name: 'TEST FIELD WORK FEE',
      description: 'Test service for field work and practical sessions',
      amount: 250,
      type: 'Service',
      category: 'Academic',
      isActive: true,
      forProgrammes: ['BSA', 'BSF', 'BESM'],
      forLevels: ['Level 200', 'Level 300'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'HANAMEL_Finance_Officer'
    };
    
    const servicesRef = collection(db, 'fee-services');
    const docRef = await addDoc(servicesRef, serviceData);
    
    console.log(`✅ Test service created with ID: ${docRef.id}`);
    console.log(`📋 Service: ${serviceData.name} - ¢${serviceData.amount}`);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating test service:', error);
  }
}

async function testFinanceDashboardData() {
  console.log('\n📊 Testing Finance Dashboard Data...');
  
  try {
    // Calculate total outstanding
    const paymentsRef = collection(db, 'student-payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    
    let totalPaid = 0;
    let paymentCount = 0;
    
    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data();
      if (payment.status === 'verified' || payment.status === 'completed') {
        totalPaid += payment.amount || 0;
        paymentCount++;
      }
    });
    
    console.log(`💰 Total Paid: ¢${totalPaid.toLocaleString()}`);
    console.log(`📊 Payment Count: ${paymentCount}`);
    
    // Check wallet balances
    const walletsRef = collection(db, 'student-wallets');
    const walletsSnapshot = await getDocs(walletsRef);
    
    let totalWalletBalance = 0;
    walletsSnapshot.forEach((doc) => {
      const wallet = doc.data();
      totalWalletBalance += (wallet.balance || 0) / 100; // Convert from pesewas
    });
    
    console.log(`🏦 Total Wallet Balance: ¢${totalWalletBalance.toLocaleString()}`);
    
    // Calculate collection rate (mock calculation)
    const estimatedTotalFees = 130000; // Mock total
    const collectionRate = Math.round((totalPaid / estimatedTotalFees) * 100);
    console.log(`📈 Collection Rate: ${collectionRate}%`);
    
  } catch (error) {
    console.error('❌ Error calculating dashboard data:', error);
  }
}

async function runAllTests() {
  await testFirebaseConnection();
  await createTestService();
  await testFinanceDashboardData();
  
  console.log('\n🏁 All tests completed!');
  process.exit(0);
}

// Run the tests
runAllTests().catch(console.error);



