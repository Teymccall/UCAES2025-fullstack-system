"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Users, CheckCircle, Clock, Download, FileText } from "lucide-react"
import { sampleStudents } from "@/lib/sample-data"
import type { Student } from "@/lib/types"

export default function GraduationManager() {
  const [students, setStudents] = useState<Student[]>([])
  const [eligibleStudents, setEligibleStudents] = useState<Student[]>([])

  useEffect(() => {
    // Simulate fetching from Firebase
    setStudents(sampleStudents)
    setEligibleStudents(sampleStudents.filter((s) => s.graduationEligible))
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Graduated":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Graduated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const graduatedStudents = students.filter((s) => s.status === "Graduated")
  const pendingGraduation = eligibleStudents.filter((s) => s.status === "Active")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Graduation Manager</h1>
          <p className="text-gray-600">Manage graduation eligibility and ceremonies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
          <Button className="bg-green-700 hover:bg-green-800">
            <Award className="mr-2 h-4 w-4" />
            Process Graduation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible for Graduation</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{pendingGraduation.length}</div>
            <p className="text-xs text-muted-foreground">Ready to graduate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Already Graduated</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{graduatedStudents.length}</div>
            <p className="text-xs text-muted-foreground">Completed studies</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-muted-foreground">Under evaluation</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{students.length}</div>
            <p className="text-xs text-muted-foreground">All students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="eligible" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eligible">Eligible Students</TabsTrigger>
          <TabsTrigger value="graduated">Graduated Students</TabsTrigger>
          <TabsTrigger value="ceremony">Ceremony Planning</TabsTrigger>
        </TabsList>

        {/* Eligible Students Tab */}
        <TabsContent value="eligible" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Students Eligible for Graduation</CardTitle>
              <CardDescription>Students who have met all graduation requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingGraduation.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.indexNumber}</TableCell>
                        <TableCell>{`${student.surname}, ${student.otherNames}`}</TableCell>
                        <TableCell>{student.programme}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-green-700 hover:bg-green-800">
                              <Award className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Graduated Students Tab */}
        <TabsContent value="graduated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Graduated Students</CardTitle>
              <CardDescription>Students who have completed their studies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Graduation Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {graduatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.indexNumber}</TableCell>
                        <TableCell>{`${student.surname}, ${student.otherNames}`}</TableCell>
                        <TableCell>{student.programme}</TableCell>
                        <TableCell>May 2024</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ceremony Planning Tab */}
        <TabsContent value="ceremony" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Ceremony</CardTitle>
                <CardDescription>Next graduation ceremony details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>June 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Venue:</span>
                    <span>University Auditorium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Expected Graduates:</span>
                    <span>{pendingGraduation.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Planning</Badge>
                  </div>
                </div>
                <Button className="w-full bg-green-700 hover:bg-green-800">Finalize Ceremony</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ceremony Checklist</CardTitle>
                <CardDescription>Tasks to complete before ceremony</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Verify graduation eligibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Prepare certificates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Send invitations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Arrange venue setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Coordinate with catering</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
