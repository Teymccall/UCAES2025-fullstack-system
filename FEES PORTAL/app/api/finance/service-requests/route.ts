import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore'

// Firebase configuration - same as both systems
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

// Initialize Firebase for API routes
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

export interface ServiceRequest {
  id?: string
  studentId: string
  studentName: string
  services: Array<{
    serviceId: string
    serviceName: string
    quantity: number
    amount: number
    total: number
  }>
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requestDate: string
  processedBy?: string
  processedDate?: string
  notes?: string
}

// POST - Create service requests for a student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, services, notes } = body
    
    console.log('➕ Creating service requests for student:', studentId)
    
    // Validate required fields
    if (!studentId || !studentName || !services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, studentName, services' },
        { status: 400 }
      )
    }
    
    // Validate services array
    for (const service of services) {
      if (!service.serviceId || !service.serviceName || !service.quantity || !service.amount) {
        return NextResponse.json(
          { success: false, error: 'Invalid service data in services array' },
          { status: 400 }
        )
      }
      
      if (service.quantity <= 0 || service.amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Service quantity and amount must be greater than 0' },
          { status: 400 }
        )
      }
    }
    
    // Calculate total amount
    const totalAmount = services.reduce((sum, service) => sum + (service.total || 0), 0)
    
    // Check if student already has pending/approved requests for the same services
    const existingRequestsRef = collection(db, 'service-requests')
    const existingQuery = query(
      existingRequestsRef,
      where('studentId', '==', studentId),
      where('status', 'in', ['pending', 'approved'])
    )
    
    const existingSnapshot = await getDocs(existingQuery)
    const existingServices = new Set()
    
    existingSnapshot.forEach(doc => {
      const request = doc.data() as ServiceRequest
      request.services.forEach(service => {
        existingServices.add(service.serviceId)
      })
    })
    
    // Filter out services that already have pending/approved requests
    const newServices = services.filter(service => !existingServices.has(service.serviceId))
    
    if (newServices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All selected services already have pending or approved requests' },
        { status: 400 }
      )
    }
    
    // Recalculate total for new services only
    const newTotalAmount = newServices.reduce((sum, service) => sum + (service.total || 0), 0)
    
    const serviceRequest: Omit<ServiceRequest, 'id'> = {
      studentId,
      studentName,
      services: newServices,
      totalAmount: newTotalAmount,
      status: 'pending',
      requestDate: new Date().toISOString(),
      notes: notes || ''
    }
    
    // Add to Firebase
    const serviceRequestsRef = collection(db, 'service-requests')
    const docRef = await addDoc(serviceRequestsRef, {
      ...serviceRequest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ Service request created with ID:', docRef.id)
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...serviceRequest },
      message: 'Service request created successfully',
      warnings: existingServices.size > 0 ? 'Some services were skipped due to existing requests' : undefined
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

// GET - Fetch service requests for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Fetching service requests for student:', studentId)
    
    const serviceRequestsRef = collection(db, 'service-requests')
    let q = query(
      serviceRequestsRef,
      where('studentId', '==', studentId),
      orderBy('requestDate', 'desc')
    )
    
    if (status) {
      q = query(q, where('status', '==', status))
    }
    
    const querySnapshot = await getDocs(q)
    
    const requests: ServiceRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as ServiceRequest)
    })
    
    console.log(`✅ Found ${requests.length} service requests for student ${studentId}`)
    
    return NextResponse.json({
      success: true,
      data: requests,
      total: requests.length
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

















