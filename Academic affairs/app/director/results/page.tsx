"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Check, X } from "lucide-react"

export default function ResultApprovals() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResult, setSelectedResult] = useState<any>(null)

  const pendingResults = [
    {
      id: 1,
      course: "Computer Science 301",
      courseCode: "CS 301",
      staff: "Prof. Michael Chen",
      submittedDate: "2024-01-15",
      studentsCount: 45,
      status: "pending",
      semester: "Fall 2024",
    },
    {
      id: 2,
      course: "Mathematics 201",
      courseCode: "MATH 201",
      staff: "Dr. Sarah Wilson",
      submittedDate: "2024-01-14",
      studentsCount: 38,
      status: "pending",
      semester: "Fall 2024",
    },
    {
      id: 3,
      course: "English Literature 101",
      courseCode: "ENG 101",
      staff: "Prof. James Rodriguez",
      submittedDate: "2024-01-13",
      studentsCount: 52,
      status: "pending",
      semester: "Fall 2024",
    },
  ]

  const studentResults = [
    { studentId: "ST001", name: "John Doe", midterm: 85, final: 78, assignments: 92, total: 85, grade: "B+" },
    { studentId: "ST002", name: "Jane Smith", midterm: 92, final: 88, assignments: 95, total: 91, grade: "A-" },
    { studentId: "ST003", name: "Mike Johnson", midterm: 76, final: 82, assignments: 88, total: 82, grade: "B" },
  ]

  const filteredResults = pendingResults.filter(
    (result) =>
      result.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.staff.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Result Approvals</h1>
        <p className="text-muted-foreground">Review and approve results submitted by staff</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Result Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course, code, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.course}</div>
                      <div className="text-sm text-muted-foreground">{result.courseCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>{result.staff}</TableCell>
                  <TableCell>{result.submittedDate}</TableCell>
                  <TableCell>{result.studentsCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Review Results - {result?.course}</DialogTitle>
                            <DialogDescription>
                              Review and approve/reject the submitted results for {result?.courseCode}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Course</label>
                                <p>
                                  {result?.course} ({result?.courseCode})
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Staff</label>
                                <p>{result?.staff}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Semester</label>
                                <p>{result?.semester}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Students</label>
                                <p>{result?.studentsCount} students</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Student Results</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Midterm</TableHead>
                                    <TableHead>Final</TableHead>
                                    <TableHead>Assignments</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Grade</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {studentResults.map((student) => (
                                    <TableRow key={student.studentId}>
                                      <TableCell>{student.studentId}</TableCell>
                                      <TableCell>{student.name}</TableCell>
                                      <TableCell>{student.midterm}</TableCell>
                                      <TableCell>{student.final}</TableCell>
                                      <TableCell>{student.assignments}</TableCell>
                                      <TableCell className="font-medium">{student.total}</TableCell>
                                      <TableCell>
                                        <Badge variant="secondary">{student.grade}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Comments (Optional)</label>
                              <Textarea placeholder="Add any comments or feedback..." className="mt-1" />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline">
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
