// Script to seed complete curriculum data for BSc. Sustainable Agriculture and BSc. Environmental Science and Management

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
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

// BSc. Sustainable Agriculture - Year 1 Semester 1 Courses
const agriY1S1Courses = [
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
  },
  {
    code: "ESM 151",
    title: "Principles of Biochemistry",
    description: "Study of the structure and function of biological molecules essential to life.",
    credits: 3,
    level: 100,
    semester: 1,
    department: "Environmental Science",
    theory: 2,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 155",
    title: "Introduction to Climatology",
    description: "Introduction to climate systems and their impact on agricultural production.",
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
    code: "GNS 151",
    title: "Introductory Pure Mathematics",
    description: "Introduction to fundamental mathematical concepts relevant to scientific fields.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 153",
    title: "Introduction to Computing I",
    description: "Introduction to computer systems and basic programming concepts.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "General Studies",
    theory: 1,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 155",
    title: "Communication Skills I",
    description: "Development of effective communication skills for academic and professional contexts.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  }
];

// BSc. Sustainable Agriculture - Year 1 Semester 2 Courses
const agriY1S2Courses = [
  {
    code: "AGM 158",
    title: "Introductory Economics",
    description: "Introduction to economic principles with focus on agriculture and food systems.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "Agriculture Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "AGM 152",
    title: "Principles of Land Surveying",
    description: "Basic principles and techniques of land surveying for agricultural applications.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "Agriculture Science",
    theory: 1,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "AGM 154",
    title: "Principles of Agroecology",
    description: "Introduction to ecological principles applied to agricultural systems.",
    credits: 1,
    level: 100,
    semester: 2,
    department: "Agriculture Science",
    theory: 1,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "AGM 156",
    title: "Vacation Training",
    description: "Supervised practical training in agricultural settings.",
    credits: 3,
    level: 100,
    semester: 2,
    department: "Agriculture Science",
    theory: 0,
    practical: 3,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ANS 152",
    title: "Anatomy and Physiology of Farm Animals",
    description: "Study of the structure and function of major organ systems in farm animals.",
    credits: 3,
    level: 100,
    semester: 2,
    department: "Animal Science",
    theory: 2,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 156",
    title: "Basic Microbiology",
    description: "Introduction to microorganisms and their roles in agricultural systems.",
    credits: 3,
    level: 100,
    semester: 2,
    department: "Environmental Science",
    theory: 2,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 152",
    title: "Basic Statistics",
    description: "Introduction to statistical methods for data analysis in agricultural sciences.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 154",
    title: "Introduction to Computing II",
    description: "Advanced concepts in computing and applications in agricultural sciences.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "General Studies",
    theory: 1,
    practical: 2,
    prerequisites: ["GNS 153"],
    status: "active"
  },
  {
    code: "GNS 156",
    title: "Communication Skills II",
    description: "Advanced communication skills for scientific and technical writing.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: ["GNS 155"],
    status: "active"
  }
];

// BSc. Environmental Science and Management - Year 1 Semester 1 Courses
const esmY1S1Courses = [
  {
    code: "ESM 151",
    title: "Principles of Biochemistry",
    description: "Study of the structure and function of biological molecules essential to life.",
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
  },
  {
    code: "AGM 151",
    title: "Introduction to Soil Science",
    description: "Study of soil properties, formation, and classification systems.",
    credits: 3,
    level: 100,
    semester: 1,
    department: "Agriculture Science",
    theory: 2,
    practical: 3,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 151",
    title: "Basic Mathematics",
    description: "Introduction to mathematical concepts relevant to environmental science.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 153",
    title: "Introduction to Computing I",
    description: "Introduction to computer systems and basic programming concepts.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "General Studies",
    theory: 1,
    practical: 3,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 155",
    title: "Communication Skills I",
    description: "Development of effective communication skills for academic and professional contexts.",
    credits: 2,
    level: 100,
    semester: 1,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 161",
    title: "Principles of Management",
    description: "Introduction to management principles and practices for environmental professionals.",
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

// BSc. Environmental Science and Management - Year 1 Semester 2 Courses
const esmY1S2Courses = [
  {
    code: "ESM 152",
    title: "Principles of Environmental Science II",
    description: "Advanced concepts in environmental science building on part I.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "Environmental Science",
    theory: 2,
    practical: 0,
    prerequisites: ["ESM 153"],
    status: "active"
  },
  {
    code: "ESM 154",
    title: "Environment and Development",
    description: "Study of the relationship between environmental issues and socio-economic development.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "Environmental Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 156",
    title: "Basic Microbiology",
    description: "Introduction to microorganisms and their roles in environmental systems.",
    credits: 3,
    level: 100,
    semester: 2,
    department: "Environmental Science",
    theory: 2,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "AGM 152",
    title: "Principles of Land Surveying",
    description: "Basic principles and techniques of land surveying for environmental applications.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "Agriculture Science",
    theory: 1,
    practical: 2,
    prerequisites: [],
    status: "active"
  },
  {
    code: "ESM 158",
    title: "Introductory Economics",
    description: "Introduction to economic principles with focus on environmental economics.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "Environmental Science",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 152",
    title: "Basic Statistics",
    description: "Introduction to statistical methods for data analysis in environmental sciences.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: [],
    status: "active"
  },
  {
    code: "GNS 154",
    title: "Introduction to Computing II",
    description: "Advanced concepts in computing and applications in environmental sciences.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "General Studies",
    theory: 1,
    practical: 3,
    prerequisites: ["GNS 153"],
    status: "active"
  },
  {
    code: "GNS 156",
    title: "Communication Skills II",
    description: "Advanced communication skills for scientific and technical writing.",
    credits: 2,
    level: 100,
    semester: 2,
    department: "General Studies",
    theory: 2,
    practical: 0,
    prerequisites: ["GNS 155"],
    status: "active"
  }
];

// Helper functions
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

async function getProgramIdByCode(programCode) {
  try {
    const programsRef = collection(db, 'academic-programs');
    const q = query(programsRef, where('code', '==', programCode));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const programDoc = snapshot.docs[0];
    return programDoc.id;
  } catch (error) {
    console.error(`Error getting program ID for code ${programCode}:`, error);
    return null;
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

// Function to seed courses for a specific program and semester
async function seedCoursesForProgram(courses, programCode) {
  try {
    const programId = await getProgramIdByCode(programCode);
    
    if (!programId) {
      console.log(`Could not find program ID for ${programCode}. Skipping courses.`);
      return;
    }
    
    for (const course of courses) {
      const exists = await courseExists(course.code);
      
      if (exists) {
        console.log(`Course ${course.code} already exists. Skipping.`);
      } else {
        const courseData = {
          ...course,
          programId: programId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'academic-courses'), courseData);
        console.log(`Added course ${course.code} with ID: ${docRef.id}`);
      }
    }
  } catch (error) {
    console.error("Error seeding courses:", error);
  }
}

// Function to seed curriculum structure for a program
async function seedCurriculumStructure(programCode, structure) {
  try {
    const programId = await getProgramIdByCode(programCode);
    
    if (!programId) {
      console.log(`Could not find program ID for ${programCode}. Skipping curriculum structure.`);
      return;
    }
    
    const curriculumData = {
      programId: programId,
      structure: structure,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'curriculum-structure', programCode), curriculumData);
    console.log(`Added curriculum structure for ${programCode}`);
  } catch (error) {
    console.error("Error seeding curriculum structure:", error);
  }
}

// Main function
async function seedData() {
  try {
    console.log("Starting seed process for complete curriculum data...");
    
    // Step 1: Seed programs
    await seedPrograms();
    
    // Step 2: Seed courses for BSc. Sustainable Agriculture
    console.log("Seeding courses for BSc. Sustainable Agriculture...");
    await seedCoursesForProgram(agriY1S1Courses, "BSC-AGRI");
    await seedCoursesForProgram(agriY1S2Courses, "BSC-AGRI");
    
    // Step 3: Seed courses for BSc. Environmental Science and Management
    console.log("Seeding courses for BSc. Environmental Science and Management...");
    await seedCoursesForProgram(esmY1S1Courses, "BSC-ESM");
    await seedCoursesForProgram(esmY1S2Courses, "BSC-ESM");
    
    // Step 4: Seed curriculum structure for BSc. Sustainable Agriculture
    const agriStructure = [
      {
        year: 1,
        semester: 1,
        totalCredits: 18,
        courses: agriY1S1Courses.map(c => c.code)
      },
      {
        year: 1,
        semester: 2,
        totalCredits: 20,
        courses: agriY1S2Courses.map(c => c.code)
      }
    ];
    await seedCurriculumStructure("BSC-AGRI", agriStructure);
    
    // Step 5: Seed curriculum structure for BSc. Environmental Science and Management
    const esmStructure = [
      {
        year: 1,
        semester: 1,
        totalCredits: 18,
        courses: esmY1S1Courses.map(c => c.code)
      },
      {
        year: 1,
        semester: 2,
        totalCredits: 17,
        courses: esmY1S2Courses.map(c => c.code)
      }
    ];
    await seedCurriculumStructure("BSC-ESM", esmStructure);
    
    console.log("Seed process completed successfully!");
  } catch (error) {
    console.error("Error in seed process:", error);
  }
}

// Run the seed function
seedData(); 