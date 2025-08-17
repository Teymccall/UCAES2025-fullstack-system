import { NextRequest, NextResponse } from 'next/server'
import { collection, query, getDocs, addDoc, doc, getDoc, where, orderBy } from 'firebase/firestore'
import { getDb } from '@/lib/firebase-admin'



export interface ServiceRequest {
  id?: string
  studentId: string
  studentName: string
  serviceId: string
  serviceName: string
  serviceAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requestDate: string
  approvedDate?: string
  paidDate?: string
  notes?: string
  approvedBy?: string
}

// GET - Fetch service requests (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    
    console.log('🔍 Fetching service requests...', { studentId, status })
    
    let q = query(collection(db, 'service-requests'), orderBy('requestDate', 'desc'))
    
    if (studentId) {
      q = query(collection(db, 'service-requests'), where('studentId', '==', studentId), orderBy('requestDate', 'desc'))
    } else if (status) {
      q = query(collection(db, 'service-requests'), where('status', '==', status), orderBy('requestDate', 'desc'))
    }
    
    const querySnapshot = await getDocs(q)
    
    const requests: ServiceRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as ServiceRequest)
    })
    
    console.log(`✅ Found ${requests.length} service requests`)
    
    return NextResponse.json({
      success: true,
      data: requests
    })
    
  } catch (error) {
    console.error('❌ Error fetching service requests:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch service requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new service request
export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const body = await request.json()
    const { studentId, serviceIds, notes } = body
    
    // Validation
    if (!studentId || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student ID and service IDs are required' },
        { status: 400 }
      )
    }
    
    console.log('➕ Creating service requests for student:', studentId)
    
    // Get student information
    const studentsRef = collection(db, 'student-registrations')
    const studentQuery = query(studentsRef, where('registrationNumber', '==', studentId))
    const studentSnapshot = await getDocs(studentQuery)
    
    if (studentSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }
    
    const studentData = studentSnapshot.docs[0].data()
    const studentName = `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim()
    
    // Get service information and create requests
    const createdRequests = []
    
    for (const serviceId of serviceIds) {
      try {
        const serviceRef = doc(db, 'fee-services', serviceId)
        const serviceDoc = await getDoc(serviceRef)
        
        if (!serviceDoc.exists()) {
          console.warn(`Service ${serviceId} not found, skipping`)
          continue
        }
        
        const serviceData = serviceDoc.data()
        
        // Check if student already has this service requested
        const existingRequestQuery = query(
          collection(db, 'service-requests'),
          where('studentId', '==', studentId),
          where('serviceId', '==', serviceId),
          where('status', 'in', ['pending', 'approved'])
        )
        const existingSnapshot = await getDocs(existingRequestQuery)
        
        if (!existingSnapshot.empty) {
          console.warn(`Student ${studentId} already has a pending/approved request for service ${serviceId}`)
          continue
        }
        
        const requestData: Omit<ServiceRequest, 'id'> = {
          studentId,
          studentName,
          serviceId,
          serviceName: serviceData.name,
          serviceAmount: serviceData.amount,
          status: 'approved', // Auto-approve for now, can add approval workflow later
          requestDate: new Date().toISOString(),
          approvedDate: new Date().toISOString(),
          notes: notes || '',
          approvedBy: 'system' // Can be changed to require manual approval
        }
        
        const requestsRef = collection(db, 'service-requests')
        const docRef = await addDoc(requestsRef, requestData)
        
        createdRequests.push({ id: docRef.id, ...requestData })
        
        console.log(`✅ Service request created: ${serviceData.name} for ${studentName}`)
      } catch (serviceError) {
        console.error(`Error processing service ${serviceId}:`, serviceError)
      }
    }
    
    if (createdRequests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid service requests could be created' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: createdRequests,
      message: `${createdRequests.length} service request(s) created successfully`
    })
    
  } catch (error) {
    console.error('❌ Error creating service request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create service request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


