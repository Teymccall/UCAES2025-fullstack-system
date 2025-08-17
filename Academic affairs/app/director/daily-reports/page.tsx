"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Search, Eye, FileText, CheckCircle, Clock, MessageSquare, Users, GraduationCap, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdmissionApplication {
  id: string
  applicationId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  level: string
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected'
  paymentStatus: 'pending' | 'paid' | 'failed'
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  feedback?: string
}

export default function AdmissionsDashboard() {
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null)
  const [feedback, setFeedback] = useState("")
  const [applications, setApplications] = useState<AdmissionApplication[]>([])

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockApplications: AdmissionApplication[] = [
      {
        id: "1",
        applicationId: "APP-2024-0001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+233 24 123 4567",
        program: "Bachelor of Agriculture",
        level: "Undergraduate",
        status: "submitted",
        paymentStatus: "paid",
        submittedAt: new Date().toISOString()
      },
      {
        id: "2",
        applicationId: "APP-2024-0002",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@email.com",
        phone: "+233 20 987 6543",
        program: "Diploma in Environmental Studies",
        level: "Diploma",
        status: "under_review",
        paymentStatus: "paid",
        submittedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        applicationId: "APP-2024-0003",
        firstName: "Kwame",
        lastName: "Mensah",
        email: "kwame.mensah@email.com",
        phone: "+233 26 555 1234",
        program: "Master of Agricultural Economics",
        level: "Postgraduate",
        status: "accepted",
        paymentStatus: "paid",
        submittedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: "4",
        applicationId: "APP-2024-0004",
        firstName: "Ama",
        lastName: "Osei",
        email: "ama.osei@email.com",
        phone: "+233 27 777 8888",
        program: "Certificate in Horticulture",
        level: "Certificate",
        status: "draft",
        paymentStatus: "pending",
        submittedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ]
    setApplications(mockApplications)
  }, [])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDate = selectedDate ? app.submittedAt.split("T")[0] === selectedDate : true

    return matchesSearch && matchesDate
  })

  const handleReviewApplication = (applicationId: string, status: "accepted" | "rejected") => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? {
            ...app,
            status,
            reviewedBy: "Dr. Sarah Johnson", // In real app, get from auth
            reviewedAt: new Date().toISOString(),
            feedback: feedback,
          }
        : app
    ))

    setFeedback("")
    setSelectedApplication(null)

    toast({
      title: "Application Reviewed",
      description: `Application has been ${status}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "default"
      case "under_review":
        return "secondary"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const todaysApplications = applications.filter(app => 
    app.submittedAt.split("T")[0] === new Date().toISOString().split("T")[0]
  )
  const pendingApplications = applications.filter(app => app.status === "submitted")
  const acceptedApplications = applications.filter(app => app.status === "accepted")
  const paidApplications = applications.filter(app => app.paymentStatus === "paid")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admissions Dashboard</h1>
        <p className="text-muted-foreground">Review and manage student applications</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysApplications.length}</div>
            <p className="text-xs text-muted-foreground">Applications submitted today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedApplications.length}</div>
            <p className="text-xs text-muted-foreground">Applications accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Applications</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidApplications.length}</div>
            <p className="text-xs text-muted-foreground">Payment completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="today">Today's Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full md:w-48"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Application Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.applicationId}</TableCell>
                      <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                      <TableCell>{app.program}</TableCell>
                      <TableCell>{app.level}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusColor(app.paymentStatus)}>{app.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details - {selectedApplication?.firstName} {selectedApplication?.lastName}</DialogTitle>
                              <DialogDescription>
                                Application ID: {selectedApplication?.applicationId}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Personal Information</Label>
                                  <div className="mt-1 space-y-2">
                                    <div className="text-sm">
                                      <span className="font-medium">Name:</span> {selectedApplication?.firstName} {selectedApplication?.lastName}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium">Email:</span> {selectedApplication?.email}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium">Phone:</span> {selectedApplication?.phone}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Academic Information</Label>
                                  <div className="mt-1 space-y-2">
                                    <div className="text-sm">
                                      <span className="font-medium">Program:</span> {selectedApplication?.program}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium">Level:</span> {selectedApplication?.level}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium">Submitted:</span> {selectedApplication?.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Application Status</Label>
                                  <div className="mt-1">
                                    <Badge variant={getStatusColor(selectedApplication?.status || '')}>
                                      {selectedApplication?.status}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Payment Status</Label>
                                  <div className="mt-1">
                                    <Badge variant={getPaymentStatusColor(selectedApplication?.paymentStatus || '')}>
                                      {selectedApplication?.paymentStatus}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {(selectedApplication?.status === "submitted" || selectedApplication?.status === "under_review") && (
                                <div>
                                  <Label htmlFor="feedback">Director Decision & Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide feedback and decision on this application..."
                                    className="mt-1"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button 
                                      onClick={() => handleReviewApplication(selectedApplication?.id || '', "accepted")} 
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept Application
                                    </Button>
                                    <Button 
                                      onClick={() => handleReviewApplication(selectedApplication?.id || '', "rejected")} 
                                      variant="destructive"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Reject Application
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {selectedApplication?.feedback && (
                                <div>
                                  <Label className="text-sm font-medium">Director Feedback</Label>
                                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm">{selectedApplication.feedback}</p>
                                                                          <p className="text-xs text-muted-foreground mt-2">
                                        Reviewed by {selectedApplication?.reviewedBy} on{" "}
                                                                              {selectedApplication?.reviewedAt && new Date(selectedApplication.reviewedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No applications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedDate
                      ? "Try adjusting your search criteria"
                      : "No applications have been submitted yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.applicationId}</TableCell>
                      <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                      <TableCell>{app.program}</TableCell>
                      <TableCell>{app.submittedAt && new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedApplication(app)}>
                              Review
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pendingApplications.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground">No applications are pending review at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.applicationId}</TableCell>
                      <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                      <TableCell>{app.program}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {todaysApplications.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No applications today</h3>
                  <p className="text-muted-foreground">No applications have been submitted today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
