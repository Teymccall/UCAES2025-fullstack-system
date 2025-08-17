// check-course-levels.js
// A diagnostic script to verify which levels are present for specific programs in Firebase.

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec"
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Main Diagnostic Logic ---

/**
 * Fetches program details from Firestore.
 * @param {string} programName - The name of the program to find.
 * @returns {Object|null} - An object with program ID and name, or null.
 */
async function getProgram(programName) {
    const programsRef = collection(db, "academic-programs");
    const q = query(programsRef, where("name", "==", programName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, name: doc.data().name };
    }
    console.error(`[ERROR] Program not found: "${programName}"`);
    return null;
}

/**
 * Checks the available levels for a given program ID.
 * @param {string} programId - The Firestore ID of the program.
 * @param {string} programName - The name of the program for logging.
 */
async function checkLevelsForProgram(programId, programName) {
    console.log(`\nChecking levels for program: "${programName}" (ID: ${programId})...`);
    const coursesRef = collection(db, "academic-courses");
    const q = query(coursesRef, where("programId", "==", programId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.warn(`[WARNING] No courses found for "${programName}". No levels to report.`);
        return;
    }

    const levels = Array.from(new Set(snapshot.docs.map(doc => doc.data().level)));
    const sortedLevels = levels.sort((a, b) => a - b);

    console.log(`  > Found ${snapshot.size} course entries.`);
    console.log(`  > Unique levels discovered: [${sortedLevels.join(', ')}]`);
}

/**
 * Main function to run the script.
 */
async function main() {
    console.log("--- Starting Database Level Verification Script ---");
    
    const programsToVerify = [
        "BSc. Sustainable Agriculture",
        "BSc. Environmental Science and Management"
    ];

    for (const progName of programsToVerify) {
        const program = await getProgram(progName);
        if (program) {
            await checkLevelsForProgram(program.id, program.name);
        }
    }

    console.log("\n--- Verification Script Finished ---");
}

main().catch(console.error); 