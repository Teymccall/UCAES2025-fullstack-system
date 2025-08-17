import { getDb } from './firebase-admin';

// Programs offered by the college - server-side data (embedded to avoid client-side import issues)
const COLLEGE_PROGRAMS = [
  {
    name: "B.Sc. Sustainable Agriculture",
    code: "BSA",
    department: "Agriculture",
    coordinator: "Dr. Kwame Boateng",
    entryRequirements: "WASSCE with credits in English, Mathematics, and Science subjects",
    duration: "4 years",
    description: "Comprehensive program covering sustainable agricultural practices, crop production, soil management, and ecological farming systems.",
    status: "Active",
    coursesPerLevel: {
      "100": {
        "1": [],
        "2": []
      },
      "200": {
        "1": [],
        "2": []
      },
      "300": {
        "1": [],
        "2": []
      },
      "400": {
        "1": [],
        "2": []
      }
    }
  },
  {
    name: "B.Sc. Sustainable Forestry",
    code: "BSF",
    department: "Forestry",
    coordinator: "Prof. Ama Serwaa",
    entryRequirements: "WASSCE with credits in English, Mathematics, and Science subjects",
    duration: "4 years",
    description: "Study of forest ecosystems, conservation, sustainable timber harvesting, and forest resource management.",
    status: "Active",
    coursesPerLevel: {
      "100": {
        "1": [],
        "2": []
      },
      "200": {
        "1": [],
        "2": []
      },
      "300": {
        "1": [],
        "2": []
      },
      "400": {
        "1": [],
        "2": []
      }
    }
  },
  {
    name: "B.Sc. Environmental Science and Management",
    code: "BESM",
    department: "Environmental Science",
    coordinator: "Dr. Samuel Adjei",
    entryRequirements: "WASSCE with credits in English, Mathematics, and Science subjects",
    duration: "4 years",
    description: "Study of environmental systems, climate change, pollution control, and sustainable natural resource management.",
    status: "Active",
    coursesPerLevel: {
      "100": {
        "1": [],
        "2": []
      },
      "200": {
        "1": [],
        "2": []
      },
      "300": {
        "1": [],
        "2": []
      },
      "400": {
        "1": [],
        "2": []
      }
    }
  }
];

/**
 * Initialize the database with required data
 * This should be called at the application startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Starting Firebase database initialization...');
    
    // Initialize programs
    await initializePrograms();
    
    // Initialize current academic year and semester if they don't exist
    await initializeAcademicPeriod();
    
    // Log database initialization
    await logDatabaseInitialization();
    
    console.log('Firebase database initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Initialize programs in Firebase
 */
async function initializePrograms(): Promise<void> {
  try {
    // Check if we already have programs
    const adminDb = getDb();
    const programsCollection = adminDb.collection('programs');
    const programsSnapshot = await programsCollection.get();
    const existingPrograms = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const existingProgramCodes = existingPrograms.map(p => p.code);
    
    // For each of our predefined programs
    for (const program of COLLEGE_PROGRAMS) {
      // If this program code doesn't exist yet, add it
      if (!existingProgramCodes.includes(program.code)) {
        const newProgram = {
          name: program.name,
          code: program.code,
          department: program.department,
          faculty: program.department, // Using department as faculty for now
          description: program.description,
          entryRequirements: program.entryRequirements,
          durationYears: parseInt(program.duration.split(' ')[0]),
          type: 'degree',
          credits: 120, // Default value
          status: program.status.toLowerCase(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add to Firestore with program code as document ID
        await programsCollection.doc(program.code).set(newProgram);
        console.log(`Program added to Firebase: ${program.name} (${program.code})`);
      } else {
        console.log(`Program already exists in Firebase: ${program.code}`);
      }
    }
    
    console.log('Program initialization in Firebase complete.');
  } catch (error) {
    console.error('Error initializing programs in Firebase:', error);
    throw error;
  }
}

/**
 * Initialize the current academic year and semester if they don't exist
 */
async function initializeAcademicPeriod(): Promise<void> {
  try {
    const currentYear = new Date().getFullYear();
    const academicYearStr = `${currentYear}/${currentYear + 1}`;
    
    // Check if current academic year exists
    const adminDb = getDb();
    const academicYearsCollection = adminDb.collection('academic-years');
    const academicYearDoc = academicYearsCollection.doc(academicYearStr);
    const academicYearSnapshot = await academicYearDoc.get();
    
    if (!academicYearSnapshot.exists) {
      // Add the current academic year
      const newAcademicYear = {
        year: academicYearStr,
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-08-31`),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await academicYearDoc.set(newAcademicYear);
      console.log(`Initialized academic year in Firebase: ${academicYearStr}`);
    }
    
    // Initialize semesters if needed
    const semestersCollection = adminDb.collection('semesters');
    const semestersQuery = semestersCollection.where('academicYear', '==', academicYearStr);
    const semestersSnapshot = await semestersQuery.get();
    
    if (semestersSnapshot.empty) {
      // Add first and second semesters
      const firstSemester = {
        academicYear: academicYearStr,
        name: 'First Semester',
        number: '1',
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-01-15`),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const secondSemester = {
        academicYear: academicYearStr,
        name: 'Second Semester',
        number: '2',
        startDate: new Date(`${currentYear + 1}-02-01`),
        endDate: new Date(`${currentYear + 1}-06-30`),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await Promise.all([
        semestersCollection.doc(`${academicYearStr}-1`).set(firstSemester),
        semestersCollection.doc(`${academicYearStr}-2`).set(secondSemester)
      ]);
      
      console.log(`Initialized semesters for academic year in Firebase: ${academicYearStr}`);
    }
  } catch (error) {
    console.error('Error initializing academic period in Firebase:', error);
  }
}

// Log database initialization as a system audit
async function logDatabaseInitialization(): Promise<void> {
  try {
    const adminDb = getDb();
    const auditLogsCollection = adminDb.collection('audit-logs');
    const auditLog = {
      action: 'DATABASE_INITIALIZATION',
      entity: 'System',
      entityId: 'system',
      details: 'Database initialized with programs and academic periods',
      status: 'success',
      userType: 'system',
      timestamp: new Date()
    };
    
    await auditLogsCollection.add(auditLog);
  } catch (error) {
    console.error('Error logging database initialization:', error);
  }
}

// Only export this for server-side use
export async function initializeDatabaseIfNeeded() {
  if (typeof window === 'undefined') {
    await initializeDatabase();
  }
}