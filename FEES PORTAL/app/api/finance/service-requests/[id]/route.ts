import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

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

// PATCH - Update service request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, processedBy, notes } = body
    
    console.log(`🔄 Updating service request ${id} status to: ${status}`)
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'paid']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be one of: pending, approved, rejected, paid' },
        { status: 400 }
      )
    }
    
    // Update the service request
    const serviceRequestRef = doc(db, 'service-requests', id)
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (processedBy) {
      updateData.processedBy = processedBy
    }
    
    if (notes) {
      updateData.notes = notes
    }
    
    // Add processed date for status changes
    if (['approved', 'rejected', 'paid'].includes(status)) {
      updateData.processedDate = new Date().toISOString()
    }
    
    await updateDoc(serviceRequestRef, updateData)
    
    console.log(`✅ Service request ${id} status updated to ${status}`)
    
    return NextResponse.json({
      success: true,
      message: `Service request status updated to ${status}`,
      data: { id, status, processedBy, processedDate: updateData.processedDate }
    })
    
  } catch (error) {
    console.error('❌ Error updating service request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update service request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Fetch specific service request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 Fetching service request: ${id}`)
    
    // TODO: Implement fetch by ID
    // const serviceRequestRef = doc(db, 'service-requests', id)
    // const serviceRequestDoc = await getDoc(serviceRequestRef)
    
    // if (!serviceRequestDoc.exists()) {
    //   return NextResponse.json(
    //     { success: false, error: 'Service request not found' },
    //     { status: 404 }
    //   )
    // }
    
    // const serviceRequest = { id: serviceRequestDoc.id, ...serviceRequestDoc.data() }
    
    return NextResponse.json({
      success: true,
      message: 'Service request fetched successfully',
      // data: serviceRequest
    })
    
  } catch (error) {
    console.error('❌ Error fetching service request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch service request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
