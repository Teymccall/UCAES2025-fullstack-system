"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, GraduationCap, BookCopy, Calendar } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { student, loading, isAuthenticated, refreshUserData } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
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
  }, [mounted, isAuthenticated, refreshUserData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          <p className="text-gray-500">Loading...</p>
        </div>
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
              <span className="text-2xl font-bold">-</span>
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
              <span className="text-2xl font-bold">-</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">2nd</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <CardTitle>Academic Records</CardTitle>
            <CardDescription>Check your academic progress</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {/* Content here */}
          </CardContent>
          <div className="px-6 pb-4">
            <Link href="/academic-records">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View Records
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
      </div>

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
    </div>
  )
} 