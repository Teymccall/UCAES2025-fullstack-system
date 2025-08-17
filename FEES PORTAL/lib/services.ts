// Service management for Fees Portal
import { db } from './firebase'
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore'

export interface ServiceFee {
  id: string
  name: string
  description?: string
  amount: number
  type: 'Service' | 'Mandatory' | 'Optional'
  category: string
  isActive: boolean
  forProgrammes?: string[]
  forLevels?: string[]
}

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
}

// Fetch available services for students from Academic Affairs API
export const getAvailableServices = async (studentProgramme?: string, studentLevel?: string): Promise<ServiceFee[]> => {
  try {
    console.log('🔍 Fetching available services from Academic Affairs API...')
    
    // Try to fetch from Academic Affairs API first
    try {
      const response = await fetch('/api/finance/services')
      if (response.ok) {
        const data = await response.json()
        const services = data.data || data.services || []
        
        // Filter services based on student programme and level
        const applicableServices = services.filter((service: ServiceFee) => {
          const isApplicable = (
            service.isActive &&
            (!service.forProgrammes || service.forProgrammes.length === 0 || 
             (studentProgramme && service.forProgrammes.includes(studentProgramme))) &&
            (!service.forLevels || service.forLevels.length === 0 || 
             (studentLevel && service.forLevels.includes(studentLevel)))
          )
          return isApplicable
        })
        
        console.log(`✅ Found ${applicableServices.length} applicable services from API`)
        return applicableServices
      }
    } catch (apiError) {
      console.warn('⚠️ Academic Affairs API not available, falling back to Firebase')
    }
    
    // Fallback to Firebase if API is not available
    const servicesRef = collection(db, 'fee-services')
    const q = query(
      servicesRef, 
      where('isActive', '==', true),
      orderBy('category'),
      orderBy('name')
    )
    
    const querySnapshot = await getDocs(q)
    
    const services: ServiceFee[] = []
    querySnapshot.forEach((doc) => {
      const serviceData = doc.data() as Omit<ServiceFee, 'id'>
      
      // Check if service is applicable to student's programme and level
      const isApplicable = (
        (!serviceData.forProgrammes || serviceData.forProgrammes.length === 0 || 
         (studentProgramme && serviceData.forProgrammes.includes(studentProgramme))) &&
        (!serviceData.forLevels || serviceData.forLevels.length === 0 || 
         (studentLevel && serviceData.forLevels.includes(studentLevel)))
      )
      
      if (isApplicable) {
        services.push({ id: doc.id, ...serviceData })
      }
    })
    
    console.log(`✅ Found ${services.length} applicable services from Firebase`)
    return services
    
  } catch (error) {
    console.error('❌ Error fetching services:', error)
    return []
  }
}

// Get student's service requests
export const getStudentServiceRequests = async (studentId: string): Promise<ServiceRequest[]> => {
  try {
    console.log('🔍 Fetching service requests for student:', studentId)
    
    // Try to use Academic Affairs API first
    try {
      const response = await fetch(`/api/finance/service-requests?studentId=${studentId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`✅ Found ${result.data.length} service requests via API`)
          return result.data
        } else {
          console.warn('⚠️ API request failed:', result.error)
        }
      } else {
        console.warn('⚠️ API request failed with status:', response.status)
      }
    } catch (apiError) {
      console.warn('⚠️ Academic Affairs API not available, falling back to Firebase:', apiError)
    }
    
    // Fallback to Firebase if API is not available
    const requestsRef = collection(db, 'service-requests')
    const q = query(
      requestsRef,
      where('studentId', '==', studentId),
      orderBy('requestDate', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    
    const requests: ServiceRequest[] = []
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as ServiceRequest)
    })
    
    console.log(`✅ Found ${requests.length} service requests via Firebase`)
    return requests
    
  } catch (error) {
    console.error('❌ Error fetching service requests:', error)
    return []
  }
}

// Request services for a student
export const requestServices = async (
  studentId: string, 
  studentName: string,
  selectedServices: Array<{
    service: { id: string; name: string; amount: number }
    quantity: number
    total: number
  }>, 
  notes?: string
): Promise<boolean> => {
  try {
    console.log('➕ Creating service requests for student:', studentId)
    
    // Prepare services data for API
    const services = selectedServices.map(item => ({
      serviceId: item.service.id,
      serviceName: item.service.name,
      quantity: item.quantity,
      amount: item.service.amount,
      total: item.total
    }))
    
    // Try to use Academic Affairs API first
    try {
      const response = await fetch('/api/finance/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          studentName,
          services,
          notes: notes || ''
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('✅ Service requests created via API:', result.data.id)
          return true
        } else {
          console.warn('⚠️ API request failed:', result.error)
        }
      } else {
        console.warn('⚠️ API request failed with status:', response.status)
      }
    } catch (apiError) {
      console.warn('⚠️ Academic Affairs API not available, falling back to Firebase:', apiError)
    }
    
    // Fallback to Firebase if API is not available
    const requestsRef = collection(db, 'service-requests')
    
    for (const service of selectedServices) {
      try {
        // Check if student already has this service requested
        const existingQuery = query(
          requestsRef,
          where('studentId', '==', studentId),
          where('serviceId', '==', service.service.id),
          where('status', 'in', ['pending', 'approved'])
        )
        const existingSnapshot = await getDocs(existingQuery)
        
        if (!existingSnapshot.empty) {
          console.warn(`Student already has pending/approved request for service ${service.service.name}`)
          continue
        }
        
        // Create service request
        const requestData = {
          studentId,
          studentName,
          serviceId: service.service.id,
          serviceName: service.service.name,
          serviceAmount: service.service.amount,
          quantity: service.quantity,
          total: service.total,
          status: 'approved', // Auto-approve for now
          requestDate: new Date().toISOString(),
          approvedDate: new Date().toISOString(),
          notes: notes || ''
        }
        
        await addDoc(requestsRef, requestData)
        console.log(`✅ Service request created: ${service.service.name}`)
        
      } catch (serviceError) {
        console.error(`Error processing service ${service.service.name}:`, serviceError)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error requesting services:', error)
    return false
  }
}


