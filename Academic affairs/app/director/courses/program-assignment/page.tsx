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
    status: "active"
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
  
  // Semester options
  const semesterOptions = ["First Semester", "Second Semester"]

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
  }, [selectedProgramId, selectedLevel, selectedSemester, selectedAcademicYear, getProgramById])

  const loadAssignedCourses = () => {
    if (!selectedProgramId || !selectedAcademicYear) return
    
    setIsLoading(true)
    
    // Get courses assigned to this program for the selected level, semester and academic year
    const assignedCourses = getProgramCourses(selectedProgramId, selectedLevel, selectedSemester, selectedAcademicYear)
    setAssignedCourses(assignedCourses)
    
    // Filter available courses (those not already assigned)
    const assignedCourseCodes = assignedCourses.map(course => course.code)
    const availableCourses = courses.filter(course => 
      !assignedCourseCodes.includes(course.code) && 
      course.status === "active" &&
      (course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       course.code.toLowerCase().includes(searchTerm.toLowerCase()))
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
      selectedAvailableCourses
    )
    
    if (success) {
      toast({
        title: "Courses Assigned",
        description: `${selectedAvailableCourses.length} course(s) assigned to ${selectedProgram?.name} Level ${selectedLevel} Semester ${selectedSemester} for ${selectedAcademicYear}`,
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
      selectedAssignedCourses
    )
    
    if (success) {
      toast({
        title: "Courses Removed",
        description: `${selectedAssignedCourses.length} course(s) removed from ${selectedProgram?.name} Level ${selectedLevel} Semester ${selectedSemester} for ${selectedAcademicYear}`,
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
      status: "active"
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
      status: "active"
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/director/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Program Course Assignment</h1>
          </div>
          <p className="text-muted-foreground">Assign courses to programs by level, semester and academic year</p>
        </div>
      </div>

      {/* Add Course Button */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <Plus className="h-4 w-4 mr-2" /> Add New Course
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new course to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">Course Code</Label>
              <Input
                id="code"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Course Name</Label>
              <Input
                id="name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={newCourse.credits}
                onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">Department</Label>
              <Input
                id="department"
                value={newCourse.department}
                onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleAddNewCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Select Program, Level, Semester and Academic Year</CardTitle>
          <CardDescription>
            Choose a program and specify the level, semester and academic year to manage course assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="program">Program</Label>
              <Select 
                value={selectedProgramId} 
                onValueChange={setSelectedProgramId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="level">Level</Label>
              <Select 
                value={selectedLevel} 
                onValueChange={setSelectedLevel}
                disabled={!selectedProgramId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={selectedSemester} 
                onValueChange={setSelectedSemester}
                disabled={!selectedProgramId}
              >
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
                disabled={!selectedProgramId}
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
        </CardContent>
      </Card>

      {selectedProgram && selectedAcademicYear && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Courses</span>
                <Badge variant="outline">{availableCourses.length}</Badge>
              </CardTitle>
              <CardDescription>
                Courses that can be assigned to this program
              </CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="button" onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {availableCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available courses found
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={
                              selectedAvailableCourses.length === availableCourses.length && 
                              availableCourses.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAvailableCourses(availableCourses.map(c => c.code))
                              } else {
                                setSelectedAvailableCourses([])
                              }
                            }}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Course Name</TableHead>
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
                              aria-label={`Select ${course.name}`}
                            />
                          </TableCell>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAssignCourses}
                  disabled={selectedAvailableCourses.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Assign Selected Courses
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assigned Courses</span>
                <Badge variant="outline">{assignedCourses.length}</Badge>
              </CardTitle>
              <CardDescription>
                Courses assigned to {selectedProgram.name} - Level {selectedLevel} Semester {selectedSemester} ({selectedAcademicYear})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses assigned yet
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedAssignedCourses.length === assignedCourses.length && 
                              assignedCourses.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAssignedCourses(assignedCourses.map(c => c.code))
                              } else {
                                setSelectedAssignedCourses([])
                              }
                            }}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Course Name</TableHead>
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
                              aria-label={`Select ${course.name}`}
                            />
                          </TableCell>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleRemoveCourses}
                  disabled={selectedAssignedCourses.length === 0 || isLoading}
                  className="text-red-600"
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Remove Selected Courses
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}