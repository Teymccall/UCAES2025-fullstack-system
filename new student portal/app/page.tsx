"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, BookOpen, Bell, Calendar, Award, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { AuthGuard } from "@/components/auth-guard"
import { useEffect } from "react"

export default function Dashboard() {
  const { student } = useAuth()
  
  // Debug student data
  useEffect(() => {
    if (student) {
      console.log("Student data loaded:", student);
      console.log("Name:", student.surname, student.otherNames);
      console.log("Programme:", student.programme);
    }
  }, [student]);

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Image
                src={student?.profilePictureUrl || "/placeholder-user.jpg"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {student && student.surname && student.otherNames ? 
                `${student.surname} ${student.otherNames}`.trim() : 'Student'}</h1>
              <p className="text-green-100">{student?.programme || 'Program'} • Level {student?.currentLevel || '100'}</p>
              <p className="text-green-100">
                {student?.studentIndexNumber ? 
                  `Index Number: ${student.studentIndexNumber}` : 
                  student?.registrationNumber ? `Index Number: ${student.registrationNumber}` : 
                  'Student ID: N/A'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="text-xl font-semibold">{student?.currentLevel || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registered Courses</p>
                  <p className="text-xl font-semibold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credit Hours</p>
                  <p className="text-xl font-semibold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Semester</p>
                  <p className="text-xl font-semibold">2nd</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>View and manage your profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/personal-info">
                <Button className="w-full bg-green-600 hover:bg-green-700">View Details</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Academic Records</CardTitle>
                  <CardDescription>Check your academic progress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/academic-records">
                <Button className="w-full bg-green-600 hover:bg-green-700">View Records</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Grades & Results</CardTitle>
                  <CardDescription>View your semester grades</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/grades">
                <Button className="w-full bg-green-600 hover:bg-green-700">Check Grades</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Course Registration</CardTitle>
                  <CardDescription>Register for courses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/course-registration">
                <Button className="w-full bg-green-600 hover:bg-green-700">Register Courses</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Current Semester & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Current Semester Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Academic Year</span>
                <Badge variant="secondary">2023/2024</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Semester</span>
                <Badge variant="secondary">Second Semester</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Registration Status</span>
                <Badge className="bg-green-100 text-green-800">Pending</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Courses Registered</span>
                <span className="font-semibold">0 courses (0 credits)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-sm">Course Registration Deadline</h4>
                <p className="text-sm text-gray-600">Registration closes on March 15, 2024</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-sm">Mid-Semester Exams</h4>
                <p className="text-sm text-gray-600">Exams scheduled for April 1-5, 2024</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-sm">Library Hours Extended</h4>
                <p className="text-sm text-gray-600">Open until 10 PM during exam period</p>
                <p className="text-xs text-gray-500">2 weeks ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
