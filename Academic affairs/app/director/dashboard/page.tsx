"use client"

import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/dashboard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, ClipboardList, TrendingUp, AlertCircle, CheckCircle, Clock, LoaderCircle, Calendar, UserCheck, BookOpen } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useAcademic } from "@/components/academic-context"
import { useRouter } from "next/navigation"
import { Spinner, SpinnerContainer } from "@/components/ui/spinner"

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
  const { user, loading } = useAuth()
  const { currentAcademicYear, staffMembers } = useAcademic()
  const router = useRouter()
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [loadingDashboardData, setLoadingDashboardData] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRegistrations: 0,
    pendingResults: 0,
    currentAcademicYear: '',
    totalStaff: 0,
    totalLecturers: 0,
  })

  useEffect(() => {
    console.log('[Dashboard useEffect] user:', user, 'loading:', loading)
    // If not authenticated, redirect to login
    if (!loading && !user) {
      console.log('[Dashboard useEffect] Not authenticated, redirecting to /login')
      router.push("/login")
      return
    }

    if (!loading && user) {
      console.log('[Dashboard useEffect] Authenticated user:', user)
      // Fetch data from MongoDB via API endpoints
      const fetchDashboardData = async () => {
        try {
          // Fetch dashboard stats
          const statsResponse = await fetch('/api/director/dashboard/stats', {
            headers: {
              'x-user-id': user.uid
            }
          });
          const statsData = await statsResponse.json();
          
          console.log('📊 Dashboard stats response:', statsData);
          
          if (statsData.success) {
            setStats({
              ...statsData.stats,
              currentAcademicYear: currentAcademicYear?.year || statsData.stats.currentAcademicYear,
              totalStaff: staffMembers.length,
              totalLecturers: staffMembers.filter(staff => staff.position === 'Lecturer').length
            });
            console.log('✅ Stats updated:', statsData.stats);
          } else {
            console.log('❌ Stats API failed:', statsData);
          }
          
          // Fetch pending approvals
          const approvalsResponse = await fetch('/api/director/dashboard/approvals', {
            headers: {
              'x-user-id': user.uid
            }
          });
          const approvalsData = await approvalsResponse.json();
          
          console.log('📋 Approvals response:', approvalsData);
          
          if (approvalsData.success) {
            setPendingApprovals(approvalsData.approvals);
            console.log('✅ Approvals updated:', approvalsData.approvals);
          } else {
            console.log('❌ Approvals API failed, using fallback data');
            // Use placeholder data if API fails
            setPendingApprovals([
              { id: "1", type: "Course Registration", student: "John Doe", course: "CS 301", status: "pending", timestamp: new Date() },
              { id: "2", type: "Result Approval", staff: "Prof. Smith", course: "MATH 201", status: "pending", timestamp: new Date() }
            ]);
          }
          
          // Fetch recent activities
          const activitiesResponse = await fetch('/api/director/dashboard/activities', {
            headers: {
              'x-user-id': user.uid
            }
          });
          const activitiesData = await activitiesResponse.json();
          
          console.log('📈 Activities response:', activitiesData);
          
          if (activitiesData.success) {
            setRecentActivities(activitiesData.activities);
            console.log('✅ Activities updated:', activitiesData.activities);
          } else {
            console.log('❌ Activities API failed, using fallback data');
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
            currentAcademicYear: currentAcademicYear?.year || new Date().getFullYear().toString(),
            totalStaff: staffMembers.length,
            totalLecturers: staffMembers.filter(staff => staff.position === 'Lecturer').length
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
          setLoadingDashboardData(false); // Fix: Update the dashboard loading state
        }
      };

      fetchDashboardData();
    }
  }, [user, loading, router, currentAcademicYear, staffMembers]);

  if (loading || loadingDashboardData) {
    console.log('[Dashboard render] Loading... user:', user, 'loading:', loading, 'loadingDashboardData:', loadingDashboardData)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <SpinnerContainer>
          Loading dashboard data...
        </SpinnerContainer>
      </div>
    )
  }

  if (!user) {
    console.log('[Dashboard render] No user, access denied')
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Please log in to access the dashboard</p>
        <Button className="mt-4" onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Academic Affairs Dashboard</h1>
        <p className="text-lg text-muted-foreground">Welcome back, {user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          title="Academic Year"
          value={stats.currentAcademicYear || new Date().getFullYear().toString()}
          description="Current academic year"
          icon={Calendar}
        />
        <DashboardCard
          title="Total Staff"
          value={stats.totalStaff.toString()}
          description="All staff members"
          icon={UserCheck}
        />
        <DashboardCard
          title="Total Lecturers"
          value={stats.totalLecturers.toString()}
          description="Teaching staff"
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-5 w-5 text-orange-500" />
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
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-5 w-5 text-green-500" />
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
