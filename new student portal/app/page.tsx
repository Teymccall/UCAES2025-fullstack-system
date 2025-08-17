"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, BookOpen, Bell, Calendar, Award, Clock, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import AuthGuard from "@/components/auth-guard"
import { useEffect, useState } from "react"
import { getStudentCourseRegistration } from "@/lib/academic-service"
import { useSystemConfig } from "@/components/system-config-provider"

export default function Dashboard() {
  const { student } = useAuth()
  const { currentAcademicYear, currentSemester, isLoading: configLoading } = useSystemConfig()
  const [registeredCourses, setRegisteredCourses] = useState(0)
  const [creditHours, setCreditHours] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Debug student data
  useEffect(() => {
    if (student) {
      console.log("Student data loaded:", student);
      console.log("Name:", student.surname, student.otherNames);
      console.log("Programme:", student.programme);
    }
  }, [student]);

  // Fetch course registration data
  useEffect(() => {
    async function fetchCourseRegistration() {
      if (!student?.id) return;
      
      try {
        const registration = await getStudentCourseRegistration(student.id);
        if (registration) {
          setRegisteredCourses(registration.courses?.length || 0);
          setCreditHours(registration.totalCredits || 0);
        }
      } catch (error) {
        console.error("Error fetching course registration:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourseRegistration();
  }, [student]);

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 md:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-[300px] w-[250px] bg-white/20 flex items-center justify-center overflow-hidden rounded-[25px] border-2 border-[#f9f9f9] p-[5px]">
              <Image
                src={student?.profilePictureUrl || "/placeholder-user.jpg"}
                alt="Profile"
                width={240}
                height={290}
                className="object-cover w-full h-full rounded-[20px]"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl md:text-2xl font-bold">Welcome back, {student && student.surname && student.otherNames ? 
                `${student.surname} ${student.otherNames}`.trim() : 'Student'}</h1>
              <p className="text-green-100">{student?.programme || 'Program'} • Level {student?.currentLevel || '100'}</p>
              <p className="text-green-100">
                {student?.studentIndexNumber ? 
                  `Index Number: ${student.studentIndexNumber}` : 
                  student?.registrationNumber ? `Index Number: ${student.registrationNumber}` : 
                  'Student ID: N/A'
                }
              </p>
              <div className="mt-3 bg-white/20 py-2 px-4 rounded-md flex justify-center sm:justify-start">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-green-100">Current Academic Year</p>
                  <p className="text-lg font-semibold">{currentAcademicYear || 'Loading...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Current Level</p>
                  <p className="text-lg md:text-xl font-semibold">{student?.currentLevel || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Registered Courses</p>
                  <p className="text-lg md:text-xl font-semibold">{loading ? "..." : registeredCourses || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Award className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Credit Hours</p>
                  <p className="text-lg md:text-xl font-semibold">{loading ? "..." : creditHours || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Current Semester</p>
                  <p className="text-lg md:text-xl font-semibold">{configLoading ? "..." : currentSemester || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Personal Information</CardTitle>
                  <CardDescription>View and manage your profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link href="/personal-info">
                <Button className="w-full bg-green-600 hover:bg-green-700">View Details</Button>
              </Link>
            </CardContent>
          </Card>



          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Award className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Grades & Results</CardTitle>
                  <CardDescription>View your semester grades</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link href="/grades">
                <Button className="w-full bg-green-600 hover:bg-green-700">Check Grades</Button>
              </Link>
            </CardContent>
          </Card>



          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Course Registration</CardTitle>
                  <CardDescription>Register for courses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link href="/course-registration">
                <Button className="w-full bg-green-600 hover:bg-green-700">Register Courses</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Defer Program</CardTitle>
                  <CardDescription>Request to defer your program</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link href="/defer-program">
                <Button className="w-full bg-green-600 hover:bg-green-700">Request Deferment</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
