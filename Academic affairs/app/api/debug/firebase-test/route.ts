import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 DEBUGGING FIREBASE CONNECTION FROM API')
    console.log('Testing direct Firebase access from server-side API...')
    
    const results = {
      timestamp: new Date().toISOString(),
      firebaseConnected: false,
      collections: {},
      error: null
    }

    // Test basic Firebase connection
    try {
      const db = getDb();
      console.log('📋 Testing student-registrations collection...')
      const studentRegsSnapshot = await getDocs(collection(db, 'student-registrations'))
      
      results.firebaseConnected = true
      results.collections['student-registrations'] = {
        count: studentRegsSnapshot.size,
        sampleData: []
      }
      
      console.log(`✅ Found ${studentRegsSnapshot.size} documents in student-registrations`)
      
      // Get sample data
      if (studentRegsSnapshot.size > 0) {
        const samples = studentRegsSnapshot.docs.slice(0, 3).map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            registrationNumber: data.registrationNumber || data.studentIndexNumber || 'N/A',
            name: data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim() || 'N/A',
            email: data.email || 'N/A',
            programme: data.programme || data.program || 'N/A'
          }
        })
        results.collections['student-registrations'].sampleData = samples
        
        console.log('📄 Sample students:')
        samples.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.name} (${student.registrationNumber})`)
        })
      }
      
    } catch (error) {
      console.error('❌ Firebase connection error:', error)
      results.error = error.message
      results.firebaseConnected = false
    }

    // Test other collections
    const otherCollections = ['students', 'student-grades', 'course-registrations']
    
    for (const collectionName of otherCollections) {
      try {
        const db = getDb();
        console.log(`📊 Testing ${collectionName} collection...`)
        const snapshot = await getDocs(collection(db, collectionName))
        results.collections[collectionName] = {
          count: snapshot.size
        }
        console.log(`✅ Found ${snapshot.size} documents in ${collectionName}`)
      } catch (error) {
        console.error(`❌ Error accessing ${collectionName}:`, error.message)
        results.collections[collectionName] = {
          error: error.message
        }
      }
    }

    console.log('🎯 Firebase test completed')
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('❌ API Debug failed:', error)
    return NextResponse.json(
      { 
        error: 'Debug test failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
