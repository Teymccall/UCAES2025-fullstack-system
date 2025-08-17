import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json()

    console.log(`🚀 Creating test student with ID: ${studentId}`)

    // Create the exact student data for the ID you're looking for
    const testStudent = {
      registrationNumber: studentId || "UCAES20240001",
      name: "John Doe Test Student",
      surname: "Doe",
      otherNames: "John Test",
      email: `${studentId?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ucaes20240001'}@student.ucaes.edu.gh`,
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

    // Add to student-registrations collection
    console.log('📋 Adding to student-registrations...')
    const regDoc = await addDoc(collection(db, 'student-registrations'), testStudent)
    console.log(`✅ Added to student-registrations with ID: ${regDoc.id}`)

    // Add to students collection
    console.log('👥 Adding to students collection...')
    const studentDoc = await addDoc(collection(db, 'students'), testStudent)
    console.log(`✅ Added to students with ID: ${studentDoc.id}`)

    // Also create with the exact document ID for direct access
    console.log('🎯 Creating with exact document ID...')
    await setDoc(doc(db, 'students', studentId || 'UCAES20240001'), {
      ...testStudent,
      id: studentId || 'UCAES20240001'
    })
    console.log(`✅ Created document with exact ID: ${studentId}`)

    // Create some sample grades for this student
    const sampleGrades = [
      {
        studentId: testStudent.email,
        courseId: "ESM255",
        courseCode: "ESM255",
        courseTitle: "Hydrology",
        courseName: "Hydrology",
        academicYear: "2026-2027",
        semester: "First",
        credits: 3,
        assessment: 10,
        midsem: 15,
        exams: 40,
        total: 65,
        grade: "C+",
        gradePoint: 2.3,
        status: "published",
        lecturerId: "prof.water",
        lecturerName: "Prof. Water",
        publishedAt: new Date(),
        publishedBy: "director"
      },
      {
        studentId: testStudent.email,
        courseId: "ESM251",
        courseCode: "ESM251",
        courseTitle: "Geology",
        courseName: "Geology",
        academicYear: "2026-2027",
        semester: "First",
        credits: 3,
        assessment: 10,
        midsem: 20,
        exams: 40,
        total: 70,
        grade: "B",
        gradePoint: 3.0,
        status: "published",
        lecturerId: "dr.rock",
        lecturerName: "Dr. Rock",
        publishedAt: new Date(),
        publishedBy: "director"
      }
    ]

    console.log('📊 Adding sample grades...')
    for (const grade of sampleGrades) {
      await addDoc(collection(db, 'student-grades'), {
        ...grade,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Added grade for ${grade.courseCode}`)
    }

    return NextResponse.json({
      success: true,
      message: `Test student ${studentId} created successfully with sample grades`,
      student: testStudent,
      gradesAdded: sampleGrades.length
    })

  } catch (error) {
    console.error('❌ Error creating test student:', error)
    return NextResponse.json(
      { error: 'Failed to create test student', details: error.message },
      { status: 500 }
    )
  }
}














