"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCourses, type Course, type Program } from "@/components/course-context"
import { useAcademic } from "@/components/academic-context"
import { Plus, Search, Edit, Trash2, BookOpen, GraduationCap, ChevronRight, CalendarDays, Layers, Folder } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function CourseManagement() {
  const { courses, programs, addCourse, addProgram, editCourse, editProgram, deleteCourse, deleteProgram } =
    useCourses()
  const { academicYears } = useAcademic()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedProgramView, setSelectedProgramView] = useState<"courses" | "structure">("structure")

  // Course form state
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    description: "",
    credits: "",
    prerequisites: "",
    semester: "",
    department: "",
    status: "active" as const,
  })

  // Program form state
  const [programForm, setProgramForm] = useState({
    code: "",
    name: "",
    description: "",
    duration: "",
    degreeType: "",
    requirements: "",
    courses: "",
    status: "active" as const,
  })

  const handleAddCourse = () => {
    if (!courseForm.code || !courseForm.name || !courseForm.credits) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Code, Name, Credits)",
        variant: "destructive",
      })
      return
    }

    // Check if course code already exists
    if (courses.some((course) => course.code === courseForm.code)) {
      toast({
        title: "Error",
        description: "Course code already exists",
        variant: "destructive",
      })
      return
    }

    const newCourse: Omit<Course, "id" | "createdAt"> = {
      code: courseForm.code,
      name: courseForm.name,
      description: courseForm.description,
      credits: Number.parseInt(courseForm.credits),
      prerequisites: courseForm.prerequisites ? courseForm.prerequisites.split(",").map((p) => p.trim()) : [],
      semester: courseForm.semester,
      department: courseForm.department,
      status: courseForm.status,
    }

    addCourse(newCourse)
    setCourseForm({
      code: "",
      name: "",
      description: "",
      credits: "",
      prerequisites: "",
      semester: "",
      department: "",
      status: "active",
    })
    setIsAddCourseOpen(false)

    toast({
      title: "Success",
      description: "Course added successfully",
    })
  }

  const handleAddProgram = () => {
    if (!programForm.code || !programForm.name || !programForm.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Code, Name, Duration)",
        variant: "destructive",
      })
      return
    }

    // Check if program code already exists
    if (programs.some((program) => program.code === programForm.code)) {
      toast({
        title: "Error",
        description: "Program code already exists",
        variant: "destructive",
      })
      return
    }

    const newProgram: Omit<Program, "id" | "createdAt"> = {
      code: programForm.code,
      name: programForm.name,
      description: programForm.description,
      duration: programForm.duration,
      degreeType: programForm.degreeType,
      requirements: programForm.requirements ? programForm.requirements.split(",").map((r) => r.trim()) : [],
      courses: programForm.courses ? programForm.courses.split(",").map((c) => c.trim()) : [],
      coursesPerLevel: {},
      status: programForm.status,
    }

    addProgram(newProgram)
    setProgramForm({
      code: "",
      name: "",
      description: "",
      duration: "",
      degreeType: "",
      requirements: "",
      courses: "",
      status: "active",
    })
    setIsAddProgramOpen(false)

    toast({
      title: "Success",
      description: "Program added successfully",
    })
  }

  const filteredCourses = courses.filter(
    (course) =>
      (course.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (course.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (course.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
  )

  const filteredPrograms = programs.filter(
    (program) =>
      (program.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (program.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (program.degreeType?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course & Program Management</h1>
        <p className="text-muted-foreground">Manage courses and academic programs</p>
      </div>

      {selectedProgram ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedProgram(null)}
                className="flex items-center gap-1"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back
              </Button>
              <h2 className="text-2xl font-semibold">{selectedProgram.name} ({selectedProgram.code})</h2>
              <Badge variant="outline">{selectedProgram.degreeType || selectedProgram.duration}</Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedProgramView === "structure" ? "default" : "outline"}
                onClick={() => setSelectedProgramView("structure")}
                className="flex items-center gap-1"
              >
                <Layers className="h-4 w-4" />
                Program Structure
              </Button>
              <Button 
                variant={selectedProgramView === "courses" ? "default" : "outline"}
                onClick={() => setSelectedProgramView("courses")}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Course List
              </Button>
            </div>
          </div>
          
          {selectedProgramView === "structure" ? (
            <ProgramStructureView program={selectedProgram} />
          ) : (
            <div className="mt-4">
              <Dialog>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Program Course Assignment</DialogTitle>
                    <DialogDescription>
                      Assign courses to {selectedProgram.name} ({selectedProgram.code}) for each level, semester and academic year
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ProgramCourseAssignment program={selectedProgram} />
                  
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="programs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Program Management</CardTitle>
                  <Dialog open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Program</DialogTitle>
                        <DialogDescription>Create a new academic program</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="program-code">Program Code *</Label>
                            <Input
                              id="program-code"
                              value={programForm.code}
                              onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                              placeholder="e.g., CS-MS"
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration *</Label>
                            <Input
                              id="duration"
                              value={programForm.duration}
                              onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                              placeholder="4 years"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="program-name">Program Name *</Label>
                          <Input
                            id="program-name"
                            value={programForm.name}
                            onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                            placeholder="Master of Science in Computer Science"
                          />
                        </div>
                        <div>
                          <Label htmlFor="program-description">Description</Label>
                          <Textarea
                            id="program-description"
                            value={programForm.description}
                            onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                            placeholder="Program description..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="degree-type">Degree Type</Label>
                          <Select
                            value={programForm.degreeType}
                            onValueChange={(value) => setProgramForm({ ...programForm, degreeType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select degree type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                              <SelectItem value="Master's">Master's</SelectItem>
                              <SelectItem value="Doctorate">Doctorate</SelectItem>
                              <SelectItem value="Certificate">Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                          <Input
                            id="requirements"
                            value={programForm.requirements}
                            onChange={(e) => setProgramForm({ ...programForm, requirements: e.target.value })}
                            placeholder="120 credits, Capstone project, Internship"
                          />
                        </div>
                        <div>
                          <Label htmlFor="program-courses">Core Courses (comma-separated)</Label>
                          <Input
                            id="program-courses"
                            value={programForm.courses}
                            onChange={(e) => setProgramForm({ ...programForm, courses: e.target.value })}
                            placeholder="CS 101, CS 201, CS 301"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddProgramOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddProgram}>Add Program</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search programs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrograms.map((program) => (
                    <Card key={program.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline">{program.code}</Badge>
                          <Badge variant="secondary">{program.degreeType || program.duration}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {program.description || "No description provided"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProgram(program)}
                        >
                          Manage Courses
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteProgram(program.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Management</CardTitle>
                  <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>Create a new course in the academic system</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="course-code">Course Code *</Label>
                            <Input
                              id="course-code"
                              value={courseForm.code}
                              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                              placeholder="e.g., CS 401"
                            />
                          </div>
                          <div>
                            <Label htmlFor="credits">Credits *</Label>
                            <Input
                              id="credits"
                              type="number"
                              value={courseForm.credits}
                              onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                              placeholder="3"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="course-name">Course Name *</Label>
                          <Input
                            id="course-name"
                            value={courseForm.name}
                            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                            placeholder="Advanced Database Systems"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={courseForm.description}
                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                            placeholder="Course description..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="department">Department</Label>
                            <Select
                              value={courseForm.department}
                              onValueChange={(value) => setCourseForm({ ...courseForm, department: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                <SelectItem value="Engineering">Engineering</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Liberal Arts">Liberal Arts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="semester">Semester</Label>
                            <Select
                              value={courseForm.semester}
                              onValueChange={(value) => setCourseForm({ ...courseForm, semester: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select semester" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                                <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                                <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="prerequisites">Prerequisites (comma-separated)</Label>
                          <Input
                            id="prerequisites"
                            value={courseForm.prerequisites}
                            onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                            placeholder="CS 201, MATH 101"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCourse}>Add Course</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code || 'N/A'}</TableCell>
                        <TableCell>{course.name || 'N/A'}</TableCell>
                        <TableCell>{course.department || 'N/A'}</TableCell>
                        <TableCell>{course.credits || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteCourse(course.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function ProgramCourseAssignment({ program }: { program: Program }) {
  const { courses, getProgramCourses, addCoursesToProgram, removeCoursesFromProgram } = useCourses()
  const { academicYears } = useAcademic()
  const { toast } = useToast()
  const [selectedLevel, setSelectedLevel] = useState("100")
  const [selectedSemester, setSelectedSemester] = useState("First Semester")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  
  // Level options
  const levelOptions = ["100", "200", "300", "400"]
  const semesterOptions = ["First Semester", "Second Semester"]
  
  // Set default academic year if available
  useEffect(() => {
    if (academicYears.length > 0 && !selectedAcademicYear) {
      // Find active academic year
      const activeYear = academicYears.find(year => year.status === "active")
      setSelectedAcademicYear(activeYear?.year || academicYears[0].year)
    }
  }, [academicYears, selectedAcademicYear])
  
  // Load assigned courses when level, semester, or academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadAssignedCourses()
    }
  }, [selectedLevel, selectedSemester, selectedAcademicYear, program.id])
  
  const loadAssignedCourses = () => {
    if (!selectedAcademicYear) return
    
    const programCourses = getProgramCourses(program.id, selectedLevel, selectedSemester, selectedAcademicYear)
    setAssignedCourses(programCourses)
  }
  
  // Available courses (not already assigned)
  const availableCourses = courses.filter(
    course => !assignedCourses.some(assigned => assigned.code === course.code)
  )
  
  // Handle course assignment
  const handleAssignCourses = async () => {
    if (!selectedCourses.length || !selectedAcademicYear) {
      toast({
        title: "No Courses Selected",
        description: "Please select at least one course to assign",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    
    try {
      const success = await addCoursesToProgram(
        program.id, 
        selectedLevel, 
        selectedSemester,
        selectedAcademicYear,
        selectedCourses
      )
      
      if (success) {
        toast({
          title: "Courses Assigned",
          description: `Successfully assigned ${selectedCourses.length} courses to ${program.name} (${selectedLevel}, ${selectedSemester}, ${selectedAcademicYear})`,
        })
        setSelectedCourses([])
        loadAssignedCourses()
      } else {
        toast({
          title: "Assignment Failed",
          description: "Failed to assign courses. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning courses:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Handle course removal
  const handleRemoveCourse = async (courseCode: string) => {
    if (!selectedAcademicYear) return
    
    setLoading(true)
    
    try {
      const success = await removeCoursesFromProgram(
        program.id,
        selectedLevel,
        selectedSemester,
        selectedAcademicYear,
        [courseCode]
      )
      
      if (success) {
        toast({
          title: "Course Removed",
          description: `Successfully removed course from ${program.name}`,
        })
        loadAssignedCourses()
      } else {
        toast({
          title: "Removal Failed",
          description: "Failed to remove course. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6 my-4">
      {/* Level, Semester, and Academic Year Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map(level => (
                <SelectItem key={level} value={level}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map(semester => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="academicYear">Academic Year</Label>
          <Select 
            value={selectedAcademicYear} 
            onValueChange={setSelectedAcademicYear}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={year.year}>
                  {year.year} {year.status === "active" ? "(Current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Course Assignment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {availableCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available courses to assign</p>
              ) : (
                availableCourses.map(course => (
                  <div key={course.code} className="flex items-center space-x-2">
                    <Checkbox 
                      id={course.code}
                      checked={selectedCourses.includes(course.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCourses(prev => [...prev, course.code])
                        } else {
                          setSelectedCourses(prev => prev.filter(code => code !== course.code))
                        }
                      }}
                    />
                    <Label htmlFor={course.code} className="flex-1 cursor-pointer text-sm">
                      <span className="font-medium">{course.code}</span> - {course.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
            
            <Button 
              onClick={handleAssignCourses} 
              className="mt-4 w-full" 
              disabled={selectedCourses.length === 0 || loading || !selectedAcademicYear}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </>
              ) : (
                <>Assign Selected Courses</>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Assigned Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Assigned Courses for Level {selectedLevel}, {selectedSemester} 
              {selectedAcademicYear ? `, ${selectedAcademicYear}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {assignedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses assigned yet</p>
              ) : (
                assignedCourses.map((course, index) => (
                  <div key={`${course.code}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-sm">{course.code}</p>
                      <p className="text-xs text-muted-foreground">{course.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCourse(course.code)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProgramStructureView({ program }: { program: Program }) {
  const { courses, getProgramCourses } = useCourses()
  const { academicYears } = useAcademic()
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null)
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null)
  
  // Level options
  const levelOptions = ["100", "200", "300", "400", "500", "600"]
  
  // Semester options
  const semesterOptions = ["First Semester", "Second Semester"]
  
  // Set default expanded items on mount
  useEffect(() => {
    if (academicYears.length > 0) {
      const activeYear = academicYears.find(year => year.status === "active")
      setExpandedYear(activeYear?.year || academicYears[0].year)
    }
    
    setExpandedLevel("100")
    setExpandedSemester("First Semester")
  }, [academicYears])
  
  const getCourseCountForYearLevelSemester = (year: string, level: string, semester: string) => {
    const courses = getProgramCourses(program.id, level, semester, year)
    return courses.length
  }
  
  const getTotalCreditsForYearLevelSemester = (year: string, level: string, semester: string) => {
    const assignedCourses = getProgramCourses(program.id, level, semester, year)
    return assignedCourses.reduce((total, course) => total + (course.credits || 0), 0)
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Program Structure</CardTitle>
          <CardDescription>
            View and manage courses by academic year, level, and semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {academicYears.map(academicYear => (
              <AccordionItem key={academicYear.id} value={academicYear.year}>
                <AccordionTrigger 
                  onClick={() => setExpandedYear(academicYear.year === expandedYear ? null : academicYear.year)}
                  className="px-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{academicYear.year}</span>
                    {academicYear.status === "active" && (
                      <Badge variant="secondary" className="ml-2">Current</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-6 space-y-1">
                    <Accordion type="single" collapsible>
                      {levelOptions.map(level => (
                        <AccordionItem key={level} value={level}>
                          <AccordionTrigger 
                            onClick={() => setExpandedLevel(level === expandedLevel ? null : level)}
                            className="px-4 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              <span>Level {level}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-6 space-y-1">
                              <Accordion type="single" collapsible>
                                {semesterOptions.map(semester => {
                                  const courseCount = getCourseCountForYearLevelSemester(academicYear.year, level, semester)
                                  const totalCredits = getTotalCreditsForYearLevelSemester(academicYear.year, level, semester)
                                  
                                  return (
                                    <AccordionItem key={semester} value={semester}>
                                      <AccordionTrigger 
                                        onClick={() => setExpandedSemester(semester === expandedSemester ? null : semester)}
                                        className="px-4 hover:bg-muted/50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Folder className="h-4 w-4" />
                                          <span>{semester}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {courseCount} {courseCount === 1 ? 'course' : 'courses'}
                                          </Badge>
                                          {totalCredits > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                              {totalCredits} {totalCredits === 1 ? 'credit' : 'credits'}
                                            </Badge>
                                          )}
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="pl-6 pr-4 py-2">
                                          <ProgramCoursesDisplay 
                                            program={program}
                                            academicYear={academicYear.year}
                                            level={level}
                                            semester={semester}
                                          />
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  )
                                })}
                              </Accordion>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

function ProgramCoursesDisplay({ 
  program,
  academicYear,
  level,
  semester
}: { 
  program: Program,
  academicYear: string,
  level: string,
  semester: string
}) {
  const { courses, getProgramCourses } = useCourses()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const assignedCourses = getProgramCourses(program.id, level, semester, academicYear)
  
  if (assignedCourses.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">No courses assigned yet</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Assign Courses
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Assign Courses</DialogTitle>
              <DialogDescription>
                Assign courses to {program.name} - Level {level} - {semester} - {academicYear}
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              <ProgramCourseAssignment program={program} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Department</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedCourses.map((course, index) => (
              <TableRow key={`${course.code}-${index}`}>
                <TableCell className="font-medium">{course.code}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>{course.department}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Manage Courses
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Courses</DialogTitle>
              <DialogDescription>
                Manage courses for {program.name} - Level {level} - {semester} - {academicYear}
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              <ProgramCourseAssignment program={program} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
