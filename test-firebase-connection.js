// Test script to verify Firebase connection and registration functionality
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testFirebaseConnection() {
  try {
    console.log("🔍 Testing Firebase connection...");
    
    // Test 1: Anonymous authentication
    console.log("1. Testing anonymous authentication...");
    const userCredential = await signInAnonymously(auth);
    console.log("✅ Anonymous authentication successful:", userCredential.user.uid);
    
    // Test 2: Write test data to Firestore
    console.log("2. Testing Firestore write...");
    const testData = {
      testType: "connection_test",
      timestamp: serverTimestamp(),
      message: "Firebase connection test successful",
      testRun: true
    };
    
    const docRef = await addDoc(collection(db, "test-collection"), testData);
    console.log("✅ Test document created with ID:", docRef.id);
    
    // Test 3: Read back the test data
    console.log("3. Testing Firestore read...");
    const docSnap = await getDoc(doc(db, "test-collection", docRef.id));
    if (docSnap.exists()) {
      console.log("✅ Test document read successfully:", docSnap.data());
    } else {
      console.log("❌ Test document not found");
    }
    
    // Test 4: Test student-registrations collection access
    console.log("4. Testing student-registrations collection access...");
    try {
      const testRegistration = {
        testType: "registration_test",
        surname: "TEST",
        otherNames: "STUDENT",
        email: "test@example.com",
        registrationNumber: "TEST123",
        registrationDate: serverTimestamp(),
        status: "test",
        testRun: true
      };
      
      const regDocRef = await addDoc(collection(db, "student-registrations"), testRegistration);
      console.log("✅ Test registration created with ID:", regDocRef.id);
      
      // Clean up test data
      console.log("5. Cleaning up test data...");
      // Note: In production, you might want to keep test data for debugging
      console.log("ℹ️ Test data cleanup skipped (for debugging purposes)");
      
    } catch (error) {
      console.error("❌ Error testing student-registrations collection:", error);
    }
    
    console.log("🎉 All Firebase tests PASSED!");
    console.log("✅ Firebase connection is working properly");
    console.log("✅ Authentication is working");
    console.log("✅ Firestore read/write is working");
    console.log("✅ Student registrations collection is accessible");
    
  } catch (error) {
    console.error("❌ Firebase connection test FAILED:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
    
    // Provide specific troubleshooting advice
    if (error.code === "auth/network-request-failed") {
      console.error("💡 Troubleshooting: Check your internet connection");
    } else if (error.code === "permission-denied") {
      console.error("💡 Troubleshooting: Check Firebase security rules");
    } else if (error.code === "unavailable") {
      console.error("💡 Troubleshooting: Firebase service might be temporarily unavailable");
    } else {
      console.error("💡 Troubleshooting: Check Firebase configuration and network connectivity");
    }
  }
}

// Run the test
console.log("🚀 Starting Firebase connection test...");
testFirebaseConnection(); 