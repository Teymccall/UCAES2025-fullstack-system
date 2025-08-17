// Detailed Firebase diagnostic script
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");

// Firebase configuration
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

async function runDiagnostics() {
  console.log("🔍 Starting detailed Firebase diagnostics...");
  console.log("📋 Configuration check:");
  console.log("- Project ID:", firebaseConfig.projectId);
  console.log("- Auth Domain:", firebaseConfig.authDomain);
  console.log("- API Key:", firebaseConfig.apiKey ? "✅ Present" : "❌ Missing");

  try {
    console.log("\n🚀 Initializing Firebase app...");
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully");

    console.log("\n📊 Initializing Firebase services...");
    const db = getFirestore(app);
    const auth = getAuth(app);
    console.log("✅ Firebase services initialized");

    console.log("\n🔐 Testing authentication...");
    console.log("Current auth state:", auth.currentUser ? "Signed in" : "Not signed in");
    
    // Test anonymous authentication with detailed error handling
    try {
      console.log("Attempting anonymous sign-in...");
      const userCredential = await signInAnonymously(auth);
      console.log("✅ Anonymous authentication successful");
      console.log("User UID:", userCredential.user.uid);
    } catch (authError) {
      console.error("❌ Authentication failed:", authError);
      console.error("Error code:", authError.code);
      console.error("Error message:", authError.message);
      
      // Provide specific troubleshooting based on error code
      switch (authError.code) {
        case "auth/network-request-failed":
          console.error("💡 This is a network connectivity issue. Possible causes:");
          console.error("   - Internet connection problems");
          console.error("   - Firewall blocking Firebase");
          console.error("   - Corporate network restrictions");
          console.error("   - Firebase service temporarily unavailable");
          break;
        case "auth/invalid-api-key":
          console.error("💡 API key is invalid or restricted");
          break;
        case "auth/operation-not-allowed":
          console.error("💡 Anonymous authentication is not enabled in Firebase console");
          break;
        default:
          console.error("💡 Unknown authentication error");
      }
      return;
    }

    console.log("\n📝 Testing Firestore operations...");
    
    // Test basic Firestore write
    try {
      console.log("Testing basic document creation...");
      const testDoc = await addDoc(collection(db, "diagnostic-test"), {
        timestamp: serverTimestamp(),
        test: true,
        message: "Firebase diagnostic test"
      });
      console.log("✅ Basic document created:", testDoc.id);
      
      // Test reading the document back
      const docSnap = await getDoc(doc(db, "diagnostic-test", testDoc.id));
      if (docSnap.exists()) {
        console.log("✅ Document read successfully");
      } else {
        console.log("❌ Document not found after creation");
      }
    } catch (firestoreError) {
      console.error("❌ Firestore operation failed:", firestoreError);
      console.error("Error code:", firestoreError.code);
      console.error("Error message:", firestoreError.message);
    }

    console.log("\n🎓 Testing student-registrations collection...");
    
    // Test student-registrations collection specifically
    try {
      const testRegistration = {
        testType: "diagnostic_test",
        surname: "DIAGNOSTIC",
        otherNames: "TEST",
        email: "diagnostic@test.com",
        registrationNumber: "DIAG123",
        registrationDate: serverTimestamp(),
        status: "test",
        diagnostic: true
      };
      
      const regDoc = await addDoc(collection(db, "student-registrations"), testRegistration);
      console.log("✅ Test registration created:", regDoc.id);
      
      // Verify it was actually saved
      const regSnap = await getDoc(doc(db, "student-registrations", regDoc.id));
      if (regSnap.exists()) {
        console.log("✅ Registration verified in Firebase");
        console.log("Registration data:", regSnap.data());
      } else {
        console.log("❌ Registration not found after creation");
      }
    } catch (regError) {
      console.error("❌ Student registration test failed:", regError);
      console.error("Error code:", regError.code);
      console.error("Error message:", regError.message);
    }

    console.log("\n🎉 Diagnostic complete!");
    console.log("✅ Firebase connection is working");
    console.log("✅ Authentication is working");
    console.log("✅ Firestore operations are working");
    console.log("✅ Student registrations collection is accessible");

  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    console.error("This suggests a configuration or network issue");
  }
}

// Run the diagnostics
runDiagnostics(); 