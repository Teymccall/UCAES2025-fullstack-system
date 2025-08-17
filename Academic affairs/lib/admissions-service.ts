import { collection, getDocs, query, where, doc, getDoc, updateDoc, serverTimestamp, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"

export interface AdmissionApplication {
  id: string
  applicationId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  level: string
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected'
  paymentStatus: 'pending' | 'paid' | 'failed'
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  feedback?: string
  
  // Personal Information
  dateOfBirth?: string
  gender?: string
  nationality?: string
  region?: string
  
  // Contact Information
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  
  // Academic Background
  schoolName?: string
  qualificationType?: string
  yearCompleted?: string
  subjects?: Array<{ subject: string; grade: string }>
  
  // Program Selection
  studyMode?: string
  firstChoice?: string
  secondChoice?: string
  
  // Documents
  documents?: {
    photo?: string
    idDocument?: string
    certificate?: string
    transcript?: string
  }
  
  // Document URLs for viewing/downloading
  documentUrls?: {
    photo?: string
    idDocument?: string
    certificate?: string
    transcript?: string
  }
}

// Fetch all admission applications from Firebase
export async function fetchAdmissionApplications(): Promise<AdmissionApplication[]> {
  try {
    console.log("🔍 Fetching admission applications from Firebase...")
    
    // First, try to get from student-registrations collection (new student information system)
    const registrationsRef = collection(db, 'student-registrations')
    const registrationsQuery = query(
      registrationsRef,
      where('status', 'in', ['pending', 'approved', 'rejected']),
      orderBy('registrationDate', 'desc')
    )
    
    const registrationsSnapshot = await getDocs(registrationsQuery)
    const applications: AdmissionApplication[] = []
    
    registrationsSnapshot.forEach((doc) => {
      const data = doc.data()
      const application: AdmissionApplication = {
        id: doc.id,
        applicationId: data.registrationNumber || `APP-${doc.id}`,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        program: data.programme || data.program || '',
        level: data.level || 'Undergraduate',
        status: mapRegistrationStatus(data.status),
        paymentStatus: data.paymentStatus || 'pending',
        submittedAt: data.registrationDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        nationality: data.nationality || 'Ghanaian',
        region: data.region || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        schoolName: data.schoolName || data.previousSchool || '',
        qualificationType: data.qualificationType || data.entryQualification || '',
        yearCompleted: data.yearCompleted || '',
        subjects: data.subjects || [],
        studyMode: data.studyMode || 'Full-time',
        firstChoice: data.firstChoice || data.programme || '',
        secondChoice: data.secondChoice || '',
        documents: {
          photo: data.profilePictureUrl ? 'uploaded' : undefined,
          idDocument: data.idDocumentUrl ? 'uploaded' : undefined,
          certificate: data.certificateUrl ? 'uploaded' : undefined,
          transcript: data.transcriptUrl ? 'uploaded' : undefined,
        },
        documentUrls: {
          photo: data.profilePictureUrl || undefined,
          idDocument: data.idDocumentUrl || undefined,
          certificate: data.certificateUrl || undefined,
          transcript: data.transcriptUrl || undefined,
        }
      }
      applications.push(application)
    })
    
    console.log(`✅ Found ${applications.length} admission applications`)
    return applications
    
  } catch (error) {
    console.error("❌ Error fetching admission applications:", error)
    throw error
  }
}

// Map registration status to admission status
function mapRegistrationStatus(registrationStatus: string): 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' {
  switch (registrationStatus) {
    case 'pending':
      return 'submitted'
    case 'approved':
      return 'accepted'
    case 'rejected':
      return 'rejected'
    default:
      return 'submitted'
  }
}

// Update application status and feedback
export async function updateApplicationStatus(
  applicationId: string,
  status: 'accepted' | 'rejected',
  feedback: string,
  reviewedBy: string
): Promise<void> {
  try {
    console.log(`🔄 Updating application ${applicationId} status to ${status}`)
    
    // Update in student-registrations collection
    const registrationRef = doc(db, 'student-registrations', applicationId)
    const registrationDoc = await getDoc(registrationRef)
    
    if (registrationDoc.exists()) {
      const newStatus = status === 'accepted' ? 'approved' : 'rejected'
      
      await updateDoc(registrationRef, {
        status: newStatus,
        feedback: feedback,
        reviewedBy: reviewedBy,
        reviewedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      })
      
      console.log(`✅ Application ${applicationId} status updated to ${newStatus}`)
    } else {
      throw new Error(`Application ${applicationId} not found`)
    }
    
  } catch (error) {
    console.error("❌ Error updating application status:", error)
    throw error
  }
}

// Get application statistics
export async function getApplicationStatistics() {
  try {
    const registrationsRef = collection(db, 'student-registrations')
    
    // Get today's applications
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayQuery = query(
      registrationsRef,
      where('registrationDate', '>=', today),
      where('status', 'in', ['pending', 'approved', 'rejected'])
    )
    const todaySnapshot = await getDocs(todayQuery)
    
    // Get pending applications
    const pendingQuery = query(
      registrationsRef,
      where('status', '==', 'pending')
    )
    const pendingSnapshot = await getDocs(pendingQuery)
    
    // Get approved applications
    const approvedQuery = query(
      registrationsRef,
      where('status', '==', 'approved')
    )
    const approvedSnapshot = await getDocs(approvedQuery)
    
    // Get paid applications (assuming payment status is tracked)
    const paidQuery = query(
      registrationsRef,
      where('paymentStatus', '==', 'paid')
    )
    const paidSnapshot = await getDocs(paidQuery)
    
    return {
      todaysApplications: todaySnapshot.size,
      pendingApplications: pendingSnapshot.size,
      acceptedApplications: approvedSnapshot.size,
      paidApplications: paidSnapshot.size
    }
    
  } catch (error) {
    console.error("❌ Error getting application statistics:", error)
    return {
      todaysApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      paidApplications: 0
    }
  }
} 