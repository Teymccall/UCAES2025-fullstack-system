// add-agriculture-courses.js
// Script to add B.Sc. Sustainable Agriculture courses to the curriculum structure

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where } = require('firebase/firestore');

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

// B.Sc. Sustainable Agriculture Level 100 Semester 2 courses
const agricultureL100S2 = [
  { code: "AGM 158", title: "Introductory Economics", credits: 2, theory: 2, practical: 0 },
  { code: "AGM 152", title: "Principles of Land Surveying", credits: 2, theory: 1, practical: 2 },
  { code: "AGM 154", title: "Principles of Agroecology", credits: 1, theory: 1, practical: 0 },
  { code: "AGM 156", title: "Vacation Training", credits: 3, theory: 0, practical: 3 },
  { code: "ANS 152", title: "Anatomy and Physiology of Farm Animals", credits: 3, theory: 2, practical: 2 },
  { code: "ESM 156", title: "Basic Microbiology", credits: 3, theory: 2, practical: 2 },
  { code: "GNS 152", title: "Basic Statistics", credits: 2, theory: 2, practical: 0 },
  { code: "GNS 154", title: "Introduction to Computing II", credits: 2, theory: 1, practical: 2 },
  { code: "GNS 156", title: "Communication Skills II", credits: 2, theory: 2, practical: 0 }
];

// Function to get program code by name
async function getProgramCodeByName(programName) {
  try {
    // First try exact match
    const programsRef = collection(db, "academic-programs");
    let q = query(programsRef, where("name", "==", programName));
    let querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No exact match found for "${programName}", trying with alternate formats...`);
      
      // Try with different formats (B.Sc. vs BSc.)
      const alternateNames = [
        programName.replace("B.Sc.", "BSc."),
        programName.replace("BSc.", "B.Sc."),
        programName.replace("B.Sc.", "B. Sc."),
        programName.replace("B.Sc.", "B.Sc"),
        programName.replace("BSc.", "BSc")
      ];
      
      for (const name of alternateNames) {
        console.log(`Trying with alternate name: "${name}"`);
        q = query(programsRef, where("name", "==", name));
        querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          console.log(`Found match with alternate name: "${name}"`);
          break;
        }
      }
      
      // If still not found, try partial match
      if (querySnapshot.empty) {
        console.log("No matches with alternate formats, fetching all programs to check for partial matches...");
        const allProgramsSnapshot = await getDocs(collection(db, "academic-programs"));
        
        allProgramsSnapshot.forEach((doc) => {
          const programData = doc.data();
          console.log(`Checking program: ${programData.name}`);
          
          // Check if program names contain similar words
          if (programData.name.includes("Agriculture") && programName.includes("Agriculture") ||
              programData.name.toLowerCase().includes("sustainable") && programName.toLowerCase().includes("sustainable")) {
            console.log(`Found potential match: ${programData.name}`);
            querySnapshot.docs = [doc];
          }
        });
      }
    }
    
    if (!querySnapshot.empty) {
      const programData = querySnapshot.docs[0].data();
      console.log(`Found program: ${programData.name} with code: ${programData.code}`);
      return programData.code;
    } else {
      console.log(`Program "${programName}" not found. Using default code.`);
      return programName.includes("Agriculture") ? "BSC-AGRI" : "BSC-ESM";
    }
  } catch (error) {
    console.error("Error getting program code:", error);
    return programName.includes("Agriculture") ? "BSC-AGRI" : "BSC-ESM";
  }
}

// Function to update curriculum structure with course details
async function updateCurriculumStructure() {
  try {
    console.log("Updating B.Sc. Sustainable Agriculture curriculum structure...");
    
    const programName = "B.Sc. Sustainable Agriculture";
    const programCode = await getProgramCodeByName(programName);
    
    console.log(`Using program code: ${programCode}`);
    
    // Get existing curriculum structure
    const structureRef = doc(db, "curriculum-structure", programCode);
    const structureSnapshot = await getDoc(structureRef);
    
    if (!structureSnapshot.exists()) {
      console.log("Curriculum structure not found. Creating a new one.");
      
      // Create a new structure
      const newStructure = {
        programCode: programCode,
        programName: programName,
        structure: [
          {
            year: 1,
            semester: 2,
            courses: agricultureL100S2.map(course => course.code),
            courses_details: agricultureL100S2
          }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(structureRef, newStructure);
      console.log("Created new curriculum structure with Level 100 Semester 2 courses");
    } else {
      // Update existing structure
      const currentStructure = structureSnapshot.data();
      
      // Find if the year 1 semester 2 structure exists
      let semesterStructureIndex = currentStructure.structure.findIndex(
        s => s.year === 1 && s.semester === 2
      );
      
      if (semesterStructureIndex >= 0) {
        console.log("Found existing Year 1 Semester 2 structure. Updating courses...");
        
        // Update the semester structure
        currentStructure.structure[semesterStructureIndex].courses = agricultureL100S2.map(course => course.code);
        currentStructure.structure[semesterStructureIndex].courses_details = agricultureL100S2;
      } else {
        console.log("Year 1 Semester 2 structure not found. Adding it...");
        
        // Add new semester structure
        currentStructure.structure.push({
          year: 1,
          semester: 2,
          courses: agricultureL100S2.map(course => course.code),
          courses_details: agricultureL100S2
        });
      }
      
      // Fix program name to match exactly what user specified
      currentStructure.programName = programName;
      
      // Update the document
      await setDoc(structureRef, {
        ...currentStructure,
        updatedAt: serverTimestamp()
      });
      
      console.log("Updated curriculum structure with Level 100 Semester 2 courses");
    }
  } catch (error) {
    console.error("Error updating curriculum structure:", error);
  }
}

// Main function
async function main() {
  try {
    await updateCurriculumStructure();
    console.log("Courses successfully added to curriculum structure!");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
main(); 