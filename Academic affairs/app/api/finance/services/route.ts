import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, where, orderBy } from 'firebase/firestore'

// Firebase configuration
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
  forProgrammes?: string[] // Empty array means all programmes
  forLevels?: string[] // Empty array means all levels
  createdAt: string
  updatedAt: string
  createdBy: string
}

// GET - Fetch all available services
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching available services from fee-services collection...')
    
    const servicesRef = collection(db, 'fee-services')
    console.log('📄 Collection reference created successfully')
    
    // For management purposes, fetch all services (active and inactive)
    // Note: Using single orderBy to avoid composite index requirement
    const q = query(servicesRef, orderBy('category'))
    console.log('🔍 Executing query...')
    
    const querySnapshot = await getDocs(q)
    console.log(`📊 Query completed. Found ${querySnapshot.size} documents`)
    
    const services: ServiceFee[] = []
    querySnapshot.forEach((doc) => {
      const serviceData = { id: doc.id, ...doc.data() } as ServiceFee
      services.push(serviceData)
      console.log(`📋 Service loaded: ${serviceData.name} (${serviceData.id})`)
    })
    
    console.log(`✅ Successfully loaded ${services.length} services`)
    
    // Sort services by category and then by name (client-side sorting)
    services.sort((a, b) => {
      const categoryCompare = (a.category || '').localeCompare(b.category || '')
      if (categoryCompare !== 0) return categoryCompare
      return (a.name || '').localeCompare(b.name || '')
    })
    
    // Return success even if no services found (empty collection is valid)
    return NextResponse.json({
      success: true,
      data: services,
      message: services.length === 0 ? 'No services found in database' : `Found ${services.length} services`
    })
    
  } catch (error) {
    console.error('❌ Error fetching services:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Add a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      amount, 
      type, 
      category, 
      forProgrammes = [], 
      forLevels = [],
      createdBy 
    } = body
    
    // Validation
    if (!name || !amount || !type || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, amount, type, category' },
        { status: 400 }
      )
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }
    
    console.log('➕ Creating new service:', name)
    
    const serviceData: Omit<ServiceFee, 'id'> = {
      name: name.trim(),
      description: description?.trim() || '',
      amount: Number(amount),
      type,
      category: category.trim(),
      isActive: true,
      forProgrammes: Array.isArray(forProgrammes) ? forProgrammes : [],
      forLevels: Array.isArray(forLevels) ? forLevels : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: createdBy || 'system'
    }
    
    const servicesRef = collection(db, 'fee-services')
    const docRef = await addDoc(servicesRef, serviceData)
    
    console.log('✅ Service created with ID:', docRef.id)
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...serviceData },
      message: 'Service created successfully'
    })
    
  } catch (error) {
    console.error('❌ Error creating service:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update a service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      name, 
      description, 
      amount, 
      type, 
      category, 
      forProgrammes, 
      forLevels,
      isActive 
    } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      )
    }
    
    console.log('📝 Updating service:', id)
    
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
    
    const serviceRef = doc(db, 'fee-services', id)
    await updateDoc(serviceRef, updateData)
    
    console.log('✅ Service updated successfully')
    
    return NextResponse.json({
      success: true,
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

// DELETE - Delete a service (soft delete by setting isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🗑️ Deactivating service:', id)
    
    const serviceRef = doc(db, 'fee-services', id)
    await updateDoc(serviceRef, {
      isActive: false,
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ Service deactivated successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Service deactivated successfully'
    })
    
  } catch (error) {
    console.error('❌ Error deactivating service:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to deactivate service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


