"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Clock, User, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  lecturer: string
  schedule: string
  type: "Core" | "Elective"
  prerequisite?: string
  registered: boolean
}

const availableCourses: Course[] = [
  {
    id: "1",
    code: "AGRI 301",
    title: "Crop Production Systems",
    credits: 3,
    lecturer: "Dr. Emmanuel Asante",
    schedule: "Mon, Wed, Fri 8:00-9:00 AM",
    type: "Core",
    registered: true,
  },
  {
    id: "2",
    code: "AGRI 302",
    title: "Soil Science and Fertility",
    credits: 3,
    lecturer: "Prof. Mary Osei",
    schedule: "Tue, Thu 10:00-11:30 AM",
    type: "Core",
    registered: true,
  },
  {
    id: "3",
    code: "AGRI 303",
    title: "Plant Pathology",
    credits: 3,
    lecturer: "Dr. Kwame Boateng",
    schedule: "Mon, Wed 2:00-3:30 PM",
    type: "Core",
    registered: false,
  },
  {
    id: "4",
    code: "AGRI 304",
    title: "Agricultural Economics",
    credits: 3,
    lecturer: "Dr. Grace Mensah",
    schedule: "Tue, Thu 8:00-9:30 AM",
    type: "Core",
    registered: true,
  },
  {
    id: "5",
    code: "AGRI 305",
    title: "Farm Management",
    credits: 3,
    lecturer: "Mr. Joseph Amoah",
    schedule: "Fri 10:00 AM-1:00 PM",
    type: "Core",
    registered: false,
  },
  {
    id: "6",
    code: "AGRI 306",
    title: "Organic Agriculture",
    credits: 2,
    lecturer: "Dr. Sarah Adjei",
    schedule: "Wed 3:00-5:00 PM",
    type: "Elective",
    registered: false,
  },
  {
    id: "7",
    code: "AGRI 307",
    title: "Greenhouse Technology",
    credits: 2,
    lecturer: "Eng. Michael Owusu",
    schedule: "Thu 2:00-4:00 PM",
    type: "Elective",
    registered: false,
  },
  {
    id: "8",
    code: "AGRI 308",
    title: "Agricultural Biotechnology",
    credits: 3,
    lecturer: "Dr. Rebecca Nkrumah",
    schedule: "Mon, Wed 11:00 AM-12:30 PM",
    type: "Elective",
    registered: true,
  },
]

export default function CourseRegistration() {
  const [courses, setCourses] = useState<Course[]>(availableCourses)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleCourseToggle = (courseId: string) => {
    setCourses(
      courses.map((course) => (course.id === courseId ? { ...course, registered: !course.registered } : course)),
    )
  }

  const registeredCourses = courses.filter((course) => course.registered)
  const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0)
  const coreCredits = registeredCourses
    .filter((course) => course.type === "Core")
    .reduce((sum, course) => sum + course.credits, 0)
  const electiveCredits = registeredCourses
    .filter((course) => course.type === "Elective")
    .reduce((sum, course) => sum + course.credits, 0)

  const handleSubmitRegistration = () => {
    setShowConfirmDialog(false)
    // Here you would typically submit to an API
    alert("Course registration submitted successfully!")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Registration</h1>
          <p className="text-gray-600">Register for courses - Level 300, Second Semester 2023/2024</p>
        </div>
      </div>

      {/* Registration Summary */}
      <Card>
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
              <p className="text-2xl font-bold text-orange-600">{registeredCourses.length}</p>
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

      {/* Available Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Available Courses
          </CardTitle>
          <CardDescription>Select courses for registration. Core courses are mandatory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`border rounded-lg p-4 transition-colors ${
                  course.registered ? "border-green-200 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={course.registered}
                    onCheckedChange={() => handleCourseToggle(course.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {course.code} - {course.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge
                            variant={course.type === "Core" ? "default" : "secondary"}
                            className={course.type === "Core" ? "bg-red-100 text-red-800" : ""}
                          >
                            {course.type}
                          </Badge>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.credits} Credits
                          </span>
                        </div>
                      </div>

                      {course.registered && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{course.lecturer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{course.schedule}</span>
                      </div>
                    </div>

                    {course.prerequisite && (
                      <p className="text-xs text-gray-500">
                        <strong>Prerequisite:</strong> {course.prerequisite}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ready to submit your course registration?</p>
              <p className="text-sm text-gray-600">
                You have selected {registeredCourses.length} courses totaling {totalCredits} credits.
              </p>
            </div>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" disabled={registeredCourses.length === 0}>
                  Submit Registration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Course Registration</DialogTitle>
                  <DialogDescription>Please review your course selection before submitting.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Registration Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Total Courses: {registeredCourses.length}</div>
                      <div>Total Credits: {totalCredits}</div>
                      <div>Core Credits: {coreCredits}</div>
                      <div>Elective Credits: {electiveCredits}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Selected Courses:</h4>
                    {registeredCourses.map((course) => (
                      <div key={course.id} className="text-sm flex justify-between">
                        <span>
                          {course.code} - {course.title}
                        </span>
                        <span>{course.credits} credits</span>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmitRegistration}>
                    Confirm Registration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Registration deadline: <strong>March 15, 2024</strong>
            </p>
            <p>
              • Minimum credit requirement: <strong>18 credits per semester</strong>
            </p>
            <p>
              • Maximum credit limit: <strong>24 credits per semester</strong>
            </p>
            <p>• Core courses are mandatory and must be completed</p>
            <p>• Changes to registration can be made within the first two weeks of the semester</p>
            <p>• Contact the Academic Office for assistance with course conflicts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
