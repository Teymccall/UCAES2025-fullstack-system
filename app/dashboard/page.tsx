"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, GraduationCap, BookCopy, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { Loader } from "@/components/ui/loader"
import { getStudentCourseRegistration, getAcademicRecord } from "@/lib/academic-service"
import { getStudentGrades } from "@/lib/firebase-utils"

interface DashboardData {
  registeredCourses: number
  creditHours: number
  totalGrades: number
  currentSemester: string
  academicRecord: any
  loading: boolean
  error: string | null
}

export default function DashboardPage() {
  const { student, loading: authLoading, isAuthenticated, refreshUserData } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    registeredCourses: 0,
    creditHours: 0,
    totalGrades: 0,
    currentSemester: "2nd",
    academicRecord: null,
    loading: true,
    error: null
  })
  
  // Use mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Always refresh user data when the dashboard loads
  useEffect(() => {
    if (mounted && isAuthenticated) {
      console.log("Dashboard loaded - refreshing user data");
      refreshUserData().catch(console.error);
    }
  }, [mounted, isAuthenticated, refreshUserData])

  // Fetch dashboard data when student is available
  useEffect(() => {
    async function fetchDashboardData() {
      if (!student?.id) return;
      
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        console.log("Fetching dashboard data for student:", student.id);
        
        // Fetch course registration data
        const registration = await getStudentCourseRegistration(student.id);
        console.log("Course registration data:", registration);
        
        // Fetch grades data
        const grades = await getStudentGrades(student.id);
        console.log("Grades data:", grades);
        
        // Fetch academic record
        const academicRecord = await getAcademicRecord(student);
        console.log("Academic record:", academicRecord);
        
        setDashboardData({
          registeredCourses: registration?.courses?.length || 0,
          creditHours: registration?.totalCredits || 0,
          totalGrades: grades.length,
          currentSemester: "2nd", // This could be dynamic based on current date
          academicRecord,
          loading: false,
          error: null
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch dashboard data"
        }));
      }
    }
    
    if (student?.id && mounted) {
      fetchDashboardData();
    }
  }, [student?.id, mounted]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!student) return null

  // Helper function to format name properly
  const formatName = (surname = "", otherNames = "") => {
    const formattedSurname = surname?.toUpperCase() || "";
    const formattedOtherNames = otherNames?.toUpperCase() || "";
    return `${formattedSurname} ${formattedOtherNames}`.trim();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-green-600 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {formatName(student.surname, student.otherNames)}</h1>
        <p className="text-lg">{student.programme} • Level {student.currentLevel}</p>
        <p className="text-sm mt-1">Index Number: {student.studentIndexNumber || student.registrationNumber}</p>
      </div>

      {/* Error message */}
      {dashboardData.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error loading dashboard data: {dashboardData.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{student.currentLevel || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Registered Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-green-500 mr-2" />
              {dashboardData.loading ? (
                <Loader className="h-5 w-5" />
              ) : (
                <span className="text-2xl font-bold">{dashboardData.registeredCourses}</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Credit Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookCopy className="h-5 w-5 text-purple-500 mr-2" />
              {dashboardData.loading ? (
                <Loader className="h-5 w-5" />
              ) : (
                <span className="text-2xl font-bold">{dashboardData.creditHours}</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Published Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-amber-500 mr-2" />
              {dashboardData.loading ? (
                <Loader className="h-5 w-5" />
              ) : (
                <span className="text-2xl font-bold">{dashboardData.totalGrades}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Progress Section */}
      {dashboardData.academicRecord && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 text-blue-500 mr-2" />
                Academic Progress
              </CardTitle>
              <CardDescription>Your current academic standing and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Current CGPA</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData.academicRecord.currentCGPA?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Credits Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.academicRecord.totalCreditsEarned || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Academic Standing</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {dashboardData.academicRecord.academicStanding || "Good Standing"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>View and manage your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {/* Content here */}
          </CardContent>
          <div className="px-6 pb-4">
            <Link href="/personal-info">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle>Grades & Results</CardTitle>
            <CardDescription>View your semester grades</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {/* Content here */}
          </CardContent>
          <div className="px-6 pb-4">
            <Link href="/grades">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Check Grades
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Update your contact information</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {/* Content here */}
          </CardContent>
          <div className="px-6 pb-4">
            <Link href="/contact-details">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Update Contact
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-purple-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle>Course Registration</CardTitle>
            <CardDescription>Register for courses this semester</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-600">Register for your courses for the current semester. Make sure to check your academic advisor's recommendations before registering.</p>
          </CardContent>
          <div className="px-6 pb-4">
            <Link href="/course-registration">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Register Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-red-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle>Defer Program</CardTitle>
            <CardDescription>Request to defer your academic program</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-600">Submit a formal request to defer your academic program for the current semester. Please provide valid reasons for your deferment request.</p>
          </CardContent>
          <div className="px-6 pb-4">
            <Link href="/defer-program">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Request Deferment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
} 