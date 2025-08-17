"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Users, Database, BookOpen, CheckCircle } from "lucide-react"

export default function TestDataPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [dataStatus, setDataStatus] = useState<{
    students: number
    registrations: number  
    grades: number
  } | null>(null)

  // Sample student data
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

  // Sample grades
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
    },
    {
      studentId: "michael.johnson@student.ucaes.edu.gh",
      courseId: "WME101",
      courseCode: "WME101",
      courseTitle: "Waste Management Principles",
      courseName: "Waste Management Principles",
      academicYear: "2025-2026",
      semester: "First", 
      credits: 4,
      assessment: 8,
      midsem: 17,
      exams: 60,
      total: 85,
      grade: "A",
      gradePoint: 4.0,
      status: "published",
      lecturerId: "dr.brown",
      lecturerName: "Dr. Brown",
      publishedAt: new Date(),
      publishedBy: "director"
    }
  ]

  const checkExistingData = async () => {
    try {
      const [registrationsSnapshot, studentsSnapshot, gradesSnapshot] = await Promise.all([
        getDocs(collection(db, 'student-registrations')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'student-grades'))
      ])

      const status = {
        registrations: registrationsSnapshot.size,
        students: studentsSnapshot.size,
        grades: gradesSnapshot.size
      }

      setDataStatus(status)
      return status
    } catch (error) {
      console.error('Error checking existing data:', error)
      toast({
        title: "Error",
        description: "Failed to check existing data",
        variant: "destructive"
      })
      return null
    }
  }

  const populateTestData = async () => {
    setIsLoading(true)
    try {
      console.log('🚀 Starting test data population...')

      // Add students to student-registrations collection
      console.log('📝 Adding students to student-registrations...')
      let addedRegistrations = 0
      for (const student of sampleStudents) {
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
          addedRegistrations++
          console.log(`✅ Added ${student.name} to student-registrations`)
        }
      }

      // Add students to students collection
      console.log('👥 Adding students to students collection...')
      let addedStudents = 0
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
          addedStudents++
          console.log(`✅ Added ${student.name} to students collection`)
        }
      }

      // Add sample grades
      console.log('📊 Adding sample grades...')
      let addedGrades = 0
      for (const grade of sampleGrades) {
        await addDoc(collection(db, 'student-grades'), {
          ...grade,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        addedGrades++
        console.log(`✅ Added grade for ${grade.courseCode}`)
      }

      // Refresh data status
      await checkExistingData()

      toast({
        title: "Success!",
        description: `Added ${addedRegistrations} registrations, ${addedStudents} students, and ${addedGrades} grades`,
      })

      console.log('🎉 Test data population completed!')

    } catch (error) {
      console.error('❌ Error populating data:', error)
      toast({
        title: "Error",
        description: "Failed to populate test data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Data Management</h1>
          <p className="text-muted-foreground">Populate sample data for testing the transcript system</p>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Current Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button variant="outline" onClick={checkExistingData}>
              Refresh Status
            </Button>
          </div>
          
          {dataStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{dataStatus.registrations}</p>
                <p className="text-sm text-gray-600">Student Registrations</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{dataStatus.students}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{dataStatus.grades}</p>
                <p className="text-sm text-gray-600">Published Grades</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Sample Test Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Sample Students ({sampleStudents.length})</h4>
              <div className="space-y-2 text-sm">
                {sampleStudents.map((student, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>{student.name} ({student.registrationNumber})</span>
                    <span className="text-muted-foreground">{student.program}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Sample Grades ({sampleGrades.length})</h4>
              <div className="space-y-2 text-sm">
                {sampleGrades.map((grade, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>{grade.courseCode} - {grade.courseTitle}</span>
                    <span className="font-medium">Grade: {grade.grade} ({grade.total}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={populateTestData} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Populating Data...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Populate Test Data
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-600" />
            After Populating Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p><strong>🔍 You can then search for students using:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>"John" or "Doe" (will find John Doe)</li>
              <li>"Jane" or "Smith" (will find Jane Smith)</li>
              <li>"UCAES20250001", "UCAES20250002", etc.</li>
              <li>"john.doe@student.ucaes.edu.gh"</li>
            </ul>
            
            <p className="mt-4"><strong>📊 Sample transcripts will show:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>John Doe: 2 courses with A and B+ grades</li>
              <li>Jane Smith: 1 course with A grade</li>
              <li>Michael Johnson: 1 course with A grade</li>
            </ul>
            
            <p className="mt-4 text-orange-600">
              <strong>⚠️ Note:</strong> This is test data for development. In production, 
              students will be automatically registered through the admission system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}














