"use client"

import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCourses } from "@/components/course-context"
import { useStudents, type StudentResult } from "@/components/student-context"
import { Save, Send, Calculator, Users, BookOpen, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Memoized course selector component to prevent unnecessary re-renders
function CourseSelectorComponent({ 
  courses, 
  selectedCourse, 
  onCourseChange 
}: { 
  courses: any[], 
  selectedCourse: string, 
  onCourseChange: (value: string) => void 
}) {
  // Use a stable callback function
  const handleChange = useCallback((value: string) => {
    if (value !== selectedCourse) {
      onCourseChange(value);
    }
  }, [selectedCourse, onCourseChange]);

  return (
    <div>
      <Label htmlFor="course">Course</Label>
      <Select 
        value={selectedCourse} 
        onValueChange={handleChange}
      >
        <SelectTrigger id="course">
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.code} value={course.code}>
              {course.code} - {course.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Custom comparison function for memo
function areCourseSelectorPropsEqual(prevProps: any, nextProps: any) {
  return (
    prevProps.selectedCourse === nextProps.selectedCourse &&
    prevProps.courses.length === nextProps.courses.length &&
    prevProps.courses.every((course: any, index: number) => 
      course.code === nextProps.courses[index].code
    ) &&
    prevProps.onCourseChange === nextProps.onCourseChange
  );
}

// Apply memo with custom comparison
const CourseSelector = memo(CourseSelectorComponent, areCourseSelectorPropsEqual);
CourseSelector.displayName = 'CourseSelector';

// Memoized semester selector component
function SemesterSelectorComponent({
  value,
  onChange
}: {
  value: string,
  onChange: (value: string) => void
}) {
  // Use a stable callback function
  const handleChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  return (
    <div>
      <Label htmlFor="semester">Semester</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger id="semester">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fall2024">Fall 2024</SelectItem>
          <SelectItem value="spring2024">Spring 2024</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const SemesterSelector = memo(SemesterSelectorComponent, (prev, next) => 
  prev.value === next.value && prev.onChange === next.onChange
);
SemesterSelector.displayName = 'SemesterSelector';

// Memoized program selector component
function ProgramSelectorComponent({
  value,
  onChange
}: {
  value: string,
  onChange: (value: string) => void
}) {
  // Use a stable callback function
  const handleChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  return (
    <div>
      <Label htmlFor="program">Program Level</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger id="program">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="100">Level 100</SelectItem>
          <SelectItem value="200">Level 200</SelectItem>
          <SelectItem value="300">Level 300</SelectItem>
          <SelectItem value="400">Level 400</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const ProgramSelector = memo(ProgramSelectorComponent, (prev, next) => 
  prev.value === next.value && prev.onChange === next.onChange
);
ProgramSelector.displayName = 'ProgramSelector';

export default function ResultEntry() {
  const { courses } = useCourses()
  const { students, getStudentsByCourse, saveResultDraft, submitResults, getResultsByCourse, calculateGrade } =
    useStudents()
  const { toast } = useToast()

  const [selectedCourse, setSelectedCourse] = useState("")
  const [currentResults, setCurrentResults] = useState<Record<string, Partial<StudentResult>>>({})
  const [isDraftSaved, setIsDraftSaved] = useState(false)
  const [semesterValue, setSemesterValue] = useState("fall2024")
  const [programValue, setProgramValue] = useState("all")

  // Filter courses assigned to current staff member
  const assignedCourses = useMemo(() => courses.filter(
    (course) => course.instructor === "Prof. Michael Chen" || course.status === "active",
  ), [courses]);

  const selectedCourseData = useMemo(() => 
    courses.find((course) => course.code === selectedCourse),
    [courses, selectedCourse]
  );
  
  const enrolledStudents = useMemo(() => 
    selectedCourse ? getStudentsByCourse(selectedCourse) : [],
    [selectedCourse, getStudentsByCourse]
  );
  
  const existingResults = useMemo(() => 
    selectedCourse ? getResultsByCourse(selectedCourse) : [],
    [selectedCourse, getResultsByCourse]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleCourseChange = useCallback((value: string) => {
    setSelectedCourse(value);
  }, []);

  const handleSemesterChange = useCallback((value: string) => {
    setSemesterValue(value);
  }, []);

  const handleProgramChange = useCallback((value: string) => {
    setProgramValue(value);
  }, []);

  // Load existing results when course changes
  useEffect(() => {
    if (selectedCourse) {
      const results: Record<string, Partial<StudentResult>> = {}
      existingResults.forEach((result) => {
        results[result.studentId] = {
          midterm: result.midterm,
          final: result.final,
          assignments: result.assignments,
          total: result.total,
          grade: result.grade,
          status: result.status,
        }
      })
      setCurrentResults(results)
    } else {
      setCurrentResults({})
    }
  }, [selectedCourse, existingResults])

  const updateStudentResult = useCallback((studentId: string, field: string, value: string) => {
    const numValue = value === "" ? null : Number.parseFloat(value)

    setCurrentResults((prev) => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: numValue,
        },
      }

      // Calculate total and grade
      const result = updated[studentId]
      if (result) {
        const midterm = result.midterm || 0
        const final = result.final || 0
        const assignments = result.assignments || 0
        const total = Math.round(midterm * 0.3 + final * 0.5 + assignments * 0.2)

        result.total = total
        result.grade = calculateGrade(total)
      }

      return updated
    })

    setIsDraftSaved(false)
  }, [calculateGrade])

  const getStudentResult = useCallback((studentId: string) => {
    return currentResults[studentId] || {}
  }, [currentResults])

  const saveDraft = () => {
    if (!selectedCourse) return

    enrolledStudents.forEach((student) => {
      const result = getStudentResult(student.studentId)
      if (result.midterm !== undefined || result.final !== undefined || result.assignments !== undefined) {
        const resultData: Omit<StudentResult, "id"> = {
          studentId: student.studentId,
          courseId: selectedCourseData?.id || "",
          courseCode: selectedCourse,
          courseName: selectedCourseData?.name || "",
          midterm: result.midterm || null,
          final: result.final || null,
          assignments: result.assignments || null,
          total: result.total || 0,
          grade: result.grade || "",
          status: "draft",
          submittedBy: "Prof. Michael Chen", // In real app, get from auth
        }
        saveResultDraft(resultData)
      }
    })

    setIsDraftSaved(true)
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved as a draft.",
    })
  }

  const submitForApproval = () => {
    if (!selectedCourse) return

    // Validate all students have complete results
    const incompleteStudents = enrolledStudents.filter((student) => {
      const result = getStudentResult(student.studentId)
      return !result.midterm || !result.final || !result.assignments
    })

    if (incompleteStudents.length > 0) {
      toast({
        title: "Incomplete Results",
        description: `Please complete results for all students before submitting.`,
        variant: "destructive",
      })
      return
    }

    // Save all results as submitted
    enrolledStudents.forEach((student) => {
      const result = getStudentResult(student.studentId)
      const resultData: Omit<StudentResult, "id"> = {
        studentId: student.studentId,
        courseId: selectedCourseData?.id || "",
        courseCode: selectedCourse,
        courseName: selectedCourseData?.name || "",
        midterm: result.midterm || 0,
        final: result.final || 0,
        assignments: result.assignments || 0,
        total: result.total || 0,
        grade: result.grade || "",
        status: "submitted",
        submittedBy: "Prof. Michael Chen", // In real app, get from auth
      }
      saveResultDraft(resultData)
    })

    submitResults(selectedCourse, "Prof. Michael Chen")

    toast({
      title: "Results Submitted",
      description: "Results have been submitted for director approval.",
    })
  }

  const calculateAllGrades = () => {
    const updated = { ...currentResults }
    enrolledStudents.forEach((student) => {
      const result = updated[student.studentId]
      if (result && (result.midterm || result.final || result.assignments)) {
        const midterm = result.midterm || 0
        const final = result.final || 0
        const assignments = result.assignments || 0
        const total = Math.round(midterm * 0.3 + final * 0.5 + assignments * 0.2)

        result.total = total
        result.grade = calculateGrade(total)
      }
    })
    setCurrentResults(updated)
  }

  const getSubmissionStatus = () => {
    if (existingResults.length === 0) return null
    const statuses = existingResults.map((r) => r.status)
    if (statuses.every((s) => s === "approved")) return "approved"
    if (statuses.some((s) => s === "submitted")) return "submitted"
    if (statuses.some((s) => s === "draft")) return "draft"
    return null
  }

  const submissionStatus = getSubmissionStatus()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Results Entry</h1>
        <p className="text-muted-foreground">Enter and submit student results for your assigned courses</p>
      </div>

      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Result Entry</TabsTrigger>
          <TabsTrigger value="status">Submission Status</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CourseSelector 
                  courses={assignedCourses} 
                  selectedCourse={selectedCourse} 
                  onCourseChange={handleCourseChange}
                />
                <SemesterSelector 
                  value={semesterValue} 
                  onChange={handleSemesterChange} 
                />
                <ProgramSelector 
                  value={programValue} 
                  onChange={handleProgramChange} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Info and Status */}
          {selectedCourse && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrolledStudents.length}</div>
                  <p className="text-xs text-muted-foreground">Students in {selectedCourse}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submission Status</CardTitle>
                  {submissionStatus === "approved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {submissionStatus === "submitted" && <Clock className="h-4 w-4 text-blue-500" />}
                  {submissionStatus === "draft" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {submissionStatus === "approved" && "Approved"}
                    {submissionStatus === "submitted" && "Pending"}
                    {submissionStatus === "draft" && "Draft"}
                    {!submissionStatus && "Not Started"}
                  </div>
                  <p className="text-xs text-muted-foreground">Current status</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course Credits</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedCourseData?.credits || 0}</div>
                  <p className="text-xs text-muted-foreground">Credit hours</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Entry Table */}
          {selectedCourse && enrolledStudents.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Results - {selectedCourse}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={calculateAllGrades}>
                      <Calculator className="h-4 w-4 mr-1" />
                      Calculate All
                    </Button>
                    <Button variant="outline" onClick={saveDraft} disabled={submissionStatus === "approved"}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Draft
                    </Button>
                    <Button onClick={submitForApproval} disabled={submissionStatus === "approved"}>
                      <Send className="h-4 w-4 mr-1" />
                      Submit for Approval
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {submissionStatus === "approved" && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Results for this course have been approved by the Director. No further changes can be made.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Grading Policy:</strong> Midterm (30%) + Final (50%) + Assignments (20%) = Total Score
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Grade Scale:</strong> A (90-100), A- (85-89), B+ (80-84), B (75-79), B- (70-74), C+ (65-69),
                    C (60-64), C- (55-59), D (50-54), F (0-49)
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Midterm (30%)</TableHead>
                      <TableHead>Final (50%)</TableHead>
                      <TableHead>Assignments (20%)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map((student) => {
                      const result = getStudentResult(student.studentId)
                      const isReadOnly = submissionStatus === "approved"
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.studentId}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.program}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Level {student.level}</Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={result.midterm || ""}
                              onChange={(e) => updateStudentResult(student.studentId, "midterm", e.target.value)}
                              className="w-20"
                              disabled={isReadOnly}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={result.final || ""}
                              onChange={(e) => updateStudentResult(student.studentId, "final", e.target.value)}
                              className="w-20"
                              disabled={isReadOnly}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={result.assignments || ""}
                              onChange={(e) => updateStudentResult(student.studentId, "assignments", e.target.value)}
                              className="w-20"
                              disabled={isReadOnly}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{result.total || 0}</TableCell>
                          <TableCell>
                            {result.grade && (
                              <Badge
                                variant={
                                  result.grade.startsWith("A")
                                    ? "default"
                                    : result.grade.startsWith("B")
                                      ? "secondary"
                                      : result.grade === "F"
                                        ? "destructive"
                                        : "outline"
                                }
                              >
                                {result.grade}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {isDraftSaved && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Draft saved successfully. You can continue editing or submit for approval.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {selectedCourse && enrolledStudents.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Students Enrolled</h3>
                <p className="text-muted-foreground">No students are currently enrolled in this course.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedCourses.map((course) => {
                    const courseResults = getResultsByCourse(course.code)
                    const courseStudents = getStudentsByCourse(course.code)
                    const status = courseResults.length > 0 ? courseResults[0].status : "not_started"

                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-muted-foreground">{course.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{courseStudents.length}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "approved"
                                ? "default"
                                : status === "submitted"
                                  ? "secondary"
                                  : status === "draft"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {status === "approved" && "Approved"}
                            {status === "submitted" && "Pending Approval"}
                            {status === "draft" && "Draft"}
                            {status === "not_started" && "Not Started"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {courseResults.length > 0 && courseResults[0].submittedAt
                            ? new Date(courseResults[0].submittedAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourse(course.code)}
                            disabled={status === "approved"}
                          >
                            {status === "not_started" ? "Start Entry" : "View/Edit"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
