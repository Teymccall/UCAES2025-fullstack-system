"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Plus, Check, X, Clock, Filter, MoreHorizontal, UserCheck, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { sampleRegistrations, sampleStudents, sampleCourses } from "@/lib/sample-data"
import type { Registration } from "@/lib/types"

export default function CourseRegistration() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    // Simulate fetching from Firebase
    setRegistrations(sampleRegistrations)
    setFilteredRegistrations(sampleRegistrations)
  }, [])

  useEffect(() => {
    let filtered = registrations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((registration) => {
        const student = sampleStudents.find((s) => s.id === registration.studentId)
        const course = sampleCourses.find((c) => c.id === registration.courseId)
        return (
          student?.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${student?.surname} ${student?.otherNames}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course?.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((registration) => registration.status === filterStatus)
    }

    setFilteredRegistrations(filtered)
  }, [registrations, searchTerm, filterStatus])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "dropped":
        return <Badge variant="secondary">Dropped</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApproveRegistration = (registrationId: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? { ...r, status: "approved" as const, approvedBy: "Registrar", approvedAt: new Date().toISOString() }
          : r,
      ),
    )
  }

  const handleRejectRegistration = (registrationId: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? { ...r, status: "rejected" as const, approvedBy: "Registrar", approvedAt: new Date().toISOString() }
          : r,
      ),
    )
  }

  const pendingCount = registrations.filter((r) => r.status === "pending").length
  const approvedCount = registrations.filter((r) => r.status === "approved").length
  const totalCredits = registrations
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => {
      const course = sampleCourses.find((c) => c.id === r.courseId)
      return sum + (course?.creditHours || 0)
    }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Registration</h1>
          <p className="text-gray-600">Manage student course registrations and approvals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-700 hover:bg-green-800">
              <Plus className="mr-2 h-4 w-4" />
              Manual Registration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manual Course Registration</DialogTitle>
              <DialogDescription>Register a student for a course manually</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.indexNumber} - {student.surname}, {student.otherNames}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Academic Year/Semester</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023/2024-First">2023/2024 - First</SelectItem>
                    <SelectItem value="2023/2024-Second">2023/2024 - Second</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-green-700 hover:bg-green-800">Register Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Registrations</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Approved credits</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">Students over limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by student name, index number, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Registrations ({filteredRegistrations.length})</CardTitle>
          <CardDescription>Manage and approve student course registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => {
                  const student = sampleStudents.find((s) => s.id === registration.studentId)
                  const course = sampleCourses.find((c) => c.id === registration.courseId)
                  return (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student?.surname}, {student?.otherNames}
                          </p>
                          <p className="text-sm text-gray-500">{student?.indexNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course?.code}</p>
                          <p className="text-sm text-gray-500">{course?.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>{course?.creditHours}</TableCell>
                      <TableCell>
                        {registration.academicYear} - {registration.semester}
                      </TableCell>
                      <TableCell>{new Date(registration.registeredAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell className="text-right">
                        {registration.status === "pending" ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              className="bg-green-700 hover:bg-green-800"
                              onClick={() => handleApproveRegistration(registration.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRegistration(registration.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Drop Course</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
