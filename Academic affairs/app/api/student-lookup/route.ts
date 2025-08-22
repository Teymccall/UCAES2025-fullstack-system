// Server-side API endpoint for student lookup
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get('registrationNumber')
    
    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, error: 'Registration number is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking up student by registration number:', registrationNumber)
    
    const db = getDb()
    
    // Search in students collection with multiple possible field names
    const studentsRef = db.collection('students')
    
    // Try different field combinations in order of preference
    const searchQueries = [
      studentsRef.where('registrationNumber', '==', registrationNumber.toUpperCase()),
      studentsRef.where('registrationNumber', '==', registrationNumber),
      studentsRef.where('studentId', '==', registrationNumber.toUpperCase()),
      studentsRef.where('studentId', '==', registrationNumber),
      // Also try these common field names
      studentsRef.where('adminStudentId', '==', registrationNumber.toUpperCase()),
      studentsRef.where('adminStudentId', '==', registrationNumber),
      studentsRef.where('indexNumber', '==', registrationNumber.toUpperCase()),
      studentsRef.where('indexNumber', '==', registrationNumber)
    ]
    
    let studentSnapshot = null
    let studentDoc = null
    
    for (const query of searchQueries) {
      try {
        const snapshot = await query.get()
        if (!snapshot.empty) {
          studentSnapshot = snapshot
          studentDoc = snapshot.docs[0]
          console.log('✅ Found student with query field')
          break
        }
      } catch (error) {
        console.warn('Query failed, trying next:', error)
      }
    }
    
    if (!studentSnapshot || !studentDoc) {
      console.log('❌ Student not found with registration number:', registrationNumber)
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }
    
    const studentData = await buildComprehensiveStudentData(studentDoc.data(), studentDoc.id)
    
    return NextResponse.json({ success: true, data: studentData })
    
  } catch (error: any) {
    console.error('❌ Error looking up student:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to lookup student' },
      { status: 500 }
    )
  }
}

/**
 * Build comprehensive student data from Firestore document
 */
async function buildComprehensiveStudentData(studentData: any, docId: string) {
  try {
    // Get current academic period
    const academicPeriod = await getCurrentAcademicPeriod()
    
    // Determine schedule type and semester
    const scheduleType = studentData.scheduleType || studentData.programmeType || 'Regular'
    const currentSemester = getCurrentSemester(scheduleType, academicPeriod)
    
    // Build comprehensive data based on actual Firebase field names
    const comprehensiveData = {
      // Basic Information - matching actual field names from sample data
      studentId: studentData.registrationNumber || studentData.studentId || studentData.adminStudentId || '',
      registrationNumber: studentData.registrationNumber || studentData.studentId || studentData.adminStudentId || '',
      firstName: studentData.otherNames || studentData.name?.split(' ')[0] || '',
      lastName: studentData.surname || studentData.name?.split(' ').slice(1).join(' ') || '',
      fullName: studentData.name || `${studentData.otherNames || ''} ${studentData.surname || ''}`.trim(),
      email: studentData.email || `${(studentData.registrationNumber || studentData.studentId || '').toLowerCase()}@student.ucaes.edu.gh`,
      phoneNumber: studentData.mobile || studentData.phoneNumber || studentData.contactNumber || '',
      
      // Academic Information - matching actual field names
      program: studentData.programme || studentData.program || '',
      programName: getProgramFullName(studentData.programme || studentData.program || ''),
      level: studentData.currentLevel || studentData.level || studentData.entryLevel || '100',
      currentLevel: studentData.currentLevel || studentData.level || studentData.entryLevel || '100',
      scheduleType: studentData.scheduleType || studentData.studyMode || 'Regular',
      academicYear: academicPeriod?.academicYear || studentData.academicYear || '2025/2026',
      semester: currentSemester,
      gpa: parseFloat(studentData.gpa || studentData.cgpa || '0'),
      
      // Personal Information - using actual field names
      dateOfBirth: studentData.dateOfBirth || studentData.dob || '',
      gender: studentData.gender || 'Male',
      nationality: studentData.nationality || 'Ghanaian',
      region: studentData.region || studentData.homeRegion || '',
      hometown: studentData.hometown || studentData.homeTown || '',
      
      // Contact Information - using actual address structure
      residentialAddress: getFormattedAddress(studentData.address || studentData),
      
      // University Information
      admissionDate: studentData.admissionDate || studentData.enrollmentDate || (studentData.yearOfAdmission ? `${studentData.yearOfAdmission}-01-01` : ''),
      studentStatus: studentData.status || studentData.studentStatus || 'active',
      entryQualification: studentData.entryQualification || '',
      yearOfAdmission: studentData.yearOfAdmission || new Date().getFullYear(),
      
      // Photo and Documents
      passportPhoto: studentData.profilePictureUrl || studentData.passportPhoto || studentData.profileImage || studentData.photoUrl || '',
      profileImage: studentData.profilePictureUrl || studentData.passportPhoto || studentData.profileImage || studentData.photoUrl || '',
      
      // Academic Performance
      academicStanding: determineAcademicStanding(parseFloat(studentData.gpa || studentData.cgpa || '0')),
      creditsEarned: parseInt(studentData.creditsEarned || '0'),
      totalCreditsRequired: getTotalCreditsRequired(studentData.programme || studentData.program || '')
    }
    
    console.log('✅ Comprehensive student data built:', {
      studentId: comprehensiveData.studentId,
      fullName: comprehensiveData.fullName,
      program: comprehensiveData.program,
      level: comprehensiveData.level,
      scheduleType: comprehensiveData.scheduleType
    })
    
    return comprehensiveData
    
  } catch (error) {
    console.error('❌ Error building comprehensive student data:', error)
    throw error
  }
}

/**
 * Get current academic period from Academic Affairs
 */
async function getCurrentAcademicPeriod(): Promise<any> {
  try {
    const db = getDb()
    const configRef = db.collection('systemConfig').doc('academicPeriod')
    const configDoc = await configRef.get()
    
    if (configDoc.exists) {
      return configDoc.data()
    }
    
    // Fallback to default
    return {
      academicYear: '2025/2026',
      regularSemester: { number: '1', name: 'First Semester' },
      weekendSemester: { number: '1', name: 'First Trimester' }
    }
  } catch (error) {
    console.warn('⚠️ Could not get academic period, using default:', error)
    return {
      academicYear: '2025/2026',
      regularSemester: { number: '1', name: 'First Semester' },
      weekendSemester: { number: '1', name: 'First Trimester' }
    }
  }
}

/**
 * Get current semester based on schedule type
 */
function getCurrentSemester(scheduleType: string, academicPeriod: any): string {
  if (scheduleType.toLowerCase().includes('weekend')) {
    return academicPeriod?.weekendSemester?.name || 'First Trimester'
  } else {
    return academicPeriod?.regularSemester?.name || 'First Semester'
  }
}

/**
 * Get full program name from program code
 */
function getProgramFullName(programCode: string): string {
  const programs: Record<string, string> = {
    'BSA': 'Bachelor of Science in Agriculture',
    'BSF': 'Bachelor of Science in Forestry',
    'BESM': 'Bachelor of Environmental Science and Management',
    'MSA': 'Master of Science in Agriculture',
    'MSF': 'Master of Science in Forestry',
    'PHD-AGR': 'Doctor of Philosophy in Agriculture',
    'DIPLOMA-AGR': 'Diploma in Agriculture',
    'CERTIFICATE-AGR': 'Certificate in Agriculture'
  }
  
  return programs[programCode.toUpperCase()] || programCode
}

/**
 * Determine academic standing based on GPA
 */
function determineAcademicStanding(gpa: number): 'Good' | 'Probation' | 'Excellent' {
  if (gpa >= 3.5) return 'Excellent'
  if (gpa >= 2.0) return 'Good'
  return 'Probation'
}

/**
 * Get total credits required for program
 */
function getTotalCreditsRequired(programCode: string): number {
  const creditRequirements: Record<string, number> = {
    'BSA': 120,
    'BSF': 120,
    'BESM': 120,
    'MSA': 36,
    'MSF': 36,
    'PHD-AGR': 72,
    'DIPLOMA-AGR': 60,
    'CERTIFICATE-AGR': 30
  }
  
  return creditRequirements[programCode.toUpperCase()] || 120
}

/**
 * Format address from different possible structures
 */
function getFormattedAddress(addressData: any): string {
  if (!addressData) return ''
  
  // If it's already a string
  if (typeof addressData === 'string') return addressData
  
  // If it's an object with address structure
  if (addressData.street || addressData.city || addressData.region) {
    const parts = [
      addressData.street,
      addressData.city,
      addressData.region,
      addressData.country
    ].filter(Boolean)
    return parts.join(', ')
  }
  
  // Try other possible field names
  const parts = [
    addressData.address,
    addressData.city,
    addressData.region,
    addressData.country || 'Ghana'
  ].filter(Boolean)
  
  return parts.join(', ') || ''
}
