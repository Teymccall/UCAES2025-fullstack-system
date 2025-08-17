"use client"

import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/dashboard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, ClipboardList, Clock, CheckCircle, AlertTriangle, LoaderCircle } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useCourses } from "@/components/course-context"
import { useStudents } from "@/components/student-context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface Task {
  id: string;
  task: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  courseId: string;
  assignedTo: string;
  status: "pending" | "completed";
}

export default function StaffDashboard() {
  const { user, isLoading, isAuthenticated, canAccessCourse, hasPermission } = useAuth()
  const { courses } = useCourses()
  const { results, getResultsByCourse } = useStudents()
  const router = useRouter()
  
  const [assignedCourses, setAssignedCourses] = useState<typeof courses>([])
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(0)
  const [pendingResults, setPendingResults] = useState(0)
  const [submittedResults, setSubmittedResults] = useState(0)

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isLoading && user) {
      // Filter courses that the staff is assigned to
      const staffCourses = courses.filter(course => 
        user.assignedCourses?.includes(course.code) || canAccessCourse(course.code)
      )
      setAssignedCourses(staffCourses)

      // Calculate students across all courses
      const studentCount = staffCourses.reduce((total, course) => total + (course.students || 0), 0)
      setTotalStudents(studentCount)

      // Calculate pending and submitted results
      let pending = 0
      let submitted = 0

      staffCourses.forEach(course => {
        const courseResults = getResultsByCourse(course.code)
        pending += courseResults.filter(r => r.status === "draft" && r.submittedBy === user.id).length
        submitted += courseResults.filter(r => r.status === "submitted" && r.submittedBy === user.id).length
      })

      setPendingResults(pending)
      setSubmittedResults(submitted)

      // Fetch tasks for this staff member
      const fetchTasks = async () => {
        try {
          if (!user.uid) {
            console.warn("[StaffDashboard] Missing user.uid; skipping task fetch to avoid invalid Firestore query")
            return
          }
          const tasksQuery = query(
            collection(db, "tasks"), 
            where("assignedTo", "==", user.uid),
            where("status", "==", "pending")
          )
          
          const tasksSnapshot = await getDocs(tasksQuery)
          const tasksData = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Task[]
          
          setPendingTasks(tasksData)
        } catch (error) {
          console.error("Error fetching tasks:", error)
          // Use default tasks if fetch fails
          setPendingTasks([
            { 
              id: "1",
              task: "Submit final results", 
              deadline: new Date().toISOString().split('T')[0], 
              priority: "high",
              courseId: staffCourses[0]?.code || "",
              assignedTo: user.id,
              status: "pending"
            }
          ])
        } finally {
          setLoading(false)
        }
      }

      // If there are no tasks in Firestore, use these default tasks
      if (pendingTasks.length === 0) {
        setPendingTasks([
          { 
            id: "1",
            task: staffCourses[0] ? `Submit final results for ${staffCourses[0].code}` : "Submit final results", 
            deadline: new Date().toISOString().split('T')[0], 
            priority: "high",
            courseId: staffCourses[0]?.code || "",
            assignedTo: user.id,
            status: "pending"
          },
          { 
            id: "2",
            task: staffCourses[1] ? `Enter midterm scores for ${staffCourses[1].code}` : "Enter midterm scores", 
            deadline: new Date().toISOString().split('T')[0], 
            priority: "medium",
            courseId: staffCourses[1]?.code || "",
            assignedTo: user.id,
            status: "pending"
          }
        ])
        // Ensure the local loading state clears even when using defaults
        setLoading(false)
      } else {
        fetchTasks()
      }
    }
  }, [user, isLoading, isAuthenticated, courses, results, router, canAccessCourse, getResultsByCourse])

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Please log in to access your dashboard</p>
        <Button className="mt-4" onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Manage your assigned courses and academic tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Assigned Courses" 
          value={assignedCourses.length.toString()} 
          description="Active this semester" 
          icon={BookOpen} 
        />
        <DashboardCard 
          title="Total Students" 
          value={totalStudents.toString()} 
          description="Across all courses" 
          icon={Users} 
        />
        <DashboardCard 
          title="Pending Results" 
          value={pendingResults.toString()} 
          description="Awaiting submission" 
          icon={ClipboardList} 
        />
        <DashboardCard 
          title="Submitted Results" 
          value={submittedResults.toString()} 
          description="Awaiting approval" 
          icon={CheckCircle} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Assigned Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Assigned Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No courses assigned to you yet
              </div>
            ) : (
              <div className="space-y-3">
                {assignedCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{course.name || 'Unnamed Course'}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.code} • {course.students || 0} students
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.status === "active" ? "default" : "secondary"}>
                        {course.status || 'Unknown'}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/staff/courses/${course.id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending tasks
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{task.task}</div>
                      <div className="text-sm text-muted-foreground">Due: {task.deadline}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                        }
                      >
                        {task.priority === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {task.priority}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => {
                          // Navigate to the relevant page based on the task
                          if (task.task.includes("results")) {
                            router.push(`/staff/results?course=${task.courseId}`)
                          } else {
                            router.push(`/staff/courses/${task.courseId}`)
                          }
                        }}
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
