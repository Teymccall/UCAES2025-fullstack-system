import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore'

// Firebase config (this should match your existing config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "ucaes2025.firebaseapp.com", 
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample student data for testing transcripts
const sampleStudents = [
  {
    registrationNumber: "UCAES20250001",
    name: "John Doe",
    surname: "Doe",
    otherNames: "John",
    email: "john.doe@student.ucaes.edu.gh",
    program: "B.Sc. Environmental Science and Management",
    programme: "B.Sc. Environmental Science and Management",
    level: "100",
    currentLevel: "100",
    entryLevel: "100",
    gender: "Male",
    studyMode: "Regular",
    scheduleType: "Regular",
    status: "active",
    dateOfBirth: "2000-05-15",
    nationality: "Ghanaian",
    mobile: "0201234567",
    yearOfAdmission: 2025,
    entryQualification: "WASSCE"
  },
  {
    registrationNumber: "UCAES20250002", 
    name: "Jane Smith",
    surname: "Smith",
    otherNames: "Jane",
    email: "jane.smith@student.ucaes.edu.gh",
    program: "Certificate in Sustainable Agriculture",
    programme: "Certificate in Sustainable Agriculture",
    level: "100",
    currentLevel: "100", 
    entryLevel: "100",
    gender: "Female",
    studyMode: "Regular",
    scheduleType: "Regular",
    status: "active",
    dateOfBirth: "1999-08-22",
    nationality: "Ghanaian",
    mobile: "0207654321",
    yearOfAdmission: 2025,
    entryQualification: "WASSCE"
  },
  {
    registrationNumber: "UCAES20250003",
    name: "Michael Johnson", 
    surname: "Johnson",
    otherNames: "Michael",
    email: "michael.johnson@student.ucaes.edu.gh",
    program: "Certificate in Waste Management & Environmental Health",
    programme: "Certificate in Waste Management & Environmental Health",
    level: "100",
    currentLevel: "100",
    entryLevel: "100", 
    gender: "Male",
    studyMode: "Weekend",
    scheduleType: "Weekend",
    status: "active",
    dateOfBirth: "1998-12-10",
    nationality: "Ghanaian",
    mobile: "0243567890",
    yearOfAdmission: 2025,
    entryQualification: "WASSCE"
  }
]

// Sample grades for testing transcript generation
const sampleGrades = [
  {
    studentId: "john.doe@student.ucaes.edu.gh",
    courseId: "ENV101", 
    courseCode: "ENV101",
    courseTitle: "Introduction to Environmental Science",
    courseName: "Introduction to Environmental Science",
    academicYear: "2025-2026",
    semester: "First",
    credits: 3,
    assessment: 8,
    midsem: 16,
    exams: 58,
    total: 82,
    grade: "A",
    gradePoint: 4.0,
    status: "published",
    lecturerId: "prof.smith",
    lecturerName: "Prof. Smith",
    publishedAt: new Date(),
    publishedBy: "director"
  },
  {
    studentId: "john.doe@student.ucaes.edu.gh", 
    courseId: "AGR101",
    courseCode: "AGR101", 
    courseTitle: "Principles of Agriculture",
    courseName: "Principles of Agriculture",
    academicYear: "2025-2026",
    semester: "First",
    credits: 3,
    assessment: 7,
    midsem: 15,
    exams: 52,
    total: 74,
    grade: "B+",
    gradePoint: 3.3,
    status: "published",
    lecturerId: "dr.jones",
    lecturerName: "Dr. Jones", 
    publishedAt: new Date(),
    publishedBy: "director"
  },
  {
    studentId: "jane.smith@student.ucaes.edu.gh",
    courseId: "ENV101",
    courseCode: "ENV101",
    courseTitle: "Introduction to Environmental Science", 
    courseName: "Introduction to Environmental Science",
    academicYear: "2025-2026",
    semester: "First",
    credits: 3,
    assessment: 9,
    midsem: 18,
    exams: 62,
    total: 89,
    grade: "A",
    gradePoint: 4.0,
    status: "published",
    lecturerId: "prof.smith",
    lecturerName: "Prof. Smith",
    publishedAt: new Date(),
    publishedBy: "director"
  }
]

async function checkExistingData() {
  console.log('🔍 Checking existing student data...')
  
  // Check student-registrations
  const registrationsSnapshot = await getDocs(collection(db, 'student-registrations'))
  console.log(`📋 Found ${registrationsSnapshot.size} records in student-registrations`)
  
  // Check students collection
  const studentsSnapshot = await getDocs(collection(db, 'students'))
  console.log(`👥 Found ${studentsSnapshot.size} records in students collection`)
  
  // Check student-grades
  const gradesSnapshot = await getDocs(collection(db, 'student-grades'))
  console.log(`📊 Found ${gradesSnapshot.size} records in student-grades`)
  
  return {
    registrations: registrationsSnapshot.size,
    students: studentsSnapshot.size,
    grades: gradesSnapshot.size
  }
}

async function populateStudents() {
  try {
    console.log('🚀 Starting student data population...')
    
    const existingData = await checkExistingData()
    
    // Add students to student-registrations collection
    console.log('📝 Adding students to student-registrations...')
    for (const student of sampleStudents) {
      // Check if student already exists
      const existingQuery = query(
        collection(db, 'student-registrations'),
        where('registrationNumber', '==', student.registrationNumber)
      )
      const existing = await getDocs(existingQuery)
      
      if (existing.empty) {
        await addDoc(collection(db, 'student-registrations'), {
          ...student,
          registrationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log(`✅ Added ${student.name} to student-registrations`)
      } else {
        console.log(`⏭️ Skipped ${student.name} (already exists)`)
      }
    }
    
    // Add students to students collection  
    console.log('👥 Adding students to students collection...')
    for (const student of sampleStudents) {
      const existingQuery = query(
        collection(db, 'students'),
        where('registrationNumber', '==', student.registrationNumber)
      )
      const existing = await getDocs(existingQuery)
      
      if (existing.empty) {
        await addDoc(collection(db, 'students'), {
          ...student,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log(`✅ Added ${student.name} to students collection`)
      } else {
        console.log(`⏭️ Skipped ${student.name} (already exists in students)`)
      }
    }
    
    // Add sample grades
    console.log('📊 Adding sample grades...')
    for (const grade of sampleGrades) {
      await addDoc(collection(db, 'student-grades'), {
        ...grade,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Added grade for ${grade.courseCode}`)
    }
    
    console.log('🎉 Sample data population completed!')
    console.log('\n📋 Summary:')
    console.log(`✅ Students added to student-registrations: ${sampleStudents.length}`)
    console.log(`✅ Students added to students collection: ${sampleStudents.length}`) 
    console.log(`✅ Sample grades added: ${sampleGrades.length}`)
    console.log('\n🔍 You can now search for students in the transcript system using:')
    console.log('- "John" or "Doe"')
    console.log('- "Jane" or "Smith"') 
    console.log('- "UCAES20250001", "UCAES20250002", etc.')
    console.log('- "john.doe@student.ucaes.edu.gh"')
    
  } catch (error) {
    console.error('❌ Error populating data:', error)
  }
}

populateStudents()














