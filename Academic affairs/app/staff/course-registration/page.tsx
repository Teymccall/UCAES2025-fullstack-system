"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Search, User, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { db } from "@/lib/firebase"
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  setDoc,
  limit
} from "firebase/firestore"
import { useAcademic } from "@/components/academic-context"
import { useCourses } from "@/components/course-context"
import { detectCourseScheduleConflicts } from "@/lib/schedule-utils"
import Link from "next/link"

interface Student {
  id: string
  name: string
  registrationNumber: string
  program: string
  level: string
  gender: string
  studyMode: "Regular" | "Weekend"
  email: string
  phone?: string
  status: "active" | "inactive" | "suspended"
}

interface Course {
  id?: string
  code: string
  title: string
  name: string
  description: string
  credits: number
  theory: number;
  practical: number;
  level: number
  semester: number
  department: string
  prerequisites: string[]
  status: "active" | "inactive"
  type?: "core" | "elective" // Added for filtering
  specialization?: { name: string } // Added for specialization filtering
  electiveGroup?: string // Added for elective courses
}

interface Registration {
  id?: string
  studentId: string
  studentName: string
  registrationNumber: string
  email: string
  academicYear: string
  semester: string
  level: string
  program: string
  studyMode: string
  courses: {
    courseId: string
    courseCode: string
    courseName: string
    credits: number
  }[]
  totalCredits: number
  registrationDate: any
  status: "pending" | "approved" | "rejected"
  registeredBy: string
}

function CourseRegistrationContent() {
  const { toast } = useToast()
  const { academicYears, currentAcademicYear, currentSemester, currentRegularSemester, currentWeekendSemester } = useAcademic()
  const { courses, programs, getProgramCourses } = useCourses()
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // State for selected student and registration
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [existingRegistration, setExistingRegistration] = useState<Registration | null>(null)
  const [totalCredits, setTotalCredits] = useState(0)
  
  // New state for program and level selection
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)
  
  // New state for specialization
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("")
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([])
  
  // New state for dynamic dropdowns
  const [programOptions, setProgramOptions] = useState<{id: string, name: string}[]>([])
  const [levelOptions, setLevelOptions] = useState<number[]>([])
  const [semesterOptions, setSemesterOptions] = useState<number[]>([])
  
  // Add state for active academic data
  const [activeAcademicYear, setActiveAcademicYear] = useState<{ id: string, name: string } | null>(null)
  const [activeRegularSemester, setActiveRegularSemester] = useState<{ id: string, name: string } | null>(null)
  const [activeWeekendSemester, setActiveWeekendSemester] = useState<{ id: string, name: string } | null>(null)
  
  // Fetch active academic year and semester - Fix dependencies
  useEffect(() => {
    // Use the academic context data instead of fetching directly from Firebase
    if (currentAcademicYear) {
      // Set active academic year from context
      setActiveAcademicYear({
        id: currentAcademicYear.id,
        name: currentAcademicYear.year
      });
    }
    
    // Use current semesters from context
    if (currentRegularSemester) {
      setActiveRegularSemester({
        id: currentRegularSemester.id,
        name: currentRegularSemester.name
      });
    }
    
    if (currentWeekendSemester) {
      setActiveWeekendSemester({
        id: currentWeekendSemester.id,
        name: currentWeekendSemester.name
      });
    }
  }, [currentAcademicYear, currentRegularSemester, currentWeekendSemester]);
  
  // Set default academic year and semester - Fix dependencies and separate concerns
  useEffect(() => {
    // Only set the selected academic year from context
    if (currentAcademicYear) {
      setSelectedAcademicYear(currentAcademicYear.year);
    } else if (academicYears && academicYears.length > 0) {
      setSelectedAcademicYear(academicYears[0].year);
    }
  }, [academicYears, currentAcademicYear]);
  
  // Load programs from context
  useEffect(() => {
    if (programs && programs.length > 0) {
      setIsLoadingPrograms(true)
      const programOptions = programs.map(program => ({
        id: program.id || '',
        name: program.name,
        code: program.code || '',
        type: program.degreeType || ''
      }))
      console.log("[DEBUG] Loaded program options from context:", programOptions);
      setProgramOptions(programOptions)
      setIsLoadingPrograms(false)
    }
  }, [programs])

  // When a program is selected, get unique levels from context courses
  useEffect(() => {
    if (!selectedProgram) {
      setLevelOptions([]);
      return;
    }
    
    console.log(`Fetching levels for program: ${selectedProgram}`);
    const programCourses = courses.filter(course => course.programId === selectedProgram)
    
    if (programCourses.length === 0) {
      console.warn(`No courses found for programId: ${selectedProgram}. Levels cannot be determined.`);
      setLevelOptions([]);
      return;
    }

    const levels = Array.from(new Set(programCourses.map(course => course.level))).sort((a, b) => a - b)
    console.log("Found levels from context:", levels);
    setLevelOptions(levels)
  }, [selectedProgram, courses])

  // When a program and level are selected, get unique semesters from context and auto-select the current one
  useEffect(() => {
    if (!selectedProgram || !selectedLevel) {
      setSemesterOptions([]);
      setSelectedSemester("");
      return;
    }

    const levelNum = parseInt(selectedLevel, 10);
    if (isNaN(levelNum)) return;

    // Get semesters from context courses
    const programLevelCourses = courses.filter(
      course => course.programId === selectedProgram && course.level === levelNum
    );
    
    const semesters = Array.from(
      new Set(programLevelCourses.map(course => {
        // Handle both string and number semester values
        const semester = course.semester;
        return typeof semester === 'string' ? parseInt(semester, 10) : semester;
      }).filter(sem => !isNaN(sem)))
    ).sort((a, b) => a - b);
    
    console.log("Found semesters from context:", semesters);
    setSemesterOptions(semesters);

    // Auto-select the centralized semester based on the student's study mode
    if (selectedStudent) {
      const activeSemester =
        selectedStudent.studyMode === "Regular"
          ? currentRegularSemester
          : selectedStudent.studyMode === "Weekend"
          ? currentWeekendSemester
          : currentSemester;

      if (activeSemester?.name) {
        const semesterNum = activeSemester.name.toLowerCase().includes("first") ? 1 : 2;
        if (semesters.includes(semesterNum)) {
          setSelectedSemester(semesterNum.toString());
        } else {
          setSelectedSemester(""); // Reset if not an option
        }
      } else {
        setSelectedSemester("");
      }
    } else {
      setSelectedSemester(""); // No student selected
    }
  }, [
    selectedProgram,
    selectedLevel,
    selectedStudent,
    currentRegularSemester,
    currentWeekendSemester,
    currentSemester,
    courses,
  ]);

  // Auto-reload courses when context changes and we have all required selections
  useEffect(() => {
    if (selectedProgram && selectedLevel && selectedSemester && courses.length > 0) {
      console.log("[DEBUG] Auto-reloading courses due to context change");
      loadAvailableCourses(selectedProgram, selectedLevel, selectedSemester, selectedSpecialization);
    }
  }, [courses, selectedProgram, selectedLevel, selectedSemester, selectedSpecialization]);
  
  // When program, level, and semester are selected, fetch specializations for Level 400
  useEffect(() => {
    if (selectedProgram && selectedLevel === '400' && selectedSemester) {
      const fetchSpecializations = async () => {
        const coursesRef = collection(db, "academic-courses");
        const q = query(
          coursesRef,
          where("programId", "==", selectedProgram),
          where("level", "==", 400),
          where("semester", "==", parseInt(selectedSemester, 10))
        );
        const snapshot = await getDocs(q);
        const specializations = Array.from(
          new Set(snapshot.docs.map(doc => doc.data().specialization?.name).filter(Boolean))
        );
        setAvailableSpecializations(specializations);
      };
      fetchSpecializations();
    } else {
      setAvailableSpecializations([]);
      setSelectedSpecialization("");
    }
  }, [selectedProgram, selectedLevel, selectedSemester]);
  
  // Function to sync student data to main collection
  const syncStudentToMainCollection = async (student: Student) => {
    try {
      console.log(`[DEBUG] Syncing student ${student.registrationNumber} to main students collection`)
      
      // Check if student already exists in students collection
      const studentsRef = collection(db, "students")
      const existingQuery = query(studentsRef, where("registrationNumber", "==", student.registrationNumber))
      const existingSnapshot = await getDocs(existingQuery)
      
      if (existingSnapshot.empty) {
        // Create new record in students collection
        await addDoc(studentsRef, {
          name: student.name,
          registrationNumber: student.registrationNumber,
          level: student.level,
          currentLevel: student.level,
          program: student.program,
          programme: student.program,
          studyMode: student.studyMode,
          email: student.email,
          gender: student.gender,
          status: student.status,
          createdAt: serverTimestamp(),
          syncedAt: serverTimestamp()
        })
        console.log(`[DEBUG] Created new student record in students collection`)
      } else {
        // Update existing record
        const existingDoc = existingSnapshot.docs[0]
        await updateDoc(existingDoc.ref, {
          level: student.level,
          currentLevel: student.level,
          program: student.program,
          programme: student.program,
          studyMode: student.studyMode,
          email: student.email,
          gender: student.gender,
          status: student.status,
          syncedAt: serverTimestamp()
        })
        console.log(`[DEBUG] Updated existing student record in students collection`)
      }
    } catch (error) {
      console.error("[DEBUG] Error syncing student data:", error)
    }
  }
  
  // Search for students
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a student name or ID to search",
        variant: "destructive",
      })
      return
    }
    
    setIsSearching(true)
    setSearchResults([])
    setSelectedStudent(null)
    
    try {
      let students: Student[] = []
      
      // Search in both collections to ensure we get the most up-to-date data
      
      // 1. First search in students collection
      const studentsRef = collection(db, "students")
      let studentsQuery = query(studentsRef)
      
      // Check if search term is a registration number
      if (/^UCAES\d+$/.test(searchTerm.toUpperCase())) {
        studentsQuery = query(studentsRef, where("registrationNumber", "==", searchTerm.toUpperCase()))
      } else {
        // Search by name (case insensitive)
        studentsQuery = query(studentsRef, where("name", ">=", searchTerm), where("name", "<=", searchTerm + "\uf8ff"))
      }
      
      const studentsSnapshot = await getDocs(studentsQuery)
      
      studentsSnapshot.forEach((doc) => {
        const studentData = doc.data() as Omit<Student, "id">
        students.push({
          id: doc.id,
          ...studentData,
          name: studentData.name || 
                (studentData.surname && studentData.otherNames ? 
                `${studentData.surname} ${studentData.otherNames}` : 
                studentData.fullName || "Unknown"),
          registrationNumber: studentData.registrationNumber || "Not assigned",
          level: studentData.level || studentData.currentLevel || "100",
          studyMode: studentData.studyMode || "Regular",
          program: studentData.program || studentData.programme || "Not assigned"
        })
      })
      
      // 2. If no results found, also search in student-registrations collection
      if (students.length === 0) {
        console.log("[DEBUG] No students found in 'students' collection, searching 'student-registrations'...")
        
        const registrationsRef = collection(db, "student-registrations")
        let registrationsQuery = query(registrationsRef)
        
        if (/^UCAES\d+$/.test(searchTerm.toUpperCase())) {
          registrationsQuery = query(registrationsRef, where("registrationNumber", "==", searchTerm.toUpperCase()))
        } else {
          // Search by surname or other names
          registrationsQuery = query(registrationsRef, where("surname", ">=", searchTerm.toUpperCase()), where("surname", "<=", searchTerm.toUpperCase() + "\uf8ff"))
        }
        
        const registrationsSnapshot = await getDocs(registrationsQuery)
        
        registrationsSnapshot.forEach((doc) => {
          const regData = doc.data()
          students.push({
            id: doc.id,
            name: `${regData.surname || ''} ${regData.otherNames || ''}`.trim(),
            registrationNumber: regData.registrationNumber || "Not assigned",
            level: regData.currentLevel || regData.entryLevel || "100", // Use currentLevel first
            studyMode: (regData.scheduleType as "Regular" | "Weekend") || "Regular",
            program: regData.programme || "Not assigned",
            email: regData.email || "",
            gender: regData.gender || "Unknown",
            status: regData.status === "approved" ? "active" : "inactive"
          })
        })
        
        if (students.length > 0) {
          console.log(`[DEBUG] Found ${students.length} students in student-registrations collection`)
          // Optionally sync to students collection for future searches
          await syncStudentToMainCollection(students[0])
        }
      }
      
      setSearchResults(students)
      
      if (students.length === 0) {
        toast({
          title: "No students found",
          description: "No students match your search criteria",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching for students:", error)
      toast({
        title: "Search failed",
        description: "An error occurred while searching for students",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }
  
  // Handle student selection
  const selectStudent = async (student: Student) => {
    setSelectedStudent(student)

    // Enhanced program matching with multiple strategies
    const normalize = (str: string) => str.replace(/\./g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const studentProgramName = normalize(student.program);

    // Strategy 1: Exact normalized match
    let program = programOptions.find(p => normalize(p.name) === studentProgramName)

    // Strategy 2: Partial match if exact fails
    if (!program) {
      program = programOptions.find(p => 
        normalize(p.name).includes(studentProgramName) || 
        studentProgramName.includes(normalize(p.name))
      )
    }

    // Strategy 3: Match by common variations
    if (!program) {
      const variations = {
        "bsc sustainable agriculture": "BSc. Sustainable Agriculture",
        "b.sc sustainable agriculture": "BSc. Sustainable Agriculture", 
        "bsc environmental science": "BSc. Environmental Science and Management",
        "b.sc environmental science": "BSc. Environmental Science and Management",
        "bsc environmental science and management": "BSc. Environmental Science and Management",
        "b.sc environmental science and management": "BSc. Environmental Science and Management",
        "environmental science and management": "BSc. Environmental Science and Management",
        "sustainable agriculture": "BSc. Sustainable Agriculture"
      }
      
      const variationKey = studentProgramName.replace(/[^a-z\s]/g, "").trim();
      const matchedName = variations[variationKey];
      
      if (matchedName) {
        program = programOptions.find(p => normalize(p.name) === normalize(matchedName))
      }
    }

    if (program) {
      console.log(`[DEBUG] Student selected. Program: "${student.program}", Found Program ID: "${program.id}"`);
      setSelectedProgram(program.id)
    } else {
      console.error(`[DEBUG] Student's program "${student.program}" was not found in programOptions.`);
      console.log("[DEBUG] Student Program (Normalized):", studentProgramName);
      console.log("[DEBUG] Available Programs:", programOptions.map(p => p.name));
      console.log("[DEBUG] Available Programs (Normalized):", programOptions.map(p => normalize(p.name)));
      
      // Try a more flexible matching approach
      const flexibleMatch = programOptions.find(p => {
        const normalizedProgram = normalize(p.name);
        const normalizedStudent = studentProgramName;
        
        // Check if any significant words match
        const programWords = normalizedProgram.split(' ').filter(w => w.length > 2);
        const studentWords = normalizedStudent.split(' ').filter(w => w.length > 2);
        
        const matchingWords = programWords.filter(word => 
          studentWords.some(studentWord => 
            studentWord.includes(word) || word.includes(studentWord)
          )
        );
        
        console.log(`[DEBUG] Comparing "${p.name}" vs "${student.program}":`, {
          programWords,
          studentWords,
          matchingWords,
          similarity: matchingWords.length / Math.max(programWords.length, studentWords.length)
        });
        
        // Consider it a match if at least 60% of words match
        return matchingWords.length / Math.max(programWords.length, studentWords.length) >= 0.6;
      });
      
      if (flexibleMatch) {
        console.log(`[DEBUG] Found flexible match: "${flexibleMatch.name}" for student program "${student.program}"`);
        setSelectedProgram(flexibleMatch.id);
        return;
      }

      setSelectedProgram("") // Reset program if not found
      toast({
        title: "Program Not Found",
        description: `Student's program "${student.program}" is not in the programs list. Please select one manually from the dropdown.`,
        variant: "destructive",
      })
    }
    
    setSelectedLevel(student.level)
    setSelectedCourses([])
    setTotalCredits(0)
    
    // To check existing registration correctly, we need the master User ID.
    let masterUserId = student.id; // Fallback to student doc ID
    if (student.email) {
      try {
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("email", "==", student.email.toLowerCase()));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          masterUserId = userSnapshot.docs[0].id;
          console.log(`[DEBUG] Found master User ID "${masterUserId}" for checking registration.`);
        } else {
          console.warn(`[DEBUG] Could not find a master user for email ${student.email}. Registration check may be inaccurate.`)
        }
      } catch (error) {
        console.error("[DEBUG] Error finding master User ID for registration check:", error);
      }
    }
    
    // Check if student already has a registration using the correct master ID
    await checkExistingRegistration(masterUserId)
    
    // Don't automatically load courses - wait for user to select program, level and semester
  }
  
  // Check if student already has a registration
  const checkExistingRegistration = async (studentId: string) => {
    try {
      const registrationsRef = collection(db, "course-registrations")
      const q = query(
        registrationsRef,
        where("studentId", "==", studentId),
        where("academicYear", "==", selectedAcademicYear),
        where("semester", "==", selectedSemester)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const registrationData = querySnapshot.docs[0].data() as Omit<Registration, "id">
        const registration: Registration = {
          id: querySnapshot.docs[0].id,
          ...registrationData,
        }
        
        setExistingRegistration(registration)
        
        // Pre-select the courses
        const courseCodes = registration.courses.map(course => course.courseCode)
        setSelectedCourses(courseCodes)
        setTotalCredits(registration.totalCredits)
        
        toast({
          title: "Existing Registration Found",
          description: `This student already has a registration for ${selectedSemester} ${selectedAcademicYear}`,
        })
      } else {
        setExistingRegistration(null)
      }
    } catch (error) {
      console.error("Error checking existing registration:", error)
    }
  }
  
  // Refactored loadAvailableCourses function
  const loadAvailableCourses = (programId: string, level: string, semester: string, specialization?: string) => {
    setIsLoading(true)
    setAvailableCourses([])

    try {
      // Log the input parameters for debugging
      console.log(`[DEBUG] Loading courses from context with params:`, {
        programId,
        level,
        semester,
        specialization,
      });

      // Convert level and semester to numbers
      const levelNum = parseInt(level.replace(/\D/g, ''), 10);
      const semesterNum = parseInt(semester, 10);

      if (isNaN(levelNum) || isNaN(semesterNum)) {
        toast({ title: "Invalid level or semester", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Log the converted values and available courses
      console.log(`[DEBUG] Converted values: Level=${levelNum}, Semester=${semesterNum}`);
      console.log(`[DEBUG] Total courses in context:`, courses.length);

      // Filter courses from context instead of Firebase
      const filteredCourses = courses.filter(course => {
        // Match program ID
        if (course.programId !== programId) return false;
        
        // Match level
        if (course.level !== levelNum) return false;
        
        // Match semester (handle both string and number values)
        const courseSemester = typeof course.semester === 'string' 
          ? parseInt(course.semester, 10) 
          : course.semester;
        if (courseSemester !== semesterNum) return false;
        
        // Check status (prefer active courses, but include others if no status field)
        if (course.status && course.status !== 'active') return false;
        
        // Handle specialization for level 400
        if (levelNum === 400 && specialization) {
          // Add specialization filtering logic here if needed
          // For now, include all level 400 courses
        }
        
        return true;
      });

      console.log(`[DEBUG] Filtered ${filteredCourses.length} courses from context`);
      
      // Format courses for UI
      const formattedCourses: Course[] = filteredCourses.map(course => ({
        ...course,
        name: course.title || course.name || "Untitled Course",
        type: course.type || course.courseType || 'core', // Ensure type field is set
        theory: course.theory || course.theoryHours || 3, // Default theory hours
        practical: course.practical || course.practicalHours || 0, // Default practical hours
      }));

      // Remove duplicate courses based on course code
      const uniqueCourses = formattedCourses.reduce((acc: Course[], current) => {
        const existingCourse = acc.find(course => course.code === current.code);
        if (!existingCourse) {
          acc.push(current);
        } else {
          console.log(`[DEBUG] Removed duplicate course: ${current.code} - ${current.title}`);
        }
        return acc;
      }, []);

      console.log(`[DEBUG] Removed duplicates: ${formattedCourses.length} → ${uniqueCourses.length} courses`);
      
      // Log unique course codes to verify no duplicates
      const courseCodes = uniqueCourses.map(c => c.code);
      const duplicateCheck = courseCodes.filter((code, index) => courseCodes.indexOf(code) !== index);
      if (duplicateCheck.length > 0) {
        console.warn(`[DEBUG] Still have duplicates after removal:`, duplicateCheck);
      } else {
        console.log(`[DEBUG] All courses are now unique by code`);
      }
      setAvailableCourses(uniqueCourses);

      if (formattedCourses.length === 0) {
        toast({
          title: "No courses found",
          description: `No courses found for the selected criteria. Try adding courses for this program, level, and semester.`,
          variant: "destructive",
        });
      } else {
        console.log(`[DEBUG] Successfully loaded ${formattedCourses.length} courses from context`);
      }
    } catch (error) {
      console.error("[DEBUG] Error loading available courses:", error);
      toast({
        title: "Error loading courses",
        description: "An error occurred while loading available courses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to add a course
  const addCourse = (courses: Course[], code: string, title: string, credits: number, theoryHours: number, practicalHours: number) => {
    courses.push({
      id: `course-${code}`,
      code,
      title,
      name: title,
      description: `${title} course`,
      credits,
      theory: theoryHours,
      practical: practicalHours,
      level: parseInt(selectedLevel.replace(/\D/g, ""), 10) || 100,
      semester: parseInt(selectedSemester.replace(/\D/g, ""), 10) || 1,
      department: "Agriculture",
      prerequisites: [],
      status: "active"
    })
  }
  
  // Toggle course selection
  const toggleCourse = (courseCode: string, credits: number) => {
    const course = availableCourses.find(c => c.code === courseCode);
    if (!course) {
      console.warn(`[DEBUG] Course with code ${courseCode} not found in available courses`);
      return;
    }
  
    console.log(`[DEBUG] Toggling course: ${courseCode} - ${course.title} (${credits} credits)`);
  
    // --- Elective Group Validation ---
    if (course.type === 'elective') {
      const selectedElectiveGroup = availableCourses.find(c => selectedCourses.includes(c.code) && c.type === 'elective')?.electiveGroup;
  
      if (selectedElectiveGroup && course.electiveGroup !== selectedElectiveGroup) {
        toast({
          title: "Invalid Elective Choice",
          description: `You can only select electives from one group. You have already selected from Group ${selectedElectiveGroup}.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check if we're adding a course (not removing)
    const isSelected = selectedCourses.includes(courseCode);
    if (!isSelected) {
      // Schedule conflict detection
      const { getCourseSchedules } = useCourses();
      
      // Get schedules for the course being added
      const courseSchedules = getCourseSchedules ? getCourseSchedules(course.id) : [];
      
      // Get schedules for all currently selected courses
      const selectedCoursesIds = availableCourses
        .filter(c => selectedCourses.includes(c.code))
        .map(c => c.id);
      
      if (courseSchedules.length > 0 && selectedCoursesIds.length > 0) {
        // Check for schedule conflicts
        const allSchedules = getCourseSchedules ? 
          [...selectedCoursesIds.flatMap(id => getCourseSchedules(id) || []), ...courseSchedules] : 
          [];
        
        const { hasConflicts, conflicts } = detectCourseScheduleConflicts(
          [...selectedCoursesIds, course.id],
          allSchedules
        );
        
        if (hasConflicts) {
          // Format conflict messages
          const conflictMessages = conflicts.map(conflict => {
            const course1 = availableCourses.find(c => c.id === conflict.course1)?.title || conflict.course1;
            const course2 = availableCourses.find(c => c.id === conflict.course2)?.title || conflict.course2;
            return `${course1} conflicts with ${course2} on ${conflict.day} at ${conflict.time}`;
          });
          
          // Show warning to user
          toast({
            title: "Schedule Conflict Detected",
            description: (
              <div>
                <p>This course conflicts with your current selection:</p>
                <ul className="list-disc pl-4 mt-2">
                  {conflictMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
                <p className="mt-2">Do you still want to add this course?</p>
              </div>
            ),
            variant: "warning",
            action: (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    // Add course despite conflict
                    setSelectedCourses(prev => [...prev, courseCode]);
                    setTotalCredits(totalCredits + credits);
                  }}
                >
                  Add Anyway
                </Button>
              </div>
            ),
          });
          
          // Return early to prevent automatic addition
          return;
        }
      } else {
        console.log(`[DEBUG] No schedules found for course: ${courseCode} or no selected courses yet`);
      }
    }
  
    setSelectedCourses(prev => {
      const isSelected = prev.includes(courseCode);
      console.log(`[DEBUG] Course ${courseCode} was ${isSelected ? 'selected' : 'not selected'}, ${isSelected ? 'removing' : 'adding'} it`);
      
      if (isSelected) {
        setTotalCredits(totalCredits - credits);
        return prev.filter(code => code !== courseCode);
      } else {
        setTotalCredits(totalCredits + credits);
        return [...prev, courseCode];
      }
    });
  };
  
  // Check for duplicate course registration
  const checkDuplicateCourses = async () => {
    if (!selectedStudent) return { hasDuplicates: false, duplicates: [] };

    try {
      const registrationsRef = collection(db, "course-registrations");
      const q = query(
        registrationsRef,
        where("studentId", "==", selectedStudent.id),
        where("academicYear", "==", currentAcademicYear),
        where("semester", "==", selectedSemester),
        where("status", "in", ["approved", "pending"])
      );

      const snapshot = await getDocs(q);
      const registeredCourses = new Set();
      
      snapshot.docs.forEach(doc => {
        const registration = doc.data();
        if (registration.courses) {
          registration.courses.forEach((course: any) => {
            registeredCourses.add(course.code || course.courseCode);
          });
        }
      });

      const duplicates = selectedCourses.filter(courseCode => 
        registeredCourses.has(courseCode)
      );

      return {
        hasDuplicates: duplicates.length > 0,
        duplicates
      };

    } catch (error) {
      console.error('Error checking duplicate courses:', error);
      return { hasDuplicates: false, duplicates: [] };
    }
  };

  // Enhanced prerequisite validation with grade requirements
  const validateCoursePrerequisites = async (courseCode: string) => {
    if (!selectedStudent) return { valid: true, missingPrereqs: [], lowGradePrereqs: [] };

    try {
      // Get course details to check prerequisites
      const courseDoc = await getDoc(doc(db, "courses", courseCode));
      if (!courseDoc.exists()) {
        return { valid: true, missingPrereqs: [], lowGradePrereqs: [] };
      }

      const courseData = courseDoc.data();
      const prerequisites = courseData.prerequisites || [];
      
      if (prerequisites.length === 0) {
        return { valid: true, missingPrereqs: [], lowGradePrereqs: [] };
      }

      // Get student's completed courses with grades
      const registrationsRef = collection(db, "course-registrations");
      const q = query(
        registrationsRef,
        where("studentId", "==", selectedStudent.id),
        where("status", "==", "approved")
      );

      const snapshot = await getDocs(q);
      const completedCourses = new Map();
      
      snapshot.docs.forEach(doc => {
        const registration = doc.data();
        if (registration.courses) {
          registration.courses.forEach((course: any) => {
            completedCourses.set(course.code || course.courseCode, {
              grade: course.grade || null,
              completed: true
            });
          });
        }
      });

      const missingPrereqs = [];
      const lowGradePrereqs = [];

      // Check each prerequisite
      for (const prereq of prerequisites) {
        const courseCode = typeof prereq === 'string' ? prereq : prereq.code;
        const minGrade = typeof prereq === 'object' ? prereq.minGrade : 'D'; // Default minimum grade
        
        const completedCourse = completedCourses.get(courseCode);
        
        if (!completedCourse) {
          missingPrereqs.push(courseCode);
        } else if (completedCourse.grade && completedCourse.grade < minGrade) {
          lowGradePrereqs.push({
            course: courseCode,
            grade: completedCourse.grade,
            required: minGrade
          });
        }
      }

      return {
        valid: missingPrereqs.length === 0 && lowGradePrereqs.length === 0,
        missingPrereqs,
        lowGradePrereqs
      };

    } catch (error) {
      console.error('Error validating prerequisites:', error);
      return { valid: true, missingPrereqs: [], lowGradePrereqs: [] };
    }
  };

  // Check student payment status before registration
  const checkStudentPaymentStatus = async () => {
    if (!selectedStudent) {
      return {
        canRegister: false,
        reason: "No student selected"
      };
    }

    try {
      // Import the fee service dynamically to avoid circular dependencies
      const { getCurrentSemesterFees } = await import('../../../FEES PORTAL/lib/academic-period-service');
      
      // Get student info to determine programme type and level
      const studentDoc = await getDoc(doc(db, "users", selectedStudent.id));
      if (!studentDoc.exists()) {
        return {
          canRegister: false,
          reason: "Student information not found. Please contact support."
        };
      }
      
      const studentData = studentDoc.data();
      const programmeType = studentData.programmeType === 'weekend' ? 'weekend' : 'regular';
      const level = parseInt(studentData.currentLevel?.replace(/\D/g, '') || '100') || 100;
      
      console.log(`🔍 Checking fees for student ${selectedStudent.name}, programme: ${programmeType}, level: ${level}`);
      
      const semesterFees = await getCurrentSemesterFees(selectedStudent.id, programmeType, level);
      
      console.log(`💰 Fee check result:`, semesterFees);
      
      if (!semesterFees) {
        return {
          canRegister: false,
          reason: "Fee information not found. Please visit the Fees Portal to ensure fees are calculated and paid."
        };
      }
      
      if (semesterFees.balance > 0) {
        const unpaidAmount = semesterFees.balance.toLocaleString();
        return {
          canRegister: false,
          reason: `Fees must be paid before course registration. Student has an outstanding balance of ¢${unpaidAmount} for ${semesterFees.semesterName}. Please visit the Fees Portal to make payment.`,
          feeDetails: semesterFees
        };
      }
      
      // If balance is 0, fees are paid
      console.log(`✅ Fees paid. Balance: ¢${semesterFees.balance}`);
      return {
        canRegister: true,
        reason: "Fees paid",
        feeDetails: semesterFees
      };
      
    } catch (feeError) {
      console.error('❌ Error checking fee payment status:', feeError);
      return {
        canRegister: false,
        reason: "Error checking payment status. Please contact support."
      };
    }
  };

  // Submit registration to database
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Check payment status before registration
      const paymentCheck = await checkStudentPaymentStatus();
      if (!paymentCheck.canRegister) {
        toast({
          title: "Payment Required",
          description: paymentCheck.reason,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get student information
      const studentDocId = selectedStudent?.id;
      const masterUserId = selectedStudent?.masterUserId || "";
      
      // Prepare courses data
      const coursesData = selectedCourses.map(code => {
        const course = availableCourses.find(c => c.code === code);
        return {
          code,
          name: course?.title || code,
          credits: course?.credits || 0,
          theory: course?.theory || 0,
          practical: course?.practical || 0,
          type: course?.type || "core"
        };
      });
      
      // Validate program
      if (!selectedProgram) {
        throw new Error("No program selected");
      }
      
      // Prepare registration data
      const registrationData = {
        studentId: studentDocId,
        studentName: selectedStudent?.name || "",
        registrationNumber: selectedStudent?.registrationNumber || "",
        email: selectedStudent?.email || "",
        academicYear: currentAcademicYear,
        semester: selectedSemester,
        level: selectedLevel,
        program: selectedProgram,
        studyMode: selectedStudent?.studyMode || "Regular",
        courses: coursesData,
        totalCredits,
        registrationDate: new Date().toISOString(),
        status: "approved", // Auto-approved for staff registrations
        registeredBy: "staff",
        createdAt: serverTimestamp()
      };
      
      // Check if student already has a registration for this semester
      const registrationsRef = collection(db, "course-registrations");
      const q = query(
        registrationsRef,
        where("studentId", "==", studentDocId),
        where("academicYear", "==", currentAcademicYear),
        where("semester", "==", selectedSemester)
      );
      
      const existingRegistrations = await getDocs(q);
      
      if (!existingRegistrations.empty) {
        // Update existing registration
        const registrationDoc = existingRegistrations.docs[0];
        await updateDoc(doc(db, "course-registrations", registrationDoc.id), registrationData);
        console.log(`[DEBUG] Updated existing registration for student ${selectedStudent?.name}`);
      } else {
        // Create new registration
        await addDoc(collection(db, "course-registrations"), registrationData);
        console.log(`[DEBUG] Created new registration for student ${selectedStudent?.name}`);
      }
      
      // Update student's registration status
      if (studentDocId) {
        await updateDoc(doc(db, "students", studentDocId), {
          registrationStatus: "registered",
          updatedAt: serverTimestamp()
        });
      }
      
      toast({
        title: "Registration Successful",
        description: `Successfully registered ${selectedStudent?.name} for ${selectedCourses.length} courses.`,
        variant: "success",
      });
      
      // Reset form
      setSelectedCourses([]);
      setTotalCredits(0);
      setPrintMode(true);
      
    } catch (error) {
      console.error("[DEBUG] Error registering courses:", error);
      toast({
        title: "Registration Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register courses for student
  const registerCourses = async () => {
    if (!selectedStudent) {
      toast({
        title: "No student selected",
        description: "Please select a student first",
        variant: "destructive",
      })
      return
    }
    
    if (!selectedProgram) {
      toast({
        title: "No program selected",
        description: "Please select a valid program for the student",
        variant: "destructive",
      })
      return
    }
    
    if (selectedCourses.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course",
        variant: "destructive",
      })
      return
    }
    
    // Final schedule conflict check before registration
    const { getCourseSchedules } = useCourses();
    if (getCourseSchedules) {
      const selectedCoursesIds = availableCourses
        .filter(c => selectedCourses.includes(c.code))
        .map(c => c.id);
      
      const allSchedules = selectedCoursesIds.flatMap(id => getCourseSchedules(id) || []);
      
      if (allSchedules.length > 0) {
        const { hasConflicts, conflicts } = detectCourseScheduleConflicts(
          selectedCoursesIds,
          allSchedules
        );
        
        if (hasConflicts) {
          // Format conflict messages
          const conflictMessages = conflicts.map(conflict => {
            const course1 = availableCourses.find(c => c.id === conflict.course1)?.title || conflict.course1;
            const course2 = availableCourses.find(c => c.id === conflict.course2)?.title || conflict.course2;
            return `${course1} conflicts with ${course2} on ${conflict.day} at ${conflict.time}`;
          });
          
          // Show warning to user with option to proceed
          toast({
            title: "Schedule Conflicts Detected",
            description: (
              <div>
                <p>The following schedule conflicts were detected:</p>
                <ul className="list-disc pl-4 mt-2">
                  {conflictMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold">Do you want to proceed with registration anyway?</p>
              </div>
            ),
            variant: "warning",
            duration: 10000, // Show for longer
            action: (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    // Proceed with registration despite conflicts
                    proceedWithPrerequisiteValidation();
                  }}
                >
                  Register Anyway
                </Button>
              </div>
            ),
          });
          
          // Return early to prevent automatic registration
          return;
        }
      }
    }
    
    // Proceed with prerequisite validation
    proceedWithPrerequisiteValidation();
  }

  // Enhanced prerequisite validation with grade requirements
  const proceedWithPrerequisiteValidation = async () => {
    // Check for duplicate courses first
    const duplicateCheck = await checkDuplicateCourses();
    if (duplicateCheck.hasDuplicates) {
      toast({
        title: "Duplicate Courses Detected",
        description: (
          <div>
            <p>The following courses are already registered for this semester:</p>
            <ul className="list-disc pl-4 mt-2">
              {duplicateCheck.duplicates.map((course, i) => (
                <li key={i}>{course}</li>
              ))}
            </ul>
            <p className="mt-2 font-semibold">Please remove duplicate courses before proceeding.</p>
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      return;
    }

    const invalidPrereqs = [];
    const missingPrereqs = [];
    const lowGradePrereqs = [];

    for (const courseCode of selectedCourses) {
      const validation = await validateCoursePrerequisites(courseCode);
      
      if (!validation.valid) {
        invalidPrereqs.push(courseCode);
        missingPrereqs.push(...validation.missingPrereqs);
        lowGradePrereqs.push(...validation.lowGradePrereqs);
      }
    }

    if (invalidPrereqs.length > 0) {
      let errorMessage = "Prerequisite validation failed for: " + invalidPrereqs.join(', ');
      
      if (missingPrereqs.length > 0) {
        errorMessage += `\nMissing prerequisites: ${missingPrereqs.join(', ')}`;
      }
      
      if (lowGradePrereqs.length > 0) {
        const gradeIssues = lowGradePrereqs.map(item => 
          `${item.course} (grade: ${item.grade}, required: ${item.required})`
        ).join(', ');
        errorMessage += `\nGrade requirements not met: ${gradeIssues}`;
      }

      // Show warning to user with option to proceed
      toast({
        title: "Prerequisite Issues Detected",
        description: (
          <div>
            <p>The following prerequisite issues were detected:</p>
            {missingPrereqs.length > 0 && (
              <div>
                <p className="font-semibold mt-2">Missing prerequisites:</p>
                <ul className="list-disc pl-4">
                  {missingPrereqs.map((prereq, i) => (
                    <li key={i}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
            {lowGradePrereqs.length > 0 && (
              <div>
                <p className="font-semibold mt-2">Grade requirements not met:</p>
                <ul className="list-disc pl-4">
                  {lowGradePrereqs.map((item, i) => (
                    <li key={i}>{item.course} (grade: {item.grade}, required: {item.required})</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 font-semibold">Do you want to proceed with registration anyway?</p>
          </div>
        ),
        variant: "warning",
        duration: 15000, // Show for longer
        action: (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Proceed with registration despite prerequisite issues
                handleSubmit();
              }}
            >
              Register Anyway
            </Button>
          </div>
        ),
      });
    } else {
      // All validations passed, proceed with registration
      handleSubmit();
    }
  };
  
  // Print registration form
  const printRegistrationForm = async () => {
    if (!selectedStudent || !existingRegistration) {
      toast({
        title: "No registration to print",
        description: "Please register courses first",
        variant: "destructive",
      })
      return
    }
    
    // Fetch student profile picture
    let profilePictureUrl = ''
    try {
      if (selectedStudent.registrationNumber) {
        const studentsRef = collection(db, "students")
        const q = query(studentsRef, where("registrationNumber", "==", selectedStudent.registrationNumber))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs[0].data()
          profilePictureUrl = studentData.profilePictureUrl || ''
          console.log('📸 Found student photo for printing:', profilePictureUrl ? 'Yes' : 'No')
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch student photo for printing:', error)
    }
    
    // Get program name
    const programName = programOptions.find(p => p.id === selectedProgram)?.name || selectedStudent.program || "Unknown Program"
    
    // Prepare courses data
    const coursesToPrint = selectedCourses.map(code => {
      const course = availableCourses.find(c => c.code === code)
      return {
        courseCode: code,
        courseName: course?.title || course?.name || "Unknown Course",
        credits: course?.credits || 0
      }
    })
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Please allow popups to print registration",
        variant: "destructive",
      })
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Course Registration - ${selectedStudent.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; position: relative; }
          .school-logo { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 80px; 
            height: 80px; 
            object-fit: contain;
          }
          .logo { font-size: 24px; font-weight: bold; color: #166534; }
          .title { font-size: 20px; font-weight: bold; margin: 10px 0; }
          .student-photo { 
            position: absolute; 
            top: 0; 
            right: 0; 
            width: 120px; 
            height: 140px; 
            border: 2px solid #166534; 
            object-fit: cover;
            border-radius: 5px;
          }
          .photo-placeholder { 
            position: absolute; 
            top: 0; 
            right: 0; 
            width: 120px; 
            height: 140px; 
            border: 2px solid #ccc; 
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 12px;
            text-align: center;
            border-radius: 5px;
          }
          .info { margin: 20px 0; }
          .info-row { display: flex; margin: 5px 0; }
          .label { font-weight: bold; width: 150px; }
          .value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin-top: 30px; }
          .total { font-weight: bold; margin-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/uceslogo.png" alt="UCAES Logo" class="school-logo" />
          <div class="logo">UCAES</div>
          <div class="title">Course Registration Form</div>
          <div>University College of Agriculture and Environmental Studies</div>
          ${profilePictureUrl 
            ? `<img src="${profilePictureUrl}" alt="Student Photo" class="student-photo" />` 
            : `<div class="photo-placeholder">No Photo<br/>Available</div>`
          }
        </div>
        
        <div class="info">
          <div class="info-row">
            <span class="label">Student Name:</span>
            <span class="value">${selectedStudent.name}</span>
          </div>
          <div class="info-row">
            <span class="label">Registration No:</span>
            <span class="value">${selectedStudent.registrationNumber || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Program:</span>
            <span class="value">${programName}</span>
          </div>
          <div class="info-row">
            <span class="label">Level:</span>
            <span class="value">${selectedLevel}</span>
          </div>
          <div class="info-row">
            <span class="label">Academic Year:</span>
            <span class="value">${selectedAcademicYear}</span>
          </div>
          <div class="info-row">
            <span class="label">Semester:</span>
            <span class="value">${selectedSemester === "1" ? "First Semester" : selectedSemester === "2" ? "Second Semester" : selectedSemester}</span>
          </div>
          <div class="info-row">
            <span class="label">Registration Date:</span>
            <span class="value">${new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            ${coursesToPrint.map(course => `
              <tr>
                <td>${course.courseCode}</td>
                <td>${course.courseName}</td>
                <td>${course.credits}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <strong>Total Credits: ${totalCredits}</strong>
        </div>
        
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Student Signature</div>
            <div>Date: _______________</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>Director's Signature</div>
            <div>Date: _______________</div>
          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  } // Close printRegistrationForm function
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Student Course Registration</h1>
          {activeAcademicYear && (
            <div className="bg-blue-100 text-blue-800 rounded-md px-4 py-2 text-sm flex flex-col">
              <span className="font-medium text-base">Active: {activeAcademicYear.name}</span>
              <div className="text-sm flex space-x-4 mt-1">
                {activeRegularSemester && (
                  <span className="font-semibold">Regular: {activeRegularSemester.name}</span>
                )}
                {activeWeekendSemester && (
                  <span className="font-semibold">Weekend: {activeWeekendSemester.name}</span>
                )}
              </div>
            </div>
          )}
        </div>
        <Link href="/director/course-registration/registered-students">
          <Button>
            View Registered Students
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Search for Student</CardTitle>
          <CardDescription>
            Enter student name or registration number to begin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Label htmlFor="search" className="mb-2">
                Student Name or Registration Number
              </Label>
              <Input
                id="search"
                placeholder="Enter student name or ID (e.g., UCAES20250001)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Search Results</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.program}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.studyMode}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "destructive"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => selectStudent(student)}
                            disabled={false}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Course Registration</CardTitle>
              <div>
                <Badge variant="outline" className="ml-2">
                  {selectedStudent.program}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  Level {selectedStudent.level}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {selectedStudent.studyMode}
                </Badge>
                {/* Display Academic Year and Semester */}
                <Badge variant="secondary" className="ml-2">
                  {currentAcademicYear?.year || "N/A"} - {selectedStudent.studyMode === 'Regular' ? currentRegularSemester?.name : currentWeekendSemester?.name || "N/A"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="text-lg font-semibold">Register courses for {selectedStudent.name} ({selectedStudent.registrationNumber})</div>
                <div className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg px-4 py-2 text-center">
                    <div className="text-sm text-muted-foreground">Current Academic Period</div>
                    <div className="font-medium text-primary">
                      {currentAcademicYear?.year || "N/A"} - {selectedStudent.studyMode === 'Regular' 
                        ? currentRegularSemester?.name 
                        : currentWeekendSemester?.name || currentSemester?.name || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Debug Information - Only show when program is not found */}
            {selectedStudent && !selectedProgram && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Program Matching Issue</h4>
                <div className="text-sm text-yellow-700">
                  <p><strong>Student's Program:</strong> {selectedStudent.program}</p>
                  <p><strong>Available Programs:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {programOptions.map((program) => (
                      <li key={program.id}>{program.name} (ID: {program.id})</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">
                    Please manually select the correct program from the dropdown above.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              <div>
                <Label htmlFor="program">Program <span className="text-red-500">*</span></Label>
                <Select
                  value={selectedProgram}
                  onValueChange={(value) => {
                    setSelectedProgram(value)
                    setSelectedLevel("")
                    setSelectedSemester("")
                    setSelectedCourses([])
                    setTotalCredits(0)
                  }}
                >
                  <SelectTrigger className={!selectedProgram ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select program (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {programOptions.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{program.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {program.code} • {program.type} • {program.durationYears || 4} years
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedProgram && (
                  <p className="text-xs text-red-500 mt-1">
                    Please select a program to continue
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="level">Year/Level</Label>
                <Select
                  value={selectedLevel}
                  onValueChange={(value) => {
                    setSelectedLevel(value)
                    setSelectedSemester("")
                    setSelectedCourses([])
                    setTotalCredits(0)
                  }}
                  disabled={!selectedProgram}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year/level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={selectedSemester}
                  onValueChange={(value) => {
                    setSelectedSemester(value)
                    setSelectedCourses([])
                    setTotalCredits(0)
                  }}
                  disabled={!selectedProgram || !selectedLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((semester) => (
                      <SelectItem key={semester} value={semester.toString()}>{semester === 1 ? "First Semester" : "Second Semester"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedLevel === '400' && availableSpecializations.length > 0 && (
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select
                    value={selectedSpecialization}
                    onValueChange={(value) => {
                      setSelectedSpecialization(value);
                      setSelectedCourses([]);
                      setTotalCredits(0);
                    }}
                    disabled={!selectedLevel || !selectedSemester}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="col-span-2">
                <Label htmlFor="registration-status">Registration Status</Label>
                <div className="h-10 flex items-center">
                  {existingRegistration ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Registered on {new Date(existingRegistration.registrationDate?.toDate()).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Not Registered</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <Button 
                onClick={() => {
                  console.log("[DEBUG] BUTTON CLICKED with values:", {
                    selectedProgram,
                    selectedLevel,
                    selectedSemester,
                    selectedSpecialization
                  });
                  loadAvailableCourses(selectedProgram, selectedLevel, selectedSemester, selectedSpecialization);
                }}
                disabled={!selectedProgram || !selectedLevel || !selectedSemester || (selectedLevel === '400' && !selectedSpecialization) || isLoading}
              >
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Load Available Courses
              </Button>
            </div>
            
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-4">Available Courses for {selectedSemester}</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No courses available for this selection</p>
                </div>
              ) : (
                <>
                {selectedLevel === '400' && (
                  <div className="mb-4 text-center bg-gray-100 p-2 rounded-md">
                    <h4 className="font-bold text-lg">Specialization: {selectedSpecialization}</h4>
                  </div>
                )}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Select courses for registration:</h4>
                    <div className="flex items-center text-sm space-x-4">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">T</Badge>
                        <span>Theory Hours</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">P</Badge>
                        <span>Practical Hours</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">C</Badge>
                        <span>Credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Render Core Courses */}
                  <h3 className="font-semibold text-lg mb-2">Core Courses</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-center">T</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">C</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableCourses.filter(c => c.type === 'core').map((course) => (
                        <TableRow 
                          key={course.id}
                          className={selectedCourses.includes(course.code) ? "bg-primary/5" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedCourses.includes(course.code)}
                              onCheckedChange={() => toggleCourse(course.code, course.credits)}
                              id={`course-${course.code}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Label
                              htmlFor={`course-${course.code}`}
                              className="font-medium cursor-pointer"
                            >
                              {course.code}
                            </Label>
                          </TableCell>
                          <TableCell>
                            <Label
                              htmlFor={`course-${course.code}`}
                              className="cursor-pointer"
                            >
                              {course.title}
                            </Label>
                          </TableCell>
                          <TableCell className="text-center">{course.theory}</TableCell>
                          <TableCell className="text-center">{course.practical}</TableCell>
                          <TableCell className="text-center">{course.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Render Elective Courses */}
                  {availableCourses.some(c => c.type === 'elective') && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-2">Elective Courses</h3>
                      <p className="text-sm text-muted-foreground mb-2">Select one group of elective courses.</p>
                      
                      {/* Group electives by their group name */}
                      {Object.entries(
                        availableCourses
                          .filter(c => c.type === 'elective')
                          .reduce((acc, course) => {
                            const group = course.electiveGroup || 'General';
                            if (!acc[group]) acc[group] = [];
                            acc[group].push(course);
                            return acc;
                          }, {} as Record<string, Course[]>)
                      ).map(([groupName, courses]) => (
                        <div key={groupName} className="mb-4">
                          <h4 className="font-bold text-md mb-2">Group {groupName}</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Select</TableHead>
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead className="text-center">T</TableHead>
                                <TableHead className="text-center">P</TableHead>
                                <TableHead className="text-center">C</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {courses.map((course) => (
                                <TableRow 
                                  key={course.id}
                                  className={selectedCourses.includes(course.code) ? "bg-primary/5" : ""}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedCourses.includes(course.code)}
                                      onCheckedChange={() => toggleCourse(course.code, course.credits)}
                                      id={`course-${course.code}`}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Label
                                      htmlFor={`course-${course.code}`}
                                      className="font-medium cursor-pointer"
                                    >
                                      {course.code}
                                    </Label>
                                  </TableCell>
                                  <TableCell>
                                    <Label
                                      htmlFor={`course-${course.code}`}
                                      className="cursor-pointer"
                                    >
                                      {course.title}
                                    </Label>
                                  </TableCell>
                                  <TableCell className="text-center">{course.theory}</TableCell>
                                  <TableCell className="text-center">{course.practical}</TableCell>
                                  <TableCell className="text-center">{course.credits}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6 border-t pt-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium">Total Courses Selected:</span>{" "}
                      <Badge variant="outline" className="ml-1">
                        {selectedCourses.length}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Total Credits:</span>{" "}
                      <Badge variant={totalCredits > 24 ? "destructive" : "default"} className="ml-1">
                        {totalCredits}
                      </Badge>
                      {totalCredits > 24 && (
                        <span className="text-destructive text-sm ml-2">
                          Warning: Credit limit exceeded
                        </span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button
                        onClick={registerCourses}
                        disabled={isLoading || selectedCourses.length === 0}
                      >
                        {existingRegistration ? "Update Registration" : "Register Courses"}
                      </Button>
                      {existingRegistration && (
                        <Button variant="outline" onClick={printRegistrationForm}>
                          Print Registration
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} // Close CourseRegistrationContent function

export default function StaffCourseRegistrationPage() {
  return (
    <RouteGuard requiredPermissions={["registration_management"]}>
      <CourseRegistrationContent />
    </RouteGuard>
  )
}