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
import { useCourses, type Course, type Program } from "@/components/course-context"
import { useAcademic } from "@/components/academic-context"
import { Plus, Search, Edit, Trash2, BookOpen, GraduationCap, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"

export default function ProgramCourseAssignment() {
  const { courses, programs, getProgramById, getProgramCourses, addCoursesToProgram, removeCoursesFromProgram, addCourse } = useCourses()
  const { academicYears, addAcademicYear } = useAcademic()
  const { toast } = useToast()
  
  const [selectedProgramId, setSelectedProgramId] = useState<string>("")
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>("100")
  const [selectedSemester, setSelectedSemester] = useState<string>("First Semester")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("")
  const [selectedStudyMode, setSelectedStudyMode] = useState<string>("Regular") // Added study mode state
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedAvailableCourses, setSelectedAvailableCourses] = useState<string[]>([])
  const [selectedAssignedCourses, setSelectedAssignedCourses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showAddCourseDialog, setShowAddCourseDialog] = useState<boolean>(false)
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    code: "",
    name: "",
    description: "",
    credits: 3,
    prerequisites: [],
    semester: "",
    department: "",
    status: "active",
    studyMode: "Regular" // Added default study mode
  })
  const [showAddYearDialog, setShowAddYearDialog] = useState(false)
  const [yearForm, setYearForm] = useState({
    year: "",
    startDate: "",
    endDate: "",
    status: "upcoming"
  })

  // Level options for university programs
  const levelOptions = ["100", "200", "300", "400", "500", "600"]
  
  // Semester options (support trimester for Weekend)
  const semesterOptions = selectedStudyMode === 'Weekend'
    ? ["First Trimester", "Second Trimester", "Third Trimester"]
    : ["First Semester", "Second Semester"]

  // Study mode options
  const studyModeOptions = ["Regular", "Weekend"]

  // Set default academic year if available
  useEffect(() => {
    if (academicYears.length > 0 && !selectedAcademicYear) {
      // Find active academic year
      const activeYear = academicYears.find(year => year.status === "active")
      setSelectedAcademicYear(activeYear?.year || academicYears[0].year)
    }
  }, [academicYears, selectedAcademicYear])

  useEffect(() => {
    if (selectedProgramId) {
      const program = getProgramById(selectedProgramId)
      setSelectedProgram(program || null)
      
      if (program) {
        loadAssignedCourses()
      }
    } else {
      setSelectedProgram(null)
      setAssignedCourses([])
    }
  }, [selectedProgramId, selectedLevel, selectedSemester, selectedAcademicYear, selectedStudyMode, getProgramById])

  const loadAssignedCourses = () => {
    if (!selectedProgramId || !selectedAcademicYear) return
    
    setIsLoading(true)
    
    // Get courses assigned to this program for the selected level, semester, academic year and study mode
    const assignedCourses = getProgramCourses(
      selectedProgramId, 
      selectedLevel, 
      selectedSemester, 
      selectedAcademicYear,
      selectedStudyMode
    )
    setAssignedCourses(assignedCourses)
    
    // Filter available courses (those not already assigned)
    const assignedCourseCodes = assignedCourses.map(course => course.code)
    const availableCourses = courses.filter(course => 
      !assignedCourseCodes.includes(course.code) && 
      course.status === "active" &&
      (course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       course.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedStudyMode || selectedStudyMode === 'all' || 
       course.studyMode === selectedStudyMode || 
       (selectedStudyMode === 'Regular' && !course.studyMode)) // Filter by study mode
    )
    setAvailableCourses(availableCourses)
    
    // Reset selections
    setSelectedAvailableCourses([])
    setSelectedAssignedCourses([])
    
    setIsLoading(false)
  }

  const handleAssignCourses = async () => {
    if (!selectedProgramId || selectedAvailableCourses.length === 0 || !selectedAcademicYear) return
    
    setIsLoading(true)
    
    const success = await addCoursesToProgram(
      selectedProgramId,
      selectedLevel,
      selectedSemester,
      selectedAcademicYear,
      selectedAvailableCourses,
      selectedStudyMode // Pass study mode to the function
    )
    
    if (success) {
      toast({
        title: "Courses Assigned",
        description: `${selectedAvailableCourses.length} course(s) assigned to ${selectedProgram?.name} Level ${selectedLevel} Semester ${selectedSemester} for ${selectedAcademicYear} (${selectedStudyMode})`,
      })
      
      // Reload courses
      loadAssignedCourses()
    } else {
      toast({
        title: "Error",
        description: "Failed to assign courses. Please try again.",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const handleRemoveCourses = async () => {
    if (!selectedProgramId || selectedAssignedCourses.length === 0 || !selectedAcademicYear) return
    
    setIsLoading(true)
    
    const success = await removeCoursesFromProgram(
      selectedProgramId,
      selectedLevel,
      selectedSemester,
      selectedAcademicYear,
      selectedAssignedCourses,
      selectedStudyMode // Pass study mode to the function
    )
    
    if (success) {
      toast({
        title: "Courses Removed",
        description: `${selectedAssignedCourses.length} course(s) removed from ${selectedProgram?.name} Level ${selectedLevel} Semester ${selectedSemester} for ${selectedAcademicYear} (${selectedStudyMode})`,
      })
      
      // Reload courses
      loadAssignedCourses()
    } else {
      toast({
        title: "Error",
        description: "Failed to remove courses. Please try again.",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const toggleAvailableCourse = (courseCode: string) => {
    setSelectedAvailableCourses(prev => 
      prev.includes(courseCode)
        ? prev.filter(code => code !== courseCode)
        : [...prev, courseCode]
    )
  }

  const toggleAssignedCourse = (courseCode: string) => {
    setSelectedAssignedCourses(prev => 
      prev.includes(courseCode)
        ? prev.filter(code => code !== courseCode)
        : [...prev, courseCode]
    )
  }

  const handleSearch = () => {
    loadAssignedCourses()
  }

  const handleAddNewCourse = () => {
    const { code, name, description, credits, department } = newCourse
    
    if (!code || !name || !description || !credits || !department) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    
    // Add the course using the context function
    addCourse({
      code,
      name,
      description,
      credits: Number(credits),
      prerequisites: newCourse.prerequisites || [],
      semester: newCourse.semester || "",
      department,
      status: "active",
      studyMode: newCourse.studyMode || "Regular" // Ensure study mode is set
    })
    
    toast({
      title: "Course Added",
      description: `Added ${code}: ${name}`,
    })
    
    // Reset form and close dialog
    setNewCourse({
      code: "",
      name: "",
      description: "",
      credits: 3,
      prerequisites: [],
      semester: "",
      department: "",
      status: "active",
      studyMode: "Regular"
    })
    setShowAddCourseDialog(false)
    
    // Refresh the available courses list
    loadAssignedCourses()
  }

  // Add academic year handler
  const handleAddAcademicYear = async () => {
    if (!yearForm.year || !yearForm.startDate || !yearForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    await addAcademicYear({
      year: yearForm.year,
      startDate: yearForm.startDate,
      endDate: yearForm.endDate,
      status: yearForm.status,
      semesters: [],
    })
    setShowAddYearDialog(false)
    setYearForm({ year: "", startDate: "", endDate: "", status: "upcoming" })
    toast({ title: "Success", description: "Academic year added successfully" })
  }

  // Fallback UI if no academic years exist
  if (academicYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">No Academic Years Found</h2>
        <p className="mb-4 text-muted-foreground">You must add an academic year before assigning courses.</p>
        <Button onClick={() => setShowAddYearDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Academic Year
        </Button>
        <Dialog open={showAddYearDialog} onOpenChange={setShowAddYearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
              <DialogDescription>Enter the details for the new academic year.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">Academic Year</Label>
                <Input
                  id="year"
                  value={yearForm.year}
                  onChange={e => setYearForm({ ...yearForm, year: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. 2025-2026"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={yearForm.startDate}
                  onChange={e => setYearForm({ ...yearForm, startDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={yearForm.endDate}
                  onChange={e => setYearForm({ ...yearForm, endDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={yearForm.status} onValueChange={v => setYearForm({ ...yearForm, status: v })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddYearDialog(false)}>Cancel</Button>
              <Button onClick={handleAddAcademicYear}>Add Academic Year</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Program Course Assignment</h1>
        
        <div className="flex gap-2">
          <Link href="/director/courses">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          
          <Button onClick={() => setShowAddCourseDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assign Courses to Program</CardTitle>
          <CardDescription>
            Select a program and assign courses to specific levels, semesters, and study modes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="program">Program</Label>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs
                    .filter(program => program.id && program.id.trim() !== "") // Filter out programs with empty/null IDs
                    .map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                  {programs.filter(program => !program.id || program.id.trim() === "").length > 0 && (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      Some programs have invalid IDs and are not shown
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((level) => (
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
                  {semesterOptions.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <div className="flex items-center space-x-2">
                <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear} className="flex-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.year}>
                        {year.year} {year.status === "active" && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={() => setShowAddYearDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Study Mode Selection */}
            <div>
              <Label htmlFor="studyMode">Study Mode</Label>
              <Select value={selectedStudyMode} onValueChange={setSelectedStudyMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {studyModeOptions.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rest of the UI */}
          {selectedProgram ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Available courses */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Available Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search courses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Button variant="outline" onClick={handleSearch}>
                        Search
                      </Button>
                    </div>
                    
                    <div className="h-80 overflow-auto border rounded-md">
                      {availableCourses.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No available courses found</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Credits</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableCourses.map((course) => (
                              <TableRow key={course.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedAvailableCourses.includes(course.code)}
                                    onCheckedChange={() => toggleAvailableCourse(course.code)}
                                  />
                                </TableCell>
                                <TableCell>{course.code}</TableCell>
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleAssignCourses} 
                      disabled={selectedAvailableCourses.length === 0 || isLoading}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Assign Selected Courses
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Assigned courses */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Assigned Courses</CardTitle>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium">
                        {selectedProgram.name} ({selectedProgram.code})
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Level {selectedLevel}</span>
                        <span>•</span>
                        <span>{selectedSemester}</span>
                        <span>•</span>
                        <span>{selectedStudyMode}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 overflow-auto border rounded-md">
                    {assignedCourses.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No courses assigned yet</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Credits</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignedCourses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedAssignedCourses.includes(course.code)}
                                  onCheckedChange={() => toggleAssignedCourse(course.code)}
                                />
                              </TableCell>
                              <TableCell>{course.code}</TableCell>
                              <TableCell>{course.name}</TableCell>
                              <TableCell>{course.credits}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 text-destructive" 
                    onClick={handleRemoveCourses}
                    disabled={selectedAssignedCourses.length === 0 || isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected Courses
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center bg-muted/20 rounded-md">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold">Select a Program</h3>
              <p className="text-muted-foreground text-sm">Choose a program to manage its courses</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Create a new course that can be assigned to programs</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-code">Course Code *</Label>
                <Input
                  id="course-code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  value={newCourse.credits?.toString() || "3"}
                  onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value, 10) })}
                  placeholder="3"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="course-name">Course Name *</Label>
              <Input
                id="course-name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value, title: e.target.value })}
                placeholder="Introduction to Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="course-description">Description *</Label>
              <Input
                id="course-description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Course description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="study-mode">Study Mode *</Label>
                <Select
                  value={newCourse.studyMode || "Regular"}
                  onValueChange={(value) => setNewCourse({ ...newCourse, studyMode: value as "Regular" | "Weekend" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyModeOptions.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleAddNewCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Academic Year Dialog */}
      <Dialog open={showAddYearDialog} onOpenChange={setShowAddYearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Academic Year</DialogTitle>
            <DialogDescription>Create a new academic year for course planning</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="year">Academic Year *</Label>
              <Input
                id="year"
                value={yearForm.year}
                onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                placeholder="e.g., 2023-2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={yearForm.startDate}
                  onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={yearForm.endDate}
                  onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={yearForm.status} onValueChange={(value) => setYearForm({ ...yearForm, status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddYearDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAcademicYear}>Add Academic Year</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}