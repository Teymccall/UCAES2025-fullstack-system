// Script to seed programs and courses data to Firebase

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration from Academic affairs
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

// Programs data
const programs = [
  {
    name: "BSc. Sustainable Agriculture",
    code: "BSC-AGRI",
    faculty: "Agriculture",
    department: "Agriculture Science",
    type: "degree",
    description: "A program focused on sustainable agricultural practices and food production systems.",
    durationYears: 4,
    credits: 140,
    entryRequirements: "High school diploma with science subjects and minimum GPA of 3.0",
    status: "active"
  },
  {
    name: "BSc. Environmental Science and Management",
    code: "BSC-ESM",
    faculty: "Environmental Studies",
    department: "Environmental Science",
    type: "degree",
    description: "A program focused on environmental management, conservation, and sustainable development.",
    durationYears: 4,
    credits: 140,
    entryRequirements: "High school diploma with science subjects and minimum GPA of 3.0",
    status: "active"
  }
];

// Sample courses for BSc. Sustainable Agriculture (Year 1, Semester 1)
const agricultureCourses = [
  {
    code: "AGM 151",
    title: "Introduction to Soil Science",
    description: "Study of soil properties, formation, and classification systems.",
    credits: 3,
    level: 100,
    semester: 1,
    department: "Agriculture Science",
    theory: 2,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "AGM 153",
    title: "Introductory Botany",
    description: "Introduction to the biology of plants, including structure, function, and classification.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "Agriculture Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "AGM 155",
    title: "Principles of Crop Production",
    description: "Fundamental principles of crop production and management.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "Agriculture Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  }
];

// Sample courses for BSc. Environmental Science and Management (Year 1, Semester 1)
const environmentalCourses = [
  {
    code: "ESM 151",
    title: "Principles of Biochemistry",
    description: "Introduction to the chemistry of biological molecules and processes.",
    credits: 3,
    level: 100,
    semester: 1,
    department: "Environmental Science",
    theory: 2,
    practical: 3,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 153",
    title: "Principles of Environmental Science I",
    description: "Introduction to fundamental concepts in environmental science.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "Environmental Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 155",
    title: "Introduction to Climatology",
    description: "Study of climate systems and their impact on the environment.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "Environmental Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  }
];

// Function to check if a program already exists
async function programExists(programCode) {
  try {
    const programsRef = collection(db, 'academic-programs');
    const q = query(programsRef, where('code', '==', programCode));
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking if program ${programCode} exists:`, error);
    return false;
  }
}

// Function to check if a course already exists
async function courseExists(courseCode) {
  try {
    const coursesRef = collection(db, 'academic-courses');
    const q = query(coursesRef, where('code', '==', courseCode));
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking if course ${courseCode} exists:`, error);
    return false;
  }
}

// Function to seed programs
async function seedPrograms() {
  try {
    console.log("Checking and seeding programs...");
    
    for (const program of programs) {
      const exists = await programExists(program.code);
      
      if (exists) {
        console.log(`Program ${program.code} already exists. Skipping.`);
      } else {
        // Add program with timestamp
        const programData = {
          ...program,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'academic-programs'), programData);
        console.log(`Added program ${program.code} with ID: ${docRef.id}`);
      }
    }
    
    console.log("Programs check and seed completed.");
  } catch (error) {
    console.error("Error seeding programs:", error);
  }
}

// Function to seed courses
async function seedCourses() {
  try {
    console.log("Checking and seeding courses...");
    
    // Process agriculture courses
    for (const course of agricultureCourses) {
      const exists = await courseExists(course.code);
      
      if (exists) {
        console.log(`Course ${course.code} already exists. Skipping.`);
      } else {
        // Add programId to course
        const programId = await getProgramIdByCode("BSC-AGRI");
        
        if (programId) {
          const courseData = {
            ...course,
            programId: programId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, 'academic-courses'), courseData);
          console.log(`Added course ${course.code} with ID: ${docRef.id}`);
        } else {
          console.log(`Could not find program ID for BSC-AGRI. Skipping course ${course.code}.`);
        }
      }
    }
    
    // Process environmental courses
    for (const course of environmentalCourses) {
      const exists = await courseExists(course.code);
      
      if (exists) {
        console.log(`Course ${course.code} already exists. Skipping.`);
      } else {
        // Add programId to course
        const programId = await getProgramIdByCode("BSC-ESM");
        
        if (programId) {
          const courseData = {
            ...course,
            programId: programId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, 'academic-courses'), courseData);
          console.log(`Added course ${course.code} with ID: ${docRef.id}`);
        } else {
          console.log(`Could not find program ID for BSC-ESM. Skipping course ${course.code}.`);
        }
      }
    }
    
    console.log("Courses check and seed completed.");
  } catch (error) {
    console.error("Error seeding courses:", error);
  }
}

// Helper function to get program ID by code
async function getProgramIdByCode(programCode) {
  try {
    const programsRef = collection(db, 'academic-programs');
    const q = query(programsRef, where('code', '==', programCode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting program ID for ${programCode}:`, error);
    return null;
  }
}

// Main function
async function seedData() {
  try {
    console.log("Starting seed process for programs and courses...");
    
    // Step 1: Seed programs
    await seedPrograms();
    
    // Step 2: Seed courses
    await seedCourses();
    
    console.log("Seed process completed successfully!");
  } catch (error) {
    console.error("Error in seed process:", error);
  }
}

// Run the seed function
seedData(); 