// Quick script to add a single test student with the exact ID you're searching for
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore'

// Initialize Firebase (this will use your existing config)
const firebaseConfig = {
  // This should auto-detect from your environment
}

try {
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Create the exact student you're looking for
  const testStudent = {
    registrationNumber: "UCAES20240001",
    name: "John Doe Test Student",
    surname: "Doe",
    otherNames: "John Test",
    email: "john.doe.test@student.ucaes.edu.gh",
    program: "B.Sc. Environmental Science and Management",
    programme: "B.Sc. Environmental Science and Management",
    level: "100",
    currentLevel: "100",
    entryLevel: "100",
    gender: "Male",
    studyMode: "Regular",
    scheduleType: "Regular",
    status: "active",
    dateOfBirth: "2000-01-15",
    nationality: "Ghanaian",
    mobile: "0200123456",
    yearOfAdmission: 2024,
    entryQualification: "WASSCE",
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Add to both collections
  console.log('Adding test student to student-registrations...')
  await addDoc(collection(db, 'student-registrations'), testStudent)
  
  console.log('Adding test student to students collection...')
  await addDoc(collection(db, 'students'), testStudent)
  
  // Also try with document ID matching registration number
  console.log('Adding with document ID matching registration number...')
  await setDoc(doc(db, 'students', 'UCAES20240001'), testStudent)
  
  console.log('✅ Test student added successfully!')
  console.log('Try searching for: "UCAES20240001" or "john" or "doe"')

} catch (error) {
  console.error('❌ Error:', error.message)
  console.log('This script needs to run in a browser environment with Firebase initialized')
}














