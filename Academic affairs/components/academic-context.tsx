"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useFirebaseData } from "@/hooks/use-firebase-data"
import { 
  StaffService, AcademicYearsService, SemestersService, 
  StaffAuthService, type Staff as StaffType, 
  type AcademicYear as AcademicYearType,
  type Semester as SemesterType
} from "@/lib/firebase-service"

export interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  status: "active" | "completed" | "upcoming"
  semesters: AcademicSemester[]
  createdAt: string
}

export interface AcademicSemester {
  id: string
  name: string
  yearId: string
  startDate: string
  endDate: string
  registrationStart: string
  registrationEnd: string
  status: "active" | "completed" | "upcoming"
  isCurrentSemester: boolean
  createdAt: string
}

export interface StaffMember {
  id: string
  staffId: string
  name: string
  email: string
  department: string
  position: string
  assignedCourses: string[]
  permissions: string[]
  status: "active" | "inactive" | "suspended"
  loginCredentials?: {
    username: string
    password?: string 
  }
  createdAt: string
  lastLogin?: string
}

export interface DailyReport {
  id: string
  staffId: string
  staffName: string
  date: string
  reportContent: string
  activities: string[]
  issues: string[]
  achievements: string[]
  status: "draft" | "submitted" | "reviewed"
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  feedback?: string
}

export interface OperationalHours {
  id: string
  startTime: string
  endTime: string
  workingDays: string[]
  timezone: string
  isActive: boolean
  createdAt: string
}

interface AcademicContextType {
  academicYears: AcademicYear[]
  currentSemester: AcademicSemester | null
  staffMembers: StaffMember[]
  dailyReports: DailyReport[]
  operationalHours: OperationalHours | null
  loading: boolean

  // Academic Year/Semester Management
  addAcademicYear: (year: Omit<AcademicYear, "id" | "createdAt" | "semesters">) => Promise<void>
  addSemester: (semester: Omit<AcademicSemester, "id" | "createdAt">) => Promise<void>
  setCurrentSemester: (semesterId: string) => Promise<void>
  rolloverToNewSemester: (newSemesterData: Omit<AcademicSemester, "id" | "createdAt">) => Promise<void>

  // Staff Management
  addStaffMember: (staff: Omit<StaffMember, "id" | "createdAt">) => Promise<void>
  updateStaffMember: (id: string, staff: Partial<StaffMember>) => Promise<void>
  deleteStaffMember: (id: string) => Promise<void>
  authenticateStaff: (username: string, password: string) => Promise<StaffMember | null>

  // Daily Reports
  submitDailyReport: (report: Omit<DailyReport, "id">) => Promise<void>
  updateDailyReport: (id: string, report: Partial<DailyReport>) => Promise<void>
  getReportsByStaff: (staffId: string) => DailyReport[]
  getReportsByDate: (date: string) => DailyReport[]

  // Operational Hours
  setOperationalHours: (hours: Omit<OperationalHours, "id" | "createdAt">) => Promise<void>
  isWithinOperationalHours: () => boolean
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined)

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [semesters, setSemesters] = useState<AcademicSemester[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [operationalHours, setOperationalHoursState] = useState<OperationalHours | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch Firebase data
  const { data: firebaseYears, loading: yearsLoading } = useFirebaseData<AcademicYearType>(
    'academic-years',
    { orderBy: [['year', 'desc']] }
  )

  const { data: firebaseSemesters, loading: semestersLoading } = useFirebaseData<SemesterType>(
    'academic-semesters'
  )

  const { data: firebaseStaff, loading: staffLoading } = useFirebaseData<StaffType>(
    'academic-staff',
    { orderBy: [['name', 'asc']] }
  )

  // Transform Firebase data to context format
  useEffect(() => {
    if (firebaseYears && firebaseSemesters) {
      const transformedYears: AcademicYear[] = firebaseYears.map(year => {
        const yearSemesters = firebaseSemesters.filter(
          sem => sem.academicYear === year.id || sem.academicYear === year.year
        );
        
        const transformed: AcademicYear = {
          id: year.id || '',
          year: year.year,
          startDate: year.startDate instanceof Date ? year.startDate.toISOString() : String(year.startDate),
          endDate: year.endDate instanceof Date ? year.endDate.toISOString() : String(year.endDate),
          status: year.status as "active" | "completed" | "upcoming",
          createdAt: year.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          semesters: yearSemesters.map(sem => ({
            id: sem.id || '',
            name: sem.name,
            yearId: year.id || '',
            startDate: sem.startDate instanceof Date ? sem.startDate.toISOString() : String(sem.startDate),
            endDate: sem.endDate instanceof Date ? sem.endDate.toISOString() : String(sem.endDate),
            registrationStart: '',
            registrationEnd: '',
            status: sem.status as "active" | "completed" | "upcoming",
            isCurrentSemester: sem.status === 'active',
            createdAt: sem.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          }))
        };
        
        return transformed;
      });
      
      setAcademicYears(transformedYears);
      
      // Get all semesters
      const allSemesters = transformedYears.flatMap(y => y.semesters);
      setSemesters(allSemesters);
    }
  }, [firebaseYears, firebaseSemesters]);

  // Transform staff data
  useEffect(() => {
    if (firebaseStaff) {
      const transformedStaff: StaffMember[] = firebaseStaff.map(staff => ({
        id: staff.id || '',
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        department: staff.department,
        position: staff.position,
        assignedCourses: staff.assignedCourses || [],
        permissions: staff.permissions || [],
        status: staff.status as "active" | "inactive" | "suspended",
        createdAt: staff.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLogin: staff.lastLogin?.toDate?.()?.toISOString()
      }));
      
      setStaffMembers(transformedStaff);
    }
  }, [firebaseStaff]);

  // Track loading state
  useEffect(() => {
    setLoading(yearsLoading || semestersLoading || staffLoading);
  }, [yearsLoading, semestersLoading, staffLoading]);

  const currentSemester = semesters.find((s) => s.isCurrentSemester) || null

  const addAcademicYear = async (yearData: Omit<AcademicYear, "id" | "createdAt" | "semesters">) => {
    try {
      const firebaseYear: AcademicYearType = {
        year: yearData.year,
        startDate: new Date(yearData.startDate),
        endDate: new Date(yearData.endDate),
        status: yearData.status
      };
      
      await AcademicYearsService.create(firebaseYear);
    } catch (error) {
      console.error('Error adding academic year:', error);
      throw error;
    }
  }

  const addSemester = async (semesterData: Omit<AcademicSemester, "id" | "createdAt">) => {
    try {
      const firebaseSemester: SemesterType = {
        academicYear: semesterData.yearId,
        name: semesterData.name,
        number: semesterData.name.includes('First') ? '1' : 
                semesterData.name.includes('Second') ? '2' : 
                semesterData.name.includes('Third') ? '3' : '1',
        startDate: new Date(semesterData.startDate),
        endDate: new Date(semesterData.endDate),
        status: semesterData.status
      };
      
      await SemestersService.create(firebaseSemester);
    } catch (error) {
      console.error('Error adding semester:', error);
      throw error;
    }
  }

  const setCurrentSemester = async (semesterId: string) => {
    try {
      // Find the semester
      const semesterToUpdate = semesters.find(s => s.id === semesterId);
      if (!semesterToUpdate) throw new Error('Semester not found');
      
      // First reset any current semester
      const currentSemester = semesters.find(s => s.isCurrentSemester);
      if (currentSemester) {
        await SemestersService.update(currentSemester.id, {
          status: 'completed'
        });
      }
      
      // Set the new current semester
      await SemestersService.update(semesterId, {
        status: 'active'
      });
      
      // Update local state
      setSemesters(prev => prev.map(semester => ({
        ...semester,
        isCurrentSemester: semester.id === semesterId,
        status: semester.id === semesterId ? 'active' : 
                semester.isCurrentSemester ? 'completed' : semester.status
      })));
    } catch (error) {
      console.error('Error setting current semester:', error);
      throw error;
    }
  }

  const rolloverToNewSemester = async (newSemesterData: Omit<AcademicSemester, "id" | "createdAt">) => {
    try {
      // Mark current semester as completed
      if (currentSemester) {
        await SemestersService.update(currentSemester.id, {
          status: 'completed'
        });
      }
      
      // Add new semester as active
      const firebaseSemester: SemesterType = {
        academicYear: newSemesterData.yearId,
        name: newSemesterData.name,
        number: newSemesterData.name.includes('First') ? '1' : 
                newSemesterData.name.includes('Second') ? '2' : 
                newSemesterData.name.includes('Third') ? '3' : '1',
        startDate: new Date(newSemesterData.startDate),
        endDate: new Date(newSemesterData.endDate),
        status: 'active'
      };
      
      await SemestersService.create(firebaseSemester);
      
      console.log("Archiving previous semester data...");
    } catch (error) {
      console.error('Error rolling over to new semester:', error);
      throw error;
    }
  }

  const addStaffMember = async (staffData: Omit<StaffMember, "id" | "createdAt">) => {
    try {
      // Create Firebase auth user if login credentials are provided
      let authUid = '';
      
      if (staffData.loginCredentials && staffData.loginCredentials.password) {
        authUid = await StaffAuthService.register(
          staffData.email,
          staffData.loginCredentials.password,
          staffData.name
        );
      }
      
      const firebaseStaff: StaffType = {
        staffId: staffData.staffId,
        name: staffData.name,
        email: staffData.email,
        department: staffData.department,
        position: staffData.position,
        assignedCourses: staffData.assignedCourses || [],
        permissions: staffData.permissions || [],
        status: staffData.status,
        ...(authUid ? { authUid } : {})
      };
      
      await StaffService.create(firebaseStaff);
    } catch (error) {
      console.error('Error adding staff member:', error);
      throw error;
    }
  }

  const updateStaffMember = async (id: string, staffData: Partial<StaffMember>) => {
    try {
      const { loginCredentials, ...rest } = staffData;
      
      // Convert to Firebase format
      const firebaseStaffData: Partial<StaffType> = {
        ...rest
      };
      
      await StaffService.update(id, firebaseStaffData);
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  }

  const deleteStaffMember = async (id: string) => {
    try {
      await StaffService.delete(id);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  }

  const authenticateStaff = async (email: string, password: string): Promise<StaffMember | null> => {
    try {
      await StaffAuthService.login(email, password);
      
      // Get staff details
      const staffMember = await StaffService.getByEmail(email);
      
      if (!staffMember) return null;
      
      // Convert to StaffMember format
      return {
        id: staffMember.id || '',
        staffId: staffMember.staffId,
        name: staffMember.name,
        email: staffMember.email,
        department: staffMember.department,
        position: staffMember.position,
        assignedCourses: staffMember.assignedCourses || [],
        permissions: staffMember.permissions || [],
        status: staffMember.status as "active" | "inactive" | "suspended",
        createdAt: staffMember.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLogin: staffMember.lastLogin?.toDate?.()?.toISOString()
      };
    } catch (error) {
      console.error('Error authenticating staff:', error);
      return null;
    }
  }

  // For now, these are stub implementations using local state
  // These would also be migrated to Firebase in a complete implementation
  const submitDailyReport = async (reportData: Omit<DailyReport, "id">) => {
    const newReport = {
      ...reportData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };
    setDailyReports(prev => [...prev, newReport]);
  }

  const updateDailyReport = async (id: string, reportData: Partial<DailyReport>) => {
    setDailyReports(prev => prev.map(report => (report.id === id ? { ...report, ...reportData } : report)))
  }

  const getReportsByStaff = (staffId: string) => {
    return dailyReports.filter(report => report.staffId === staffId)
  }

  const getReportsByDate = (date: string) => {
    return dailyReports.filter(report => report.date === date)
  }

  const setOperationalHours = async (hoursData: Omit<OperationalHours, "id" | "createdAt">) => {
    const newHours = {
      ...hoursData,
      id: operationalHours?.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setOperationalHoursState(newHours)
  }

  const isWithinOperationalHours = (): boolean => {
    if (!operationalHours || !operationalHours.isActive) return false

    const now = new Date()
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" })
    const currentTime = now.toLocaleTimeString("en-US", { hour12: false })

    // Check if today is a working day
    if (!operationalHours.workingDays.includes(dayOfWeek)) return false

    // Parse start and end times
    const startTimeParts = operationalHours.startTime.split(":")
    const endTimeParts = operationalHours.endTime.split(":")
    const startTimeStr = `${startTimeParts[0].padStart(2, "0")}:${
      startTimeParts[1] ? startTimeParts[1].padStart(2, "0") : "00"
    }`
    const endTimeStr = `${endTimeParts[0].padStart(2, "0")}:${
      endTimeParts[1] ? endTimeParts[1].padStart(2, "0") : "00"
    }`

    // Compare current time with operational hours
    return currentTime >= startTimeStr && currentTime <= endTimeStr
  }

  return (
    <AcademicContext.Provider
      value={{
        academicYears,
        currentSemester,
        staffMembers,
        dailyReports,
        operationalHours,
        loading,
        addAcademicYear,
        addSemester,
        setCurrentSemester,
        rolloverToNewSemester,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        authenticateStaff,
        submitDailyReport,
        updateDailyReport,
        getReportsByStaff,
        getReportsByDate,
        setOperationalHours,
        isWithinOperationalHours,
      }}
    >
      {children}
    </AcademicContext.Provider>
  )
}

export function useAcademic() {
  const context = useContext(AcademicContext)
  if (context === undefined) {
    throw new Error("useAcademic must be used within a AcademicProvider")
  }
  return context
}
