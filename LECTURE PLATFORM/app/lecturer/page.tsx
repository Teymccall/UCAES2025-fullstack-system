"use client"

import * as React from "react"
import { BookOpen, Users, Clock, TrendingUp } from "lucide-react"
import { StatsCard } from "@/components/lecturer/stats-card"
import { RecentActivity } from "@/components/lecturer/recent-activity"
import { AnnouncementsPreview } from "@/components/lecturer/announcements-preview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { sampleAuditLogs, sampleAnnouncements } from "@/lib/sample-data"
import type { DashboardStats } from "@/lib/types"

export default function LecturerDashboard() {
  const [stats, setStats] = React.useState<DashboardStats>({
    assignedCourses: 3,
    pendingGradeSubmissions: 2,
    totalStudents: 75,
    recentSubmissions: 5,
  })

  const [recentActivity] = React.useState(sampleAuditLogs)
  const [announcements] = React.useState(sampleAnnouncements)

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome back, Dr. Sarah Johnson</h1>
        <p className="text-green-600">Here's what's happening with your courses today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Courses"
          value={stats.assignedCourses}
          description="Active this semester"
          icon={BookOpen}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Across all courses"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Grades"
          value={stats.pendingGradeSubmissions}
          description="Awaiting submission"
          icon={Clock}
          trend={{ value: -20, isPositive: false }}
        />
        <StatsCard
          title="Recent Submissions"
          value={stats.recentSubmissions}
          description="This week"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/lecturer/grade-submission">Submit Grades</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
              <Link href="/lecturer/courses">View My Courses</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
              <Link href="/lecturer/announcements">Create Announcement</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />

        {/* Announcements Preview */}
        <AnnouncementsPreview announcements={announcements} />
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800">Course Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">AGRI301</h3>
              <p className="text-sm text-green-600 mb-2">Crop Production Systems</p>
              <p className="text-xs text-gray-600">25 students enrolled</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">AGRI401</h3>
              <p className="text-sm text-green-600 mb-2">Agricultural Economics</p>
              <p className="text-xs text-gray-600">30 students enrolled</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">ENVS201</h3>
              <p className="text-sm text-green-600 mb-2">Environmental Chemistry</p>
              <p className="text-xs text-gray-600">20 students enrolled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
