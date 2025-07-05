"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"

interface ValidationResult {
  type: "success" | "warning" | "error" | "info"
  message: string
  details?: string[]
}

interface StudentValidationProps {
  validationResults: ValidationResult[]
  className?: string
}

export function StudentValidation({ validationResults, className }: StudentValidationProps) {
  if (validationResults.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {validationResults.map((result, index) => (
        <Alert key={index} variant={getVariant(result.type)}>
          {getIcon(result.type)}
          <AlertDescription>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{result.type.toUpperCase()}</Badge>
              <span>{result.message}</span>
            </div>
            {result.details && result.details.length > 0 && (
              <ul className="mt-2 ml-4 list-disc text-sm">
                {result.details.map((detail, detailIndex) => (
                  <li key={detailIndex}>{detail}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export function validateStudentCourseRegistration(
  student: any,
  courseCode: string,
  userRole: "staff" | "director",
  staffCourses?: string[],
): ValidationResult[] {
  const results: ValidationResult[] = []

  // Check if student exists
  if (!student) {
    results.push({
      type: "error",
      message: "Student not found",
      details: ["Please verify the student ID and try again"],
    })
    return results
  }

  // Check if already enrolled
  if (student.enrolledCourses.includes(courseCode)) {
    results.push({
      type: "warning",
      message: "Student is already enrolled in this course",
      details: [`${student.name} is currently registered for ${courseCode}`],
    })
    return results
  }

  // Check staff authorization
  if (userRole === "staff" && staffCourses && !staffCourses.includes(courseCode)) {
    results.push({
      type: "error",
      message: "Unauthorized course access",
      details: [
        "Staff members can only register students for courses they teach",
        "Contact the course instructor or director for assistance",
      ],
    })
    return results
  }

  // Check course prerequisites (mock validation)
  const missingPrereqs: string[] = []
  if (courseCode === "CS 301" && !student.enrolledCourses.includes("CS 201")) {
    missingPrereqs.push("CS 201")
  }
  if (courseCode === "CS 201" && !student.enrolledCourses.includes("CS 101")) {
    missingPrereqs.push("CS 101")
  }

  if (missingPrereqs.length > 0) {
    results.push({
      type: "error",
      message: "Prerequisites not met",
      details: [`Student must complete: ${missingPrereqs.join(", ")}`],
    })
    return results
  }

  // Check enrollment capacity (mock validation)
  const mockCapacity = 50
  const mockCurrentEnrollment = 45
  if (mockCurrentEnrollment >= mockCapacity) {
    results.push({
      type: "error",
      message: "Course at maximum capacity",
      details: [`Course ${courseCode} is full (${mockCurrentEnrollment}/${mockCapacity} students)`],
    })
    return results
  }

  // Check academic standing
  if (student.cgpa < 2.0) {
    results.push({
      type: "warning",
      message: "Student on academic probation",
      details: [
        `Current CGPA: ${student.cgpa.toFixed(2)}`,
        "Consider academic counseling before additional course registration",
      ],
    })
  }

  // Success validation
  results.push({
    type: "success",
    message: "Registration validation passed",
    details: ["All prerequisites met", "Course has available capacity", "User has appropriate permissions"],
  })

  return results
}
