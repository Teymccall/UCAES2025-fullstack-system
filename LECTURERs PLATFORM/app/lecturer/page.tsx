"use client"

import * as React from "react"
import { BookOpen, Users, Clock, TrendingUp } from "lucide-react"
import { StatsCard } from "@/components/lecturer/stats-card"
import { RecentActivity } from "@/components/lecturer/recent-activity"
import { AnnouncementsPreview } from "@/components/lecturer/announcements-preview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { DashboardStats } from "@/lib/types"
import { useAuth } from "@/components/auth-context"
import { useAcademic } from "@/components/academic-provider"
import { db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  doc, 
  getDoc
} from "firebase/firestore"

export default function LecturerDashboard() {
  const { user } = useAuth();
  // Get active academic data from the central context
  const { 
    activeYear, 
    activeRegularSemester, 
    activeWeekendSemester,
    allAcademicYears
  } = useAcademic();
  
  const [stats, setStats] = React.useState<DashboardStats>({
    assignedCourses: 0,
    pendingGradeSubmissions: 0,
    totalStudents: 0,
    recentSubmissions: 0,
  });

  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [announcements, setAnnouncements] = React.useState<any[]>([]);
  const [lecturerAssignments, setLecturerAssignments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Display state for current academic info based on assignments
  const [displayAcademicYear, setDisplayAcademicYear] = React.useState<string | null>(null);
  const [displaySemester, setDisplaySemester] = React.useState<string | null>(null);
  
  // Set display academic info based on assignments
  React.useEffect(() => {
    if (lecturerAssignments && lecturerAssignments.length > 0) {
      // Get the assignment we want to show (prioritize the one with the most recent year/semester)
      const assignment = lecturerAssignments[0]; // Default to first one
      
      if (assignment.academicYearId && allAcademicYears) {
        // Find the academic year object
        const yearObj = allAcademicYears.find(y => y.id === assignment.academicYearId);
        if (yearObj) {
          setDisplayAcademicYear(yearObj.year || yearObj.name);
        }
      }
      
      // Set semester display if available
      if (assignment.academicSemesterName) {
        setDisplaySemester(assignment.academicSemesterName);
      }
    } else if (activeYear) {
      // Fall back to the global context
      setDisplayAcademicYear(activeYear.year);
      if (activeRegularSemester) {
        setDisplaySemester(activeRegularSemester.name);
      }
    }
  }, [lecturerAssignments, activeYear, activeRegularSemester, allAcademicYears]);

  // Fetch lecturer-specific data when user is available
  React.useEffect(() => {
    if (!user || !user.email) return;
    
    const fetchLecturerData = async () => {
      setLoading(true);
      try {
        // Step 1: Find the lecturer's ID in the users collection
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, where("email", "==", user.email));
        const userSnapshot = await getDocs(usersQuery);
        
        if (userSnapshot.empty) {
          console.error("No matching user found");
          setLoading(false);
          return;
        }
        
        const lecturerId = userSnapshot.docs[0].id;
        
        // Step 2: Fetch lecturer's course assignments
        const assignmentsRef = collection(db, "lecturer-assignments");
        const assignmentsQuery = query(
          assignmentsRef, 
          where("lecturerId", "==", lecturerId)
          // Removed status filter to show all assignments regardless of status
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        
                 const assignments = assignmentsSnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
         }));
         
         // Fetch course details for each assignment
         const assignmentsWithDetails = await Promise.all(
           assignments.map(async (assignment) => {
                            try {
                 // Get course details if available
                 if (assignment.courseId) {
                   const courseDocRef = doc(db, "academic-courses", assignment.courseId);
                   const courseDoc = await getDoc(courseDocRef);
                   
                   if (courseDoc.exists()) {
                     const courseData = courseDoc.data();
                     assignment = {
                       ...assignment,
                       courseCode: courseData.code || assignment.courseCode,
                       courseName: courseData.title || assignment.courseName
                     };
                   }
                 }
                 
                 // Get semester name if available
                 if (assignment.academicSemesterId) {
                   const semesterDocRef = doc(db, "academic-semesters", assignment.academicSemesterId);
                   const semesterDoc = await getDoc(semesterDocRef);
                   
                   if (semesterDoc.exists()) {
                     const semesterData = semesterDoc.data();
                     assignment = {
                       ...assignment,
                       academicSemesterName: semesterData.name
                     };
                   }
                                  }
                 
                 return assignment;
              } catch (error) {
                console.error("Error fetching course details:", error);
                return assignment;
             }
           })
         );
         
         setLecturerAssignments(assignmentsWithDetails);
        
        // Count assigned courses and get course IDs
        const courseIds = assignments.map(a => a.courseId);
        const uniqueCourseIds = [...new Set(courseIds)];
        
        // Step 3: Get student count for these courses
        let totalStudentCount = 0;
        let pendingGradeCount = 0;
        let recentSubmissionCount = 0;
        let directStudentCount = 0;
        
        // Directly check the "registrations" collection used by the academic affairs director
        try {
          // This is the collection used in Academic Affairs when director registers students
          const directRegsRef = collection(db, "registrations");
          const directRegsSnapshot = await getDocs(directRegsRef);
          
          // Process each registration to find our courses
          if (!directRegsSnapshot.empty) {
            // Count how many registrations include our courses
            directRegsSnapshot.forEach(regDoc => {
              const regData = regDoc.data();
              
              // Check if this registration contains any of our courses
              if (regData.courses && Array.isArray(regData.courses)) {
                for (const uniqueCourseId of uniqueCourseIds) {
                  // Check if any course in the registration matches our course ID
                  const hasCourse = regData.courses.some(course => 
                    (course.courseId === uniqueCourseId) || 
                    (course.id === uniqueCourseId) ||
                    (typeof course === 'string' && course === uniqueCourseId)
                  );
                  
                  if (hasCourse) {
                    directStudentCount++;
                    break; // Count this student once even if registered for multiple courses
                  }
                }
              }
            });
          }
          
          console.log(`Found ${directStudentCount} students registered by director`);
        } catch (error) {
          console.error("Error checking director registrations:", error);
        }
        
        for (const courseId of uniqueCourseIds) {
          // Get student registrations for this course
          const regsRef = collection(db, "course-registrations");
          const regsQuery = query(
            regsRef, 
            where("courseId", "==", courseId)
            // Removed status filter to count all registered students
          );
          const regsSnapshot = await getDocs(regsQuery);
          totalStudentCount += regsSnapshot.size;
          
          // Alternative approach - also check the 'students' collection that might have been populated
          // during course registration by the director
          try {
            const studentCoursesRef = collection(db, "course-students");
            const studentCoursesQuery = query(
              studentCoursesRef,
              where("courseId", "==", courseId)
            );
            const studentCoursesSnapshot = await getDocs(studentCoursesQuery);
            totalStudentCount += studentCoursesSnapshot.size;
          } catch (error) {
            console.log("No additional student records found in course-students collection");
          }
          
          // Get pending grade submissions
          const gradesRef = collection(db, "grades");
          const pendingGradesQuery = query(
            gradesRef,
            where("courseId", "==", courseId),
            where("lecturerId", "==", lecturerId),
            where("status", "==", "pending")
          );
          const pendingGradesSnapshot = await getDocs(pendingGradesQuery);
          pendingGradeCount += pendingGradesSnapshot.size;
          
          // Get recent submissions (last 7 days)
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const recentSubmissionsQuery = query(
            gradesRef,
            where("courseId", "==", courseId),
            where("lecturerId", "==", lecturerId),
            where("submittedAt", ">=", oneWeekAgo.toISOString())
          );
          const recentSubmissionsSnapshot = await getDocs(recentSubmissionsQuery);
          recentSubmissionCount += recentSubmissionsSnapshot.size;
        }
        
          // Use the highest count between direct registrations and other methods
          const finalStudentCount = Math.max(directStudentCount, totalStudentCount);
          
          console.log(`Final count: ${finalStudentCount} students across ${lecturerAssignments.length} courses`);
          
          // Update stats with the actual number of courses and students
          setStats({
            assignedCourses: lecturerAssignments.length, // Use the actual assignments length
            totalStudents: finalStudentCount,
            pendingGradeSubmissions: pendingGradeCount,
            recentSubmissions: recentSubmissionCount
          });
        
        // Step 4: Fetch recent activity
        const auditLogsRef = collection(db, "auditLogs");
        const activityQuery = query(
          auditLogsRef,
          where("userId", "==", lecturerId),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const activitySnapshot = await getDocs(activityQuery);
        
        const activities = activitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentActivity(activities.length > 0 ? activities : []);
        
        // Step 5: Fetch announcements
        const announcementsRef = collection(db, "announcements");
        const announcementsQuery = query(
          announcementsRef,
          where("targetAudience", "in", ["All", "Lecturers"]),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        
        const fetchedAnnouncements = announcementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAnnouncements(fetchedAnnouncements.length > 0 ? fetchedAnnouncements : []);
        
      } catch (error) {
        console.error("Error fetching lecturer data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLecturerData();
      
    // Additional logging to confirm we're using the global academic context
    console.log("Active Academic Year:", activeYear?.year);
    console.log("Active Regular Semester:", activeRegularSemester?.name);
    console.log("Active Weekend Semester:", activeWeekendSemester?.name);
  }, [user, activeYear, activeRegularSemester, activeWeekendSemester]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-2">
          Welcome back, {user?.displayName || user?.name || user?.email?.split('@')[0] || 'Lecturer'}
        </h1>
        <p className="text-sm sm:text-base text-green-600">Here's what's happening with your courses today.</p>
        <div className="mt-2 text-xs sm:text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center">
          <span className="font-semibold">Academic Year: {displayAcademicYear || ''}</span> 
          {displaySemester && (
            <span className="sm:ml-3 mt-1 sm:mt-0">
              <span className="font-semibold">Current Semester:</span> {displaySemester}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
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
          trend={{ value: stats.pendingGradeSubmissions > 0 ? -20 : 0, isPositive: false }}
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
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/lecturer/grade-submission-new">Submit Grades</Link>
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
        <RecentActivity activities={recentActivity.length > 0 ? recentActivity : [
          {
            id: 'default-activity',
            action: 'Login',
            timestamp: new Date().toISOString(),
            details: 'No recent activity'
          }
        ]} />

        {/* Announcements Preview */}
        <AnnouncementsPreview announcements={announcements.length > 0 ? announcements : [
          {
            id: 'default-announcement',
            title: 'Welcome to the new semester',
            content: 'No announcements yet',
            createdAt: new Date().toISOString(),
            authorName: 'System'
          }
        ]} />
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800">Course Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Loading your courses...</p>
            </div>
          ) : lecturerAssignments.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lecturerAssignments.map((assignment, index) => {
                return (
                  <div key={assignment.id || index} className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {assignment.courseCode || 'Course Code'}
                    </h3>
                    <p className="text-sm text-green-600 mb-2">
                      {assignment.courseName || 'Course Name'}
                    </p>
                    <div className="text-xs text-gray-600 flex flex-col gap-1">
                      <p>Level {assignment.level || '100'}</p>
                      {assignment.programmeCourseType && (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                          {assignment.programmeCourseType}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 sm:p-6 border border-dashed border-gray-300 rounded-lg">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600">No Courses Assigned Yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Contact the Academic Affairs Director to get course assignments for the current semester.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Once courses are assigned, you'll be able to submit grades and manage your classes here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
