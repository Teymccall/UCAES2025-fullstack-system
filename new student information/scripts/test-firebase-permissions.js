// Test script to verify Firebase write permissions
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, doc, getDoc, deleteDoc } = require("firebase/firestore");

// Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test function to write to Firestore
async function testFirestoreWrite() {
  console.log("Testing Firestore write permissions...");
  
  try {
    // Create a test document
    const testData = {
      test: "Permission test",
      timestamp: new Date().toISOString(),
    };
    
    // Try to write to student-registrations collection
    console.log("Attempting to write to student-registrations collection...");
    const docRef = await addDoc(collection(db, "student-registrations"), testData);
    console.log("✅ Write successful! Document ID:", docRef.id);
    
    // Read the document back to verify
    const docSnap = await getDoc(doc(db, "student-registrations", docRef.id));
    console.log("✅ Read successful!", docSnap.data());
    
    // Clean up by deleting the test document
    await deleteDoc(doc(db, "student-registrations", docRef.id));
    console.log("✅ Delete successful! Test document removed");
    
    return true;
  } catch (error) {
    console.error("❌ Error testing Firestore permissions:", error);
    return false;
  }
}

// Run the test
testFirestoreWrite()
  .then(success => {
    if (success) {
      console.log("🎉 All tests passed! Firebase permissions are correctly configured.");
    } else {
      console.log("❌ Test failed. Please check your Firebase rules and configuration.");
    }
  })
  .catch(error => {
    console.error("Unexpected error:", error);
  }); 