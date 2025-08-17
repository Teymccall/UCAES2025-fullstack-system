import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'

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

export interface ServiceFee {
  id?: string
  name: string
  description?: string
  amount: number
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string
  isActive: boolean
  forProgrammes?: string[]
  forLevels?: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

// PUT - Update a specific service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { 
      name, 
      description, 
      amount, 
      type, 
      category, 
      forProgrammes, 
      forLevels,
      isActive,
      updatedBy
    } = body
    
    console.log('📝 Updating service:', id)
    
    // Check if service exists
    const serviceRef = doc(db, 'fee-services', id)
    const serviceDoc = await getDoc(serviceRef)
    
    if (!serviceDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }
    
    const updateData: Partial<ServiceFee> = {
      updatedAt: new Date().toISOString()
    }
    
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (amount !== undefined) updateData.amount = Number(amount)
    if (type !== undefined) updateData.type = type
    if (category !== undefined) updateData.category = category.trim()
    if (forProgrammes !== undefined) updateData.forProgrammes = forProgrammes
    if (forLevels !== undefined) updateData.forLevels = forLevels
    if (isActive !== undefined) updateData.isActive = isActive
    if (updatedBy !== undefined) updateData.createdBy = updatedBy // Use existing field for tracking
    
    await updateDoc(serviceRef, updateData)
    
    // Get updated document to return
    const updatedDoc = await getDoc(serviceRef)
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() }
    
    console.log('✅ Service updated successfully')
    
    return NextResponse.json({
      success: true,
      data: updatedData,
      message: 'Service updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Error updating service:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific service (soft delete by setting isActive to false)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    console.log('🗑️ Attempting to deactivate service with ID:', id)
    
    if (!id) {
      console.error('❌ No service ID provided')
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      )
    }
    
    // Check if service exists
    const serviceRef = doc(db, 'fee-services', id)
    console.log('🔍 Checking if service exists in fee-services collection...')
    
    const serviceDoc = await getDoc(serviceRef)
    
    if (!serviceDoc.exists()) {
      console.error('❌ Service not found in database:', id)
      return NextResponse.json(
        { success: false, error: `Service with ID ${id} not found in database` },
        { status: 404 }
      )
    }
    
    const serviceData = serviceDoc.data()
    console.log('✅ Service found:', serviceData?.name, 'Current isActive:', serviceData?.isActive)
    
    // Soft delete by setting isActive to false
    await updateDoc(serviceRef, {
      isActive: false,
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ Service deactivated successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Error deactivating service:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
