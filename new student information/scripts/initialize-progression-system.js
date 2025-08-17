/**
 * Initialize Student Level Progression System
 * Phase 1: Foundation - Set up progression tracking without affecting existing data
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '..', '..', 'ucaes2025-firebase-adminsdk-fbsvc-786e076637.json');
  
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

// Collection names
const COLLECTIONS = {
  PROGRESSION_RULES: "progression-rules",
  STUDENT_PROGRESS: "student-progress", 
  PROGRESSION_HISTORY: "progression-history",
  ACADEMIC_PERIODS: "academic-periods",
  PROGRESSION_BATCHES: "progression-batches",
  PROGRESSION_LOGS: "progression-logs",
  STUDENTS: "students",
  STUDENT_REGISTRATIONS: "student-registrations"
};

/**
 * Initialize progression rules
 */
async function initializeProgressionRules() {
  console.log("🔧 Initializing progression rules...");
  
  const rulesRef = db.collection(COLLECTIONS.PROGRESSION_RULES);
  
  // Check if rules already exist
  const existingRules = await rulesRef.get();
  if (!existingRules.empty) {
    console.log("✅ Progression rules already exist, skipping initialization");
    return;
  }
  
  // Default rules based on requirements
  const defaultRules = [
    {
      scheduleType: "Regular",
      requiredPeriods: 2,
      progressionMonth: 9, // September
      progressionDay: 1,
      academicYearStartMonth: 9, // September
      periodNames: ["First Semester", "Second Semester"],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      scheduleType: "Weekend", 
      requiredPeriods: 3,
      progressionMonth: 10, // October
      progressionDay: 1,
      academicYearStartMonth: 10, // October
      periodNames: ["First Trimester", "Second Trimester", "Third Trimester"],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  for (const rule of defaultRules) {
    const docRef = await rulesRef.add(rule);
    console.log(`✅ Created progression rule for ${rule.scheduleType} students: ${docRef.id}`);
  }
  
  console.log("✅ Progression rules initialized successfully");
}

/**
 * Create sample academic periods for current academic year
 */
async function initializeAcademicPeriods() {
  console.log("🔧 Creating sample academic periods...");
  
  const periodsRef = db.collection(COLLECTIONS.ACADEMIC_PERIODS);
  
  // Check if periods already exist
  const existingPeriods = await periodsRef.get();
  if (!existingPeriods.empty) {
    console.log("✅ Academic periods already exist, skipping initialization");
    return;
  }
  
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}/${currentYear + 1}`;
  
  // Sample periods for current academic year
  const samplePeriods = [
    // Regular schedule periods
    {
      name: `First Semester ${academicYear}`,
      type: "semester",
      scheduleType: "Regular",
      academicYear: academicYear,
      periodNumber: 1,
      startDate: new Date(currentYear, 8, 1), // September 1
      endDate: new Date(currentYear, 11, 15), // December 15
      registrationStartDate: new Date(currentYear, 7, 15), // August 15
      registrationEndDate: new Date(currentYear, 8, 15), // September 15
      status: "active",
      isProgressionPeriod: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: `Second Semester ${academicYear}`,
      type: "semester", 
      scheduleType: "Regular",
      academicYear: academicYear,
      periodNumber: 2,
      startDate: new Date(currentYear + 1, 1, 15), // February 15
      endDate: new Date(currentYear + 1, 4, 31), // May 31
      registrationStartDate: new Date(currentYear + 1, 0, 1), // January 1
      registrationEndDate: new Date(currentYear + 1, 1, 28), // February 28
      status: "upcoming",
      isProgressionPeriod: true, // Progression happens after this period
      progressionDate: new Date(currentYear + 1, 8, 1), // September 1 next year
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    
    // Weekend schedule periods
    {
      name: `First Trimester ${academicYear}`,
      type: "trimester",
      scheduleType: "Weekend", 
      academicYear: academicYear,
      periodNumber: 1,
      startDate: new Date(currentYear, 9, 1), // October 1
      endDate: new Date(currentYear, 11, 31), // December 31
      registrationStartDate: new Date(currentYear, 8, 15), // September 15
      registrationEndDate: new Date(currentYear, 9, 15), // October 15
      status: "active",
      isProgressionPeriod: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: `Second Trimester ${academicYear}`,
      type: "trimester",
      scheduleType: "Weekend",
      academicYear: academicYear,
      periodNumber: 2,
      startDate: new Date(currentYear + 1, 1, 1), // February 1
      endDate: new Date(currentYear + 1, 4, 31), // May 31
      registrationStartDate: new Date(currentYear + 1, 0, 15), // January 15
      registrationEndDate: new Date(currentYear + 1, 1, 15), // February 15
      status: "upcoming",
      isProgressionPeriod: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: `Third Trimester ${academicYear}`,
      type: "trimester",
      scheduleType: "Weekend",
      academicYear: academicYear,
      periodNumber: 3,
      startDate: new Date(currentYear + 1, 5, 1), // June 1
      endDate: new Date(currentYear + 1, 7, 31), // August 31
      registrationStartDate: new Date(currentYear + 1, 4, 15), // May 15
      registrationEndDate: new Date(currentYear + 1, 5, 15), // June 15
      status: "upcoming",
      isProgressionPeriod: true, // Progression happens after this period
      progressionDate: new Date(currentYear + 1, 9, 1), // October 1 next year
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  for (const period of samplePeriods) {
    const docRef = await periodsRef.add(period);
    console.log(`✅ Created academic period: ${period.name} (${docRef.id})`);
  }
  
  console.log("✅ Academic periods initialized successfully");
}

/**
 * Initialize progression tracking for existing students
 */
async function initializeExistingStudents() {
  console.log("🔧 Initializing progression tracking for existing students...");
  
  // Get all existing students from student-registrations
  const studentsRef = db.collection(COLLECTIONS.STUDENT_REGISTRATIONS);
  const studentsSnapshot = await studentsRef.where("status", "==", "approved").get();
  
  if (studentsSnapshot.empty) {
    console.log("📝 No approved students found to initialize");
    return;
  }
  
  console.log(`📊 Found ${studentsSnapshot.size} approved students to initialize`);
  
  const progressRef = db.collection(COLLECTIONS.STUDENT_PROGRESS);
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}/${currentYear + 1}`;
  
  let initializedCount = 0;
  
  for (const studentDoc of studentsSnapshot.docs) {
    const studentData = studentDoc.data();
    const studentId = studentData.registrationNumber || studentDoc.id;
    
    try {
      // Check if progress record already exists
      const existingProgress = await progressRef
        .where("studentId", "==", studentId)
        .where("academicYear", "==", academicYear)
        .get();
      
      if (!existingProgress.empty) {
        console.log(`⏭️ Progress record already exists for student ${studentId}`);
        continue;
      }
      
      // Create initial progress record
      const progressData = {
        studentId: studentId,
        studentEmail: studentData.email || "",
        academicYear: academicYear,
        scheduleType: studentData.scheduleType || "Regular",
        currentLevel: studentData.currentLevel || studentData.entryLevel || "100",
        entryLevel: studentData.entryLevel || "100",
        periodsCompleted: [],
        progressionStatus: "not-eligible",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: "system-initialization"
      };
      
      const progressDocRef = await progressRef.add(progressData);
      
      console.log(`✅ Created progress record for student ${studentId} (${studentData.surname} ${studentData.otherNames}): ${progressDocRef.id}`);
      initializedCount++;
      
    } catch (error) {
      console.error(`❌ Error creating progress record for student ${studentId}:`, error.message);
    }
  }
  
  console.log(`✅ Initialized progression tracking for ${initializedCount} students`);
}

/**
 * Log initialization
 */
async function logInitialization() {
  console.log("📝 Logging system initialization...");
  
  const logsRef = db.collection(COLLECTIONS.PROGRESSION_LOGS);
  
  const logData = {
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    level: "info",
    action: "system_initialization",
    message: "Student Level Progression System - Phase 1 initialization completed",
    details: {
      phase: "Phase 1: Foundation",
      componentsInitialized: [
        "progression-rules",
        "academic-periods", 
        "student-progress",
        "progression-logs"
      ],
      nonDisruptive: true,
      description: "Foundation setup complete. No existing functionality affected."
    }
  };
  
  await logsRef.add(logData);
  console.log("✅ Initialization logged successfully");
}

/**
 * Main initialization function
 */
async function initializeProgressionSystem() {
  console.log("🚀 Starting Student Level Progression System Initialization");
  console.log("📋 Phase 1: Foundation - Non-disruptive setup");
  console.log("=" * 60);
  
  try {
    // Step 1: Initialize progression rules
    await initializeProgressionRules();
    console.log("");
    
    // Step 2: Create sample academic periods
    await initializeAcademicPeriods();
    console.log("");
    
    // Step 3: Initialize existing students
    await initializeExistingStudents();
    console.log("");
    
    // Step 4: Log initialization
    await logInitialization();
    console.log("");
    
    console.log("=" * 60);
    console.log("🎉 Phase 1 Initialization Completed Successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("✅ Progression rules created for Regular and Weekend students");
    console.log("✅ Academic periods structure established");
    console.log("✅ Progression tracking initialized for existing students");
    console.log("✅ System logging configured");
    console.log("");
    console.log("🛡️ Safety Notes:");
    console.log("• No existing student data was modified");
    console.log("• No existing functionality was affected");
    console.log("• All changes are additive and non-disruptive");
    console.log("• Ready for Phase 2 when you approve");
    console.log("");
    console.log("🎯 Next Steps:");
    console.log("• Review the progression tracking in Firebase Console");
    console.log("• Test the admin dashboard (coming in Phase 2)");
    console.log("• Approve Phase 2 for progression logic implementation");
    
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
}

// Run initialization
if (require.main === module) {
  initializeProgressionSystem()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = {
  initializeProgressionSystem,
  initializeProgressionRules,
  initializeAcademicPeriods,
  initializeExistingStudents
};





