"use client"

import * as React from "react"
import { Search, Filter, Users, BookOpen, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { sampleCourses, sampleRegistrations } from "@/lib/sample-data"

export default function CoursesPage() {
  const [courses] = React.useState(sampleCourses.filter((course) => course.lecturerId === "lecturer-001"))
  const [searchTerm, setSearchTerm] = React.useState("")
  const [semesterFilter, setSemesterFilter] = React.useState("all")
  const [levelFilter, setLevelFilter] = React.useState("all")

  const getStudentCount = (courseId: string) => {
    return sampleRegistrations.filter((reg) => reg.courseId === courseId && reg.status === "Active").length
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = semesterFilter === "all" || course.semester === semesterFilter
    const matchesLevel = levelFilter === "all" || course.level.toString() === levelFilter

    return matchesSearch && matchesSemester && matchesLevel
  })

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 100:
        return "bg-blue-100 text-blue-800"
      case 200:
        return "bg-green-100 text-green-800"
      case 300:
        return "bg-yellow-100 text-yellow-800"
      case 400:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Courses</h1>
          <p className="text-green-600">Manage your assigned courses and view student enrollment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-600 text-green-600">
            {filteredCourses.length} Course{filteredCourses.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="2024/2025 Semester 1">2024/2025 Semester 1</SelectItem>
                <SelectItem value="2024/2025 Semester 2">2024/2025 Semester 2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="100">Level 100</SelectItem>
                <SelectItem value="200">Level 200</SelectItem>
                <SelectItem value="300">Level 300</SelectItem>
                <SelectItem value="400">Level 400</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSemesterFilter("all")
                setLevelFilter("all")
              }}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <BookOpen className="h-5 w-5" />
            Course List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No courses found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-green-50">
                      <TableCell className="font-medium text-green-800">{course.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelBadgeColor(course.level)}>Level {course.level}</Badge>
                      </TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{getStudentCount(course.id)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{course.semester}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <Link href={`/lecturer/grade-submission?course=${course.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Students
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">{courses.length}</p>
                <p className="text-sm text-green-600">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">
                  {courses.reduce((total, course) => total + getStudentCount(course.id), 0)}
                </p>
                <p className="text-sm text-green-600">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">
                  {courses.reduce((total, course) => total + course.credits, 0)}
                </p>
                <p className="text-sm text-green-600">Total Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
