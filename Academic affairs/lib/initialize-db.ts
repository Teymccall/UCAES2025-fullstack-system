import { connectToDatabase, mongoose } from './mongodb';
import { Program, Course, AcademicYear, Semester, Staff, AuditLog } from './models';
import { COLLEGE_PROGRAMS } from './programs-db';

/**
 * Initialize the database with required data
 * This should be called at the application startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Starting MongoDB database initialization...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Initialize programs
    await initializePrograms();
    
    // Initialize current academic year and semester if they don't exist
    await initializeAcademicPeriod();
    
    // Log database initialization
    await logDatabaseInitialization();
    
    console.log('MongoDB database initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Initialize programs in MongoDB
 */
async function initializePrograms(): Promise<void> {
  try {
    // Check if we already have programs
    const existingPrograms = await Program.find({}).lean();
    const existingProgramCodes = existingPrograms.map(p => p.code);
    
    // For each of our predefined programs
    for (const program of COLLEGE_PROGRAMS) {
      // If this program code doesn't exist yet, add it
      if (!existingProgramCodes.includes(program.code)) {
        const newProgram = new Program({
          name: program.name,
          code: program.code,
          department: program.department,
          faculty: program.department, // Using department as faculty for now
          description: program.description,
          entryRequirements: program.entryRequirements,
          durationYears: parseInt(program.duration.split(' ')[0]),
          type: 'degree',
          credits: 120, // Default value
          status: program.status.toLowerCase()
        });
        
        await newProgram.save();
        console.log(`Program added to MongoDB: ${program.name} (${program.code})`);
      } else {
        console.log(`Program already exists in MongoDB: ${program.code}`);
      }
    }
    
    console.log('Program initialization in MongoDB complete.');
  } catch (error) {
    console.error('Error initializing programs in MongoDB:', error);
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
    const existingYear = await AcademicYear.findOne({ year: academicYearStr });
    
    if (!existingYear) {
      // Add the current academic year
      const newAcademicYear = new AcademicYear({
        year: academicYearStr,
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-08-31`),
        status: 'active'
      });
      
      await newAcademicYear.save();
      console.log(`Initialized academic year in MongoDB: ${academicYearStr}`);
    }
    
    // Initialize semesters if needed
    const existingSemesters = await Semester.find({ academicYear: academicYearStr });
    
    if (existingSemesters.length === 0) {
      // Add first and second semesters
      const firstSemester = new Semester({
        academicYear: academicYearStr,
        name: 'First Semester',
        number: '1',
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-01-15`),
        status: 'active'
      });
      
      const secondSemester = new Semester({
        academicYear: academicYearStr,
        name: 'Second Semester',
        number: '2',
        startDate: new Date(`${currentYear + 1}-02-01`),
        endDate: new Date(`${currentYear + 1}-06-30`),
        status: 'pending'
      });
      
      await Promise.all([
        firstSemester.save(),
        secondSemester.save()
      ]);
      
      console.log(`Initialized semesters for academic year in MongoDB: ${academicYearStr}`);
    }
  } catch (error) {
    console.error('Error initializing academic period in MongoDB:', error);
  }
}

// Log database initialization as a system audit
async function logDatabaseInitialization(): Promise<void> {
  try {
    const auditLog = new AuditLog({
      action: 'DATABASE_INITIALIZATION',
      entity: 'System',
      entityId: 'system',
      details: 'Database initialized with programs and academic periods',
      status: 'success',
      userType: 'system'
    });
    
    await auditLog.save();
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