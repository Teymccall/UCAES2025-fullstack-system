import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase"
import { updateSystemAcademicPeriod, getSystemAcademicPeriod } from "./system-config"

export interface AcademicYear {
  id: string
  year: string // e.g., "2025"
  displayName: string // e.g., "2025/2026 Academic Year"
  startDate: string
  endDate: string
  isActive: boolean
  admissionStatus: 'open' | 'closed' | 'pending'
  admissionStartDate?: string
  admissionEndDate?: string
  maxApplications?: number
  currentApplications: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface AcademicYearSettings {
  currentYear: string
  admissionStatus: 'open' | 'closed' | 'pending'
  admissionStartDate?: string
  admissionEndDate?: string
  maxApplications?: number
}

// Get current academic year settings
export async function getCurrentAcademicYear(): Promise<AcademicYear | null> {
  try {
    console.log("🔍 Fetching current academic year settings...")
    
    const settingsRef = doc(db, 'academic-settings', 'current-year')
    const settingsDoc = await getDoc(settingsRef)
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data()
      const currentYear = data.currentYear
      
      // Get the academic year document
      const yearRef = doc(db, 'academic-years', currentYear)
      const yearDoc = await getDoc(yearRef)
      
      if (yearDoc.exists()) {
        const yearData = yearDoc.data()
        console.log("✅ Current academic year found:", yearData)
        return { id: yearDoc.id, ...yearData } as AcademicYear
      }
    }
    
    console.log("⚠️ No current academic year found")
    return null
  } catch (error) {
    console.error("❌ Error fetching current academic year:", error)
    return null
  }
}

// Set current academic year
export async function setCurrentAcademicYear(year: string, userId: string): Promise<void> {
  try {
    console.log(`🔄 Setting current academic year to ${year}...`)
    
    // Update the settings document
    const settingsRef = doc(db, 'academic-settings', 'current-year')
    const settingsData: any = {
      currentYear: year,
      updatedAt: serverTimestamp()
    }
    
    // Only add updatedBy if userId is provided
    if (userId) {
      settingsData.updatedBy = userId
    }
    
    await setDoc(settingsRef, settingsData)
    
    console.log("✅ Current academic year updated successfully")
  } catch (error) {
    console.error("❌ Error setting current academic year:", error)
    throw error
  }
}

// Create or update academic year
export async function createAcademicYear(
  year: string,
  displayName: string,
  startDate: string,
  endDate: string,
  admissionStatus: 'open' | 'closed' | 'pending',
  userId: string,
  admissionStartDate?: string,
  admissionEndDate?: string,
  maxApplications?: number
): Promise<void> {
  try {
    console.log(`🔄 Creating/updating academic year ${year}...`)
    
    const yearRef = doc(db, 'academic-years', year)
    // Build year data object, filtering out undefined values
    const yearData: any = {
      year,
      displayName,
      startDate,
      endDate,
      admissionStatus,
      currentApplications: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId
    }
    
    // Only add optional fields if they have values
    if (admissionStartDate) yearData.admissionStartDate = admissionStartDate
    if (admissionEndDate) yearData.admissionEndDate = admissionEndDate
    if (maxApplications !== undefined && maxApplications !== null) yearData.maxApplications = maxApplications
    
    await setDoc(yearRef, yearData)
    
    console.log("✅ Academic year created/updated successfully")
  } catch (error) {
    console.error("❌ Error creating academic year:", error)
    throw error
  }
}

// Get all academic years
export async function getAllAcademicYears(): Promise<AcademicYear[]> {
  try {
    console.log("🔍 Fetching all academic years...")
    
    const yearsRef = collection(db, 'academic-years')
    const q = query(yearsRef, orderBy('year', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const years = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AcademicYear)
    console.log(`✅ Found ${years.length} academic years`)
    
    return years
  } catch (error) {
    console.error("❌ Error fetching academic years:", error)
    return []
  }
}

// Update admission status
export async function updateAdmissionStatus(
  year: string,
  status: 'open' | 'closed' | 'pending',
  userId: string,
  admissionStartDate?: string,
  admissionEndDate?: string
): Promise<void> {
  try {
    console.log(`🔄 Updating admission status for ${year} to ${status}...`)
    
    const yearRef = doc(db, 'academic-years', year)
    const updateData: any = {
      admissionStatus: status,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }
    
    if (admissionStartDate) updateData.admissionStartDate = admissionStartDate
    if (admissionEndDate) updateData.admissionEndDate = admissionEndDate
    
    await updateDoc(yearRef, updateData)
    
    // Check if this is the current academic year and update systemConfig if needed
    const systemConfig = await getSystemAcademicPeriod()
    if (systemConfig && systemConfig.currentAcademicYearId === year) {
      console.log("🔄 This is the current academic year, updating systemConfig...")
      
      // Get the updated year data to get the display name
      const updatedYearDoc = await getDoc(yearRef)
      if (updatedYearDoc.exists()) {
        const yearData = updatedYearDoc.data()
        await updateSystemAcademicPeriod(
          year,
          yearData.displayName || yearData.year || year,
          systemConfig.currentSemesterId,
          systemConfig.currentSemester,
          userId
        )
        console.log("✅ SystemConfig updated with new admission status")
      }
    }
    
    console.log("✅ Admission status updated successfully")
  } catch (error) {
    console.error("❌ Error updating admission status:", error)
    throw error
  }
}

// Check if admissions are currently open
export async function isAdmissionOpen(): Promise<boolean> {
  try {
    const currentYear = await getCurrentAcademicYear()
    
    if (!currentYear) {
      console.log("⚠️ No current academic year found")
      return false
    }
    
    const isOpen = currentYear.admissionStatus === 'open'
    console.log(`📊 Admission status for ${currentYear.year}: ${currentYear.admissionStatus} (${isOpen ? 'OPEN' : 'CLOSED'})`)
    
    return isOpen
  } catch (error) {
    console.error("❌ Error checking admission status:", error)
    return false
  }
}

// Get admission statistics for current year
export async function getAdmissionStatistics(): Promise<{
  currentYear: string
  admissionStatus: 'open' | 'closed' | 'pending'
  totalApplications: number
  maxApplications?: number
  admissionStartDate?: string
  admissionEndDate?: string
} | null> {
  try {
    const currentYear = await getCurrentAcademicYear()
    
    if (!currentYear) {
      return null
    }
    
    // Get total applications for current year
    const applicationsRef = collection(db, 'student-registrations')
    const q = query(
      applicationsRef,
      where('registrationNumber', '>=', `UCAES${currentYear.year}`),
      where('registrationNumber', '<', `UCAES${currentYear.year + 1}`)
    )
    const querySnapshot = await getDocs(q)
    
    return {
      currentYear: currentYear.year,
      admissionStatus: currentYear.admissionStatus,
      totalApplications: querySnapshot.size,
      maxApplications: currentYear.maxApplications,
      admissionStartDate: currentYear.admissionStartDate,
      admissionEndDate: currentYear.admissionEndDate
    }
  } catch (error) {
    console.error("❌ Error getting admission statistics:", error)
    return null
  }
}

// Initialize default academic year if none exists
export async function initializeDefaultAcademicYear(userId: string): Promise<void> {
  try {
    console.log("🔄 Initializing default academic year...")
    
    const currentYear = new Date().getFullYear().toString()
    const nextYear = (new Date().getFullYear() + 1).toString()
    
    // Check if current year already exists
    const existingYear = await getCurrentAcademicYear()
    if (existingYear) {
      console.log("✅ Academic year already exists")
      return
    }
    
    // Create default academic year
    await createAcademicYear(
      currentYear,
      `${currentYear}/${nextYear} Academic Year`,
      `${currentYear}-09-01`,
      `${nextYear}-08-31`,
      'open',
      userId,
      `${currentYear}-01-01`,
      `${nextYear}-08-31`,
      1000
    )
    
    // Set as current year
    await setCurrentAcademicYear(currentYear, userId)
    
    console.log("✅ Default academic year initialized")
  } catch (error) {
    console.error("❌ Error initializing default academic year:", error)
    throw error
  }
} 