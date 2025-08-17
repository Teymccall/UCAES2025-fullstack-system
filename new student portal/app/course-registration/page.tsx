"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, User, CheckCircle, AlertCircle, Calendar, Printer, Loader2 } from "lucide-react"
import { getStudentCourseRegistration, getProgramName, getStudentRegistrationHistory } from "@/lib/academic-service"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import "@/styles/globals.css" // Import global styles for print
import { Loader } from "@/components/ui/loader"
import { useSystemConfig } from "@/components/system-config-provider"
import { getCurrentAcademicYear, getCurrentSemester } from "@/lib/academic-utils"
import { CourseRegistrationForm } from '@/components/course-registration-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// We're now using the system-wide config instead of a local provider

interface RegisteredCourse {
  courseId: string
  courseCode: string
  courseName: string
  credits: number
}

interface CourseRegistration {
  id: string
  studentId: string
  studentName: string
  registrationNumber?: string
  academicYear: string
  semester: string
  level: string
  program: string
  studyMode: string
  courses: RegisteredCourse[]
  totalCredits: number
  registrationDate: any
  status: "pending" | "approved" | "rejected"
  registeredBy: string
}

export default function CourseRegistration() {
  const [registration, setRegistration] = useState<CourseRegistration | null>(null)
  const [registrationHistory, setRegistrationHistory] = useState<CourseRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [programName, setProgramName] = useState<string>("") // New state for program name
  const { student } = useAuth()
  const { toast } = useToast()

  // Get active academic info from system config
  const systemConfig = useSystemConfig()

  // Get current academic period from system config
  const currentAcademicYear = systemConfig?.currentAcademicYear || "Academic Year"
  const currentSemester = systemConfig?.currentSemester || "Semester"
  
  // Convert semester to display format
  const getSemesterDisplay = (semester: string | number) => {
    if (semester === "1" || semester === 1) return "1"
    if (semester === "2" || semester === 2) return "2"
    if (semester === "First Semester" || semester === "First") return "1"
    if (semester === "Second Semester" || semester === "Second") return "2"
    return semester?.toString() || "Semester"
  }

  // Fetch registration data
  useEffect(() => {
    async function fetchRegistrationData() {
      if (!student?.id) {
        console.log("No student ID available, can't fetch registration");
        return;
      }
      
      console.log("Student object from auth context:", student);
      console.log("Attempting to fetch registration for student ID:", student.id);
      
      try {
        // Use system config values if available
        const academicYear = systemConfig?.currentAcademicYear;
        const semester = systemConfig?.currentSemester;
        
        console.log("Using system config - Year:", academicYear, "Semester:", semester);
        
        // Get the current registration for the student
        const [data, history] = await Promise.all([
          getStudentCourseRegistration(student.id, academicYear, semester),
          getStudentRegistrationHistory(student.id)
        ]);
        
        console.log("Registration data received:", data);
        console.log("Registration history received:", history);
        
        if (data) {
          setRegistration(data as CourseRegistration);
          console.log("Registration set successfully");
          
          // Get the program name if it's an ID
          if (data.program && !data.program.includes("BSc.") && !data.program.includes("B.Sc.")) {
            try {
              const name = await getProgramName(data.program);
              console.log(`Resolved program ID ${data.program} to name: ${name}`);
              setProgramName(name);
            } catch (err) {
              console.error("Error getting program name:", err);
              setProgramName(data.program);
            }
          } else {
            setProgramName(data.program);
          }
        } else {
          console.log("No registration found for student");
        }
        
        if (history) {
          setRegistrationHistory(history as CourseRegistration[]);
        }
      } catch (error) {
        console.error("Error fetching registration data:", error);
        toast({
          title: "Failed to load registration data",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchRegistrationData();
  }, [student, toast]);

  const handleRegistrationComplete = (registrationId: string) => {
    // Refresh both current registration and history
    fetchRegistrationData();
  };

  const fetchRegistrationData = async () => {
    if (!student?.id) {
      console.log("No student ID available, can't fetch registration");
      return;
    }
    
    console.log("Student object from auth context:", student);
    console.log("Attempting to fetch registration for student ID:", student.id);
    
    try {
      // Use system config values if available
      const academicYear = systemConfig?.currentAcademicYear;
      const semester = systemConfig?.currentSemester;
      
      console.log("Using system config - Year:", academicYear, "Semester:", semester);
      
      // Get the current registration for the student
      const [data, history] = await Promise.all([
        getStudentCourseRegistration(student.id, academicYear, semester),
        getStudentRegistrationHistory(student.id)
      ]);
      
      console.log("Registration data received:", data);
      console.log("Registration history received:", history);
      
      if (data) {
        setRegistration(data as CourseRegistration);
        console.log("Registration set successfully");
        
        // Get the program name if it's an ID
        if (data.program && !data.program.includes("BSc.") && !data.program.includes("B.Sc.")) {
          try {
            const name = await getProgramName(data.program);
            console.log(`Resolved program ID ${data.program} to name: ${name}`);
            setProgramName(name);
          } catch (err) {
            console.error("Error getting program name:", err);
            setProgramName(data.program);
          }
        } else {
          setProgramName(data.program);
        }
      } else {
        console.log("No registration found for student");
      }
      
      if (history) {
        setRegistrationHistory(history as CourseRegistration[]);
      }
    } catch (error) {
      console.error("Error fetching registration data:", error);
      toast({
        title: "Failed to load registration data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Calculate credits
  const totalCredits = registration?.totalCredits || 0
  const coreCredits = registration?.courses?.filter(course => course.courseCode?.startsWith('CORE'))?.reduce((sum, course) => sum + (course.credits || 0), 0) || 0
  const electiveCredits = totalCredits - coreCredits

  // Print registration
  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 300)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    )
  }



  return (
    <div className="p-6 space-y-6 print:p-2 print:space-y-4">
      {/* Print button - hide when printing */}
      <div className="print:hidden flex justify-end">
        <Button onClick={handlePrint} disabled={isPrinting}>
          {isPrinting ? (
            <div className="flex items-center gap-2">
              <div className="relative h-4 w-4">
                <Loader className="h-4 w-4" />
              </div>
              <span>Printing...</span>
            </div>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Print Registration
            </>
          )}
        </Button>
      </div>

      {/* Passport Photo for Print Only */}
      <div className="hidden print:flex print:justify-center print:mb-4">
        <img
          src={student?.profilePictureUrl || "/placeholder-user.jpg"}
          alt="Passport Photograph"
          className="h-40 w-32 object-cover rounded-xl border-2 border-gray-400 print:h-40 print:w-32 print:rounded-xl print:border print:border-gray-400"
          style={{ background: '#fff' }}
        />
      </div>

      {/* Student Info with Passport Picture (screen only) */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6 print:hidden">
        <div className="flex-shrink-0">
          <img
            src={student?.profilePictureUrl || "/placeholder-user.jpg"}
            alt="Passport Photograph"
            className="h-40 w-32 object-cover rounded-xl border-2 border-gray-200 shadow-md"
            style={{ background: '#fff' }}
          />
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{student?.name || "Student"}</h1>
          {student?.registrationNumber && <p className="text-gray-700 font-medium">Registration Number: {student.registrationNumber}</p>}
          <p className="text-gray-700">Program: {programName || registration?.program || student?.programme || "Program"}</p>
          <p className="text-gray-700">Level: {registration?.level || student?.currentLevel || "Level"}</p>
          <p className="text-gray-700">Academic Year: {registration?.academicYear || currentAcademicYear}</p>
          <p className="text-gray-700">Semester: {registration?.semester || getSemesterDisplay(currentSemester)}</p>
        </div>
      </div>

      {/* Page header (screen only) */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Registration</h1>
          <p className="text-gray-600">
            {programName || registration?.program || student?.programme || "Program"} - Level {registration?.level || student?.currentLevel || "Level"}, {registration?.semester || getSemesterDisplay(currentSemester)} {registration?.academicYear || currentAcademicYear}
          </p>
        </div>
      </div>

      {/* Institution header - only visible when printing */}
      <div className="hidden print:block registration-print-header">
        <div className="flex items-start justify-between mb-4">
          <img 
            src="/logo.png" 
            alt="UCAES Logo" 
            className="h-16 w-16 object-contain"
            style={{ display: 'block' }}
          />
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES</h1>
            <h2 className="text-base font-medium">COURSE REGISTRATION FORM</h2>
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
      </div>
      
      {/* Student information - only visible when printing */}
      {registration && (
        <div className="hidden print:block border-b pb-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold">Student Information</h2>
              <p>Name: {registration.studentName}</p>
              {registration.registrationNumber && <p>Registration Number: {registration.registrationNumber}</p>}
              <p>Program: {programName || registration.program}</p>
              <p>Level: {registration.level}</p>
            </div>
            <div>
              <h2 className="font-semibold">Registration Details</h2>
              <p>Academic Year: {registration.academicYear}</p>
              <p>Semester: {registration.semester}</p>
              <p>Study Mode: {registration.studyMode}</p>
              <p>Status: {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}</p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="current" className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Registration</TabsTrigger>
          <TabsTrigger value="register">Register Courses</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          {registration ? (
            <>
              {/* Registration Summary - Only visible on screen, hidden when printing */}
              <Card className="print:hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Registration Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{totalCredits}</p>
                      <p className="text-sm text-gray-600">Total Credits</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{coreCredits}</p>
                      <p className="text-sm text-gray-600">Core Credits</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{electiveCredits}</p>
                      <p className="text-sm text-gray-600">Elective Credits</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{registration?.courses?.length || 0}</p>
                      <p className="text-sm text-gray-600">Courses</p>
                    </div>
                  </div>

                  {totalCredits < 18 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          <strong>Notice:</strong> You have registered for {totalCredits} credits. Minimum requirement is 18
                          credits per semester.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registered Courses */}
              <Card className="print:shadow-none print:border mt-6">
                <CardHeader className="print:py-2">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600 print:hidden" />
                    Registered Courses
                  </CardTitle>
                  <CardDescription className="print:hidden">
                    Courses registered for you by the academic affairs office
                  </CardDescription>
                </CardHeader>
                <CardContent className="print:p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Course Code</th>
                          <th className="text-left py-2 px-4">Course Name</th>
                          <th className="text-right py-2 px-4">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registration?.courses?.map((course, index) => (
                          <tr key={course.courseId || index} className="border-b">
                            <td className="py-2 px-4">{course.courseCode}</td>
                            <td className="py-2 px-4">{course.courseName}</td>
                            <td className="py-2 px-4 text-right">{course.credits}</td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td className="py-2 px-4" colSpan={2}>Total Credits</td>
                          <td className="py-2 px-4 text-right">{totalCredits}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                
                {/* Total Credits for Print */}
                <div className="hidden print:block mt-4 p-4 border-t">
                  <div className="text-right">
                    <strong>Total Credits: {totalCredits}</strong>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>No Registration Found</CardTitle>
                  <CardDescription>
                    You don't have any course registration for {systemConfig?.currentAcademicYear} - Semester {systemConfig?.currentSemester}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    You can register for courses using the "Register Courses" tab.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="register">
          <CourseRegistrationForm 
            onRegistrationComplete={handleRegistrationComplete}
            currentAcademicYear={currentAcademicYear}
            currentSemester={currentSemester}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Registration History</CardTitle>
              <CardDescription>
                Your previous course registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationHistory.length > 0 ? (
                <div className="space-y-4">
                  {registrationHistory.map((reg) => (
                    <div key={reg.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {reg.academicYear} - Semester {reg.semester}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {reg.courses?.length || 0} courses • {reg.totalCredits || 0} credits
                          </p>
                        </div>
                        <Badge 
                          variant={reg.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {reg.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {reg.courses?.map((course: any) => (
                          <span key={course.id} className="inline-block mr-2">
                            {course.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No registration history found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      {/* Important Notes - Only visible on screen, hidden when printing */}
      {registration && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Registration is only complete when approved by the Academic Affairs Office</p>
              <p>• Minimum credit requirement: <strong>18 credits per semester</strong></p>
              <p>• For any questions regarding your registration, contact the Academic Affairs Office</p>
              <p>• This printout serves as proof of your course registration</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature section - only visible when printing */}
      <div className="hidden print:block mt-12 mb-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-t border-black pt-2 mt-16 w-48">
              <p className="font-medium">Student's Signature</p>
              <p className="text-xs">Date: _________________</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-2 mt-16 w-48 ml-auto">
              <p className="font-medium">Academic Affairs Officer</p>
              <p className="text-xs">Date: _________________</p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Print footer - only visible when printing */}
      <div className="hidden print:block mt-8 text-sm text-gray-600 text-center">
        <p>Printed on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
        <p>This is an official registration record from the UCAES Student Portal</p>
      </div>
    </div>
  )
}
