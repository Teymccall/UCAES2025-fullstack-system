"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Plus, RefreshCw, CheckCircle, XCircle, UserCheck, FileCheck, AlertTriangle, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { useAuth } from "@/components/auth-context"
// Import the academic context
import { useAcademic } from "@/components/academic-context"

interface LecturerUser {
  id: string
  uid: string
  name: string
  email: string
  role: string
  status: string
  department?: string
  createdAt: string
  updatedAt: string
}

interface Program {
  id: string
  name: string
  code: string
  department: string
  faculty: string
}

interface Course {
  id: string
  code: string
  title: string
  level: number
  semester: number
  credits: number
  department: string
  programId?: string
}

interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
}

interface AcademicSemester {
  id: string
  academicYearId: string
  name: string
  startDate: string
  endDate: string
  status: string
}

interface LecturerAssignment {
  id?: string
  lecturerId: string
  academicYearId: string
  academicSemesterId: string
  programId: string
  courseId: string
  programmeCourseType: "Regular" | "Weekend"
  level: number
  status: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export default function LecturerManagement() {
  const { user } = useAuth()
  const [lecturers, setLecturers] = useState<LecturerUser[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicSemesters, setAcademicSemesters] = useState<AcademicSemester[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerUser | null>(null)
  const { toast } = useToast()
  
  // Use the academic context
  const { 
    academicYears: contextAcademicYears, 
    currentAcademicYear, 
    currentRegularSemester, 
    currentWeekendSemester 
  } = useAcademic()
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<LecturerAssignment>({
    lecturerId: "",
    academicYearId: "",
    academicSemesterId: "",
    programId: "",
    courseId: "",
    programmeCourseType: "Regular",
    level: 100,
    status: "active"
  })
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [filteredSemesters, setFilteredSemesters] = useState<AcademicSemester[]>([])
  const [lecturerAssignments, setLecturerAssignments] = useState<LecturerAssignment[]>([])
  const [allAssignments, setAllAssignments] = useState<LecturerAssignment[]>([])
  
  // Add back the data loading functions in a new useEffect
  useEffect(() => {
    const fetchLecturers = async () => {
      setIsLoading(true)
      setError("")
      
      try {
        const q = query(collection(db, "users"), where("role", "==", "Lecturer"))
        const querySnapshot = await getDocs(q)
        const lecturersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LecturerUser))
        
        setLecturers(lecturersList)
      } catch (err) {
        console.error("Error fetching lecturers:", err)
        setError("Failed to load lecturer users")
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchPrograms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "academic-programs"))
        const programsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Program))
        
        setPrograms(programsList)
      } catch (err) {
        console.error("Error fetching programs:", err)
      }
    }
    
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "academic-courses"))
        const coursesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course))
        
        setCourses(coursesList)
      } catch (err) {
        console.error("Error fetching courses:", err)
      }
    }
    
    const fetchAcademicSemesters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "academic-semesters"))
        const semestersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AcademicSemester))
        
        setAcademicSemesters(semestersList)
      } catch (err) {
        console.error("Error fetching academic semesters:", err)
      }
    }
    
    const fetchAllAssignments = async () => {
      try {
        const assignmentsRef = collection(db, "lecturer-assignments");
        const querySnapshot = await getDocs(assignmentsRef);
        const assignmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LecturerAssignment));
        
        setAllAssignments(assignmentsList);
      } catch (err) {
        console.error("Error fetching all lecturer assignments:", err);
      }
    }

    fetchLecturers()
    fetchPrograms()
    fetchCourses()
    fetchAcademicSemesters()
    fetchAllAssignments()
  }, [])
  
  // Populate the academic years and semesters from the context
  useEffect(() => {
    // If we have academic years data from the context, use it
    if (contextAcademicYears && contextAcademicYears.length > 0) {
      // Map the context data to match our local interface
      const mappedYears = contextAcademicYears.map(year => ({
        id: year.id,
        name: year.year,
        year: year.year,
        startDate: year.startDate,
        endDate: year.endDate,
        status: year.status
      }));
      
      setAcademicYears(mappedYears);
      
      // If there's a current active year, select it
      if (currentAcademicYear) {
        setSelectedAcademicYear(currentAcademicYear.id);
        setAssignmentForm(prev => ({
          ...prev,
          academicYearId: currentAcademicYear.id
        }));
        
        // Map the semesters from the current year
        if (currentAcademicYear.semesters && currentAcademicYear.semesters.length > 0) {
          const mappedSemesters = currentAcademicYear.semesters.map(sem => ({
            id: sem.id,
            academicYearId: currentAcademicYear.id,
            name: sem.name,
            startDate: sem.startDate,
            endDate: sem.endDate,
            status: sem.status
          }));
          
          setAcademicSemesters(prevSemesters => {
            // Filter out any existing semesters for this year to avoid duplicates
            const filtered = prevSemesters.filter(s => s.academicYearId !== currentAcademicYear.id);
            return [...filtered, ...mappedSemesters];
          });
          
          // Also set the filtered semesters
          setFilteredSemesters(mappedSemesters);
          
          // Set the current semester based on program type
          const currentSemester = assignmentForm.programmeCourseType === "Regular" 
            ? currentRegularSemester 
            : currentWeekendSemester;
          
          if (currentSemester) {
            setAssignmentForm(prev => ({
              ...prev,
              academicSemesterId: currentSemester.id
            }));
          }
        }
      }
    }
  }, [contextAcademicYears, currentAcademicYear, currentRegularSemester, currentWeekendSemester, assignmentForm.programmeCourseType]);
  
  // Filter semesters when academic year changes
  useEffect(() => {
    if (!selectedAcademicYear) {
      setFilteredSemesters([])
      return
    }
    
    const filtered = academicSemesters.filter(
      semester => semester.academicYearId === selectedAcademicYear
    )
    
    setFilteredSemesters(filtered)
    
    // Reset semester selection if current selection doesn't belong to the selected year
    if (!filtered.find(s => s.id === assignmentForm.academicSemesterId)) {
      setAssignmentForm(prev => ({
        ...prev,
        academicSemesterId: ""
      }))
    }
  }, [selectedAcademicYear, academicSemesters, assignmentForm.academicSemesterId])
  
  // Initialize filtered courses to empty array
  useEffect(() => {
    // Reset courses when any key selection changes
    setFilteredCourses([])
    
    // Reset course selection when program, level or semester changes
    setAssignmentForm(prev => ({
      ...prev,
      courseId: ""
    }))
  }, [assignmentForm.programId, assignmentForm.level, assignmentForm.academicSemesterId])
  
  // Replace automatic filtering with a manual load function
  const loadAvailableCourses = () => {
    console.log("Load Available Courses clicked!", {
      programId: assignmentForm.programId,
      level: assignmentForm.level,
      academicSemesterId: assignmentForm.academicSemesterId
    });
    
    if (!assignmentForm.programId || !assignmentForm.level || !assignmentForm.academicSemesterId) {
      toast({
        title: "Please select academic year, semester, program, and level first",
        description: "Please select academic year, semester, program, and level first",
        variant: "destructive",
      });
      return;
    }
    
    // Get semester number from semester name
    const selectedSemester = academicSemesters.find(s => s.id === assignmentForm.academicSemesterId);
    const semesterNumber = selectedSemester?.name?.includes("1") ? 1 : 
                          selectedSemester?.name?.includes("2") ? 2 : 
                          selectedSemester?.name?.includes("3") ? 3 : null;
    
    if (!semesterNumber) {
      toast({
        title: "Invalid semester selected",
        description: "Invalid semester selected",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Filtering with criteria:", {
      programId: assignmentForm.programId, 
      level: assignmentForm.level, 
      semester: semesterNumber
    });
    console.log("Available courses:", courses.length);
    
    // Filter courses by all criteria
    const filtered = courses.filter(course => {
      // First filter by program ID
      const programMatch = course.programId === assignmentForm.programId;
      
      // Then filter by level
      const levelMatch = course.level === assignmentForm.level;
      
      // Then filter by semester
      const semesterMatch = course.semester === semesterNumber;
      
      const result = programMatch && levelMatch && semesterMatch;
      
      if (result) {
        console.log("Matched course:", course.code, course.title, { 
          programMatch, 
          levelMatch, 
          semesterMatch 
        });
      }
      
      return result;
    });
    
    console.log("Filtered courses:", filtered.length, filtered.map(c => c.code));
    setFilteredCourses(filtered);
    
    // Show feedback
    if (filtered.length === 0) {
      toast({
        title: `No courses found for ${getProgramName(assignmentForm.programId)}, Level ${assignmentForm.level}, Semester ${semesterNumber}`,
        description: `No courses found for ${getProgramName(assignmentForm.programId)}, Level ${assignmentForm.level}, Semester ${semesterNumber}`,
        variant: "warning",
      });
    } else {
      toast({
        title: `Found ${filtered.length} courses for ${getProgramName(assignmentForm.programId)}, Level ${assignmentForm.level}, Semester ${semesterNumber}`,
        description: `Found ${filtered.length} courses for ${getProgramName(assignmentForm.programId)}, Level ${assignmentForm.level}, Semester ${semesterNumber}`,
        variant: "success",
      });
    }
  };
  
  // Fetch lecturer assignments when a lecturer is selected
  useEffect(() => {
    const fetchLecturerAssignments = async () => {
      if (!selectedLecturer) return
      
      try {
        const q = query(
          collection(db, "lecturer-assignments"), 
          where("lecturerId", "==", selectedLecturer.id)
        )
        const querySnapshot = await getDocs(q)
        const assignmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LecturerAssignment))
        
        setLecturerAssignments(assignmentsList)
      } catch (err) {
        console.error("Error fetching lecturer assignments:", err)
      }
    }
    
    fetchLecturerAssignments()
  }, [selectedLecturer])
  
  const toggleLecturerStatus = async (lecturer: LecturerUser) => {
    try {
      const newStatus = lecturer.status === "active" ? "suspended" : "active"
      
      // Update in Firestore
      await updateDoc(doc(db, "users", lecturer.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      // Update local state
      setLecturers(prev => 
        prev.map(l => 
          l.id === lecturer.id 
            ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } 
            : l
        )
      )
      
      toast({
        title: `Lecturer ${lecturer.name} ${newStatus === "active" ? "activated" : "suspended"} successfully`,
        description: `Lecturer ${lecturer.name} ${newStatus === "active" ? "activated" : "suspended"} successfully`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error updating lecturer status:", err)
      toast({
        title: "Failed to update lecturer status",
        description: "Failed to update lecturer status",
        variant: "destructive",
      });
    }
  }
  
  const approveLecturer = async (lecturer: LecturerUser) => {
    try {
      // Update in Firestore
      await updateDoc(doc(db, "users", lecturer.id), {
        status: "active",
        updatedAt: new Date().toISOString()
      })
      
      // Update local state
      setLecturers(prev => 
        prev.map(l => 
          l.id === lecturer.id 
            ? { ...l, status: "active", updatedAt: new Date().toISOString() } 
            : l
        )
      )
      
      toast({
        title: `Lecturer ${lecturer.name} approved successfully`,
        description: `Lecturer ${lecturer.name} approved successfully`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error approving lecturer:", err)
      toast({
        title: "Failed to approve lecturer",
        description: "Failed to approve lecturer",
        variant: "destructive",
      });
    }
  }
  
  const handleAssignmentFormChange = (field: string, value: string | number) => {
    if (field === "academicYearId") {
      setSelectedAcademicYear(value as string);
    } 
    
    if (field === "programmeCourseType") {
      // When program type changes, update the semester based on the selected type
      const newProgramType = value as "Regular" | "Weekend";
      const currentSemester = newProgramType === "Regular" 
        ? currentRegularSemester 
        : currentWeekendSemester;
      
      if (currentSemester) {
        setAssignmentForm(prev => ({
          ...prev,
          [field]: value,
          academicSemesterId: currentSemester.id
        }));
        return;
      }
    }
    
    setAssignmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  }
  
  const handleLecturerSelect = (lecturer: LecturerUser) => {
    setSelectedLecturer(lecturer)
    setAssignmentForm(prev => ({
      ...prev,
      lecturerId: lecturer.id
    }))
  }
  
  const handleAssignCourse = async () => {
    try {
      // Validate form
      if (
        !assignmentForm.lecturerId ||
        !assignmentForm.academicYearId ||
        !assignmentForm.academicSemesterId ||
        !assignmentForm.programId ||
        !assignmentForm.courseId
      ) {
        toast({
          title: "Please fill in all required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return
      }
      
      // Check if assignment already exists
      const existingAssignments = lecturerAssignments.filter(
        a => 
          a.academicYearId === assignmentForm.academicYearId &&
          a.academicSemesterId === assignmentForm.academicSemesterId &&
          a.programId === assignmentForm.programId &&
          a.courseId === assignmentForm.courseId &&
          a.programmeCourseType === assignmentForm.programmeCourseType &&
          a.level === assignmentForm.level
      )
      
      if (existingAssignments.length > 0) {
        toast({
          title: "This course assignment already exists",
          description: "This course assignment already exists",
          variant: "destructive",
        });
        return
      }
      
      // Create assignment in Firestore
      const newAssignment = {
        ...assignmentForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid
      }
      
      const docRef = await addDoc(collection(db, "lecturer-assignments"), newAssignment)
      
      // Update local state
      const createdAssignment = {
        id: docRef.id,
        ...newAssignment
      }
      
      setLecturerAssignments(prev => [...prev, createdAssignment])
      
      toast({
        title: "Course assigned successfully",
        description: "Course assigned successfully",
        variant: "success",
      });
      
      // Close dialog (must be done via DOM since we're using DialogClose)
      document.querySelector('[data-dialog-close="true"]')?.click()
      
    } catch (err) {
      console.error("Error assigning course:", err)
      toast({
        title: "Failed to assign course",
        description: "Failed to assign course",
        variant: "destructive",
      });
    }
  }
  
  // Get program name by ID
  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    return program ? program.name : "Unknown Program"
  }
  
  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? `${course.code} - ${course.title}` : "Unknown Course"
  }
  
  // Get academic year name by ID
  const getAcademicYearName = (yearId: string) => {
    // First check context academic years
    const contextYear = contextAcademicYears.find(y => y.id === yearId);
    if (contextYear) return contextYear.year;
    
    // Fallback to local state
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.name : "Unknown Year";
  }
  
  // Get semester name by ID
  const getSemesterName = (semesterId: string) => {
    // Check if the semester is in the current academic year's semesters
    if (currentAcademicYear) {
      const contextSemester = currentAcademicYear.semesters.find(s => s.id === semesterId);
      if (contextSemester) return contextSemester.name;
    }
    
    // Fallback to local state
    const semester = academicSemesters.find(s => s.id === semesterId);
    return semester ? semester.name : "Unknown Semester";
  }
  
  // Additional helper functions for admin use
  const importCourseData = async () => {
    try {
      // First check if the programs exist
      let bscSustainableAgricultureId = "";
      let bscEnvironmentalScienceId = "";

      // Check for existing programs
      const programsSnapshot = await getDocs(collection(db, "academic-programs"));
      programsSnapshot.forEach(doc => {
        const program = doc.data();
        if (program.name?.includes("Sustainable Agriculture")) {
          bscSustainableAgricultureId = doc.id;
        }
        if (program.name?.includes("Environmental Science")) {
          bscEnvironmentalScienceId = doc.id;
        }
      });
      
      // If programs don't exist, create them
      if (!bscSustainableAgricultureId) {
        const bscSARef = await addDoc(collection(db, "academic-programs"), {
          name: "BSc. Sustainable Agriculture",
          code: "BSA",
          department: "Agriculture",
          faculty: "Agriculture and Environmental Studies",
          status: "active",
          createdAt: new Date().toISOString()
        });
        bscSustainableAgricultureId = bscSARef.id;
        toast({
          title: "Created BSc. Sustainable Agriculture program",
          description: "Created BSc. Sustainable Agriculture program",
          variant: "success",
        });
      }
      
      if (!bscEnvironmentalScienceId) {
        const bscESRef = await addDoc(collection(db, "academic-programs"), {
          name: "BSc. Environmental Science and Management",
          code: "BESM",
          department: "Environmental Science",
          faculty: "Agriculture and Environmental Studies",
          status: "active",
          createdAt: new Date().toISOString()
        });
        bscEnvironmentalScienceId = bscESRef.id;
        toast({
          title: "Created BSc. Environmental Science and Management program",
          description: "Created BSc. Environmental Science and Management program",
          variant: "success",
        });
      }
      
      // Import BSc. Sustainable Agriculture Year 1 Courses
      const bsaY1S1Courses = [
        {code: "AGM 151", title: "Introduction to Soil Science", level: 100, semester: 1, credits: 3},
        {code: "AGM 153", title: "Introductory Botany", level: 100, semester: 1, credits: 2},
        {code: "AGM 155", title: "Principles of Crop Production", level: 100, semester: 1, credits: 2},
        {code: "ESM 151", title: "Principles of Biochemistry", level: 100, semester: 1, credits: 3},
        {code: "ESM 155", title: "Introduction to Climatology", level: 100, semester: 1, credits: 2},
        {code: "GNS 151", title: "Introductory Pure Mathematics", level: 100, semester: 1, credits: 2},
        {code: "GNS 153", title: "Introduction to Computing I", level: 100, semester: 1, credits: 2},
        {code: "GNS 155", title: "Communication Skills I", level: 100, semester: 1, credits: 2}
      ];
      
      const bsaY1S2Courses = [
        {code: "AGM 158", title: "Introductory Economics", level: 100, semester: 2, credits: 2},
        {code: "AGM 152", title: "Principles of Land Surveying", level: 100, semester: 2, credits: 2},
        {code: "AGM 154", title: "Principles of Agroecology", level: 100, semester: 2, credits: 1},
        {code: "AGM 156", title: "Vacation Training", level: 100, semester: 2, credits: 3},
        {code: "ANS 152", title: "Anatomy and Physiology of Farm Animals", level: 100, semester: 2, credits: 3},
        {code: "ESM 156", title: "Basic Microbiology", level: 100, semester: 2, credits: 3},
        {code: "GNS 152", title: "Basic Statistics", level: 100, semester: 2, credits: 2},
        {code: "GNS 154", title: "Introduction to Computing II", level: 100, semester: 2, credits: 2},
        {code: "GNS 156", title: "Communication Skills II", level: 100, semester: 2, credits: 2}
      ];
      
      // BSA Year 2 Courses
      const bsaY2S1Courses = [
        {code: "AGM 265", title: "Rural Sociology", level: 200, semester: 1, credits: 2},
        {code: "AGM 251", title: "Farming Systems and Natural Resources", level: 200, semester: 1, credits: 2},
        {code: "AGM 253", title: "Crop Physiology", level: 200, semester: 1, credits: 2},
        {code: "AGM 255", title: "Introduction to Plant Pathology", level: 200, semester: 1, credits: 2},
        {code: "AGM 257", title: "Principles of Plant Breeding", level: 200, semester: 1, credits: 2},
        {code: "AGM 259", title: "Agricultural Power Sources and Mechanization", level: 200, semester: 1, credits: 2},
        {code: "AGM 261", title: "Introduction to Entomology", level: 200, semester: 1, credits: 2},
        {code: "AGM 263", title: "Soil Microbiology", level: 200, semester: 1, credits: 2}
      ];
      
      const bsaY2S2Courses = [
        {code: "AGM 258", title: "Agricultural Economics and Marketing", level: 200, semester: 2, credits: 3},
        {code: "AGM 260", title: "Introduction to Agric. Extension", level: 200, semester: 2, credits: 2},
        {code: "AGM 252", title: "Arable and Plantation Crop Production", level: 200, semester: 2, credits: 2},
        {code: "AGM 254", title: "Soil Conservation and Fertility Management", level: 200, semester: 2, credits: 2},
        {code: "AGM 256", title: "Weed Science", level: 200, semester: 2, credits: 2},
        {code: "ANS 252", title: "Poultry Production and Management", level: 200, semester: 2, credits: 2},
        {code: "ANS 254", title: "Principles of Animal Nutrition", level: 200, semester: 2, credits: 2},
        {code: "AGM 262", title: "Fruit and Vegetable Crop Production", level: 200, semester: 2, credits: 2}
      ];
      
      // BSA Year 3 Courses
      const bsaY3S1Courses = [
        {code: "AGM 355", title: "Farm Management and Agribusiness", level: 300, semester: 1, credits: 2},
        {code: "AGM 351", title: "Principles of Crop Pest Control & Disease Mgt.", level: 300, semester: 1, credits: 2},
        {code: "AGM 353", title: "Integrated Crop Protection Management", level: 300, semester: 1, credits: 2},
        {code: "ANS 351", title: "Forage Production", level: 300, semester: 1, credits: 2},
        {code: "ANS 353", title: "Swine Production and Management", level: 300, semester: 1, credits: 2},
        {code: "ANS 355", title: "Animal Health and Diseases", level: 300, semester: 1, credits: 2},
        {code: "GNS 351", title: "Experimental Design and Analysis", level: 300, semester: 1, credits: 3}
      ];
      
      const bsaY3S2Courses = [
        {code: "AGM 352", title: "Agricultural Law and Policy", level: 300, semester: 2, credits: 2},
        {code: "ANS 352", title: "Ruminant Production and Management", level: 300, semester: 2, credits: 3},
        {code: "AGM 354", title: "Entrepreneurship Development", level: 300, semester: 2, credits: 2},
        {code: "ESM 258", title: "Introduction to Remote Sensing and GIS", level: 300, semester: 2, credits: 3},
        {code: "GNS 352", title: "Research Methodology and Techniques", level: 300, semester: 2, credits: 2},
        {code: "GNS 356", title: "Industrial Attachment", level: 300, semester: 2, credits: 2},
        {code: "AGM 356", title: "Amenity and Ornamental Horticulture", level: 300, semester: 2, credits: 2},
        {code: "AGM 358", title: "Introduction to Post Harvest Science", level: 300, semester: 2, credits: 3}
      ];
      
      // BSA Year 4 Courses
      const bsaY4S1Courses = [
        {code: "AGM 453", title: "Seminar I", level: 400, semester: 1, credits: 1},
        {code: "AGM 455", title: "Research Project I", level: 400, semester: 1, credits: 3},
        {code: "AGM 457", title: "Irrigation Principles and Management", level: 400, semester: 1, credits: 3},
        {code: "ESM 451", title: "Techniques for Environmental Management", level: 400, semester: 1, credits: 2},
        {code: "AGM 459", title: "Principles of Crop Biotechnology", level: 400, semester: 1, credits: 3},
        {code: "AGM 461", title: "Seed Production Technology", level: 400, semester: 1, credits: 3},
        {code: "AGM 463", title: "Soil Quality", level: 400, semester: 1, credits: 3},
        {code: "AGM 465", title: "Fertilizer Technology and Use", level: 400, semester: 1, credits: 3}
      ];
      
      const bsaY4S2Courses = [
        {code: "AGM 452", title: "Environmental Pollution and Remediation", level: 400, semester: 2, credits: 2},
        {code: "AGM 454", title: "Seminar II", level: 400, semester: 2, credits: 1},
        {code: "AGM 456", title: "Research Project II", level: 400, semester: 2, credits: 3},
        {code: "AGM 458", title: "Crop Root Associations", level: 400, semester: 2, credits: 3},
        {code: "AGM 462", title: "Economic Entomology", level: 400, semester: 2, credits: 3},
        {code: "WEH 452", title: "Food Sanitation and Safety", level: 400, semester: 2, credits: 3},
        {code: "AGM 464", title: "Organic Agriculture", level: 400, semester: 2, credits: 3},
        {code: "WEH 458", title: "Agricultural and Industrial Waste Management", level: 400, semester: 2, credits: 3}
      ];
      
      // BSc Environmental Science Year 1
      const besmY1S1Courses = [
        {code: "ESM 151", title: "Principles of Biochemistry", level: 100, semester: 1, credits: 3},
        {code: "ESM 153", title: "Principles of Environmental Science I", level: 100, semester: 1, credits: 2},
        {code: "ESM 155", title: "Introduction to Climatology", level: 100, semester: 1, credits: 2},
        {code: "AGM 151", title: "Introduction to Soil Science", level: 100, semester: 1, credits: 3},
        {code: "GNS 151", title: "Basic Mathematics", level: 100, semester: 1, credits: 2},
        {code: "GNS 153", title: "Introduction to Computing I", level: 100, semester: 1, credits: 2},
        {code: "GNS 155", title: "Communication Skills I", level: 100, semester: 1, credits: 2},
        {code: "ESM 161", title: "Principles of Management", level: 100, semester: 1, credits: 2}
      ];
      
      const besmY1S2Courses = [
        {code: "ESM 152", title: "Principles of Environmental Science II", level: 100, semester: 2, credits: 2},
        {code: "ESM 154", title: "Environment and Development", level: 100, semester: 2, credits: 2},
        {code: "ESM 156", title: "Basic Microbiology", level: 100, semester: 2, credits: 3},
        {code: "AGM 152", title: "Principles of Land Surveying", level: 100, semester: 2, credits: 2},
        {code: "ESM 158", title: "Introductory Economics", level: 100, semester: 2, credits: 2},
        {code: "GNS 152", title: "Basic Statistics", level: 100, semester: 2, credits: 2},
        {code: "GNS 154", title: "Introduction to Computing II", level: 100, semester: 2, credits: 2},
        {code: "GNS 156", title: "Communication Skills II", level: 100, semester: 2, credits: 2}
      ];
      
      // BESM Year 2
      const besmY2S1Courses = [
        {code: "ESM 251", title: "Geology", level: 200, semester: 1, credits: 3},
        {code: "ESM 253", title: "Principles of Land Economy", level: 200, semester: 1, credits: 2},
        {code: "ESM 255", title: "Hydrology", level: 200, semester: 1, credits: 2},
        {code: "ESM 257", title: "Oceanography", level: 200, semester: 1, credits: 3},
        {code: "ESM 259", title: "Rural Sociology", level: 200, semester: 1, credits: 2},
        {code: "GNS 251", title: "Fundamentals of Planning", level: 200, semester: 1, credits: 2},
        {code: "GNS 253", title: "Principles of Law", level: 200, semester: 1, credits: 2}
      ];
      
      const besmY2S2Courses = [
        {code: "ESM 252", title: "Introduction to Environmental Engineering", level: 200, semester: 2, credits: 3},
        {code: "ESM 254", title: "Environment and Sustainability", level: 200, semester: 2, credits: 2},
        {code: "ESM 256", title: "Agroecology", level: 200, semester: 2, credits: 2},
        {code: "ESM 258", title: "Remote Sensing and GIS", level: 200, semester: 2, credits: 3},
        {code: "ESM 260", title: "Introduction to Resource Analysis", level: 200, semester: 2, credits: 2},
        {code: "ESM 262", title: "Introduction to Waste Management", level: 200, semester: 2, credits: 3},
        {code: "ESM 264", title: "Introduction to Limnology", level: 200, semester: 2, credits: 3}
      ];
      
      // Add all courses to the database
      const allCourses = [
        ...bsaY1S1Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY1S2Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY2S1Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY2S2Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY3S1Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY3S2Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY4S1Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...bsaY4S2Courses.map(c => ({...c, programId: bscSustainableAgricultureId})),
        ...besmY1S1Courses.map(c => ({...c, programId: bscEnvironmentalScienceId})),
        ...besmY1S2Courses.map(c => ({...c, programId: bscEnvironmentalScienceId})),
        ...besmY2S1Courses.map(c => ({...c, programId: bscEnvironmentalScienceId})),
        ...besmY2S2Courses.map(c => ({...c, programId: bscEnvironmentalScienceId}))
      ];
      
      // Check for existing courses to avoid duplicates
      const existingCourses = new Set();
      const coursesSnapshot = await getDocs(collection(db, "academic-courses"));
      coursesSnapshot.forEach(doc => {
        const course = doc.data();
        existingCourses.add(`${course.code}-${course.programId}`);
      });
      
      // Add courses that don't exist yet
      let addedCount = 0;
      for (const course of allCourses) {
        const courseKey = `${course.code}-${course.programId}`;
        if (!existingCourses.has(courseKey)) {
          await addDoc(collection(db, "academic-courses"), {
            ...course,
            department: "Agriculture and Environmental Studies",
            description: `${course.title} for ${course.code}`,
            status: "active",
            createdAt: new Date().toISOString()
          });
          addedCount++;
        }
      }
      
      // Refresh courses in state
      const newCourses = await getDocs(collection(db, "academic-courses"));
      const coursesList = newCourses.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      
      setCourses(coursesList);
      
      toast({
        title: `Successfully imported ${addedCount} new courses. Total courses: ${coursesList.length}`,
        description: `Successfully imported ${addedCount} new courses. Total courses: ${coursesList.length}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error importing courses:", error);
      toast({
        title: "Failed to import courses",
        description: "Failed to import courses",
        variant: "destructive",
      });
    }
  };
  
  if (!user || user.role !== "director") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lecturer Management</h1>
          <p className="text-muted-foreground">Manage lecturer accounts and course assignments</p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Creating Lecturer Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            To create a new lecturer account, please go to the{" "}
            <a href="/director/staff-management" className="font-medium underline">
              Staff Management
            </a>{" "}
            page and select "Lecturer" as the role when adding a new user.
          </p>
          <p className="text-blue-700">
            Once the lecturer account is created, you can assign courses to them on this page.
          </p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="lecturers">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="lecturers">Lecturer Accounts</TabsTrigger>
          <TabsTrigger value="assignments">Course Assignments</TabsTrigger>
          <TabsTrigger value="all-assignments">All Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lecturers">
          <Card>
            <CardHeader>
              <CardTitle>Lecturer Accounts</CardTitle>
              <CardDescription>
                {isLoading ? "Loading lecturers..." : `${lecturers.length} lecturer accounts found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : lecturers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No lecturer accounts found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lecturers.map((lecturer) => (
                      <TableRow key={lecturer.id}>
                        <TableCell className="font-medium">{lecturer.name}</TableCell>
                        <TableCell>{lecturer.email}</TableCell>
                        <TableCell>{lecturer.department || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lecturer.status === "active"
                                ? "success"
                                : lecturer.status === "pending"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {lecturer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(lecturer.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lecturer.status === "pending" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveLecturer(lecturer)}
                                className="flex items-center"
                              >
                                <UserCheck className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant={lecturer.status === "active" ? "destructive" : "outline"}
                                onClick={() => toggleLecturerStatus(lecturer)}
                              >
                                {lecturer.status === "active" ? (
                                  <>
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Suspend
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLecturerSelect(lecturer)}
                              disabled={lecturer.status !== "active"}
                            >
                              Assign Courses
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Course Assignments</CardTitle>
              <CardDescription>
                Select a lecturer to view and manage their course assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1">
                  <Label htmlFor="lecturerSelect">Select Lecturer</Label>
                  <Select 
                    onValueChange={(value) => {
                      const lecturer = lecturers.find(l => l.id === value)
                      if (lecturer) handleLecturerSelect(lecturer)
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers
                        .filter(l => l.status === "active")
                        .map((lecturer) => (
                          <SelectItem key={lecturer.id} value={lecturer.id}>
                            {lecturer.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-4">
                  <Button 
                    onClick={importCourseData}
                    variant="outline"
                    className="mt-6"
                  >
                    Import Course Data
                  </Button>
                </div>
              </div>
              
              {selectedLecturer && (
                <>
                  <h3 className="text-lg font-medium mb-4">
                    {selectedLecturer.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Assignment Form */}
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md">
                        <h4 className="text-md font-medium mb-4">Assign New Course</h4>
                        
                        <div className="space-y-4">
                          {/* Step 1: Academic Year with add button */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label htmlFor="academicYear">Academic Year</Label>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const yearName = prompt("Enter academic year (e.g., 2024-2025):")
                                  if (yearName) {
                                    // Add the academic year to the database
                                    const addYear = async () => {
                                      try {
                                        const docRef = await addDoc(collection(db, "academic-years"), {
                                          name: yearName,
                                          year: yearName,
                                          startDate: new Date().toISOString(),
                                          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                                          status: "active",
                                          createdAt: new Date().toISOString()
                                        })
                                        
                                        // Add to local state
                                        setAcademicYears(prev => [...prev, {
                                          id: docRef.id,
                                          name: yearName,
                                          year: yearName,
                                          startDate: new Date().toISOString(),
                                          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                                          status: "active"
                                        }])
                                        
                                        setSelectedAcademicYear(docRef.id)
                                        toast({
                                          title: `Added academic year: ${yearName}`,
                                          description: `Added academic year: ${yearName}`,
                                          variant: "success",
                                        });
                                      } catch (error) {
                                        console.error("Error adding academic year:", error)
                                        toast({
                                          title: "Failed to add academic year",
                                          description: "Failed to add academic year",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                    addYear()
                                  }
                                }}
                              >
                                Add New
                              </Button>
                            </div>
                            <Select
                              value={assignmentForm.academicYearId}
                              onValueChange={(value) => handleAssignmentFormChange("academicYearId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select academic year" />
                              </SelectTrigger>
                              <SelectContent>
                                {academicYears.map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Step 2: Semester with add button */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label htmlFor="semester">Semester</Label>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={!selectedAcademicYear}
                                onClick={() => {
                                  if (!selectedAcademicYear) {
                                    toast({
                                      title: "Please select an academic year first",
                                      description: "Please select an academic year first",
                                      variant: "destructive",
                                    });
                                    return
                                  }
                                  
                                  const semesterNumber = prompt("Enter semester number (1, 2, or 3):")
                                  if (semesterNumber && ["1", "2", "3"].includes(semesterNumber)) {
                                    // Add the semester to the database
                                    const addSemester = async () => {
                                      try {
                                        const docRef = await addDoc(collection(db, "academic-semesters"), {
                                          name: `Semester ${semesterNumber}`,
                                          academicYearId: selectedAcademicYear,
                                          startDate: new Date().toISOString(),
                                          endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
                                          status: "active",
                                          createdAt: new Date().toISOString()
                                        })
                                        
                                        // Add to local state
                                        const newSemester = {
                                          id: docRef.id,
                                          name: `Semester ${semesterNumber}`,
                                          academicYearId: selectedAcademicYear,
                                          startDate: new Date().toISOString(),
                                          endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
                                          status: "active"
                                        }
                                        
                                        setAcademicSemesters(prev => [...prev, newSemester])
                                        setFilteredSemesters(prev => [...prev, newSemester])
                                        
                                        setAssignmentForm(prev => ({
                                          ...prev,
                                          academicSemesterId: docRef.id
                                        }))
                                        
                                        toast({
                                          title: `Added Semester ${semesterNumber}`,
                                          description: `Added Semester ${semesterNumber}`,
                                          variant: "success",
                                        });
                                      } catch (error) {
                                        console.error("Error adding semester:", error)
                                        toast({
                                          title: "Failed to add semester",
                                          description: "Failed to add semester",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                    addSemester()
                                  }
                                }}
                              >
                                Add New
                              </Button>
                            </div>
                            <Select
                              value={assignmentForm.academicSemesterId}
                              onValueChange={(value) => handleAssignmentFormChange("academicSemesterId", value)}
                              disabled={filteredSemesters.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={filteredSemesters.length === 0 ? "No semesters available" : "Select semester"} />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredSemesters.map((semester) => (
                                  <SelectItem key={semester.id} value={semester.id}>
                                    {semester.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Step 3: Program */}
                          <div>
                            <Label htmlFor="program">Program</Label>
                            <Select
                              value={assignmentForm.programId}
                              onValueChange={(value) => handleAssignmentFormChange("programId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select program" />
                              </SelectTrigger>
                              <SelectContent>
                                {programs.map((program) => (
                                  <SelectItem key={program.id} value={program.id}>
                                    {program.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Step 4: Level */}
                          <div>
                            <Label htmlFor="level">Level</Label>
                            <Select
                              value={assignmentForm.level.toString()}
                              onValueChange={(value) => {
                                handleAssignmentFormChange("level", parseInt(value));
                                // Reset course selection when level changes
                                setAssignmentForm(prev => ({...prev, courseId: ""}));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="200">200</SelectItem>
                                <SelectItem value="300">300</SelectItem>
                                <SelectItem value="400">400</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Step 5: Program Type */}
                          <div>
                            <Label htmlFor="type">Program Type</Label>
                            <Select
                              value={assignmentForm.programmeCourseType}
                              onValueChange={(value) => handleAssignmentFormChange("programmeCourseType", value as "Regular" | "Weekend")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select program type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Weekend">Weekend</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Step 6: Course (filtered by program and level) */}
                          <div>
                            <Label htmlFor="course">Course</Label>
                            <div className="flex gap-2">
                              <Select
                                value={assignmentForm.courseId}
                                onValueChange={(value) => handleAssignmentFormChange("courseId", value)}
                                disabled={!assignmentForm.programId || !assignmentForm.level || filteredCourses.length === 0}
                              >
                                <SelectTrigger className="flex-grow">
                                  <SelectValue placeholder={
                                    !assignmentForm.programId ? "Select program first" :
                                    !assignmentForm.level ? "Select level first" :
                                    filteredCourses.length === 0 ? "No courses available" : 
                                    "Select course"
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredCourses
                                    .filter(course => course.level === assignmentForm.level)
                                    .map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                      {course.code} - {course.title}
                                    </SelectItem>
                                  ))}
                                  {filteredCourses.filter(course => course.level === assignmentForm.level).length === 0 && (
                                    <SelectItem disabled value="none">No courses available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (!assignmentForm.programId || !assignmentForm.level) {
                                    toast({
                                      title: "Please select a program and level first",
                                      description: "Please select a program and level first",
                                      variant: "destructive",
                                    });
                                    return
                                  }
                                  
                                  // Get semester number
                                  const selectedSemester = academicSemesters.find(s => s.id === assignmentForm.academicSemesterId)
                                  const semesterNumber = selectedSemester?.name?.includes("1") ? 1 : 
                                                      selectedSemester?.name?.includes("2") ? 2 : 
                                                      selectedSemester?.name?.includes("3") ? 3 : 1
                                                      
                                  // Find program name
                                  const programName = programs.find(p => p.id === assignmentForm.programId)?.name || "Unknown Program"
                                  
                                  // Generate a course code and title
                                  const courseCode = prompt("Enter course code (e.g., CSC101):")
                                  
                                  if (courseCode) {
                                    const courseTitle = prompt("Enter course title:", "New Course")
                                    
                                    if (courseTitle) {
                                      // Add the course to the database
                                      const addCourse = async () => {
                                        try {
                                          const courseData = {
                                            code: courseCode,
                                            title: courseTitle,
                                            level: assignmentForm.level,
                                            semester: semesterNumber,
                                            credits: 3,
                                            department: "Academic Affairs",
                                            programId: assignmentForm.programId,
                                            description: `${courseTitle} for ${programName}`,
                                            createdAt: new Date().toISOString(),
                                            status: "active"
                                          }
                                          
                                          const docRef = await addDoc(collection(db, "academic-courses"), courseData)
                                          
                                          // Add to local state
                                          const newCourse = {
                                            id: docRef.id,
                                            ...courseData
                                          }
                                          
                                          setCourses(prev => [...prev, newCourse])
                                          setFilteredCourses(prev => [...prev, newCourse])
                                          
                                          setAssignmentForm(prev => ({
                                            ...prev,
                                            courseId: docRef.id
                                          }))
                                          
                                          toast({
                                            title: `Added course: ${courseCode} - ${courseTitle}`,
                                            description: `Added course: ${courseCode} - ${courseTitle}`,
                                            variant: "success",
                                          });
                                        } catch (error) {
                                          console.error("Error adding course:", error)
                                          toast({
                                            title: "Failed to add course",
                                            description: "Failed to add course",
                                            variant: "destructive",
                                          });
                                        }
                                      }
                                      
                                      addCourse()
                                    }
                                  }
                                }}
                              >
                                Add Course
                              </Button>
                            </div>
                          </div>
                          
                          {filteredCourses.length === 0 ? (
                            <div className="mb-4 mt-4 p-4 border border-amber-200 bg-amber-50 rounded-md">
                              <p className="text-amber-700 text-center">No courses loaded yet. Click the button below to load courses.</p>
                            </div>
                          ) : (
                            <div className="mb-4 mt-4 p-4 border border-green-200 bg-green-50 rounded-md">
                              <p className="text-green-700 text-center">Found {filteredCourses.length} courses matching your criteria.</p>
                            </div>
                          )}
                          
                          <Button 
                            className="w-full mt-4" 
                            onClick={loadAvailableCourses}
                            disabled={!assignmentForm.programId || !assignmentForm.level || !assignmentForm.academicSemesterId}
                            variant="default"
                            size="lg"
                          >
                            Load Available Courses
                          </Button>
                          
                          <Button 
                            className="w-full mt-4" 
                            onClick={handleAssignCourse}
                            disabled={
                              !assignmentForm.lecturerId ||
                              !assignmentForm.academicYearId ||
                              !assignmentForm.academicSemesterId ||
                              !assignmentForm.programId ||
                              !assignmentForm.courseId ||
                              !assignmentForm.programmeCourseType
                            }
                          >
                            Assign Course
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current Assignments */}
                    <div>
                      <h4 className="text-md font-medium mb-4">Current Assignments</h4>
                      {lecturerAssignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-md">
                          No courses assigned to this lecturer yet
                        </div>
                      ) : (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Academic Year</TableHead>
                                <TableHead>Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {lecturerAssignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{getCourseName(assignment.courseId)}</div>
                                      <div className="text-sm text-muted-foreground">{getProgramName(assignment.programId)}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{assignment.level}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div>{getAcademicYearName(assignment.academicYearId)}</div>
                                      <div className="text-sm text-muted-foreground">{getSemesterName(assignment.academicSemesterId)}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                                      {assignment.programmeCourseType}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {!selectedLecturer && (
                <div className="text-center py-12 border rounded-md">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Please select a lecturer to view and manage assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all-assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Course Assignments</CardTitle>
                <CardDescription>
                  View all lecturer assignments across all academic years and semesters.
                </CardDescription>
              </div>
              <Button 
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                Print Assignments
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-lecturer">Filter by Lecturer</Label>
                  <Select
                    value="all"
                    onValueChange={(value) => {
                      if (value === "all") {
                        setAllAssignments(prevState => {
                          const assignmentsRef = collection(db, "lecturer-assignments");
                          getDocs(assignmentsRef).then(querySnapshot => {
                            const assignmentsList = querySnapshot.docs.map(doc => ({
                              id: doc.id,
                              ...doc.data()
                            } as LecturerAssignment));
                            setAllAssignments(assignmentsList);
                          });
                          return prevState;
                        });
                      } else {
                        // Filter assignments by lecturer
                        const assignmentsRef = collection(db, "lecturer-assignments");
                        const q = query(assignmentsRef, where("lecturerId", "==", value));
                        getDocs(q).then(querySnapshot => {
                          const assignmentsList = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                          } as LecturerAssignment));
                          setAllAssignments(assignmentsList);
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Lecturers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Lecturers</SelectItem>
                      {lecturers.filter(l => l.status === "active").map(lecturer => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-year">Filter by Academic Year</Label>
                  <Select
                    value="all"
                    onValueChange={(value) => {
                      if (value === "all") {
                        setAllAssignments(prevState => {
                          const assignmentsRef = collection(db, "lecturer-assignments");
                          getDocs(assignmentsRef).then(querySnapshot => {
                            const assignmentsList = querySnapshot.docs.map(doc => ({
                              id: doc.id,
                              ...doc.data()
                            } as LecturerAssignment));
                            setAllAssignments(assignmentsList);
                          });
                          return prevState;
                        });
                      } else {
                        // Filter assignments by academic year
                        const assignmentsRef = collection(db, "lecturer-assignments");
                        const q = query(assignmentsRef, where("academicYearId", "==", value));
                        getDocs(q).then(querySnapshot => {
                          const assignmentsList = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                          } as LecturerAssignment));
                          setAllAssignments(assignmentsList);
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {academicYears.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-program">Filter by Program</Label>
                  <Select
                    value="all"
                    onValueChange={(value) => {
                      if (value === "all") {
                        setAllAssignments(prevState => {
                          const assignmentsRef = collection(db, "lecturer-assignments");
                          getDocs(assignmentsRef).then(querySnapshot => {
                            const assignmentsList = querySnapshot.docs.map(doc => ({
                              id: doc.id,
                              ...doc.data()
                            } as LecturerAssignment));
                            setAllAssignments(assignmentsList);
                          });
                          return prevState;
                        });
                      } else {
                        // Filter assignments by program
                        const assignmentsRef = collection(db, "lecturer-assignments");
                        const q = query(assignmentsRef, where("programId", "==", value));
                        getDocs(q).then(querySnapshot => {
                          const assignmentsList = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                          } as LecturerAssignment));
                          setAllAssignments(assignmentsList);
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {programs.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {allAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  No course assignments found
                </div>
              ) : (
                <div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {allAssignments.length} course assignments
                  </div>
                  
                  <Tabs defaultValue="table" className="mb-4">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="grouped">Grouped by Lecturer</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="table">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Lecturer</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allAssignments.map((assignment) => {
                            const lecturer = lecturers.find(l => l.id === assignment.lecturerId);
                            const course = courses.find(c => c.id === assignment.courseId);
                            const program = programs.find(p => p.id === assignment.programId);
                            const academicYear = academicYears.find(y => y.id === assignment.academicYearId);
                            const academicSemester = academicSemesters.find(s => s.id === assignment.academicSemesterId);
 
                            if (!lecturer || !course || !academicYear || !academicSemester || !program) {
                              return null; // Skip if data is missing
                            }
 
                            return (
                              <TableRow key={assignment.id}>
                                <TableCell>{lecturer.name}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{course.code}</div>
                                  <div className="text-sm text-muted-foreground">{course.title}</div>
                                </TableCell>
                                <TableCell>{course.level}</TableCell>
                                <TableCell>{program.name}</TableCell>
                                <TableCell>{academicYear.name}</TableCell>
                                <TableCell>{academicSemester.name}</TableCell>
                                <TableCell>
                                  <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                                    {assignment.programmeCourseType}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    
                    <TabsContent value="grouped">
                      <div className="space-y-8">
                        {/* Group assignments by lecturer */}
                        {lecturers.filter(lecturer => {
                          // Only include lecturers with assignments
                          return allAssignments.some(a => a.lecturerId === lecturer.id);
                        }).map(lecturer => {
                          // Get this lecturer's assignments
                          const lecturerAssignments = allAssignments.filter(a => a.lecturerId === lecturer.id);
                          
                          return (
                            <Card key={lecturer.id}>
                              <CardHeader>
                                <CardTitle>{lecturer.name}</CardTitle>
                                <CardDescription>
                                  {lecturerAssignments.length} course{lecturerAssignments.length !== 1 ? 's' : ''} assigned
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Course</TableHead>
                                      <TableHead>Level</TableHead>
                                      <TableHead>Program</TableHead>
                                      <TableHead>Academic Year</TableHead>
                                      <TableHead>Semester</TableHead>
                                      <TableHead>Type</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lecturerAssignments.map(assignment => {
                                      const course = courses.find(c => c.id === assignment.courseId);
                                      const program = programs.find(p => p.id === assignment.programId);
                                      const academicYear = academicYears.find(y => y.id === assignment.academicYearId);
                                      const academicSemester = academicSemesters.find(s => s.id === assignment.academicSemesterId);
                                      
                                      if (!course || !academicYear || !academicSemester || !program) {
                                        return null; // Skip if data is missing
                                      }
                                      
                                      return (
                                        <TableRow key={assignment.id}>
                                          <TableCell>
                                            <div className="font-medium">{course.code}</div>
                                            <div className="text-sm text-muted-foreground">{course.title}</div>
                                          </TableCell>
                                          <TableCell>{course.level}</TableCell>
                                          <TableCell>{program.name}</TableCell>
                                          <TableCell>{academicYear.name}</TableCell>
                                          <TableCell>{academicSemester.name}</TableCell>
                                          <TableCell>
                                            <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                                              {assignment.programmeCourseType}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 