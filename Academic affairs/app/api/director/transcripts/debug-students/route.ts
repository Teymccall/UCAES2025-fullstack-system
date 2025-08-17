import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Analyzing student database structure...')

    const result = {
      timestamp: new Date().toISOString(),
      collections: {},
      sampleData: {},
      recommendations: []
    }

    // Check student-registrations collection
    try {
      const regSnapshot = await getDocs(collection(db, 'student-registrations'))
      result.collections['student-registrations'] = {
        totalRecords: regSnapshot.size,
        hasData: regSnapshot.size > 0
      }

      if (regSnapshot.size > 0) {
        // Get sample records to analyze structure
        const sampleDoc = regSnapshot.docs[0]
        const sampleData = sampleDoc.data()
        
        result.sampleData['student-registrations'] = {
          documentId: sampleDoc.id,
          fields: Object.keys(sampleData),
          sampleRecord: {
            registrationNumber: sampleData.registrationNumber || 'N/A',
            studentIndexNumber: sampleData.studentIndexNumber || 'N/A',
            indexNumber: sampleData.indexNumber || 'N/A',
            surname: sampleData.surname || 'N/A',
            otherNames: sampleData.otherNames || 'N/A',
            name: sampleData.name || 'N/A',
            email: sampleData.email || 'N/A',
            programme: sampleData.programme || 'N/A',
            program: sampleData.program || 'N/A',
            currentLevel: sampleData.currentLevel || 'N/A',
            entryLevel: sampleData.entryLevel || 'N/A',
            status: sampleData.status || 'N/A'
          }
        }

        // Show first 3 student names for reference
        const firstThree = regSnapshot.docs.slice(0, 3).map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim(),
            registrationNumber: data.registrationNumber || data.studentIndexNumber || data.indexNumber || 'N/A',
            email: data.email || 'N/A'
          }
        })
        
        result.sampleData['student-registrations'].firstThreeStudents = firstThree
      }
    } catch (error) {
      result.collections['student-registrations'] = {
        error: error.message
      }
    }

    // Check students collection
    try {
      const studentsSnapshot = await getDocs(collection(db, 'students'))
      result.collections['students'] = {
        totalRecords: studentsSnapshot.size,
        hasData: studentsSnapshot.size > 0
      }

      if (studentsSnapshot.size > 0) {
        const sampleDoc = studentsSnapshot.docs[0]
        const sampleData = sampleDoc.data()
        
        result.sampleData['students'] = {
          documentId: sampleDoc.id,
          fields: Object.keys(sampleData),
          sampleRecord: {
            registrationNumber: sampleData.registrationNumber || 'N/A',
            studentIndexNumber: sampleData.studentIndexNumber || 'N/A',
            indexNumber: sampleData.indexNumber || 'N/A',
            name: sampleData.name || 'N/A',
            surname: sampleData.surname || 'N/A',
            otherNames: sampleData.otherNames || 'N/A',
            firstName: sampleData.firstName || 'N/A',
            lastName: sampleData.lastName || 'N/A',
            email: sampleData.email || 'N/A',
            program: sampleData.program || 'N/A',
            programme: sampleData.programme || 'N/A'
          }
        }

        // Show first 3 student names for reference
        const firstThree = studentsSnapshot.docs.slice(0, 3).map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || 
                  `${data.surname || ''} ${data.otherNames || ''}`.trim() ||
                  `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            registrationNumber: data.registrationNumber || data.studentIndexNumber || data.indexNumber || 'N/A',
            email: data.email || 'N/A'
          }
        })
        
        result.sampleData['students'].firstThreeStudents = firstThree
      }
    } catch (error) {
      result.collections['students'] = {
        error: error.message
      }
    }

    // Check student-grades collection
    try {
      const gradesSnapshot = await getDocs(query(collection(db, 'student-grades'), limit(5)))
      result.collections['student-grades'] = {
        totalRecords: gradesSnapshot.size,
        hasData: gradesSnapshot.size > 0
      }

      if (gradesSnapshot.size > 0) {
        const sampleGrade = gradesSnapshot.docs[0].data()
        result.sampleData['student-grades'] = {
          sampleStudentIds: gradesSnapshot.docs.map(doc => doc.data().studentId).slice(0, 5),
          sampleGrade: {
            studentId: sampleGrade.studentId || 'N/A',
            courseCode: sampleGrade.courseCode || 'N/A',
            grade: sampleGrade.grade || 'N/A',
            status: sampleGrade.status || 'N/A'
          }
        }
      }
    } catch (error) {
      result.collections['student-grades'] = {
        error: error.message
      }
    }

    // Generate recommendations
    if (result.collections['student-registrations']?.totalRecords > 0) {
      result.recommendations.push('✅ Found student-registrations data - search should work with real students')
      
      if (result.sampleData['student-registrations']?.firstThreeStudents) {
        const samples = result.sampleData['student-registrations'].firstThreeStudents
        result.recommendations.push(`📝 Try searching for: "${samples[0]?.name}" or "${samples[0]?.registrationNumber}"`)
        if (samples[1]) {
          result.recommendations.push(`📝 Also try: "${samples[1]?.name}" or "${samples[1]?.registrationNumber}"`)
        }
      }
    } else {
      result.recommendations.push('❌ No data in student-registrations - need to populate real students')
    }

    if (result.collections['students']?.totalRecords > 0) {
      result.recommendations.push('✅ Found students collection data')
    } else {
      result.recommendations.push('⚠️ No data in students collection - may need sync from registrations')
    }

    if (result.collections['student-grades']?.totalRecords > 0) {
      result.recommendations.push('✅ Found published grades - transcripts should work')
    } else {
      result.recommendations.push('⚠️ No published grades found - transcripts will be empty')
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Debug analysis failed:', error)
    return NextResponse.json(
      { error: 'Failed to analyze database', details: error.message },
      { status: 500 }
    )
  }
}














