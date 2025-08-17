// list-programs.js
// Script to list all academic programs in the database

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listPrograms() {
  try {
    console.log("Fetching all academic programs...");
    
    const programsRef = collection(db, "academic-programs");
    const querySnapshot = await getDocs(programsRef);
    
    if (querySnapshot.empty) {
      console.log("No programs found in the database.");
      return;
    }
    
    console.log(`Found ${querySnapshot.size} programs:`);
    console.log("-----------------------------------");
    
    querySnapshot.forEach((doc) => {
      const programData = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Name: ${programData.name}`);
      console.log(`Code: ${programData.code}`);
      console.log(`Faculty: ${programData.faculty}`);
      console.log(`Department: ${programData.department}`);
      console.log(`Status: ${programData.status}`);
      console.log("-----------------------------------");
    });
    
  } catch (error) {
    console.error("Error fetching programs:", error);
  }
}

// Run the script
listPrograms(); 