const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  let serviceAccount;
  try {
    // Look for service account key in several locations
    const possiblePaths = [
      '../serviceAccountKey.json', 
      '../../new student portal/serviceAccountKey.json',
      '../../new student information/serviceAccountKey.json'
    ];
    
    for (const relativePath of possiblePaths) {
      try {
        const fullPath = path.join(__dirname, relativePath);
        if (fs.existsSync(fullPath)) {
          serviceAccount = require(fullPath);
          console.log(`Using service account from: ${relativePath}`);
          break;
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    // If no file found, check for environment variable
    if (!serviceAccount) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('Using service account from environment variable');
      } else {
        throw new Error('No service account key found');
      }
    }
  } catch (err) {
    console.log('Service account key not found, checking for environment variable...');
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      throw new Error('No service account key found');
    }
  }

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
    projectId: 'ucaes2025'
  });

  console.log('Firebase Admin initialized successfully for project: ucaes2025');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// Sample data for academic programs
const programs = [
  {
    name: 'Bachelor of Science in Agriculture',
    code: 'BSC-AGR',
    faculty: 'Agriculture',
    department: 'Agriculture Science',
    type: 'degree',
    description: 'A comprehensive program covering all aspects of agricultural science and technology.',
    durationYears: 4,
    credits: 140,
    entryRequirements: 'High school diploma with science subjects and minimum GPA of 3.0',
    status: 'active',
  },
  {
    name: 'Diploma in Environmental Studies',
    code: 'DIP-ENV',
    faculty: 'Environmental Studies',
    department: 'Environmental Science',
    type: 'diploma',
    description: 'A program focused on understanding environmental challenges and sustainable solutions.',
    durationYears: 2,
    credits: 80,
    entryRequirements: 'High school diploma with minimum GPA of 2.5',
    status: 'active',
  },
  {
    name: 'Master of Science in Agricultural Economics',
    code: 'MSC-AGEC',
    faculty: 'Agriculture',
    department: 'Agricultural Economics',
    type: 'master',
    description: 'Advanced study of economic principles applied to agricultural production and markets.',
    durationYears: 2,
    credits: 60,
    entryRequirements: "Bachelor's degree in Agriculture or Economics with minimum GPA of 3.5",
    status: 'active',
  }
];

// Sample data for courses
const courses = [
  {
    code: 'AGR101',
    title: 'Introduction to Agriculture',
    description: 'Foundational course covering the basics of agricultural science and practices.',
    credits: 3,
    level: 100,
    semester: 1,
    department: 'Agriculture Science',
    prerequisites: [],
    programId: '', // Will be filled after programs are created
    status: 'active',
  },
  {
    code: 'AGR201',
    title: 'Soil Science',
    description: 'Study of soil properties and their relationships to plant growth and environmental quality.',
    credits: 4,
    level: 200,
    semester: 1,
    department: 'Agriculture Science',
    prerequisites: ['AGR101'],
    programId: '', // Will be filled after programs are created
    status: 'active',
  },
  {
    code: 'ENV101',
    title: 'Introduction to Environmental Science',
    description: 'Overview of environmental issues and the scientific principles behind them.',
    credits: 3,
    level: 100,
    semester: 1,
    department: 'Environmental Science',
    prerequisites: [],
    programId: '', // Will be filled after programs are created
    status: 'active',
  },
  {
    code: 'AGEC501',
    title: 'Agricultural Market Analysis',
    description: 'Advanced study of agricultural markets and price determination.',
    credits: 3,
    level: 500,
    semester: 1,
    department: 'Agricultural Economics',
    prerequisites: [],
    programId: '', // Will be filled after programs are created
    status: 'active',
  }
];

// Sample data for academic years
const academicYears = [
  {
    year: '2023-2024',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-06-30'),
    status: 'completed',
  },
  {
    year: '2024-2025',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-06-30'),
    status: 'active',
  },
  {
    year: '2025-2026',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2026-06-30'),
    status: 'upcoming',
  }
];

// Sample data for semesters
const semesters = [
  // 2023-2024 Semesters
  {
    academicYear: '2023-2024', // Will be replaced with actual ID
    name: 'First Semester 2023/2024',
    number: '1',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2023-12-15'),
    status: 'completed',
  },
  {
    academicYear: '2023-2024', // Will be replaced with actual ID
    name: 'Second Semester 2023/2024',
    number: '2',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    status: 'completed',
  },
  // 2024-2025 Semesters
  {
    academicYear: '2024-2025', // Will be replaced with actual ID
    name: 'First Semester 2024/2025',
    number: '1',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    status: 'active',
  },
  {
    academicYear: '2024-2025', // Will be replaced with actual ID
    name: 'Second Semester 2024/2025',
    number: '2',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-06-30'),
    status: 'upcoming',
  }
];

// Sample data for staff members
const staffMembers = [
  {
    staffId: 'STAFF001',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Agriculture Science',
    position: 'Professor',
    assignedCourses: ['AGR101', 'AGR201'],
    permissions: ['course_management', 'result_entry', 'student_records', 'academic_administration'],
    status: 'active',
  },
  {
    staffId: 'STAFF002',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@university.edu',
    department: 'Environmental Science',
    position: 'Associate Professor',
    assignedCourses: ['ENV101'],
    permissions: ['course_management', 'result_entry'],
    status: 'active',
  },
  {
    staffId: 'STAFF003',
    name: 'Dr. John Adams',
    email: 'john.adams@university.edu',
    department: 'Agricultural Economics',
    position: 'Assistant Professor',
    assignedCourses: ['AGEC501'],
    permissions: ['course_management', 'result_entry'],
    status: 'active',
  },
  {
    staffId: 'STAFF004',
    name: 'Admin User',
    email: 'admin@university.edu',
    department: 'Administration',
    position: 'Academic Affairs Director',
    assignedCourses: [],
    permissions: ['admin', 'staff_management', 'program_management'],
    status: 'active',
  }
];

// Function to add a batch of documents to a collection
async function addBatch(collectionName, documents, timestamp = true) {
  const batch = db.batch();
  
  documents.forEach(doc => {
    const docRef = db.collection(collectionName).doc();
    const docData = { 
      ...doc,
      ...(timestamp ? { createdAt: new Date() } : {})
    };
    batch.set(docRef, docData);
  });
  
  await batch.commit();
  console.log(`Added ${documents.length} documents to ${collectionName}`);
}

// Main function to seed data
async function seedData() {
  try {
    // Step 1: Clear existing data (optional - uncomment if needed)
    console.log('Clearing existing data...');
    
    // const collections = ['academic-programs', 'academic-courses', 'academic-years', 'academic-semesters', 'academic-staff'];
    // for (const collection of collections) {
    //   const snapshot = await db.collection(collection).get();
    //   const batch = db.batch();
    //   snapshot.docs.forEach((doc) => {
    //     batch.delete(doc.ref);
    //   });
    //   await batch.commit();
    //   console.log(`Deleted all documents in ${collection}`);
    // }
    
    // Step 2: Add programs
    console.log('Adding academic programs...');
    const programRefs = {};
    for (const program of programs) {
      const docRef = await db.collection('academic-programs').add({
        ...program,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      programRefs[program.code] = docRef.id;
      console.log(`Added program ${program.name} with ID: ${docRef.id}`);
    }
    
    // Step 3: Add courses with program references
    console.log('Adding academic courses...');
    const courseData = courses.map(course => {
      let programId = '';
      
      if (course.code.startsWith('AGR')) {
        programId = programRefs['BSC-AGR'];
      } else if (course.code.startsWith('ENV')) {
        programId = programRefs['DIP-ENV'];
      } else if (course.code.startsWith('AGEC')) {
        programId = programRefs['MSC-AGEC'];
      }
      
      return {
        ...course,
        programId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    await addBatch('academic-courses', courseData, false);
    
    // Step 4: Add academic years
    console.log('Adding academic years...');
    const yearRefs = {};
    for (const year of academicYears) {
      const docRef = await db.collection('academic-years').add({
        ...year,
        createdAt: new Date()
      });
      yearRefs[year.year] = docRef.id;
      console.log(`Added academic year ${year.year} with ID: ${docRef.id}`);
    }
    
    // Step 5: Add semesters with year references
    console.log('Adding semesters...');
    const semesterData = semesters.map(semester => {
      return {
        ...semester,
        academicYear: yearRefs[semester.academicYear],
        createdAt: new Date()
      };
    });
    
    await addBatch('academic-semesters', semesterData, false);
    
    // Step 6: Add staff members
    console.log('Adding staff members...');
    await addBatch('academic-staff', staffMembers);
    
    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
seedData().then(() => {
  console.log('Seeding process finished');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
}); 