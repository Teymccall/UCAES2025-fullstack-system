const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Your project's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
    authDomain: "ucaes2025.firebaseapp.com",
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    projectId: "ucaes2025",
    storageBucket: "ucaes2025.appspot.com",
    messagingSenderId: "543217800581",
    appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
    measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyProgramNames() {
  console.log("Connecting to Firestore to verify program names...");

  try {
    const programsRef = collection(db, 'academic-programs');
    const snapshot = await getDocs(programsRef);

    if (snapshot.empty) {
      console.log("The 'academic-programs' collection is empty. This is the root of the problem.");
      return;
    }

    console.log(`\nFound ${snapshot.size} programs in the database. Here are their exact names:`);
    console.log("-------------------------------------------------");

    snapshot.forEach(doc => {
      const programData = doc.data();
      // We will print the name field, enclosed in quotes to see any leading/trailing spaces.
      console.log(`- Document ID: ${doc.id}`);
      console.log(`  Name: "${programData.name}"`);
      console.log("-------------------------------------------------");
    });

     console.log("\nVerification complete. Compare the names above with the name in the error message.");

  } catch (error) {
    console.error("\nError connecting to or reading from Firestore:", error);
    console.log("Please ensure the firebaseConfig is correct and you have internet connectivity.");
  }
}

verifyProgramNames(); 