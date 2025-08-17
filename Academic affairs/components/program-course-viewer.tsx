"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { ProgramsService, CoursesService, Program, Course } from "@/lib/firebase-service"

export default function ProgramCourseViewer() {
  const [activeTab, setActiveTab] = useState<"programs" | "courses">("programs")
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [programCourses, setProgramCourses] = useState<Course[]>([])

  // Load programs and courses
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        
        // Fetch programs
        const programsData = await ProgramsService.getAll()
        setPrograms(programsData)
        setFilteredPrograms(programsData)
        
        // Fetch courses
        const coursesData = await CoursesService.getAll()
        setCourses(coursesData)
        setFilteredCourses(coursesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Filter programs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPrograms(programs)
      setFilteredCourses(courses)
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    
    // Filter programs
    const matchedPrograms = programs.filter(
      (program) =>
        program.name.toLowerCase().includes(lowerQuery) ||
        program.code.toLowerCase().includes(lowerQuery) ||
        program.department?.toLowerCase().includes(lowerQuery) ||
        program.faculty?.toLowerCase().includes(lowerQuery)
    )
    setFilteredPrograms(matchedPrograms)
    
    // Filter courses
    const matchedCourses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(lowerQuery) ||
        course.code.toLowerCase().includes(lowerQuery) ||
        course.description?.toLowerCase().includes(lowerQuery) ||
        course.department?.toLowerCase().includes(lowerQuery)
    )
    setFilteredCourses(matchedCourses)
  }, [searchQuery, programs, courses])

  // Load courses for a specific program
  const loadProgramCourses = async (programId: string) => {
    if (!programId) return
    
    try {
      setIsLoading(true)
      const coursesData = await CoursesService.getByProgram(programId)
      setProgramCourses(coursesData)
      setSelectedProgram(programId)
    } catch (error) {
      console.error("Error loading program courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programs and Courses</CardTitle>
        <CardDescription>
          View academic programs and courses from the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "programs" ? "Search programs..." : "Search courses..."}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="programs" onValueChange={(val) => setActiveTab(val as "programs" | "courses")}>
          <TabsList className="mb-4">
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="programs">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No programs found. Try a different search term.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.code}</TableCell>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.department}</TableCell>
                      <TableCell>{program.faculty}</TableCell>
                      <TableCell>{program.durationYears} years</TableCell>
                      <TableCell>{program.credits}</TableCell>
                      <TableCell>
                        <Badge variant={program.status === "active" ? "default" : "secondary"}>
                          {program.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => program.id && loadProgramCourses(program.id)}
                        >
                          View Courses
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
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No courses found. Try a different search term.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>
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

        {selectedProgram && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {programs.find((p) => p.id === selectedProgram)?.name} - Courses
                </CardTitle>
                <CardDescription>
                  Courses assigned to this program
                </CardDescription>
              </CardHeader>
              <CardContent>
                {programCourses.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No courses assigned to this program.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Semester</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.code}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell>{course.level}</TableCell>
                          <TableCell>{course.semester}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 