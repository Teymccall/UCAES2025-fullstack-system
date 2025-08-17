import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, query, getDocs, where, orderBy } from 'firebase/firestore'

// Firebase configuration - should match the fees portal
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

interface StudentFeeRecord {
  id: string
  studentId: string
  studentName: string
  programme: string
  level: string
  scheduleType?: string
  totalFees: number
  paidAmount: number
  outstandingBalance: number
  status: "paid" | "partial" | "overdue" | "pending"
  lastPaymentDate?: string
  registrationNumber?: string
  studentIndexNumber?: string
}

// Calculate fee structure based on programme and level
const calculateProgrammeFees = (programme: string, currentLevel: string, scheduleType: string = "Regular") => {
  const baseFees = {
    "B.Sc. Environmental Science and Management": { tuition: 3800, facilities: 700, lab: 400 },
    "B.Sc. Computer Science": { tuition: 3800, facilities: 700, lab: 400 },
    "B.Sc. Information Technology": { tuition: 3800, facilities: 700, lab: 400 },
    "B.Sc. Sustainable Agriculture": { tuition: 3600, facilities: 650, lab: 300, field: 200 },
    "Bachelor of Agriculture": { tuition: 3400, facilities: 600, field: 300 },
    "Certificate in Sustainable Agriculture": { tuition: 2800, facilities: 500 },
    "Bachelor of Business Administration": { tuition: 3200, facilities: 550, library: 200 },
    "Bachelor of Economics": { tuition: 3000, facilities: 500, library: 150 },
    "Bachelor of Education": { tuition: 2800, facilities: 450, teaching: 300 }
  }

  // Default fees if programme not found
  const defaultFees = { tuition: 3200, facilities: 550, library: 200 }
  const fees = baseFees[programme as keyof typeof baseFees] || defaultFees

  // Apply level multiplier (higher levels cost more)
  const levelMultipliers = {
    "100": 1.0,
    "200": 1.05,
    "300": 1.1,
    "400": 1.15,
    "Level 100": 1.0,
    "Level 200": 1.05,
    "Level 300": 1.1,
    "Level 400": 1.15
  }

  const multiplier = levelMultipliers[currentLevel as keyof typeof levelMultipliers] || 1.0
  
  // Apply schedule type multiplier
  const scheduleMultiplier = scheduleType?.toLowerCase().includes('weekend') ? 1.3 : 
                            scheduleType?.toLowerCase().includes('evening') ? 1.2 : 1.0

  const totalFees = Object.values(fees).reduce((sum, value) => sum + (value * multiplier * scheduleMultiplier), 0)
  return Math.round(totalFees)
}

// Get payment records for a student
const getStudentPayments = async (studentId: string) => {
  try {
    const paymentsRef = collection(db, 'student-payments')
    const q = query(paymentsRef, where('studentId', '==', studentId), orderBy('submittedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    let totalPaid = 0
    let lastPaymentDate = null
    
    querySnapshot.forEach((doc) => {
      const payment = doc.data()
      if (payment.status === 'approved' || payment.status === 'completed' || payment.status === 'verified') {
        totalPaid += payment.amount || 0
        if (!lastPaymentDate || payment.submittedAt > lastPaymentDate) {
          lastPaymentDate = payment.submittedAt
        }
      }
    })
    
    return { totalPaid, lastPaymentDate }
  } catch (error) {
    console.error('Error fetching payments for student:', studentId, error)
    return { totalPaid: 0, lastPaymentDate: null }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🏦 Fetching student fee records from Firebase...')
    
    // Get all student registrations
    const studentsRef = collection(db, 'student-registrations')
    const studentsQuery = query(studentsRef, where('status', '==', 'active'))
    const studentsSnapshot = await getDocs(studentsQuery)
    
    console.log(`📊 Found ${studentsSnapshot.size} active students`)
    
    const studentFeeRecords: StudentFeeRecord[] = []
    
    // Process each student
    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data()
      
      // Calculate total fees for this student
      const totalFees = calculateProgrammeFees(
        studentData.programme || 'Unknown Programme',
        studentData.currentLevel || '100',
        studentData.scheduleType || 'Regular'
      )
      
      // Get payment information
      const studentId = studentData.registrationNumber || studentData.studentIndexNumber
      const { totalPaid, lastPaymentDate } = await getStudentPayments(studentId)
      
      const outstandingBalance = totalFees - totalPaid
      
      // Determine status
      let status: "paid" | "partial" | "overdue" | "pending" = "pending"
      if (totalPaid >= totalFees) {
        status = "paid"
      } else if (totalPaid > 0) {
        status = "partial"
      } else {
        // Check if overdue (assuming semester started 3 months ago)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        const registrationDate = studentData.registrationDate?.toDate?.() || new Date(studentData.registrationDate || Date.now())
        
        if (registrationDate < threeMonthsAgo) {
          status = "overdue"
        }
      }
      
      // Prepare student name
      const surname = studentData.surname || studentData.lastName || ''
      const otherNames = studentData.otherNames || studentData.firstName || studentData.otherName || ''
      const fullName = `${surname} ${otherNames}`.trim() || 'Unknown Student'
      
      const feeRecord: StudentFeeRecord = {
        id: studentDoc.id,
        studentId: studentId || studentDoc.id,
        studentName: fullName,
        programme: studentData.programme || 'Unknown Programme',
        level: studentData.currentLevel || '100',
        scheduleType: studentData.scheduleType || 'Regular',
        totalFees,
        paidAmount: totalPaid,
        outstandingBalance: Math.max(0, outstandingBalance),
        status,
        lastPaymentDate: lastPaymentDate || undefined,
        registrationNumber: studentData.registrationNumber,
        studentIndexNumber: studentData.studentIndexNumber
      }
      
      studentFeeRecords.push(feeRecord)
    }
    
    // Calculate summary statistics
    const summary = {
      totalOutstanding: studentFeeRecords.reduce((sum, record) => sum + record.outstandingBalance, 0),
      totalPaid: studentFeeRecords.reduce((sum, record) => sum + record.paidAmount, 0),
      totalStudents: studentFeeRecords.length,
      overduePayments: studentFeeRecords.filter(record => record.status === 'overdue').length
    }
    
    console.log('📈 Finance Summary:', summary)
    
    return NextResponse.json({
      success: true,
      data: {
        summary,
        studentRecords: studentFeeRecords
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching student fee data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch student fee data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, studentId, amount, notes } = body
    
    // Handle fee adjustments, manual payments, etc.
    console.log('🔧 Finance action:', { action, studentId, amount, notes })
    
    // This would implement fee adjustments, manual payment recording, etc.
    return NextResponse.json({
      success: true,
      message: 'Finance action completed successfully'
    })
    
  } catch (error) {
    console.error('❌ Error processing finance action:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process finance action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


