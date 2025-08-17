"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useFirebaseData } from "@/hooks/use-firebase-data"
import { CoursesService, ProgramsService, type Course as CourseType, type Program as ProgramType } from "@/lib/firebase-service"

export interface Course {
  id: string
  code: string
  title: string
  name: string // Add both name and title for compatibility
  description: string
  credits: number
  level: number
  department: string
  prerequisites: string[]
  programId?: string
  registrationStatus: "open" | "closed" | "pending"
  semester: string
  yearOffered: string
  staffAssigned: string[]
  enrollmentLimit: number
  enrolledStudents: number
  waitlistCount: number
  status: "active" | "inactive"
  studyMode?: "Regular" | "Weekend" // Added study mode field
  createdAt: string
  updatedAt?: string
}

export interface CourseEnrollment {
  id: string
  courseId: string
  studentId: string
  studentName: string
  enrollmentDate: string
  status: "enrolled" | "waitlisted" | "dropped" | "completed"
  grade?: string
  paymentStatus: "paid" | "pending" | "waived"
  createdAt: string
  updatedAt?: string
}

export interface CourseSchedule {
  id: string
  courseId: string
  day: string
  startTime: string
  endTime: string
  room: string
  building: string
  instructorId: string
  instructorName: string
  type: "lecture" | "lab" | "tutorial"
  createdAt: string
}

export interface Program {
  id?: string;
  code: string;
  name: string;
  description?: string;
  duration?: string;
  degreeType?: string;
  faculty?: string;
  department?: string;
  requirements?: string[];
  courses?: string[];
  coursesPerLevel?: {
    [level: string]: {
      [semester: string]: {
        [year: string]: {
          [studyMode: string]: string[];
        };
      };
    };
  };
  status: 'active' | 'inactive' | 'pending' | 'discontinued';
  createdAt?: string;
}

interface CourseContextType {
  courses: Course[]
  programs: Program[]
  enrollments: CourseEnrollment[]
  schedules: CourseSchedule[]
  loading: boolean

  // Course Management
  addCourse: (course: Omit<Course, "id" | "createdAt">) => Promise<void>
  editCourse: (id: string, course: Partial<Course>) => Promise<void>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  getCoursesByProgram: (programId: string) => Course[]
  getCoursesByInstructor: (instructorId: string) => Course[]

  // Enrollment Management
  enrollStudent: (courseId: string, studentId: string, studentName: string) => Promise<void>
  dropStudent: (enrollmentId: string) => Promise<void>
  updateEnrollmentStatus: (enrollmentId: string, status: CourseEnrollment["status"]) => Promise<void>
  updateGrade: (enrollmentId: string, grade: string) => Promise<void>
  getEnrollmentsByCourse: (courseId: string) => CourseEnrollment[]
  getEnrollmentsByStudent: (studentId: string) => CourseEnrollment[]

  // Schedule Management
  addSchedule: (schedule: Omit<CourseSchedule, "id" | "createdAt">) => Promise<void>
  updateSchedule: (id: string, schedule: Partial<CourseSchedule>) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  getSchedulesByCourse: (courseId: string) => CourseSchedule[]
  getSchedulesByInstructor: (instructorId: string) => CourseSchedule[]

  // Program Management
  addProgram: (program: Omit<Program, "id" | "createdAt">) => Promise<void>
  editProgram: (id: string, program: Partial<Program>) => Promise<void>
  deleteProgram: (id: string) => Promise<void>
  getProgramCourses: (programId: string, level: string, semester: string, year?: string, studyMode?: string) => Course[]
  getProgramById: (programId: string) => Program | undefined
  addCoursesToProgram: (programId: string, level: string, semester: string, year: string, courseCodes: string[], studyMode?: string) => Promise<boolean>
  removeCoursesFromProgram: (programId: string, level: string, semester: string, year: string, courseCodes: string[], studyMode?: string) => Promise<boolean>
  // Bulk helpers
  upsertCourses: (items: Array<Partial<Course> & { code: string; title?: string; name?: string; credits?: number; level?: number; semester?: string; department?: string; studyMode?: "Regular" | "Weekend" }>) => Promise<string[]>
  bulkAssignToProgram: (programId: string, level: string, semester: string, year: string, courseCodes: string[], studyMode?: string) => Promise<boolean>
  // Auto alignment helper
  autoAlignProgramFromCatalog: (programId: string, year?: string, studyMode?: string) => Promise<boolean>
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [schedules, setSchedules] = useState<CourseSchedule[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch programs from Firestore
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        // Get programs from academic-programs collection
        const programsData = await ProgramsService.getAll();
        
        // Map Firebase data to our Program type and carry forward any existing
        // coursesPerLevel mapping structure stored on the program document.
        const formattedPrograms: Program[] = programsData.map(program => ({
          id: program.id || '',
          code: program.code || '',
          name: program.name || '',
          description: program.description || '',
          duration: `${program.durationYears} years` || '',
          degreeType: program.type || '',
          faculty: program.faculty || '',
          department: program.department || '',
          requirements: program.entryRequirements ? [program.entryRequirements] : [],
          courses: (program as any).courses || [],
          coursesPerLevel: (program as any).coursesPerLevel || {},
          status: (program.status || 'active') as 'active' | 'inactive' | 'pending' | 'discontinued',
          createdAt: program.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        
        setPrograms(formattedPrograms);
        console.log('Fetched programs:', formattedPrograms);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch courses from Firestore (no mocks, dedupe by code)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const firebaseCourses = await CoursesService.getAll();
        const formattedCourses = firebaseCourses.map(course => ({
          id: course.id || '',
          code: course.code,
          title: course.title,
          name: course.title,
          description: course.description || '',
          credits: course.credits,
          level: course.level,
          department: course.department,
          prerequisites: course.prerequisites || [],
          programId: course.programId,
          registrationStatus: 'open',
          semester: course.semester ? String(course.semester) : '1',
          yearOffered: new Date().getFullYear().toString(),
          staffAssigned: [],
          enrollmentLimit: 50,
          enrolledStudents: 0,
          waitlistCount: 0,
          status: course.status,
          createdAt: course.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: course.updatedAt?.toDate?.()?.toISOString(),
          courseType: (course as any).courseType || 'core',
          type: (course as any).courseType || 'core',
          theory: (course as any).theoryHours || 3,
          practical: (course as any).practicalHours || 0,
        }));
        // Dedupe by code to avoid duplicates if any
        const byCode = new Map<string, any>();
        formattedCourses.forEach(c => { if (!byCode.has(c.code)) byCode.set(c.code, c); });
        const deduped = Array.from(byCode.values());
        setCourses(deduped);
        console.log('Fetched courses:', deduped);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Remove mock enrollments/schedules. Keep real-only data.

  // Track loading state
  useEffect(() => {
    if (programs.length > 0 && courses.length > 0) {
      setLoading(false);
    }
  }, [courses.length, programs.length])

  const addCourse = async (courseData: Omit<Course, "id" | "createdAt">) => {
    try {
      const firebaseCourse: CourseType = {
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        credits: courseData.credits,
        level: courseData.level,
        semester: parseInt(courseData.semester, 10),
        department: courseData.department,
        prerequisites: courseData.prerequisites,
        programId: courseData.programId,
        status: courseData.status
      }
      
      // Save to Firebase and get the ID
      const id = await CoursesService.create(firebaseCourse)
      
      // Create the new course object for local state
      const newCourse: Course = {
        id,
        ...courseData,
        semester: courseData.semester, // Keep as string for UI compatibility
        registrationStatus: 'open',
        yearOffered: new Date().getFullYear().toString(),
        staffAssigned: [],
        enrollmentLimit: 50,
        enrolledStudents: 0,
        waitlistCount: 0,
        createdAt: new Date().toISOString(),
        name: courseData.title || courseData.name || "Untitled Course", // Ensure name is set
        // Add missing fields for UI compatibility
        courseType: courseData.courseType || 'core',
        type: courseData.courseType || 'core', // Map courseType to type for UI
        theory: courseData.theoryHours || 3, // Default theory hours
        practical: courseData.practicalHours || 0, // Default practical hours
      }
      
      // Update local state immediately, deduping by code to prevent duplicates
      setCourses(prev => {
        const byCode = new Map(prev.map(c => [c.code, c]))
        byCode.set(newCourse.code, newCourse)
        return Array.from(byCode.values())
      })
      
      console.log('✅ Course added successfully:', newCourse)
    } catch (error) {
      console.error('Error adding course:', error)
      throw error
    }
  }

  // Upsert a list of courses by code (create if missing, update basic fields if present)
  const upsertCourses: CourseContextType["upsertCourses"] = async (items) => {
    // Persistently upsert into Firebase, then refetch to avoid duplicates/mocks
    const updatedCodes: string[] = []
    for (const item of items) {
      const code = (item.code || '').trim()
      if (!code) continue
      const existing = courses.find(c => c.code === code)
      if (existing) {
        await CoursesService.update(existing.id, {
          title: item.title || item.name || existing.title,
          credits: item.credits ?? existing.credits,
          level: item.level ?? existing.level,
          semester: item.semester ? parseInt(String(item.semester), 10) : parseInt(String(existing.semester), 10),
          department: item.department ?? existing.department,
        })
      } else {
        const newCourse: Course = {
          id: '',
          code,
          title: item.title || item.name || code,
          name: item.title || item.name || code,
          description: '',
          credits: item.credits ?? 3,
          level: item.level ?? 100,
          department: item.department || '',
          prerequisites: [],
          programId: undefined,
          registrationStatus: 'open',
          semester: String(item.semester || '1'),
          yearOffered: new Date().getFullYear().toString(),
          staffAssigned: [],
          enrollmentLimit: 50,
          enrolledStudents: 0,
          waitlistCount: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        const id = await CoursesService.create({
          code: newCourse.code,
          title: newCourse.title,
          description: newCourse.description,
          credits: newCourse.credits,
          level: newCourse.level,
          department: newCourse.department,
          semester: parseInt(String(newCourse.semester), 10),
          status: 'active'
        } as any)
        newCourse.id = id
      }
      updatedCodes.push(code)
    }
    // Refetch authoritative list from Firebase and de-duplicate
    const firebaseCourses = await CoursesService.getAll()
    const formatted = firebaseCourses.map(course => ({
      id: course.id || '',
      code: course.code,
      title: course.title,
      name: course.title,
      description: course.description || '',
      credits: course.credits,
      level: course.level,
      department: course.department,
      prerequisites: course.prerequisites || [],
      programId: course.programId,
      registrationStatus: 'open',
      semester: course.semester ? String(course.semester) : '1',
      yearOffered: new Date().getFullYear().toString(),
      staffAssigned: [],
      enrollmentLimit: 50,
      enrolledStudents: 0,
      waitlistCount: 0,
      status: course.status,
      createdAt: course.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: course.updatedAt?.toDate?.()?.toISOString(),
      courseType: (course as any).courseType || 'core',
      type: (course as any).courseType || 'core',
      theory: (course as any).theoryHours || 3,
      practical: (course as any).practicalHours || 0,
    }))
    const unique = new Map<string, any>()
    formatted.forEach(c => { if (!unique.has(c.code)) unique.set(c.code, c) })
    setCourses(Array.from(unique.values()))
    return Array.from(new Set(updatedCodes))
  }

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      // Transform to Firebase format
      const firebaseCourseData: Partial<CourseType> = {
        ...(courseData.code && { code: courseData.code }),
        ...(courseData.title && { title: courseData.title }),
        ...(courseData.description && { description: courseData.description }),
        ...(courseData.credits !== undefined && { credits: courseData.credits }),
        ...(courseData.level !== undefined && { level: courseData.level }),
        ...(courseData.semester && { semester: parseInt(courseData.semester, 10) }),
        ...(courseData.department && { department: courseData.department }),
        ...(courseData.prerequisites && { prerequisites: courseData.prerequisites }),
        ...(courseData.programId && { programId: courseData.programId }),
        ...(courseData.status && { status: courseData.status })
      }
      
      await CoursesService.update(id, firebaseCourseData)
      
      // Update local state
      setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, ...courseData } : course)))
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      await CoursesService.delete(id)
      
      // Update local state
      setCourses((prev) => prev.filter((course) => course.id !== id))
    } catch (error) {
      console.error('Error deleting course:', error)
      throw error
    }
  }

  const getCoursesByProgram = (programId: string) => {
    return courses.filter((course) => course.programId === programId)
  }

  const getCoursesByInstructor = (instructorId: string) => {
    // Find schedules with this instructor
    const instructorSchedules = schedules.filter(
      (schedule) => schedule.instructorId === instructorId
    )
    
    // Get course IDs from those schedules
    const courseIds = instructorSchedules.map(
      (schedule) => schedule.courseId
    )
    
    // Filter courses by those IDs
    return courses.filter((course) => courseIds.includes(course.id))
  }

  // For now, these are stub implementations using local state
  // These would also be migrated to Firebase in a complete implementation
  const enrollStudent = async (courseId: string, studentId: string, studentName: string) => {
    const newEnrollment: CourseEnrollment = {
      id: `enrollment-${Date.now()}`,
      courseId,
      studentId,
      studentName,
      enrollmentDate: new Date().toISOString(),
      status: "enrolled",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    }
    
    setEnrollments((prev) => [...prev, newEnrollment])
    
    // Update enrolled count
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, enrolledStudents: course.enrolledStudents + 1 }
          : course
      )
    )
  }

  const dropStudent = async (enrollmentId: string) => {
    const enrollment = enrollments.find(
      (enrollment) => enrollment.id === enrollmentId
    )
    
    if (!enrollment) return
    
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId ? { ...e, status: "dropped" } : e
      )
    )
    
    // Update enrolled count
    setCourses((prev) =>
      prev.map((course) =>
        course.id === enrollment.courseId
          ? { ...course, enrolledStudents: course.enrolledStudents - 1 }
          : course
      )
    )
  }

  const updateEnrollmentStatus = async (enrollmentId: string, status: CourseEnrollment["status"]) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e))
    )
  }

  const updateGrade = async (enrollmentId: string, grade: string) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, grade } : e))
    )
  }

  const getEnrollmentsByCourse = (courseId: string) => {
    return enrollments.filter(
      (enrollment) => enrollment.courseId === courseId
    )
  }

  const getEnrollmentsByStudent = (studentId: string) => {
    return enrollments.filter(
      (enrollment) => enrollment.studentId === studentId
    )
  }

  const addSchedule = async (scheduleData: Omit<CourseSchedule, "id" | "createdAt">) => {
    const newSchedule: CourseSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    
    setSchedules((prev) => [...prev, newSchedule])
  }

  const updateSchedule = async (id: string, scheduleData: Partial<CourseSchedule>) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, ...scheduleData } : schedule
      )
    )
  }

  const deleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
  }

  const getSchedulesByCourse = (courseId: string) => {
    return schedules.filter((schedule) => schedule.courseId === courseId)
  }

  const getSchedulesByInstructor = (instructorId: string) => {
    return schedules.filter(
      (schedule) => schedule.instructorId === instructorId
    )
  }

  const addProgram = async (programData: Omit<Program, "id" | "createdAt">) => {
    try {
      // Create program data in Firebase format
      const firebaseProgramData: ProgramType = {
        code: programData.code,
        name: programData.name,
        description: programData.description || '',
        durationYears: parseInt(programData.duration?.split(' ')[0] || '4', 10),
        faculty: programData.faculty || 'General',
        department: programData.department || '',
        type: (programData.degreeType?.toLowerCase() || 'degree') as 'degree' | 'diploma' | 'certificate' | 'master' | 'phd',
        credits: 120, // Default value
        entryRequirements: programData.requirements?.join(', ') || '',
        status: programData.status || 'active'
      };

      // Add to Firebase
      const id = await ProgramsService.create(firebaseProgramData);
      
      // Create and add to local state
      const newProgram: Program = {
        id,
        ...programData,
        createdAt: new Date().toISOString()
      };
      
      setPrograms((prev) => [...prev, newProgram]);
    } catch (error) {
      console.error('Error adding program:', error);
      throw error;
    }
  }

  const editProgram = async (id: string, programData: Partial<Program>) => {
    try {
      // Convert to Firebase format
      const firebaseProgramData: Partial<ProgramType> = {};

      if (programData.code) firebaseProgramData.code = programData.code;
      if (programData.name) firebaseProgramData.name = programData.name;
      if (programData.description) firebaseProgramData.description = programData.description;
      if (programData.duration) {
        const years = parseInt(programData.duration.split(' ')[0], 10);
        if (!isNaN(years)) firebaseProgramData.durationYears = years;
      }
      if (programData.faculty) firebaseProgramData.faculty = programData.faculty;
      if (programData.department) firebaseProgramData.department = programData.department;
      if (programData.degreeType) {
        firebaseProgramData.type = programData.degreeType.toLowerCase() as 'degree' | 'diploma' | 'certificate' | 'master' | 'phd';
      }
      if (programData.requirements) {
        firebaseProgramData.entryRequirements = programData.requirements.join(', ');
      }
      if (programData.status) firebaseProgramData.status = programData.status;

      // Update in Firebase
      await ProgramsService.update(id, firebaseProgramData);
      
      // Update local state
      setPrograms((prev) => 
        prev.map((program) => (program.id === id ? { ...program, ...programData } : program))
      );
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  }

  const deleteProgram = async (id: string) => {
    try {
      // Delete from Firebase
      await ProgramsService.delete(id);
      
      // Update local state
      setPrograms((prev) => prev.filter((program) => program.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  }

  // Get courses for a specific program, filtered by level, semester, year, and study mode
  const getProgramCourses = (programId: string, level: string, semester: string, year?: string, studyMode?: string): Course[] => {
    if (!programId) return [];

    const program = programs.find(p => p.id === programId)
    const levelKey = `${parseInt(level, 10) || level}`
    // Normalize semester key: accept "1"/"2" or labels
    const normalizeSemester = (s: string) => {
      if (!s) return s
      const trimmed = String(s).trim()
      if (trimmed === '1' || /first/i.test(trimmed)) return 'First Semester'
      if (trimmed === '2' || /second/i.test(trimmed)) return 'Second Semester'
      if (trimmed === '3' || /third/i.test(trimmed) || /trimester/i.test(trimmed)) return 'Third Trimester'
      return trimmed
    }
    const semesterKey = normalizeSemester(semester)

    // Preferred source: structured mapping on the program document
    const codesFromMapping = new Set<string>()
    if (program?.coursesPerLevel?.[levelKey]?.[semesterKey]) {
      const yearMap = program.coursesPerLevel[levelKey][semesterKey]
      
      // Handle the 'all' year structure that exists in the database
      if (yearMap['all']) {
        const modeMap = yearMap['all']
        if (studyMode && studyMode !== 'all') {
          const arr = modeMap[studyMode] || []
          arr.forEach(c => codesFromMapping.add(c))
        } else {
          Object.values(modeMap).forEach(arr => arr.forEach(c => codesFromMapping.add(c)))
        }
      }
      // If a specific year mapping exists, use it; otherwise merge across all years
      else if (year && yearMap[year]) {
        if (studyMode && studyMode !== 'all') {
          const arr = yearMap[year][studyMode] || []
          arr.forEach(c => codesFromMapping.add(c))
        } else {
          Object.values(yearMap[year]).forEach(arr => arr.forEach(c => codesFromMapping.add(c)))
        }
      } else {
        // Merge all years for this level+semester
        Object.values(yearMap).forEach(modeMap => {
          if (studyMode && studyMode !== 'all') {
            const arr = (modeMap as any)[studyMode] || []
            arr.forEach((c: string) => codesFromMapping.add(c))
          } else {
            Object.values(modeMap as any).forEach((arr: any) => (arr as string[]).forEach(c => codesFromMapping.add(c)))
          }
        })
      }
    }

    if (codesFromMapping.size > 0) {
      // Map codes to catalog courses; if duplicates exist, Set handles it
      const byCode = new Map(courses.map(c => [c.code, c]))
      const result: Course[] = []
      codesFromMapping.forEach(code => {
        const course = byCode.get(code)
        if (course) result.push(course)
      })
      return result
    }

    // Fallback: filter by catalog fields (program name/level/semester/etc.)
    const targetProgram = programs.find(p => p.id === programId);
    const programName = targetProgram?.name || '';
    
    // Enhanced fallback: Search by program name instead of programId
    let filteredCourses = courses.filter(course => {
      // Match by program name in course.program field
      const courseProgram = course.program || course.programName || '';
      return courseProgram === programName || 
             courseProgram.toLowerCase().includes(programName.toLowerCase()) ||
             programName.toLowerCase().includes(courseProgram.toLowerCase());
    });
    
    if (level) {
      const levelNum = parseInt(level, 10);
      if (!isNaN(levelNum)) {
        filteredCourses = filteredCourses.filter(course => course.level === levelNum);
      }
    }
    if (semester) {
      const sKey = normalizeSemester(semester)
      filteredCourses = filteredCourses.filter(course => {
        const courseSem = normalizeSemester(String(course.semester))
        return courseSem === sKey
      })
    }
    // Note: catalog entries are year-agnostic; do not filter by year here
    if (studyMode && studyMode !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.studyMode === studyMode || (studyMode === 'Regular' && !course.studyMode));
    }
    
    // Debug logging
    console.log(`[DEBUG] Fallback filtering: programName=${programName}, level=${level}, semester=${semester}, found=${filteredCourses.length} courses`);
    return filteredCourses
  }

  // Get program by ID
  const getProgramById = (programId: string): Program | undefined => {
    return programs.find(program => program.id === programId);
  }

  // Add implementation for addCoursesToProgram that handles study mode
  const addCoursesToProgram = async (programId: string, level: string, semester: string, year: string, courseCodes: string[], studyMode: string = 'Regular'): Promise<boolean> => {
    try {
      // Find the program
      const program = programs.find(p => p.id === programId);
      if (!program) return false;
      
      // Create a copy to modify
      const updatedProgram = { ...program };
      
      // Initialize coursesPerLevel structure if needed
      if (!updatedProgram.coursesPerLevel) {
        updatedProgram.coursesPerLevel = {};
      }
      
      // Initialize level if needed
      if (!updatedProgram.coursesPerLevel[level]) {
        updatedProgram.coursesPerLevel[level] = {};
      }
      
      // Initialize semester if needed
      if (!updatedProgram.coursesPerLevel[level][semester]) {
        updatedProgram.coursesPerLevel[level][semester] = {};
      }
      
      // Initialize year if needed
      if (!updatedProgram.coursesPerLevel[level][semester][year]) {
        updatedProgram.coursesPerLevel[level][semester][year] = {};
      }
      
      // Initialize study mode if needed
      if (!updatedProgram.coursesPerLevel[level][semester][year][studyMode]) {
        updatedProgram.coursesPerLevel[level][semester][year][studyMode] = [];
      }
      
      // Add courses to the level, semester, year and study mode
      courseCodes.forEach(code => {
        if (!updatedProgram.coursesPerLevel?.[level]?.[semester]?.[year]?.[studyMode]?.includes(code)) {
          updatedProgram.coursesPerLevel[level][semester][year][studyMode].push(code);
        }
        
        // Also add to global courses array if not already there
        if (!updatedProgram.courses?.includes(code)) {
          if (!updatedProgram.courses) updatedProgram.courses = [];
          updatedProgram.courses.push(code);
        }
      });
      
      // Find the course objects to update their programId
      for (const code of courseCodes) {
        const courseIndex = courses.findIndex(c => c.code === code);
        if (courseIndex >= 0) {
          const updatedCourse = { ...courses[courseIndex], programId };
          courses[courseIndex] = updatedCourse;
          
          // Update in Firebase (would implement in real app)
          // await CoursesService.update(updatedCourse.id, { programId });
        }
      }
      
      // Update local state
      setPrograms(prev => 
        prev.map(p => p.id === programId ? updatedProgram : p)
      );
      
      return true;
    } catch (error) {
      console.error('Error adding courses to program:', error);
      return false;
    }
  };

  // Add implementation for removeCoursesFromProgram that handles study mode
  const removeCoursesFromProgram = async (programId: string, level: string, semester: string, year: string, courseCodes: string[], studyMode: string = 'Regular'): Promise<boolean> => {
    try {
      // Find the program
      const program = programs.find(p => p.id === programId);
      if (!program) return false;
      
      // Create a copy to modify
      const updatedProgram = { ...program };
      
      // Check if the structure exists
      if (
        updatedProgram.coursesPerLevel?.[level]?.[semester]?.[year]?.[studyMode]
      ) {
        // Remove courses from the level, semester, year and study mode
        updatedProgram.coursesPerLevel[level][semester][year][studyMode] = 
          updatedProgram.coursesPerLevel[level][semester][year][studyMode].filter(
            code => !courseCodes.includes(code)
          );
        
        // Also remove from global courses array if no longer used in any level/semester
        if (updatedProgram.courses) {
          // Check if courses are used in other levels/semesters
          const usedCourseCodes = new Set<string>();
          
          // Collect all course codes from all levels/semesters/years/modes
          Object.values(updatedProgram.coursesPerLevel || {}).forEach(levelData => {
            Object.values(levelData).forEach(semesterData => {
              Object.values(semesterData).forEach(yearData => {
                Object.values(yearData).forEach(modeData => {
                  modeData.forEach(code => usedCourseCodes.add(code));
                });
              });
            });
          });
          
          // Remove courses that are not used anywhere else
          updatedProgram.courses = updatedProgram.courses.filter(
            code => usedCourseCodes.has(code)
          );
        }
      }
      
      // Update local state
      setPrograms(prev => 
        prev.map(p => p.id === programId ? updatedProgram : p)
      );
      
      return true;
    } catch (error) {
      console.error('Error removing courses from program:', error);
      return false;
    }
  };

  const bulkAssignToProgram: CourseContextType["bulkAssignToProgram"] = async (programId, level, semester, year, courseCodes, studyMode = 'Regular') => {
    // De-duplicate and delegate to addCoursesToProgram
    const unique = Array.from(new Set(courseCodes.map(c => c.trim()).filter(Boolean)))
    return addCoursesToProgram(programId, level, semester, year, unique, studyMode)
  }

  // Build a mapping from the existing academic-courses catalog if a program has no mapping yet
  const autoAlignProgramFromCatalog: CourseContextType["autoAlignProgramFromCatalog"] = async (programId, year = 'all', studyMode = 'Regular') => {
    try {
      const program = programs.find(p => p.id === programId)
      if (!program) return false
      const hasMapping = !!program.coursesPerLevel && Object.keys(program.coursesPerLevel || {}).length > 0
      if (hasMapping) return true
      // Partition catalog courses by level/semester
      const catalog = courses.filter(c => c.programId === programId)
      if (catalog.length === 0) return false
      const groupKey = (lvl: number | string, sem: string | number) => `${lvl}|${sem}`
      const groups = new Map<string, string[]>()
      for (const c of catalog) {
        const lvl = c.level || parseInt(String(c.level || '100'), 10)
        const semStr = String(c.semester)
        const sem = /3|third|trimester/i.test(semStr)
          ? 'Third Trimester'
          : /2|second/i.test(semStr)
          ? 'Second Semester'
          : 'First Semester'
        const key = groupKey(lvl, sem)
        const arr = groups.get(key) || []
        if (!arr.includes(c.code)) arr.push(c.code)
        groups.set(key, arr)
      }
      // Write mapping via addCoursesToProgram so local state updates
      for (const [key, codes] of groups.entries()) {
        const [lvl, sem] = key.split('|')
        await addCoursesToProgram(programId, String(lvl), String(sem), year, codes, studyMode)
      }
      return true
    } catch (e) {
      console.error('autoAlignProgramFromCatalog failed', e)
      return false
    }
  }

  return (
    <CourseContext.Provider
      value={{
        courses,
        programs,
        enrollments,
        schedules,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        getCoursesByProgram,
        getCoursesByInstructor,
        enrollStudent,
        dropStudent,
        updateEnrollmentStatus,
        updateGrade,
        getEnrollmentsByCourse,
        getEnrollmentsByStudent,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getSchedulesByCourse,
        getSchedulesByInstructor,
        addCourse,
        editCourse: updateCourse,
        deleteCourse,
        addProgram,
        editProgram,
        deleteProgram,
        getProgramCourses,
        getProgramById,
        addCoursesToProgram,
        removeCoursesFromProgram,
        upsertCourses,
        bulkAssignToProgram,
        autoAlignProgramFromCatalog,
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourses() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider")
  }
  return context as CourseContextType
}
