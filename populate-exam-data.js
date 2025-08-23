// Populate Exam Data for Testing Exam Officer Functionality
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

console.log('🎯 POPULATING EXAM DATA FOR EXAM OFFICER TESTING');
console.log('='.repeat(60));

// Sample exam data
const sampleExams = [
  {
    examType: "mid-semester",
    courseId: "course_001",
    courseCode: "CHEM 121",
    courseName: "General Chemistry",
    academicYear: "2024-2025",
    semester: "First",
    examDate: "2024-10-15",
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    totalMarks: 100,
    hallId: "hall_001",
    hallName: "Main Hall",
    examinerId: "lecturer_001",
    examinerName: "Dr. Sarah Wilson",
    invigilators: ["invigilator_001", "invigilator_002"],
    status: "scheduled",
    registeredStudents: 45,
    presentStudents: 0,
    submittedGrades: 0,
    approvedGrades: 0,
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: "exam_officer_001"
  },
  {
    examType: "mid-semester",
    courseId: "course_002",
    courseCode: "MATH 101",
    courseName: "Calculus I",
    academicYear: "2024-2025",
    semester: "First",
    examDate: "2024-10-16",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    totalMarks: 100,
    hallId: "hall_002",
    hallName: "Science Lab",
    examinerId: "lecturer_002",
    examinerName: "Dr. Michael Brown",
    invigilators: ["invigilator_003", "invigilator_004"],
    status: "scheduled",
    registeredStudents: 38,
    presentStudents: 0,
    submittedGrades: 0,
    approvedGrades: 0,
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: "exam_officer_001"
  },
  {
    examType: "end-of-semester",
    courseId: "course_003",
    courseCode: "PHYS 101",
    courseName: "Physics I",
    academicYear: "2024-2025",
    semester: "First",
    examDate: "2024-12-10",
    startTime: "09:00",
    endTime: "12:00",
    duration: 180,
    totalMarks: 150,
    hallId: "hall_001",
    hallName: "Main Hall",
    examinerId: "lecturer_003",
    examinerName: "Dr. Emily Davis",
    invigilators: ["invigilator_001", "invigilator_002", "invigilator_005"],
    status: "scheduled",
    registeredStudents: 52,
    presentStudents: 0,
    submittedGrades: 0,
    approvedGrades: 0,
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: "exam_officer_001"
  },
  {
    examType: "resits",
    courseId: "course_004",
    courseCode: "BIO 101",
    courseName: "Biology I",
    academicYear: "2024-2025",
    semester: "First",
    examDate: "2024-11-20",
    startTime: "10:00",
    endTime: "12:00",
    duration: 120,
    totalMarks: 100,
    hallId: "hall_003",
    hallName: "Biology Lab",
    examinerId: "lecturer_004",
    examinerName: "Dr. Jennifer Wilson",
    invigilators: ["invigilator_006"],
    status: "scheduled",
    registeredStudents: 12,
    presentStudents: 0,
    submittedGrades: 0,
    approvedGrades: 0,
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: "exam_officer_001"
  }
];

// Sample exam timetables
const sampleTimetables = [
  {
    academicYear: "2024-2025",
    semester: "First",
    examPeriod: "mid-semester",
    exams: [
      {
        examId: "exam_001",
        courseCode: "CHEM 121",
        date: "2024-10-15",
        startTime: "09:00",
        endTime: "11:00",
        hall: "Main Hall"
      },
      {
        examId: "exam_002",
        courseCode: "MATH 101",
        date: "2024-10-16",
        startTime: "14:00",
        endTime: "16:00",
        hall: "Science Lab"
      }
    ],
    published: true,
    publishedAt: admin.firestore.Timestamp.now(),
    publishedBy: "exam_officer_001"
  }
];

// Sample exam halls
const sampleHalls = [
  {
    hallId: "hall_001",
    hallName: "Main Hall",
    capacity: 100,
    building: "Main Building",
    floor: "Ground Floor",
    roomNumber: "G01",
    status: "available",
    facilities: ["Projector", "Air Conditioning", "Security Cameras"]
  },
  {
    hallId: "hall_002",
    hallName: "Science Lab",
    capacity: 50,
    building: "Science Building",
    floor: "First Floor",
    roomNumber: "S101",
    status: "available",
    facilities: ["Lab Equipment", "Air Conditioning"]
  },
  {
    hallId: "hall_003",
    hallName: "Biology Lab",
    capacity: 30,
    building: "Science Building",
    floor: "Second Floor",
    roomNumber: "S201",
    status: "available",
    facilities: ["Lab Equipment", "Microscopes"]
  }
];

// Sample exam attendance
const sampleAttendance = [
  {
    examId: "exam_001",
    studentId: "student_001",
    registrationNumber: "2024001",
    studentName: "John Doe",
    present: true,
    checkInTime: "08:45",
    checkOutTime: "11:15",
    specialCase: false,
    remarks: "",
    recordedBy: "invigilator_001",
    recordedAt: admin.firestore.Timestamp.now()
  },
  {
    examId: "exam_001",
    studentId: "student_002",
    registrationNumber: "2024002",
    studentName: "Jane Smith",
    present: true,
    checkInTime: "08:50",
    checkOutTime: "11:10",
    specialCase: false,
    remarks: "",
    recordedBy: "invigilator_001",
    recordedAt: admin.firestore.Timestamp.now()
  }
];

// Sample special cases
const sampleSpecialCases = [
  {
    studentId: "student_003",
    examId: "exam_001",
    caseType: "defer",
    reason: "Medical emergency",
    supportingDocuments: ["medical_cert.pdf"],
    status: "pending",
    approvedBy: null,
    approvedAt: null,
    remarks: "Student requested deferment due to hospitalization"
  }
];

// Sample access logs
const sampleAccessLogs = [
  {
    userId: "lecturer_001",
    userRole: "lecturer",
    action: "view_exam_paper",
    examId: "exam_001",
    timestamp: admin.firestore.Timestamp.now(),
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    success: true
  }
];

// Sample examiner assignments
const sampleExaminerAssignments = [
  {
    examId: "exam_001",
    examinerId: "lecturer_001",
    examinerName: "Dr. Sarah Wilson",
    role: "examiner",
    assignedAt: admin.firestore.Timestamp.now(),
    assignedBy: "exam_officer_001",
    status: "assigned"
  },
  {
    examId: "exam_001",
    examinerId: "invigilator_001",
    examinerName: "Mr. Robert Johnson",
    role: "invigilator",
    assignedAt: admin.firestore.Timestamp.now(),
    assignedBy: "exam_officer_001",
    status: "assigned"
  }
];

// Sample exam anomalies
const sampleAnomalies = [
  {
    examId: "exam_001",
    anomalyType: "missing_grades",
    description: "Missing grades for 3 students",
    severity: "medium",
    detectedAt: admin.firestore.Timestamp.now(),
    detectedBy: "system",
    status: "open",
    resolvedAt: null,
    resolvedBy: null,
    resolution: ""
  }
];

// Populate data function
async function populateExamData() {
  try {
    console.log('\n📚 POPULATING EXAM DATA...');
    
    // Populate exams
    console.log('  📅 Creating exams...');
    for (const exam of sampleExams) {
      const examRef = await db.collection('exams').add(exam);
      console.log(`    ✅ Created exam: ${exam.courseCode} (${examRef.id})`);
    }
    
    // Populate exam timetables
    console.log('\n  📋 Creating exam timetables...');
    for (const timetable of sampleTimetables) {
      const timetableRef = await db.collection('exam-timetables').add(timetable);
      console.log(`    ✅ Created timetable: ${timetable.examPeriod} (${timetableRef.id})`);
    }
    
    // Populate exam halls
    console.log('\n  🏢 Creating exam halls...');
    for (const hall of sampleHalls) {
      const hallRef = await db.collection('exam-halls').add(hall);
      console.log(`    ✅ Created hall: ${hall.hallName} (${hallRef.id})`);
    }
    
    // Populate exam attendance
    console.log('\n  👥 Creating attendance records...');
    for (const attendance of sampleAttendance) {
      const attendanceRef = await db.collection('exam-attendance').add(attendance);
      console.log(`    ✅ Created attendance: ${attendance.studentName} (${attendanceRef.id})`);
    }
    
    // Populate special cases
    console.log('\n  ⚠️ Creating special cases...');
    for (const specialCase of sampleSpecialCases) {
      const caseRef = await db.collection('special-cases').add(specialCase);
      console.log(`    ✅ Created special case: ${specialCase.caseType} (${caseRef.id})`);
    }
    
    // Populate access logs
    console.log('\n  🔐 Creating access logs...');
    for (const log of sampleAccessLogs) {
      const logRef = await db.collection('access-logs').add(log);
      console.log(`    ✅ Created access log: ${log.action} (${logRef.id})`);
    }
    
    // Populate examiner assignments
    console.log('\n  👨‍🏫 Creating examiner assignments...');
    for (const assignment of sampleExaminerAssignments) {
      const assignmentRef = await db.collection('examiner-assignments').add(assignment);
      console.log(`    ✅ Created assignment: ${assignment.examinerName} (${assignmentRef.id})`);
    }
    
    // Populate exam anomalies
    console.log('\n  🚨 Creating exam anomalies...');
    for (const anomaly of sampleAnomalies) {
      const anomalyRef = await db.collection('exam-anomalies').add(anomaly);
      console.log(`    ✅ Created anomaly: ${anomaly.anomalyType} (${anomalyRef.id})`);
    }
    
    console.log('\n✅ EXAM DATA POPULATION COMPLETE!');
    console.log('\n📊 SUMMARY:');
    console.log(`  📅 Exams: ${sampleExams.length}`);
    console.log(`  📋 Timetables: ${sampleTimetables.length}`);
    console.log(`  🏢 Halls: ${sampleHalls.length}`);
    console.log(`  👥 Attendance Records: ${sampleAttendance.length}`);
    console.log(`  ⚠️ Special Cases: ${sampleSpecialCases.length}`);
    console.log(`  🔐 Access Logs: ${sampleAccessLogs.length}`);
    console.log(`  👨‍🏫 Examiner Assignments: ${sampleExaminerAssignments.length}`);
    console.log(`  🚨 Anomalies: ${sampleAnomalies.length}`);
    
    console.log('\n🎯 Exam Officer can now test the enhanced functionality!');
    
  } catch (error) {
    console.error('❌ Error populating exam data:', error);
  }
}

// Run the population
populateExamData();