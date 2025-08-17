"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Search, Loader2, BookOpen, CalendarDays, GraduationCap } from "lucide-react"
import { ProgramsService, CoursesService, Program, Course } from "@/lib/firebase-service"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ProgramDisplay() {
  const [activeTab, setActiveTab] = useState<"programs" | "courses">("programs")
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [programCourses, setProgramCourses] = useState<Course[]>([])

  // Fetch programs from Firebase
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true)
        const programsData = await ProgramsService.getAll()
        setPrograms(programsData)
        setFilteredPrograms(programsData)
      } catch (error) {
        console.error("Error loading programs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrograms()
  }, [])

  // Fetch all courses from Firebase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const coursesData = await CoursesService.getAll()
        setCourses(coursesData)
        setFilteredCourses(coursesData)
      } catch (error) {
        console.error("Error loading courses:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourses()
  }, [])

  // Filter programs and courses when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrograms(programs)
      setFilteredCourses(courses)
      return
    }

    const lowerCaseSearch = searchTerm.toLowerCase()
    
    // Filter programs
    const matchedPrograms = programs.filter((program) => 
      program.name?.toLowerCase().includes(lowerCaseSearch) ||
      program.code?.toLowerCase().includes(lowerCaseSearch) ||
      program.faculty?.toLowerCase().includes(lowerCaseSearch) ||
      program.department?.toLowerCase().includes(lowerCaseSearch)
    )
    setFilteredPrograms(matchedPrograms)
    
    // Filter courses
    const matchedCourses = courses.filter((course) => 
      course.title?.toLowerCase().includes(lowerCaseSearch) ||
      course.code?.toLowerCase().includes(lowerCaseSearch) ||
      course.description?.toLowerCase().includes(lowerCaseSearch) ||
      course.department?.toLowerCase().includes(lowerCaseSearch)
    )
    setFilteredCourses(matchedCourses)
  }, [searchTerm, programs, courses])

  // View courses for a specific program
  const viewProgramCourses = async (program: Program) => {
    if (!program.id) return
    
    try {
      setIsLoading(true)
      setSelectedProgram(program)
      
      // Load courses for this program
      const programCourses = await CoursesService.getByProgram(program.id)
      setProgramCourses(programCourses)
    } catch (error) {
      console.error(`Error loading courses for program ${program.code}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group courses by level and semester
  const groupCoursesByLevelAndSemester = (courses: Course[]) => {
    const groupedCourses: Record<number, Record<number, Course[]>> = {}
    
    courses.forEach(course => {
      const level = course.level || 100
      const semester = course.semester || 1
      
      if (!groupedCourses[level]) {
        groupedCourses[level] = {}
      }
      
      if (!groupedCourses[level][semester]) {
        groupedCourses[level][semester] = []
      }
      
      groupedCourses[level][semester].push(course)
    })
    
    return groupedCourses
  }

  return (
    <>
      {selectedProgram ? (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedProgram.name} ({selectedProgram.code})</CardTitle>
              <CardDescription>
                {selectedProgram.faculty} - {selectedProgram.department}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedProgram(null)}>
              Back to Programs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {selectedProgram.type || "Degree"}
                </Badge>
                <Badge className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {selectedProgram.durationYears} years
                </Badge>
                <Badge variant={selectedProgram.status === "active" ? "default" : "secondary"}>
                  {selectedProgram.status}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {selectedProgram.description}
              </p>
              
              {selectedProgram.entryRequirements && (
                <div className="text-sm">
                  <strong>Entry Requirements:</strong> {selectedProgram.entryRequirements}
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium mb-4">Program Structure</h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : programCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No courses found for this program
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(groupCoursesByLevelAndSemester(programCourses)).map(([level, semesters]) => (
                  <AccordionItem key={level} value={`level-${level}`}>
                    <AccordionTrigger className="hover:bg-muted/50 px-4">
                      Level {level}
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      {Object.entries(semesters).map(([semester, semesterCourses]) => (
                        <div key={`${level}-${semester}`} className="mb-4 px-6">
                          <h4 className="font-medium mb-2">Semester {semester}</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead className="hidden md:table-cell">Department</TableHead>
                                <TableHead className="hidden md:table-cell">Prerequisites</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {semesterCourses.map((course) => (
                                <TableRow key={course.id}>
                                  <TableCell className="font-medium">{course.code}</TableCell>
                                  <TableCell>{course.title}</TableCell>
                                  <TableCell>{course.credits}</TableCell>
                                  <TableCell className="hidden md:table-cell">{course.department}</TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {course.prerequisites && course.prerequisites.length > 0
                                      ? course.prerequisites.join(", ")
                                      : "None"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Program Management</CardTitle>
            <CardDescription>
              View and manage academic programs and courses from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs and courses..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "programs" | "courses")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="programs" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Programs
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="programs">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredPrograms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No programs found matching "{searchTerm}"
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Department</TableHead>
                        <TableHead className="hidden md:table-cell">Faculty</TableHead>
                        <TableHead className="hidden md:table-cell">Duration</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrograms.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">{program.code}</TableCell>
                          <TableCell>{program.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{program.department}</TableCell>
                          <TableCell className="hidden md:table-cell">{program.faculty}</TableCell>
                          <TableCell className="hidden md:table-cell">{program.durationYears} years</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={program.status === "active" ? "default" : "secondary"}>
                              {program.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewProgramCourses(program)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="courses">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No courses found matching "{searchTerm}"
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead className="hidden md:table-cell">Department</TableHead>
                        <TableHead className="hidden md:table-cell">Level</TableHead>
                        <TableHead className="hidden md:table-cell">Semester</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.code}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell className="hidden md:table-cell">{course.department}</TableCell>
                          <TableCell className="hidden md:table-cell">{course.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{course.semester}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={course.status === "active" ? "default" : "secondary"}>
                              {course.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </>
  )
} 