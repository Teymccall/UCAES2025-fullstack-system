// Script to populate real academic data for UCAES Lecturer Platform
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  writeBatch,
  serverTimestamp
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  databaseURL: "https://collage-of-agricuture-default-rtdb.firebaseio.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Real academic years data
const academicYears = [
  {
    id: "2023-2024",
    name: "2023/2024",
    year: "2023/2024",
    startDate: "2023-09-01",
    endDate: "2024-07-31",
    status: "completed"
  },
  {
    id: "2024-2025",
    name: "2024/2025",
    year: "2024/2025",
    startDate: "2024-09-01",
    endDate: "2025-07-31",
    status: "active"
  },
  {
    id: "2025-2026",
    name: "2025/2026",
    year: "2025/2026",
    startDate: "2025-09-01",
    endDate: "2026-07-31",
    status: "upcoming"
  }
];

// Real academic semesters data
const academicSemesters = [
  // 2023/2024 Academic Year
  {
    id: "2023-2024-sem1",
    name: "Semester 1",
    academicYearId: "2023-2024",
    startDate: "2023-09-01",
    endDate: "2024-01-31",
    status: "completed"
  },
  {
    id: "2023-2024-sem2",
    name: "Semester 2",
    academicYearId: "2023-2024",
    startDate: "2024-02-01",
    endDate: "2024-07-31",
    status: "completed"
  },
  // 2024/2025 Academic Year
  {
    id: "2024-2025-sem1",
    name: "Semester 1",
    academicYearId: "2024-2025",
    startDate: "2024-09-01",
    endDate: "2025-01-31",
    status: "active"
  },
  {
    id: "2024-2025-sem2",
    name: "Semester 2",
    academicYearId: "2024-2025",
    startDate: "2025-02-01",
    endDate: "2025-07-31",
    status: "upcoming"
  },
  // 2025/2026 Academic Year
  {
    id: "2025-2026-sem1",
    name: "Semester 1",
    academicYearId: "2025-2026",
    startDate: "2025-09-01",
    endDate: "2026-01-31",
    status: "upcoming"
  },
  {
    id: "2025-2026-sem2",
    name: "Semester 2",
    academicYearId: "2025-2026",
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    status: "upcoming"
  }
];

// Real academic programs data
const academicPrograms = [
  {
    id: "bsc-agric",
    name: "BSc. Agriculture",
    code: "AGRIC",
    department: "Agricultural Sciences",
    duration: 4,
    description: "Bachelor of Science in Agriculture"
  },
  {
    id: "bsc-env-science",
    name: "BSc. Environmental Science and Management",
    code: "ESM",
    department: "Environmental Studies",
    duration: 4,
    description: "Bachelor of Science in Environmental Science and Management"
  },
  {
    id: "bsc-agribusiness",
    name: "BSc. Agribusiness",
    code: "AGRIB",
    department: "Agricultural Economics",
    duration: 4,
    description: "Bachelor of Science in Agribusiness"
  },
  {
    id: "bsc-animal-science",
    name: "BSc. Animal Science",
    code: "ANSCI",
    department: "Animal Science",
    duration: 4,
    description: "Bachelor of Science in Animal Science"
  }
];

// Real academic courses data
const academicCourses = [
  // Level 100 Courses
  {
    id: "AGRI101",
    code: "AGRI101",
    title: "Introduction to Agriculture",
    level: 100,
    semester: 1,
    credits: 3,
    department: "Agricultural Sciences",
    description: "Basic principles of agriculture and farming systems"
  },
  {
    id: "AGRI102",
    code: "AGRI102",
    title: "Agricultural Economics",
    level: 100,
    semester: 2,
    credits: 3,
    department: "Agricultural Sciences",
    description: "Economic principles in agricultural production"
  },
  {
    id: "ESM101",
    code: "ESM101",
    title: "Environmental Science Fundamentals",
    level: 100,
    semester: 1,
    credits: 3,
    department: "Environmental Studies",
    description: "Basic concepts in environmental science"
  },
  {
    id: "ESM102",
    code: "ESM102",
    title: "Environmental Chemistry",
    level: 100,
    semester: 2,
    credits: 3,
    department: "Environmental Studies",
    description: "Chemical processes in environmental systems"
  },
  
  // Level 200 Courses
  {
    id: "AGRI201",
    code: "AGRI201",
    title: "Crop Production Systems",
    level: 200,
    semester: 1,
    credits: 3,
    department: "Agricultural Sciences",
    description: "Modern crop production techniques and systems"
  },
  {
    id: "AGRI202",
    code: "AGRI202",
    title: "Soil Science",
    level: 200,
    semester: 2,
    credits: 3,
    department: "Agricultural Sciences",
    description: "Soil formation, classification, and management"
  },
  {
    id: "ESM201",
    code: "ESM201",
    title: "Environmental Impact Assessment",
    level: 200,
    semester: 1,
    credits: 3,
    department: "Environmental Studies",
    description: "Methods for assessing environmental impacts"
  },
  {
    id: "ESM202",
    code: "ESM202",
    title: "Water Resource Management",
    level: 200,
    semester: 2,
    credits: 3,
    department: "Environmental Studies",
    description: "Sustainable water resource management practices"
  },
  
  // Level 300 Courses
  {
    id: "AGRI301",
    code: "AGRI301",
    title: "Advanced Crop Production",
    level: 300,
    semester: 1,
    credits: 4,
    department: "Agricultural Sciences",
    description: "Advanced techniques in crop production and management"
  },
  {
    id: "AGRI302",
    code: "AGRI302",
    title: "Plant Breeding and Genetics",
    level: 300,
    semester: 2,
    credits: 4,
    department: "Agricultural Sciences",
    description: "Principles of plant breeding and genetic improvement"
  },
  {
    id: "ESM301",
    code: "ESM301",
    title: "Climate Change and Adaptation",
    level: 300,
    semester: 1,
    credits: 4,
    department: "Environmental Studies",
    description: "Climate change science and adaptation strategies"
  },
  {
    id: "ESM302",
    code: "ESM302",
    title: "Environmental Policy and Law",
    level: 300,
    semester: 2,
    credits: 4,
    department: "Environmental Studies",
    description: "Environmental legislation and policy development"
  },
  
  // Level 400 Courses
  {
    id: "AGRI401",
    code: "AGRI401",
    title: "Agricultural Research Methods",
    level: 400,
    semester: 1,
    credits: 4,
    department: "Agricultural Sciences",
    description: "Research methodology in agricultural sciences"
  },
  {
    id: "AGRI402",
    code: "AGRI402",
    title: "Sustainable Agriculture",
    level: 400,
    semester: 2,
    credits: 4,
    department: "Agricultural Sciences",
    description: "Sustainable farming practices and systems"
  },
  {
    id: "ESM401",
    code: "ESM401",
    title: "Environmental Management Systems",
    level: 400,
    semester: 1,
    credits: 4,
    department: "Environmental Studies",
    description: "Management systems for environmental protection"
  },
  {
    id: "ESM402",
    code: "ESM402",
    title: "Environmental Monitoring and Assessment",
    level: 400,
    semester: 2,
    credits: 4,
    department: "Environmental Studies",
    description: "Advanced environmental monitoring techniques"
  }
];

// Real lecturers data
const lecturers = [
  {
    id: "lec-001",
    name: "Dr. Kwame Asante",
    email: "hanamel.awenateyachumboro@gmail.com", // Using your email for testing
    role: "Lecturer",
    department: "Agricultural Sciences",
    specialization: "Crop Production",
    qualifications: "PhD in Agricultural Sciences",
    phone: "+233-24-123-4567",
    status: "active"
  },
  {
    id: "lec-002",
    name: "Prof. Akosua Mensah",
    email: "akosua.mensah@ucaes.edu.gh",
    role: "Professor",
    department: "Environmental Studies",
    specialization: "Environmental Management",
    qualifications: "PhD in Environmental Science",
    phone: "+233-24-234-5678",
    status: "active"
  },
  {
    id: "lec-003",
    name: "Dr. Kofi Boateng",
    email: "kofi.boateng@ucaes.edu.gh",
    role: "Senior Lecturer",
    department: "Agricultural Sciences",
    specialization: "Soil Science",
    qualifications: "PhD in Soil Science",
    phone: "+233-24-345-6789",
    status: "active"
  },
  {
    id: "lec-004",
    name: "Dr. Ama Osei",
    email: "ama.osei@ucaes.edu.gh",
    role: "Lecturer",
    department: "Environmental Studies",
    specialization: "Climate Change",
    qualifications: "PhD in Climate Science",
    phone: "+233-24-456-7890",
    status: "active"
  }
];

// Real lecturer assignments
const lecturerAssignments = [
  // Dr. Kwame Asante (Current Academic Year - 2024/2025)
  {
    id: "assign-001",
    lecturerId: "lec-001",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-agric",
    courseId: "AGRI101",
    programmeCourseType: "Regular",
    level: 100,
    status: "active"
  },
  {
    id: "assign-002",
    lecturerId: "lec-001",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-agric",
    courseId: "AGRI201",
    programmeCourseType: "Regular",
    level: 200,
    status: "active"
  },
  {
    id: "assign-003",
    lecturerId: "lec-001",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-agric",
    courseId: "AGRI301",
    programmeCourseType: "Regular",
    level: 300,
    status: "active"
  },
  {
    id: "assign-004",
    lecturerId: "lec-001",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-agric",
    courseId: "AGRI401",
    programmeCourseType: "Weekend",
    level: 400,
    status: "active"
  },
  
  // Previous academic year assignments for Dr. Kwame Asante
  {
    id: "assign-005",
    lecturerId: "lec-001",
    academicYearId: "2023-2024",
    academicSemesterId: "2023-2024-sem2",
    programId: "bsc-agric",
    courseId: "AGRI102",
    programmeCourseType: "Regular",
    level: 100,
    status: "completed"
  },
  {
    id: "assign-006",
    lecturerId: "lec-001",
    academicYearId: "2023-2024",
    academicSemesterId: "2023-2024-sem2",
    programId: "bsc-agric",
    courseId: "AGRI202",
    programmeCourseType: "Regular",
    level: 200,
    status: "completed"
  },
  
  // Prof. Akosua Mensah assignments
  {
    id: "assign-007",
    lecturerId: "lec-002",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-env-science",
    courseId: "ESM101",
    programmeCourseType: "Regular",
    level: 100,
    status: "active"
  },
  {
    id: "assign-008",
    lecturerId: "lec-002",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-env-science",
    courseId: "ESM201",
    programmeCourseType: "Regular",
    level: 200,
    status: "active"
  },
  {
    id: "assign-009",
    lecturerId: "lec-002",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-env-science",
    courseId: "ESM301",
    programmeCourseType: "Regular",
    level: 300,
    status: "active"
  },
  
  // Dr. Kofi Boateng assignments
  {
    id: "assign-010",
    lecturerId: "lec-003",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-agric",
    courseId: "AGRI202",
    programmeCourseType: "Weekend",
    level: 200,
    status: "active"
  },
  
  // Dr. Ama Osei assignments
  {
    id: "assign-011",
    lecturerId: "lec-004",
    academicYearId: "2024-2025",
    academicSemesterId: "2024-2025-sem1",
    programId: "bsc-env-science",
    courseId: "ESM301",
    programmeCourseType: "Weekend",
    level: 300,
    status: "active"
  }
];

// System configuration
const systemConfig = {
  id: "academicPeriod",
  currentAcademicYear: "2024/2025",
  currentAcademicYearId: "2024-2025",
  currentSemester: "Semester 1",
  currentSemesterId: "2024-2025-sem1",
  lastUpdated: serverTimestamp()
};

// Function to clear and seed a collection
async function seedCollection(collectionName, data, customDocId = null) {
  console.log(`🔄 Seeding ${collectionName} collection...`);
  
  try {
    // Clear existing data
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = [];
    
    snapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`🗑️  Cleared ${deletePromises.length} documents from ${collectionName}`);
    }
    
    // Add new data
    const batch = writeBatch(db);
    
    if (Array.isArray(data)) {
      for (const item of data) {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } else {
      // Single document (like system config)
      const docRef = doc(db, collectionName, customDocId || "default");
      batch.set(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`✅ Added ${Array.isArray(data) ? data.length : 1} documents to ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error seeding ${collectionName}:`, error);
    throw error;
  }
}

// Main function to populate all data
async function populateAcademicData() {
  try {
    console.log("🚀 Starting real academic data population...\n");
    
    // Seed all collections
    await seedCollection('academic-years', academicYears);
    await seedCollection('academic-semesters', academicSemesters);
    await seedCollection('academic-programs', academicPrograms);
    await seedCollection('academic-courses', academicCourses);
    await seedCollection('users', lecturers);
    await seedCollection('lecturer-assignments', lecturerAssignments);
    await seedCollection('systemConfig', systemConfig, 'academicPeriod');
    
    console.log('\n🎉 All real academic data populated successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Academic Years: ${academicYears.length}`);
    console.log(`   - Academic Semesters: ${academicSemesters.length}`);
    console.log(`   - Academic Programs: ${academicPrograms.length}`);
    console.log(`   - Academic Courses: ${academicCourses.length}`);
    console.log(`   - Lecturers: ${lecturers.length}`);
    console.log(`   - Lecturer Assignments: ${lecturerAssignments.length}`);
    console.log(`   - Current Academic Period: ${systemConfig.currentAcademicYear} ${systemConfig.currentSemester}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating academic data:', error);
    process.exit(1);
  }
}

// Run the population process
populateAcademicData();























