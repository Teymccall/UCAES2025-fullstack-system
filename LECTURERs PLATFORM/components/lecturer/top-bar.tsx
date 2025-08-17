"use client"

import * as React from "react"
import { Bell, LogOut, User, Briefcase, PanelLeft, Calendar, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOutUser, db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { collection, query, where, getDocs } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopBar() {
  const [notifications] = React.useState(3) // Mock notification count
  const router = useRouter()
  const { user } = useAuth()
  const { state } = useSidebar()
  // Local state for system config to avoid SSR issues
  const [currentAcademicYear, setCurrentAcademicYear] = React.useState<string | null>(null)
  const [currentSemester, setCurrentSemester] = React.useState<string | null>(null)
  const [configLoading, setConfigLoading] = React.useState(true)
  const [lecturerDetails, setLecturerDetails] = React.useState<any>(null)
  const [assignedPrograms, setAssignedPrograms] = React.useState<string[]>([])
  const [assignmentStats, setAssignmentStats] = React.useState({
    totalAssignments: 0,
    currentAssignments: 0,
    academicYears: 0
  })

  // Fetch system config
  React.useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const configRef = doc(db, "systemConfig", "academicPeriod");
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          const data = configSnap.data();
          setCurrentAcademicYear(data.currentAcademicYear || null);
          setCurrentSemester(data.currentSemester || null);
        }
      } catch (error) {
        console.error("Error fetching system config:", error);
      } finally {
        setConfigLoading(false);
      }
    };
    
    fetchSystemConfig();
  }, []);

  React.useEffect(() => {
    const fetchLecturerDetails = async () => {
      if (!user?.email) return;

      try {
        // Get lecturer info from users collection
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const lecturerData = snapshot.docs[0].data();
          const lecturerId = snapshot.docs[0].id;
          setLecturerDetails(lecturerData);
          
          // Fetch lecturer assignments
          const assignmentsRef = collection(db, "lecturer-assignments");
          const assignmentsQuery = query(assignmentsRef, where("lecturerId", "==", lecturerId));
          const assignmentsSnapshot = await getDocs(assignmentsQuery);
          
          // Process assignments data
          const assignmentsData = assignmentsSnapshot.docs.map(doc => doc.data());
          
          // Get unique program IDs
          const programIds = new Set<string>();
          const academicYearIds = new Set<string>();
          
          assignmentsData.forEach(assignment => {
            if (assignment.programId) {
              programIds.add(assignment.programId);
            }
            if (assignment.academicYearId) {
              academicYearIds.add(assignment.academicYearId);
            }
          });
          
          // Get program names
          const programNames: string[] = [];
          for (const programId of programIds) {
            const programDocRef = doc(db, "academic-programs", programId);
            const programSnapshot = await getDoc(programDocRef);
            if (programSnapshot.exists()) {
              const programData = programSnapshot.data();
              programNames.push(programData.name || "Unknown Program");
            }
          }
          
          setAssignedPrograms(programNames);
          
          // Calculate assignment statistics
          setAssignmentStats({
            totalAssignments: assignmentsData.length,
            currentAssignments: assignmentsData.filter(a => 
              a.academicYearId && a.academicSemesterId
            ).length,
            academicYears: academicYearIds.size
          });
        }
      } catch (error) {
        console.error("Error fetching lecturer details:", error);
      }
    };
    
    fetchLecturerDetails();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOutUser()
      // Redirect to login page after successful logout
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const lecturerName = lecturerDetails?.name || user?.displayName || "Lecturer";
  const lecturerEmail = user?.email || "";

  return (
    <header className="flex h-12 sm:h-16 items-center justify-between border-b border-green-100 bg-white px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <SidebarTrigger className="text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors p-1 sm:p-2">
            <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </SidebarTrigger>
          {state === "collapsed" && (
            <div className="hidden sm:block text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Collapsed
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg sm:text-xl font-semibold text-green-800">
            University College of Agriculture and Environmental Studies
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-xs sm:text-sm text-green-600">Lecturer Portal</p>
            {!configLoading && currentAcademicYear && currentSemester && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                  <Calendar className="h-3 w-3 text-green-600" />
                  <span className="text-green-700 font-medium">{currentAcademicYear}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                  <BookOpen className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-700 font-medium">{currentSemester}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="block lg:hidden">
          <h1 className="text-sm sm:text-base font-semibold text-green-800">
            UCAES
          </h1>
          {!configLoading && currentSemester && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                {currentSemester}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-green-600 hover:bg-green-50 h-8 w-8 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {notifications > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs">
              {notifications}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 text-green-700 hover:bg-green-50 h-8 sm:h-10 p-1 sm:p-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={lecturerDetails?.profileImage || "/placeholder.svg"} alt={lecturerName} />
                <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
                  {lecturerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-xs sm:text-sm font-medium">{lecturerName}</p>
                <p className="text-xs text-green-600">{lecturerEmail}</p>
                {assignedPrograms.length > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {assignedPrograms[0]} {assignedPrograms.length > 1 ? `+${assignedPrograms.length - 1} more` : ""}
                  </p>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {assignedPrograms.length > 0 && (
              <>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Assigned Programs:
                </DropdownMenuLabel>
                {assignedPrograms.map((program, index) => (
                  <DropdownMenuItem key={index} className="text-xs">
                    <Briefcase className="mr-2 h-3 w-3" />
                    {program}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            {/* Academic Period Information */}
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
              Academic Period:
            </DropdownMenuLabel>
            <DropdownMenuItem className="text-xs">
              <Calendar className="mr-2 h-3 w-3" />
              {configLoading ? "Loading..." : `${currentAcademicYear || "Not Set"} • ${currentSemester || "Not Set"}`}
            </DropdownMenuItem>
            
            {/* Assignment Statistics */}
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
              Assignment Summary:
            </DropdownMenuLabel>
            <DropdownMenuItem className="text-xs">
              <BookOpen className="mr-2 h-3 w-3" />
              {assignmentStats.totalAssignments} total assignments across {assignmentStats.academicYears} academic years
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Standalone Logout Button */}
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 sm:gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 sm:h-10 px-2 sm:px-3"
          onClick={handleLogout}
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline text-xs sm:text-sm">Logout</span>
        </Button>
      </div>
    </header>
  )
}
