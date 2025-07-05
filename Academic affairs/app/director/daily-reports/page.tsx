"use client"

import { useState } from "react"
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
import { useAcademic, type DailyReport } from "@/components/academic-context"
import { Calendar, Search, Eye, FileText, CheckCircle, Clock, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DailyReports() {
  const { dailyReports, staffMembers, updateDailyReport, getReportsByDate } = useAcademic()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
  const [feedback, setFeedback] = useState("")

  const filteredReports = dailyReports.filter((report) => {
    const matchesSearch =
      report.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportContent.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDate = selectedDate ? report.date === selectedDate : true

    return matchesSearch && matchesDate
  })

  const handleReviewReport = (reportId: string, status: "reviewed") => {
    updateDailyReport(reportId, {
      status,
      reviewedBy: "Dr. Sarah Johnson", // In real app, get from auth
      reviewedAt: new Date().toISOString(),
      feedback: feedback,
    })

    setFeedback("")
    setSelectedReport(null)

    toast({
      title: "Report Reviewed",
      description: "Daily report has been reviewed and feedback provided",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "default"
      case "reviewed":
        return "secondary"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const todaysReports = getReportsByDate(new Date().toISOString().split("T")[0])
  const pendingReports = dailyReports.filter((report) => report.status === "submitted")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Reports</h1>
        <p className="text-muted-foreground">Review and manage staff daily reports</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysReports.length}</div>
            <p className="text-xs text-muted-foreground">Reports submitted today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyReports.length}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyReports.filter((report) => report.status === "reviewed").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="today">Today's Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Daily Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
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
                    <TableHead>Date</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{report.staffName}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {report.activities.length > 0 ? report.activities.join(", ") : "No activities"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {report.issues.length > 0 ? report.issues.join(", ") : "No issues"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Daily Report - {report.staffName}</DialogTitle>
                              <DialogDescription>
                                Report for {new Date(report.date).toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Report Content</Label>
                                <div className="mt-1 p-3 bg-muted rounded-lg">
                                  <p className="text-sm">{report.reportContent}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Activities</Label>
                                  <div className="mt-1 space-y-1">
                                    {report.activities.length > 0 ? (
                                      report.activities.map((activity, index) => (
                                        <div key={index} className="text-sm p-2 bg-green-50 rounded">
                                          • {activity}
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No activities reported</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Issues</Label>
                                  <div className="mt-1 space-y-1">
                                    {report.issues.length > 0 ? (
                                      report.issues.map((issue, index) => (
                                        <div key={index} className="text-sm p-2 bg-red-50 rounded">
                                          • {issue}
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No issues reported</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Achievements</Label>
                                <div className="mt-1 space-y-1">
                                  {report.achievements.length > 0 ? (
                                    report.achievements.map((achievement, index) => (
                                      <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                                        • {achievement}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No achievements reported</p>
                                  )}
                                </div>
                              </div>

                              {report.status === "submitted" && (
                                <div>
                                  <Label htmlFor="feedback">Director Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide feedback on this report..."
                                    className="mt-1"
                                  />
                                  <Button onClick={() => handleReviewReport(report.id, "reviewed")} className="mt-2">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Submit Review
                                  </Button>
                                </div>
                              )}

                              {report.status === "reviewed" && report.feedback && (
                                <div>
                                  <Label className="text-sm font-medium">Director Feedback</Label>
                                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm">{report.feedback}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Reviewed by {report.reviewedBy} on{" "}
                                      {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString()}
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

              {filteredReports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No reports found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedDate
                      ? "Try adjusting your search criteria"
                      : "No reports have been submitted yet"}
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
                    <TableHead>Date</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{report.staffName}</TableCell>
                      <TableCell>{report.submittedAt && new Date(report.submittedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">{report.reportContent}</div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedReport(report)}>
                              Review
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pendingReports.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground">No reports are pending review at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Submitted Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.staffName}</TableCell>
                      <TableCell>{report.submittedAt && new Date(report.submittedAt).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
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

              {todaysReports.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No reports today</h3>
                  <p className="text-muted-foreground">No staff reports have been submitted today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
