import { collection, addDoc, doc, getDoc, updateDoc, setDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { db, auth } from "../firebase"

// Check if admissions are currently open
export const checkAdmissionStatus = async (): Promise<{
  isOpen: boolean
  currentYear?: string
  admissionStatus?: string
  message?: string
}> => {
  try {
    console.log("🔍 Checking admission status...")
    
    // Use centralized system only (systemConfig/academicPeriod)
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    if (!systemConfigDoc.exists()) {
      console.log("⚠️ No centralized system configuration found")
      return {
        isOpen: false,
        message: "No admission period is currently configured"
      }
    }
    
    const systemData = systemConfigDoc.data()
    const currentYear = systemData.currentAcademicYearId
    
    if (!currentYear) {
      console.log("⚠️ No current academic year configured")
      return {
        isOpen: false,
        message: "No admission period is currently configured"
      }
    }
    
    // Get the academic year document
    const yearRef = doc(db, 'academic-years', currentYear)
    const yearDoc = await getDoc(yearRef)
    
    if (!yearDoc.exists()) {
      console.log("⚠️ Academic year document not found")
      return {
        isOpen: false,
        message: "Admission period not found"
      }
    }
    
    const yearData = yearDoc.data()
    const isOpen = yearData.admissionStatus === 'open'
    
    console.log(`📊 Admission status: ${yearData.admissionStatus} (${isOpen ? 'OPEN' : 'CLOSED'})`)
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed"
    }
  } catch (error) {
    console.error("❌ Error checking admission status:", error)
    return {
      isOpen: false,
      message: "Error checking admission status"
    }
  }
}

export interface ApplicationIdData {
  id: string;
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  registrationNumber?: string;
}

// Generate a unique application ID in format: UCAES + academic year + unique digits
export const generateApplicationId = async (): Promise<string> => {
  try {
    // Get current academic year from centralized system only
    let academicYear = new Date().getFullYear().toString()
    
    // Use centralized system only
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data()
      
      // Get the admission year from the academic year document
      if (systemData.currentAcademicYearId) {
        const yearRef = doc(db, 'academic-years', systemData.currentAcademicYearId)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data()
          // Use the actual year from the document (e.g., "2026-2027" → "2026")
          if (yearData.year) {
            const yearMatch = yearData.year.match(/(\d{4})/)
            if (yearMatch) {
              academicYear = yearMatch[1]
              console.log(`✅ Using admission year from centralized system: ${academicYear}`)
            }
          }
        }
      }
      
      // Extract year from display name like "2025/2026" → use second year "2026" for admission
      if (academicYear === new Date().getFullYear().toString()) {
        const displayYear = systemData.currentAcademicYear
        if (displayYear) {
          // For academic years like "2025/2026", use the second year (2026) for admissions
          const yearMatch = displayYear.match(/\d{4}\/(\d{4})/)
          if (yearMatch) {
            academicYear = yearMatch[1] // Use the second year (admission year)
            console.log(`✅ Using admission year from centralized display format: ${academicYear}`)
          } else {
            // Single year format, use as-is
            const singleYearMatch = displayYear.match(/(\d{4})/)
            if (singleYearMatch) {
              academicYear = singleYearMatch[1]
              console.log(`✅ Using single year format from centralized system: ${academicYear}`)
            }
          }
        }
      }
    } else {
      console.log("⚠️ No centralized system configuration found, using current year")
    }
    
    // Generate sequential number for this academic year
    const yearKey = `UCAES${academicYear}`
    const counterRef = doc(db, "application-counters", yearKey)
    
    try {
      // Try to get the existing counter
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        // Counter exists, increment it
        const currentCount = counterDoc.data().lastNumber || 0
        const nextNumber = currentCount + 1
        const paddedNumber = nextNumber.toString().padStart(4, "0")
        
        // Update the counter
        await updateDoc(counterRef, {
          lastNumber: nextNumber,
          lastUpdated: serverTimestamp()
        })
        
        const applicationId = `${yearKey}${paddedNumber}`
        console.log("✅ Generated sequential application ID:", applicationId, `(incremented from ${currentCount})`)
        return applicationId
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1
        const paddedNumber = firstNumber.toString().padStart(4, "0")
        
        // Create the counter document
        await setDoc(counterRef, {
          lastNumber: firstNumber,
          year: academicYear,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
        
        const applicationId = `${yearKey}${paddedNumber}`
        console.log("✅ Generated first application ID for year:", applicationId)
        return applicationId
      }
      
    } catch (error) {
      console.error("❌ Error accessing application counter:", error)
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0")
      const applicationId = `${yearKey}${fallbackNumber}`
      console.log("⚠️ Using fallback application ID:", applicationId)
      return applicationId
    }
  } catch (error) {
    console.error("❌ Error generating application ID:", error)
    
    // Ultimate fallback
    const year = new Date().getFullYear()
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const fallbackId = `UCAES${year}${timestamp.toString().slice(-4)}${random}`
    console.log("⚠️ Using ultimate fallback application ID:", fallbackId)
    return fallbackId
  }
};

// Generate sequential registration number with Firebase counter
export const generateSequentialRegistrationNumber = async (): Promise<string> => {
  try {
    const year = new Date().getFullYear()
    const yearKey = `UCAES${year}`
    
    console.log("🔢 Generating sequential registration number for year:", yearKey)
    
    // Get the counter document for this year
    const counterRef = doc(db, "registration-counters", yearKey)
    
    try {
      // Try to get the existing counter
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        // Counter exists, increment it
        const currentCount = counterDoc.data().lastNumber || 0
        const nextNumber = currentCount + 1
        const paddedNumber = nextNumber.toString().padStart(4, "0")
        
        // Update the counter
        await updateDoc(counterRef, {
          lastNumber: nextNumber,
          lastUpdated: serverTimestamp()
        })
        
        const registrationNumber = `${yearKey}${paddedNumber}`
        console.log("✅ Generated sequential registration number:", registrationNumber, `(incremented from ${currentCount})`)
        return registrationNumber
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1
        const paddedNumber = firstNumber.toString().padStart(4, "0")
        
        // Create the counter document
        await updateDoc(counterRef, {
          lastNumber: firstNumber,
          year: year,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
        
        const registrationNumber = `${yearKey}${paddedNumber}`
        console.log("✅ Generated first registration number for year:", registrationNumber)
        return registrationNumber
      }
      
    } catch (error) {
      console.error("❌ Error accessing registration counter:", error)
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0")
      const registrationNumber = `${yearKey}${fallbackNumber}`
      console.log("⚠️ Using fallback registration number:", registrationNumber)
      return registrationNumber
    }
  } catch (error) {
    console.error("❌ Error generating registration number:", error)
    throw error
  }
}

// Get the next sequential application number for the current year
// This is now handled by Firebase counters, but keeping for backward compatibility
export const getNextApplicationNumber = (): number => {
  // Use timestamp-based number instead of localStorage
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return timestamp + random;
};

// Generate a sequential application ID in format: UCAES + academic year + unique digits
export const generateSequentialApplicationId = async (): Promise<string> => {
  return await generateApplicationId();
};

// Store application data with ID in Firebase
export const storeApplicationData = async (userId: string, email: string, name: string, applicationId: string): Promise<void> => {
  try {
    console.log("🔄 Storing application data in Firebase...")
    
    const applicationData = {
      applicationId: applicationId, // FIXED: Use applicationId instead of id
      userId,
      email,
      name,
      createdAt: serverTimestamp(),
      status: 'draft',
      registrationNumber: await generateSequentialRegistrationNumber()
    };

    // Store in Firebase - using admission-applications collection
    await addDoc(collection(db, 'admission-applications'), applicationData)
    
    console.log("✅ Application data stored in Firebase successfully")
  } catch (error) {
    console.error("❌ Error storing application data:", error)
    throw error
  }
};

// Get application data by ID from Firebase
export const getApplicationData = async (applicationId: string): Promise<ApplicationIdData | null> => {
  try {
    const applicationsRef = collection(db, 'admission-applications')
    const q = query(applicationsRef, where('applicationId', '==', applicationId)) // FIXED: Use applicationId instead of id
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as ApplicationIdData
    }
    
    return null
  } catch (error) {
    console.error("❌ Error getting application data:", error)
    return null
  }
};

// Get application data by user ID from Firebase
export const getApplicationDataByUserId = async (userId: string): Promise<ApplicationIdData | null> => {
  try {
    const applicationsRef = collection(db, 'admission-applications')
    const q = query(applicationsRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as ApplicationIdData
    }
    
    return null
  } catch (error) {
    console.error("❌ Error getting application data by user ID:", error)
    return null
  }
};

// Update application status in Firebase
export const updateApplicationStatus = async (applicationId: string, status: ApplicationIdData['status']): Promise<void> => {
  try {
    const applicationsRef = collection(db, 'admission-applications')
    const q = query(applicationsRef, where('applicationId', '==', applicationId)) // FIXED: Use applicationId instead of id
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'admission-applications', querySnapshot.docs[0].id)
      await updateDoc(docRef, {
        status,
        lastUpdated: serverTimestamp()
      })
      console.log(`✅ Application ${applicationId} status updated to ${status}`)
    }
  } catch (error) {
    console.error("❌ Error updating application status:", error)
    throw error
  }
};

// Get all applications from Firebase (for admin/staff use)
export const getAllApplications = async (): Promise<ApplicationIdData[]> => {
  try {
    const applicationsRef = collection(db, 'admission-applications')
    const q = query(applicationsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ApplicationIdData)
  } catch (error) {
    console.error("❌ Error getting all applications:", error)
    return []
  }
};

// Validate application ID format (UCAES + academic year + unique digits)
export const isValidApplicationId = (id: string): boolean => {
  const pattern = /^UCAES\d{4}\d{4}$/;
  return pattern.test(id);
};

// Extract year from application ID
export const getApplicationYear = (applicationId: string): number => {
  const match = applicationId.match(/^UCAES(\d{4})\d{4}$/);
  return match ? parseInt(match[1]) : new Date().getFullYear();
};

// Extract sequence number from application ID
export const getApplicationSequence = (applicationId: string): number => {
  const match = applicationId.match(/^UCAES\d{4}(\d{4})$/);
  return match ? parseInt(match[1]) : 0;
};

// Create Firebase user account
export const createFirebaseUser = async (email: string, password: string, name: string): Promise<string> => {
  try {
    console.log("🔄 Creating Firebase user account...")
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: name
    })
    
    console.log("✅ Firebase user account created successfully:", user.uid)
    return user.uid
  } catch (error) {
    console.error("❌ Error creating Firebase user:", error)
    throw error
  }
}