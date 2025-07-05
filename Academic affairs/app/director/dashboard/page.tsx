"use client"

import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/dashboard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, ClipboardList, TrendingUp, AlertCircle, CheckCircle, Clock, LoaderCircle } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"

interface ApprovalItem {
  id: string;
  type: string;
  student?: string;
  staff?: string;
  course: string;
  status: string;
  timestamp: string | Date;
}

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string | Date;
  type: "success" | "info" | "warning";
}

export default function DirectorDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRegistrations: 0,
    pendingResults: 0,
    averageCGPA: 0,
  })

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isLoading && user) {
      // Fetch data from MongoDB via API endpoints
      const fetchDashboardData = async () => {
        try {
          // Fetch dashboard stats
          const statsResponse = await fetch('/api/director/dashboard/stats');
          const statsData = await statsResponse.json();
          
          if (statsData.success) {
            setStats(statsData.stats);
          }
          
          // Fetch pending approvals
          const approvalsResponse = await fetch('/api/director/dashboard/approvals');
          const approvalsData = await approvalsResponse.json();
          
          if (approvalsData.success) {
            setPendingApprovals(approvalsData.approvals);
          } else {
            // Use placeholder data if API fails
            setPendingApprovals([
              { id: "1", type: "Course Registration", student: "John Doe", course: "CS 301", status: "pending", timestamp: new Date() },
              { id: "2", type: "Result Approval", staff: "Prof. Smith", course: "MATH 201", status: "pending", timestamp: new Date() }
            ]);
          }
          
          // Fetch recent activities
          const activitiesResponse = await fetch('/api/director/dashboard/activities');
          const activitiesData = await activitiesResponse.json();
          
          if (activitiesData.success) {
            setRecentActivities(activitiesData.activities);
          } else {
            // Use placeholder data if API fails
            setRecentActivities([
              { id: "1", action: "RESULTS_APPROVED", details: "Results approved for CS 201", timestamp: new Date(), type: "success" },
              { id: "2", action: "REGISTRATION_SUBMITTED", details: "New course registration submitted", timestamp: new Date(), type: "info" }
            ]);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          
          // Use default stats if fetch fails
          setStats({
            totalStudents: 120,
            pendingRegistrations: 5,
            pendingResults: 3,
            averageCGPA: 3.2,
          });
          
          // Use default approvals if fetch fails
          setPendingApprovals([
            { id: "1", type: "Course Registration", student: "John Doe", course: "CS 301", status: "pending", timestamp: new Date() },
            { id: "2", type: "Result Approval", staff: "Prof. Smith", course: "MATH 201", status: "pending", timestamp: new Date() }
          ]);
          
          // Use default activities if fetch fails
          setRecentActivities([
            { id: "1", action: "RESULTS_APPROVED", details: "Results approved for CS 201", timestamp: new Date(), type: "success" },
            { id: "2", action: "REGISTRATION_SUBMITTED", details: "New course registration submitted", timestamp: new Date(), type: "info" }
          ]);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Please log in to access the dashboard</p>
        <Button className="mt-4" onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Affairs Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          description="Active enrolled students"
          icon={Users}
        />
        <DashboardCard 
          title="Pending Registrations" 
          value={stats.pendingRegistrations.toString()} 
          description="Awaiting approval" 
          icon={ClipboardList} 
        />
        <DashboardCard 
          title="Pending Results" 
          value={stats.pendingResults.toString()} 
          description="Awaiting approval" 
          icon={GraduationCap} 
        />
        <DashboardCard
          title="Average CGPA"
          value={stats.averageCGPA.toFixed(2)}
          description="Current semester"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending approvals
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.student && `Student: ${item.student}`}
                        {item.staff && `Staff: ${item.staff}`}
                        {" • "}
                        {item.course}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <Button variant="ghost" size="sm">
                View All Pending Items
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activities
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.action.replace(/_/g, " ")}</div>
                      <div className="text-sm text-muted-foreground">{item.details}</div>
                    </div>
                    <Badge
                      variant={
                        item.type === "success"
                          ? "success"
                          : item.type === "warning"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.type === "success" 
                        ? "Success" 
                        : item.type === "warning" 
                        ? "Warning" 
                        : "Info"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <Button variant="ghost" size="sm">
                View Activity Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
