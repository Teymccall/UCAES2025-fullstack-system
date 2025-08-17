// Curriculum data seeding script
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

// Main function to seed detailed curriculum data
async function seedCurriculumData() {
  try {
    console.log("Starting curriculum data seeding...");
    
    // Step 1: Get existing programs to reference them
    const programsSnapshot = await db.collection('academic-programs').get();
    const programsMap = {};
    
    programsSnapshot.docs.forEach(doc => {
      const programData = doc.data();
      programsMap[programData.code] = doc.id;
    });
    
    // If programs don't exist yet, create them
    if (!programsMap['BSC-AGRI']) {
      const agriProgramRef = await db.collection('academic-programs').add({
        name: 'BSc. Sustainable Agriculture',
        code: 'BSC-AGRI',
        faculty: 'Agriculture',
        department: 'Agriculture Science',
        type: 'degree',
        description: 'A program focused on sustainable agricultural practices and food production systems.',
        durationYears: 4,
        credits: 140,
        entryRequirements: 'High school diploma with science subjects and minimum GPA of 3.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      programsMap['BSC-AGRI'] = agriProgramRef.id;
      console.log('Created BSc. Sustainable Agriculture program with ID:', agriProgramRef.id);
    }
    
    if (!programsMap['BSC-ESM']) {
      const esmProgramRef = await db.collection('academic-programs').add({
        name: 'BSc. Environmental Science and Management',
        code: 'BSC-ESM',
        faculty: 'Environmental Studies',
        department: 'Environmental Science',
        type: 'degree',
        description: 'A program focused on environmental science, sustainability, and natural resource management.',
        durationYears: 4,
        credits: 140,
        entryRequirements: 'High school diploma with science subjects and minimum GPA of 3.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      programsMap['BSC-ESM'] = esmProgramRef.id;
      console.log('Created BSc. Environmental Science and Management program with ID:', esmProgramRef.id);
    }
    
    // Step 2: Define specializations
    const agriSpecializations = [
      {
        name: 'Agronomy',
        code: 'AGRONOMY',
        programId: programsMap['BSC-AGRI'],
        description: 'Specialization in crop science and soil management',
        year: 4
      },
      {
        name: 'Animal Science',
        code: 'ANIMAL',
        programId: programsMap['BSC-AGRI'],
        description: 'Specialization in animal production and management',
        year: 4
      },
      {
        name: 'Agricultural Economics and Extension',
        code: 'AGRI-ECON',
        programId: programsMap['BSC-AGRI'],
        description: 'Specialization in agricultural economics, marketing, and extension services',
        year: 4
      },
      {
        name: 'Horticulture Science and Systems',
        code: 'HORT',
        programId: programsMap['BSC-AGRI'],
        description: 'Specialization in horticultural crops and systems',
        year: 4
      }
    ];
    
    const esmSpecializations = [
      {
        name: 'Limnology and Oceanography',
        code: 'LIMN',
        programId: programsMap['BSC-ESM'],
        description: 'Specialization in aquatic ecosystems and marine science',
        year: 4
      },
      {
        name: 'Forests and Forest Resources Management',
        code: 'FOREST',
        programId: programsMap['BSC-ESM'],
        description: 'Specialization in forestry and forest resource management',
        year: 4
      },
      {
        name: 'Environmental Health and Safety',
        code: 'ENV-HEALTH',
        programId: programsMap['BSC-ESM'],
        description: 'Specialization in environmental health and waste management',
        year: 4
      },
      {
        name: 'Mining and Mineral Resources',
        code: 'MINING',
        programId: programsMap['BSC-ESM'],
        description: 'Specialization in mining operations and mineral resource management',
        year: 4
      },
      {
        name: 'Renewable and Non-Renewable Energy',
        code: 'ENERGY',
        programId: programsMap['BSC-ESM'],
        description: 'Specialization in energy systems and management',
        year: 4
      }
    ];
    
    // Store specializations in a new collection
    await addBatch('program-specializations', [...agriSpecializations, ...esmSpecializations]);
    
    // Step 3: Add sample courses for BSc. Sustainable Agriculture Year 1
    const agriY1S1Courses = [
      {
        code: 'AGM 151',
        title: 'Introduction to Soil Science',
        description: 'Basic principles of soil science and soil properties',
        credits: 3,
        theoryHours: 2,
        practicalHours: 2,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Agriculture Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AGM 153',
        title: 'Introductory Botany',
        description: 'Introduction to plant biology and botany',
        credits: 2,
        theoryHours: 2,
        practicalHours: 0,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Agriculture Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AGM 155',
        title: 'Principles of Crop Production',
        description: 'Fundamental principles of crop production systems',
        credits: 2,
        theoryHours: 2,
        practicalHours: 0,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Agriculture Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ESM 151',
        title: 'Principles of Biochemistry',
        description: 'Introduction to biochemical principles and processes',
        credits: 3,
        theoryHours: 2,
        practicalHours: 2,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Environmental Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ESM 155',
        title: 'Introduction to Climatology',
        description: 'Basic principles of climatology and climate science',
        credits: 2,
        theoryHours: 2,
        practicalHours: 0,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Environmental Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Add sample courses for BSc. Environmental Science Year 1
    const esmY1S1Courses = [
      {
        code: 'ESM 151',
        title: 'Principles of Biochemistry',
        description: 'Introduction to biochemical principles and processes',
        credits: 3,
        theoryHours: 2,
        practicalHours: 3,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Environmental Science',
        prerequisites: [],
        programId: programsMap['BSC-ESM'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ESM 153',
        title: 'Principles of Environmental Science I',
        description: 'Introduction to environmental science principles',
        credits: 2,
        theoryHours: 2,
        practicalHours: 0,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Environmental Science',
        prerequisites: [],
        programId: programsMap['BSC-ESM'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ESM 155',
        title: 'Introduction to Climatology',
        description: 'Basic principles of climatology and climate science',
        credits: 2,
        theoryHours: 2,
        practicalHours: 0,
        level: 100,
        semester: 1,
        year: 1,
        department: 'Environmental Science',
        prerequisites: [],
        programId: programsMap['BSC-ESM'],
        isCore: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Add a sample advanced level/specialization course
    const agriSpecializationCourses = [
      {
        code: 'AGM 453',
        title: 'Seminar I',
        description: 'Research seminar for final year students',
        credits: 1,
        theoryHours: 0,
        practicalHours: 2,
        level: 400,
        semester: 1,
        year: 4,
        department: 'Agriculture Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        specialization: 'AGRONOMY',
        isCore: true,
        courseGroup: 'Core',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AGM 459',
        title: 'Principles of Crop Biotechnology',
        description: 'Advanced principles of biotechnology applied to crop improvement',
        credits: 3,
        theoryHours: 3,
        practicalHours: 0,
        level: 400,
        semester: 1,
        year: 4,
        department: 'Agriculture Science',
        prerequisites: [],
        programId: programsMap['BSC-AGRI'],
        specialization: 'AGRONOMY',
        isCore: false,
        courseGroup: 'Group A',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Add all courses to the database
    await addBatch('academic-courses', [
      ...agriY1S1Courses,
      ...esmY1S1Courses,
      ...agriSpecializationCourses
    ]);
    
    // Step 4: Create a curriculum structure to link everything together
    const curriculumStructure = {
      'BSC-AGRI': {
        programId: programsMap['BSC-AGRI'],
        structure: [
          {
            year: 1,
            semester: 1,
            totalCredits: 18,
            courses: agriY1S1Courses.map(c => c.code)
          },
          {
            year: 4,
            semester: 1,
            specialization: 'AGRONOMY',
            coreCourses: agriSpecializationCourses.filter(c => c.isCore).map(c => c.code),
            electiveGroups: {
              'Group A': agriSpecializationCourses.filter(c => c.courseGroup === 'Group A').map(c => c.code)
            }
          }
        ]
      },
      'BSC-ESM': {
        programId: programsMap['BSC-ESM'],
        structure: [
          {
            year: 1,
            semester: 1,
            totalCredits: 18,
            courses: esmY1S1Courses.map(c => c.code)
          }
        ]
      }
    };
    
    // Save curriculum structure
    await db.collection('curriculum-structure').doc('BSC-AGRI').set(curriculumStructure['BSC-AGRI']);
    await db.collection('curriculum-structure').doc('BSC-ESM').set(curriculumStructure['BSC-ESM']);
    
    // Step 5: Add academic calendar information
    const academicCalendar = {
      regularSemesters: [
        {
          name: 'First Semester',
          period: 'September to December',
          registrationStart: new Date('2024-08-01'),
          registrationEnd: new Date('2024-08-31'),
          classesStart: new Date('2024-09-01'),
          classesEnd: new Date('2024-12-15'),
          examStart: new Date('2024-12-01'),
          examEnd: new Date('2024-12-20')
        },
        {
          name: 'Second Semester',
          period: 'February to May',
          registrationStart: new Date('2025-01-15'),
          registrationEnd: new Date('2025-01-31'),
          classesStart: new Date('2025-02-01'),
          classesEnd: new Date('2025-05-15'),
          examStart: new Date('2025-05-01'),
          examEnd: new Date('2025-05-20')
        }
      ],
      weekendSemesters: [
        {
          name: 'First Trimester',
          period: 'October to December',
          registrationStart: new Date('2024-09-15'),
          registrationEnd: new Date('2024-09-30'),
          classesStart: new Date('2024-10-01'),
          classesEnd: new Date('2024-12-15'),
          examStart: new Date('2024-12-01'),
          examEnd: new Date('2024-12-20')
        },
        {
          name: 'Second Trimester',
          period: 'February to May',
          registrationStart: new Date('2025-01-15'),
          registrationEnd: new Date('2025-01-31'),
          classesStart: new Date('2025-02-01'),
          classesEnd: new Date('2025-05-15'),
          examStart: new Date('2025-05-01'),
          examEnd: new Date('2025-05-20')
        },
        {
          name: 'Third Trimester',
          period: 'June to August',
          registrationStart: new Date('2025-05-15'),
          registrationEnd: new Date('2025-05-31'),
          classesStart: new Date('2025-06-01'),
          classesEnd: new Date('2025-08-15'),
          examStart: new Date('2025-08-01'),
          examEnd: new Date('2025-08-20')
        }
      ]
    };
    
    // Save academic calendar
    await db.collection('academic-calendar').doc('2024-2025').set({
      ...academicCalendar,
      year: '2024-2025',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Curriculum data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding curriculum data:', error);
  }
}

// Run the seeding function
seedCurriculumData().then(() => {
  console.log('Curriculum seeding process finished');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error during curriculum seeding:', error);
  process.exit(1);
});