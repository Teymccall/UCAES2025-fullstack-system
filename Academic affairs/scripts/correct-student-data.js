const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, writeBatch } = require('firebase/firestore');

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

async function correctStudentProgramNames() {
  console.log("Starting script to correct student program names...");

  const studentsRef = collection(db, 'students');
  const incorrectProgramName = "B.Sc. Environmental Science and Management";
  const correctProgramName = "BSc. Environmental Science and Management";

  try {
    const q = query(studentsRef, where("program", "==", incorrectProgramName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`No students found with the incorrect program name: "${incorrectProgramName}". No changes needed.`);
      return;
    }

    console.log(`Found ${snapshot.size} student(s) with the incorrect program name. Preparing to update...`);

    const batch = writeBatch(db);

    snapshot.forEach(doc => {
      console.log(`- Scheduling update for student: ${doc.id} | Name: ${doc.data().name || 'N/A'}`);
      const studentDocRef = doc.ref;
      batch.update(studentDocRef, { program: correctProgramName });
    });

    await batch.commit();

    console.log(`\nSuccessfully updated ${snapshot.size} student record(s).`);
    console.log(`All instances of "${incorrectProgramName}" have been corrected to "${correctProgramName}".`);

  } catch (error) {
    console.error("\nAn error occurred while updating student records:", error);
  }
}

correctStudentProgramNames(); 