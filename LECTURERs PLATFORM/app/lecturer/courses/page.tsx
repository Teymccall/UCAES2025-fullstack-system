"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { CalendarIcon, BookOpen, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LecturerAssignment {
  id: string
  lecturerId: string
  academicYearId: string
  academicSemesterId: string
  programId: string
  courseId: string
  programmeCourseType: "Regular" | "Weekend"
  level: number
  status: string
  createdAt: string
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

interface Program {
  id: string
  name: string
  code: string
  faculty: string
  department: string
}

interface Course {
  id: string
  code: string
  title: string
  credits: number
  level: number
  semester: number
  department: string
  description?: string
}

export default function CoursesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentLecturerId, setCurrentLecturerId] = useState<string>("")
  const [assignments, setAssignments] = useState<LecturerAssignment[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicSemesters, setAcademicSemesters] = useState<AcademicSemester[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  
  // Local state for system config to avoid SSR issues
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string | null>(null)
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string | null>(null)
  const [currentSemester, setCurrentSemester] = useState<string | null>(null)
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  

  
  const [selectedYearId, setSelectedYearId] = useState<string>("")
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<"Regular" | "Weekend" | null>(null)
  
  const [filteredAssignments, setFilteredAssignments] = useState<LecturerAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch system config
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const configRef = doc(db, "systemConfig", "academicPeriod");
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          const data = configSnap.data();
          setCurrentAcademicYear(data.currentAcademicYear || null);
          setCurrentAcademicYearId(data.currentAcademicYearId || null);
          setCurrentSemester(data.currentSemester || null);
          setCurrentSemesterId(data.currentSemesterId || null);
        }
      } catch (error) {
        console.error("Error fetching system config:", error);
      } finally {
        setConfigLoading(false);
      }
    };
    
    fetchSystemConfig();
  }, []);

  // Initialize filters with system config when available
  useEffect(() => {
    if (currentAcademicYearId && !selectedYearId) {
      setSelectedYearId(currentAcademicYearId);
    }
    
    if (currentSemesterId && !selectedSemesterId) {
      setSelectedSemesterId(currentSemesterId);
    }
  }, [currentAcademicYearId, currentSemesterId, selectedYearId, selectedSemesterId]);
  
  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        // Handle not logged in
        window.location.href = "/login"
      }
    })
    
    return () => unsubscribe()
  }, [])
  
  // Fetch data
  useEffect(() => {
    if (!currentUser) return
    
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Get lecturer document
        const lecturersRef = collection(db, "users")
        const lecturerQuery = query(lecturersRef, where("email", "==", currentUser.email))
        const lecturerSnapshot = await getDocs(lecturerQuery)
        
        if (lecturerSnapshot.empty) {
          console.error("No lecturer found with this email")
          setIsLoading(false)
          return
        }
        
        const lecturerId = lecturerSnapshot.docs[0].id
        setCurrentLecturerId(lecturerId)
        
        // Fetch assignments
        const assignmentsRef = collection(db, "lecturer-assignments")
        const assignmentsQuery = query(assignmentsRef, where("lecturerId", "==", lecturerId))
        const assignmentsSnapshot = await getDocs(assignmentsQuery)
        
        const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as LecturerAssignment)
        
        setAssignments(assignmentsData)
        
        // Fetch academic years
        const yearsRef = collection(db, "academic-years")
        const yearsSnapshot = await getDocs(yearsRef)
        
        const yearsData = yearsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as AcademicYear)
        
        setAcademicYears(yearsData)
        
        // Set default year from lecturer's assignments if available
        if (assignmentsData.length > 0) {
          // Get unique academic years from assignments
          const assignmentYearIds = [...new Set(assignmentsData.map(a => a.academicYearId))];
          
          // If there's at least one assignment, use its academic year
          if (assignmentYearIds.length > 0) {
            console.log("Setting academic year from lecturer assignment:", assignmentYearIds[0]);
            setSelectedYearId(assignmentYearIds[0]);
            
            // Also get the semester from the same assignment
            const firstAssignment = assignmentsData.find(a => a.academicYearId === assignmentYearIds[0]);
            if (firstAssignment && firstAssignment.academicSemesterId) {
              console.log("Setting semester from lecturer assignment:", firstAssignment.academicSemesterId);
              setSelectedSemesterId(firstAssignment.academicSemesterId);
            }
          }
        } else {
          // Fallback to active years if no assignments
          const activeYears = yearsData.filter(y => y.status === "active")
          if (activeYears.length > 0) {
            setSelectedYearId(activeYears[0].id)
          } else if (yearsData.length > 0) {
            setSelectedYearId(yearsData[0].id)
          }
        }
        
        // Fetch academic semesters
        const semestersRef = collection(db, "academic-semesters")
        const semestersSnapshot = await getDocs(semestersRef)
        
        const semestersData = semestersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as AcademicSemester)
        
        setAcademicSemesters(semestersData)
        
        // Fetch programs
        const programsRef = collection(db, "academic-programs")
        const programsSnapshot = await getDocs(programsRef)
        
        const programsData = programsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Program)
        
        setPrograms(programsData)
        
        // Fetch courses
        const coursesRef = collection(db, "academic-courses")
        const coursesSnapshot = await getDocs(coursesRef)
        
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Course)
        
        setCourses(coursesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [currentUser])
  
  // Filter assignments based on selected filters
  useEffect(() => {
    let filtered = [...assignments];
    
    // Only show courses that are assigned to this lecturer
    // This is important for security/privacy  
    filtered = filtered.filter(a => a.lecturerId === currentLecturerId);
    
    if (selectedYearId && selectedYearId !== "all") {
      filtered = filtered.filter(a => a.academicYearId === selectedYearId);
    }
    
    if (selectedSemesterId && selectedSemesterId !== "all") {
      filtered = filtered.filter(a => a.academicSemesterId === selectedSemesterId);
    }
    
    if (selectedLevel) {
      filtered = filtered.filter(a => a.level === selectedLevel);
    }
    
    if (selectedType) {
      filtered = filtered.filter(a => a.programmeCourseType === selectedType);
    }
    
    // Print diagnostic info if no assignments found
    if (filtered.length === 0 && assignments.length > 0) {
      console.log("No courses found with filters:", { 
        selectedYearId, 
        selectedSemesterId, 
        selectedLevel, 
        selectedType 
      });
      console.log("Available assignments:", assignments);
    }
    
    setFilteredAssignments(filtered);
  }, [assignments, selectedYearId, selectedSemesterId, selectedLevel, selectedType, currentLecturerId]);
  
  // Set default year and semester directly in the UI if not set yet
  useEffect(() => {
    // If assignments exist but no year is selected, try to find the right one
    if (assignments.length > 0 && (!selectedYearId || selectedYearId === "")) {
      const firstAssignment = assignments[0];
      if (firstAssignment.academicYearId) {
        console.log("Auto-setting academic year to:", firstAssignment.academicYearId);
        setSelectedYearId(firstAssignment.academicYearId);
        
        if (firstAssignment.academicSemesterId) {
          console.log("Auto-setting semester to:", firstAssignment.academicSemesterId);
          setSelectedSemesterId(firstAssignment.academicSemesterId);
        }
      }
    }
  }, [assignments, selectedYearId, selectedSemesterId]);
  
  // Filter semesters based on selected year
  const filteredSemesters = academicSemesters.filter(
    semester => semester.academicYearId === selectedYearId
  )
  
  // Helper functions to get names by IDs
  const getAcademicYearName = (yearId: string) => {
    const year = academicYears.find(y => y.id === yearId)
    return year ? year.name : "Unknown Year"
  }
  
  const getSemesterName = (semesterId: string) => {
    const semester = academicSemesters.find(s => s.id === semesterId)
    return semester ? semester.name : "Unknown Semester"
  }
  
  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    return program ? program.name : "Unknown Program"
  }
  
  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Courses</h1>
      </div>

      {/* Current Academic Period Card */}
      <Card className="mb-4 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">Current Academic Period</h3>
              <p className="text-blue-600">
                {configLoading ? "Loading..." : 
                  `${currentAcademicYear || "No active year"} • ${currentSemester || "No active semester"}`}
              </p>
            </div>
            <Badge className="mt-2 sm:mt-0" variant="outline">
              System-wide Setting
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Filters</CardTitle>
          <CardDescription>Filter your courses by academic year, semester, level, and program type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select
                value={selectedYearId}
                onValueChange={setSelectedYearId}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name} {assignments.some(a => a.academicYearId === year.id) ? '(Assigned)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={selectedSemesterId}
                onValueChange={setSelectedSemesterId}
                disabled={filteredSemesters.length === 0}
              >
                <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {filteredSemesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name} {assignments.some(a => 
                        a.academicYearId === selectedYearId && 
                        a.academicSemesterId === semester.id
                      ) ? '(Assigned)' : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            </div>
            
            <div>
              <Label htmlFor="level">Level</Label>
              <Select
                value={selectedLevel ? selectedLevel.toString() : ""}
                onValueChange={(value) => setSelectedLevel(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="300">300</SelectItem>
                  <SelectItem value="400">400</SelectItem>
              </SelectContent>
            </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Program Type</Label>
              <Select
                value={selectedType || ""}
                onValueChange={(value) => setSelectedType(value as "Regular" | "Weekend" || null)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select program type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Assigned Courses
                {!isLoading && (
                  <Badge variant="default" className="bg-green-600 ml-2">
                    {filteredAssignments.length} course{filteredAssignments.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isLoading 
                  ? "Loading your assigned courses..." 
                  : `Courses assigned to you by the director. Total: ${filteredAssignments.length} course${filteredAssignments.length !== 1 ? 's' : ''} found with current filters.`}
              </CardDescription>
        </CardHeader>
        <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses found matching the selected filters
                </div>
              ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                      <TableHead>Program</TableHead>
                  <TableHead>Level</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {filteredAssignments.map((assignment) => {
                      const course = getCourse(assignment.courseId)
                      // Debug log for each assignment
                      console.log(`Assignment ${assignment.id}: CourseID=${assignment.courseId}, Course Found:`, course)
                      return (
                        <TableRow key={assignment.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/lecturer/courses/${assignment.courseId}`)}>
                          <TableCell className="font-medium">
                            <span className="text-lg font-bold text-green-700">
                              {course?.code || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {course?.title || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>{getProgramName(assignment.programId)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              Level {assignment.level}
                            </Badge>
                          </TableCell>
                      <TableCell>
                            <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                              {assignment.programmeCourseType}
                            </Badge>
                      </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {getAcademicYearName(assignment.academicYearId)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {getSemesterName(assignment.academicSemesterId)}
                            </Badge>
                          </TableCell>
                    </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
              )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No courses found matching the selected filters
              </div>
            ) : (
              filteredAssignments.map((assignment) => {
                const course = getCourse(assignment.courseId)
                return (
                  <Card 
                    key={assignment.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/lecturer/courses/${assignment.courseId}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{course?.code || "N/A"}</CardTitle>
                        <Badge variant={assignment.programmeCourseType === "Regular" ? "default" : "secondary"}>
                          {assignment.programmeCourseType}
                        </Badge>
            </div>
                      <CardDescription className="line-clamp-2 font-medium text-base text-foreground">
                        {course?.title || "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{getProgramName(assignment.programId)}</span>
              </div>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {getAcademicYearName(assignment.academicYearId)} - {getSemesterName(assignment.academicSemesterId)}
                          </span>
              </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Level {assignment.level}</span>
              </div>
            </div>
          </CardContent>
        </Card>
                )
              })
            )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
