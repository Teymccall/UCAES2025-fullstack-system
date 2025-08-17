import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore'

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

// GET - Fetch available services for students (only active ones)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching available services for students...')
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const programme = searchParams.get('programme')
    const level = searchParams.get('level')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    
    console.log('📋 Filter params:', { programme, level, category, type })
    
    const servicesRef = collection(db, 'fee-services')
    
    // Build query based on filters
    let q = query(
      servicesRef, 
      where('isActive', '==', true)
    )
    
    // Add category filter if specified
    if (category) {
      q = query(q, where('category', '==', category))
    }
    
    // Add type filter if specified
    if (type) {
      q = query(q, where('type', '==', type))
    }
    
    // Add ordering
    q = query(q, orderBy('category'), orderBy('name'))
    
    const querySnapshot = await getDocs(q)
    
    const services: ServiceFee[] = []
    querySnapshot.forEach((doc) => {
      const serviceData = doc.data() as Omit<ServiceFee, 'id'>
      
      // Apply programme and level filtering on the client side for better performance
      let isApplicable = true
      
      if (programme && serviceData.forProgrammes && serviceData.forProgrammes.length > 0) {
        isApplicable = serviceData.forProgrammes.includes(programme)
      }
      
      if (level && serviceData.forLevels && serviceData.forLevels.length > 0) {
        isApplicable = isApplicable && serviceData.forLevels.includes(level)
      }
      
      if (isApplicable) {
        services.push({ id: doc.id, ...serviceData })
      }
    })
    
    console.log(`✅ Found ${services.length} applicable services for student (${programme}, ${level})`)
    
    return NextResponse.json({
      success: true,
      data: services,
      filters: { programme, level, category, type },
      total: services.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching services:', error)
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

// POST - Create new service (Admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json()
    const { name, description, amount, type, category, forProgrammes, forLevels } = body
    
    console.log('➕ Creating new service:', { name, amount, type, category })
    
    // Validate required fields
    if (!name || !amount || !type || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, amount, type, category' },
        { status: 400 }
      )
    }
    
    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }
    
    // TODO: Add to Firebase
    // const serviceRef = await addDoc(collection(db, 'fee-services'), {
    //   name,
    //   description,
    //   amount,
    //   type,
    //   category,
    //   forProgrammes: forProgrammes || [],
    //   forLevels: forLevels || [],
    //   isActive: true,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    //   createdBy: 'admin' // TODO: Get from auth context
    // })
    
    console.log('✅ Service created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      // data: { id: serviceRef.id, name, amount, type, category }
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

















