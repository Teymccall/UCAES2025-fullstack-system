// Debug script to understand why student search is failing
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'

// This should match your firebase config exactly
const firebaseConfig = {
  // You'll need to replace these with your actual Firebase config
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function debugStudentSearch() {
  console.log('🔍 DEBUGGING STUDENT SEARCH ISSUE')
  console.log('=' .repeat(50))
  
  const searchTerm = "UCAES20240001"
  console.log(`🎯 Looking for: "${searchTerm}"`)
  console.log('')

  // 1. Check student-registrations collection
  console.log('📋 Checking student-registrations collection...')
  try {
    const registrationsSnapshot = await getDocs(collection(db, "student-registrations"))
    console.log(`   Found ${registrationsSnapshot.size} total records`)
    
    if (registrationsSnapshot.size > 0) {
      console.log('   Sample records:')
      registrationsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data()
        console.log(`   ${index + 1}. ID: ${doc.id}`)
        console.log(`      Registration: ${data.registrationNumber || data.studentIndexNumber || 'N/A'}`)
        console.log(`      Name: ${data.surname || ''} ${data.otherNames || ''}`)
        console.log(`      Email: ${data.email || 'N/A'}`)
        console.log(`      Program: ${data.programme || data.program || 'N/A'}`)
        console.log('')
      })
      
      // Check if search term matches any
      let found = false
      registrationsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        const name = `${data.surname || ''} ${data.otherNames || ''}`.trim()
        const regNumber = data.registrationNumber || data.studentIndexNumber || ''
        const email = data.email || ''
        
        if (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          console.log(`   ✅ MATCH FOUND in student-registrations:`)
          console.log(`      Document ID: ${doc.id}`)
          console.log(`      Registration: ${regNumber}`)
          console.log(`      Name: ${name}`)
          console.log(`      Email: ${email}`)
          found = true
        }
      })
      
      if (!found) {
        console.log(`   ❌ No matches found in student-registrations for "${searchTerm}"`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  console.log('')

  // 2. Check students collection
  console.log('👥 Checking students collection...')
  try {
    const studentsSnapshot = await getDocs(collection(db, "students"))
    console.log(`   Found ${studentsSnapshot.size} total records`)
    
    if (studentsSnapshot.size > 0) {
      console.log('   Sample records:')
      studentsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data()
        console.log(`   ${index + 1}. ID: ${doc.id}`)
        console.log(`      Registration: ${data.registrationNumber || data.indexNumber || 'N/A'}`)
        console.log(`      Name: ${data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()}`)
        console.log(`      Email: ${data.email || 'N/A'}`)
        console.log(`      Program: ${data.program || data.programme || 'N/A'}`)
        console.log('')
      })
      
      // Check if search term matches any
      let found = false
      studentsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()
        const regNumber = data.registrationNumber || data.indexNumber || ''
        const email = data.email || ''
        
        if (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          console.log(`   ✅ MATCH FOUND in students:`)
          console.log(`      Document ID: ${doc.id}`)
          console.log(`      Registration: ${regNumber}`)
          console.log(`      Name: ${name}`)
          console.log(`      Email: ${email}`)
          found = true
        }
      })
      
      if (!found) {
        console.log(`   ❌ No matches found in students for "${searchTerm}"`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  console.log('')

  // 3. Try direct document access
  console.log('🎯 Trying direct document access...')
  try {
    // Try using the search term as a document ID
    const directDoc = await getDoc(doc(db, "students", searchTerm))
    if (directDoc.exists()) {
      console.log(`   ✅ Found direct document in students collection:`)
      const data = directDoc.data()
      console.log(`      Registration: ${data.registrationNumber || data.indexNumber || 'N/A'}`)
      console.log(`      Name: ${data.name || 'N/A'}`)
      console.log(`      Email: ${data.email || 'N/A'}`)
    } else {
      console.log(`   ❌ No direct document found with ID "${searchTerm}"`)
    }
    
    // Try student-registrations
    const directRegDoc = await getDoc(doc(db, "student-registrations", searchTerm))
    if (directRegDoc.exists()) {
      console.log(`   ✅ Found direct document in student-registrations:`)
      const data = directRegDoc.data()
      console.log(`      Registration: ${data.registrationNumber || data.studentIndexNumber || 'N/A'}`)
      console.log(`      Name: ${data.surname || ''} ${data.otherNames || ''}`)
      console.log(`      Email: ${data.email || 'N/A'}`)
    } else {
      console.log(`   ❌ No direct document found in student-registrations with ID "${searchTerm}"`)
    }
  } catch (error) {
    console.log(`   ❌ Error with direct access: ${error.message}`)
  }

  console.log('')

  // 4. Check grades to see if there's data but no student record
  console.log('📊 Checking grade records...')
  try {
    const gradesSnapshot = await getDocs(collection(db, "student-grades"))
    console.log(`   Found ${gradesSnapshot.size} grade records`)
    
    if (gradesSnapshot.size > 0) {
      console.log('   Sample grade records:')
      gradesSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data()
        console.log(`   ${index + 1}. Student ID: ${data.studentId || 'N/A'}`)
        console.log(`      Course: ${data.courseCode || data.courseId || 'N/A'}`)
        console.log(`      Grade: ${data.grade || 'N/A'}`)
        console.log(`      Status: ${data.status || 'N/A'}`)
        console.log('')
      })
      
      // Check if grades exist for our search term
      let foundGrades = false
      gradesSnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.studentId && data.studentId.includes(searchTerm)) {
          console.log(`   ✅ Found grades for student ID containing "${searchTerm}":`)
          console.log(`      Full Student ID: ${data.studentId}`)
          console.log(`      Course: ${data.courseCode || data.courseId}`)
          console.log(`      Grade: ${data.grade}`)
          foundGrades = true
        }
      })
      
      if (!foundGrades) {
        console.log(`   ❌ No grades found for student ID containing "${searchTerm}"`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking grades: ${error.message}`)
  }

  console.log('')
  console.log('🎯 SUMMARY & RECOMMENDATIONS:')
  console.log('=' .repeat(50))
  console.log('1. If you see transcript data but search returns 0:')
  console.log('   • Student data exists but in wrong format/location')
  console.log('   • Search algorithm issue')
  console.log('   • Document ID vs field mismatch')
  console.log('')
  console.log('2. If no student data found:')
  console.log('   • Use Test Data page to populate samples')
  console.log('   • Check Firebase connection')
  console.log('   • Verify correct collections')
  console.log('')
  console.log('3. If grades exist but no student record:')
  console.log('   • Need to create matching student record')
  console.log('   • Data import issue')
  console.log('   • Collection sync problem')
}

debugStudentSearch().catch(console.error)














