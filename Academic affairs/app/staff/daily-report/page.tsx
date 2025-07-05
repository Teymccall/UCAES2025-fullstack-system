"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAcademic, type DailyReport } from "@/components/academic-context"
import { Plus, Save, Send, FileText, Clock, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DailyReportSubmission() {
  const { submitDailyReport, getReportsByStaff, isWithinOperationalHours } = useAcademic()
  const { toast } = useToast()

  const [reportForm, setReportForm] = useState({
    date: new Date().toISOString().split("T")[0],
    reportContent: "",
    activities: [""],
    issues: [""],
    achievements: [""],
  })

  // Mock staff ID - in real app, this would come from authentication
  const currentStaffId = "STAFF001"
  const currentStaffName = "Prof. Michael Chen"

  const myReports = getReportsByStaff(currentStaffId)
  const todayReport = myReports.find((report) => report.date === reportForm.date)
  const withinHours = isWithinOperationalHours()

  const addField = (field: "activities" | "issues" | "achievements") => {
    setReportForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const updateField = (field: "activities" | "issues" | "achievements", index: number, value: string) => {
    setReportForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const removeField = (field: "activities" | "issues" | "achievements", index: number) => {
    setReportForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmitReport = (status: "draft" | "submitted") => {
    if (!reportForm.reportContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a report summary",
        variant: "destructive",
      })
      return
    }

    const reportData: Omit<DailyReport, "id"> = {
      staffId: currentStaffId,
      staffName: currentStaffName,
      date: reportForm.date,
      reportContent: reportForm.reportContent,
      activities: reportForm.activities.filter((a) => a.trim() !== ""),
      issues: reportForm.issues.filter((i) => i.trim() !== ""),
      achievements: reportForm.achievements.filter((a) => a.trim() !== ""),
      status,
      submittedAt: status === "submitted" ? new Date().toISOString() : undefined,
    }

    submitDailyReport(reportData)

    // Reset form
    setReportForm({
      date: new Date().toISOString().split("T")[0],
      reportContent: "",
      activities: [""],
      issues: [""],
      achievements: [""],
    })

    toast({
      title: status === "submitted" ? "Report Submitted" : "Draft Saved",
      description:
        status === "submitted"
          ? "Your daily report has been submitted for review"
          : "Your report has been saved as a draft",
    })
  }

  if (!withinHours) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Report</h1>
          <p className="text-muted-foreground">Submit your daily activity report</p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Clock className="h-5 w-5" />
              System Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              The system is currently outside operational hours. Please return during working hours to submit your daily
              report.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Report</h1>
        <p className="text-muted-foreground">Submit your daily activity report</p>
      </div>

      {/* Today's Report Status */}
      {todayReport && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You have already submitted a report for today. Status: <Badge variant="outline">{todayReport.status}</Badge>
            {todayReport.status === "reviewed" && todayReport.feedback && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <strong>Director Feedback:</strong> {todayReport.feedback}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Report Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Daily Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="report-date">Report Date</Label>
            <Input
              id="report-date"
              type="date"
              value={reportForm.date}
              onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <Label htmlFor="report-content">Daily Summary *</Label>
            <Textarea
              id="report-content"
              value={reportForm.reportContent}
              onChange={(e) => setReportForm({ ...reportForm, reportContent: e.target.value })}
              placeholder="Provide a summary of your daily activities, accomplishments, and any notable events..."
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Activities Completed</Label>
              <Button variant="outline" size="sm" onClick={() => addField("activities")}>
                <Plus className="h-4 w-4 mr-1" />
                Add Activity
              </Button>
            </div>
            <div className="space-y-2">
              {reportForm.activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={activity}
                    onChange={(e) => updateField("activities", index, e.target.value)}
                    placeholder="Describe an activity you completed today..."
                  />
                  {reportForm.activities.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeField("activities", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Issues Encountered</Label>
              <Button variant="outline" size="sm" onClick={() => addField("issues")}>
                <Plus className="h-4 w-4 mr-1" />
                Add Issue
              </Button>
            </div>
            <div className="space-y-2">
              {reportForm.issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={issue}
                    onChange={(e) => updateField("issues", index, e.target.value)}
                    placeholder="Describe any issues or challenges faced..."
                  />
                  {reportForm.issues.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeField("issues", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Achievements</Label>
              <Button variant="outline" size="sm" onClick={() => addField("achievements")}>
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </Button>
            </div>
            <div className="space-y-2">
              {reportForm.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={achievement}
                    onChange={(e) => updateField("achievements", index, e.target.value)}
                    placeholder="Describe any notable achievements or milestones..."
                  />
                  {reportForm.achievements.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeField("achievements", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSubmitReport("draft")}>
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
            <Button onClick={() => handleSubmitReport("submitted")}>
              <Send className="h-4 w-4 mr-1" />
              Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Reports */}
      <Card>
        <CardHeader>
          <CardTitle>My Previous Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myReports.slice(0, 10).map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{report.reportContent}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "submitted"
                          ? "default"
                          : report.status === "reviewed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.submittedAt && new Date(report.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {report.feedback ? (
                      <div className="max-w-xs truncate text-sm">{report.feedback}</div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No feedback</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {myReports.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No reports yet</h3>
              <p className="text-muted-foreground">Submit your first daily report above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
