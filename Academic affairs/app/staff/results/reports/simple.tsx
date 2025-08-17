"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RouteGuard } from "@/components/route-guard"
import { BarChart3 } from "lucide-react"

function SimpleCourseReportsPage() {
  const [academicYear, setAcademicYear] = useState("2024/2025")
  const [semester, setSemester] = useState("First")
  const [courseCode, setCourseCode] = useState("")

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Course Results Report
          </h1>
          <p className="text-muted-foreground">Generate comprehensive course performance reports</p>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Course Results Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Academic Year</label>
                <Input 
                  placeholder="e.g., 2024/2025" 
                  value={academicYear} 
                  onChange={e => setAcademicYear(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Semester</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md"
                  value={semester} 
                  onChange={e => setSemester(e.target.value)}
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Course Code</label>
                <Input 
                  placeholder="e.g., CSC101" 
                  value={courseCode} 
                  onChange={e => setCourseCode(e.target.value.toUpperCase())} 
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-2">
              <Button onClick={() => alert(`Loading results for ${courseCode} - ${academicYear} - ${semester}`)}>
                Load Results
              </Button>
            </div>

            {/* Placeholder Content */}
            <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Course Results Will Appear Here</h3>
              <p className="text-gray-500 mt-2">Enter course details above and click "Load Results" to view the report</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SimplePage() {
  return (
    <RouteGuard requiredPermissions={["results_approval"]}>
      <SimpleCourseReportsPage />
    </RouteGuard>
  )
}