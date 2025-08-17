"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Clock, AlertTriangle, TrendingUp, Calendar, Bell } from "lucide-react"
import Link from "next/link"
import { sampleStudents, sampleCourses, sampleGrades, sampleAnnouncements } from "@/lib/sample-data"
import type { DashboardStats } from "@/lib/types"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    pendingGrades: 0,
    upcomingDeadlines: 2,
  })

  const [recentActivity] = useState([
    { id: 1, action: "New student registered", user: "John Doe", time: "2 hours ago", type: "student" },
    { id: 2, action: "Grade submitted for AGRI301", user: "Dr. Kwame Boateng", time: "4 hours ago", type: "grade" },
    { id: 3, action: "Course registration approved", user: "Sarah Smith", time: "6 hours ago", type: "registration" },
    { id: 4, action: "New announcement published", user: "Registrar", time: "1 day ago", type: "announcement" },
  ])

  useEffect(() => {
    // Simulate fetching data from Firebase
    setStats({
      totalStudents: sampleStudents.length,
      activeCourses: sampleCourses.filter((c) => c.status === "Active").length,
      pendingGrades: sampleGrades.filter((g) => g.status === "pending").length,
      upcomingDeadlines: 2,
    })
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "student":
        return <Users className="h-4 w-4 text-blue-600" />
      case "grade":
        return <BookOpen className="h-4 w-4 text-green-600" />
      case "registration":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "announcement":
        return <Bell className="h-4 w-4 text-purple-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at UCAES today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grade Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-700" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions and updates in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Announcements */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-green-700 hover:bg-green-800">
                <Link href="/admin/students">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Courses
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-700" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleAnnouncements.slice(0, 2).map((announcement) => (
                <div key={announcement.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{announcement.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{announcement.content}</p>
                    </div>
                    <Badge variant={announcement.urgency === "high" ? "destructive" : "secondary"} className="text-xs">
                      {announcement.urgency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/communications">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
