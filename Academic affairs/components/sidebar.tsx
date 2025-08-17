"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  FileText,
  GraduationCap,
  Menu,
  Settings,
  Users,
  UserCheck,
  ClipboardList,
  Calendar,
  Clock,
  BookMarked,
  ClipboardEdit,
  ScrollText,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import Loader from "./ui/loader"
import { hasPermission, type UserRole } from "@/lib/permissions"

interface SidebarProps {
  userRole: UserRole
  userPermissions: string[]
}

export function Sidebar({ userRole, userPermissions }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [financeOpen, setFinanceOpen] = useState(false)
  const [loadingLink, setLoadingLink] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Define all possible menu items with their required permissions
  // Also include explicit role visibility to prevent cross-office leakage
  const STAFF_TYPES: UserRole[] = [
    "staff",
    "finance_officer",
    "exam_officer",
    "admissions_officer",
    "registrar",
    "Lecturer",
  ]

  const allMenuItems = [
    // Dashboard (available to everyone)
    { 
      href: userRole === "director" ? "/director/dashboard" : "/staff/dashboard", 
      label: "Dashboard", 
      icon: BarChart3, 
      permission: null, // Available to everyone
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    
    // Course Management
    { 
      href: userRole === "director" ? "/director/courses" : "/staff/courses", 
      label: userRole === "director" ? "Course Management" : "My Courses", 
      icon: BookOpen, 
      permission: "course_management",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    { 
      href: "/director/courses/program-assignment", 
      label: "Program Course Assignment", 
      icon: BookMarked, 
      permission: "program_management",
      roles: ["director", "registrar"] as UserRole[],
    },
    
    // Registration Management
    { 
      href: userRole === "director" ? "/director/course-registration" : "/staff/course-registration", 
      label: "Course Registration", 
      icon: ClipboardEdit, 
      permission: "registration_management",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    { 
      href: userRole === "director" ? "/director/course-registration/registered-students" : "/staff/course-registration/registered-students", 
      label: "Registered Students", 
      icon: ScrollText, 
      permission: "registration_management",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    
    // Student Management
    { 
      href: userRole === "director" ? "/director/student-management" : "/staff/student-management", 
      label: "Student Management", 
      icon: Users, 
      permission: "student_management",
      roles: ["director", "registrar"] as UserRole[],
    },
    { 
      href: "/director/student-progression", 
      label: "Student Level Progression", 
      icon: TrendingUp, 
      permission: "student_management",
      roles: ["director", "registrar"] as UserRole[],
    },
    { 
      href: "/staff/students", 
      label: "Student Records", 
      icon: Users, 
      permission: "student_records",
      roles: (STAFF_TYPES as UserRole[]),
    },
    
    // Results Management (exam officers and director see approvals)
    { 
      href: userRole === "director" ? "/director/results" : "/staff/results", 
      label: userRole === "director" ? "Results" : "Results", 
      icon: FileText, 
      permission: "results_approval",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    { 
      href: "/staff/results/reports", 
      label: "Results • Course Report", 
      icon: FileText, 
      permission: "results_approval",
      roles: (STAFF_TYPES as UserRole[]),
    },
    { 
      href: userRole === "director" ? "/director/transcripts" : "/staff/transcripts", 
      label: "Student Transcripts", 
      icon: ScrollText, 
      permission: "transcript_generation",
      roles: (STAFF_TYPES as UserRole[]),
    },
    
    // Finance Management
    { 
      href: userRole === "director" ? "/director/finance" : "/staff/finance", 
      label: "Finance", 
      icon: DollarSign, 
      permission: "finance_management",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    // Finance quick links (staff-only convenience entries)
    { 
      href: "/staff/finance?tab=budgets", 
      label: "Finance • Budgets", 
      icon: DollarSign, 
      permission: "finance_management",
      roles: (STAFF_TYPES as UserRole[]),
    },
    { 
      href: "/staff/finance?tab=invoices", 
      label: "Finance • Invoices", 
      icon: DollarSign, 
      permission: "finance_management",
      roles: (STAFF_TYPES as UserRole[]),
    },
    { 
      href: "/staff/finance?tab=payroll", 
      label: "Finance • Payroll", 
      icon: DollarSign, 
      permission: "finance_management",
      roles: (STAFF_TYPES as UserRole[]),
    },
    { 
      href: "/staff/finance?tab=vendors", 
      label: "Finance • Vendors", 
      icon: DollarSign, 
      permission: "finance_management",
      roles: (STAFF_TYPES as UserRole[]),
    },
    { 
      href: "/staff/finance?tab=procurement", 
      label: "Finance • Procurement", 
      icon: DollarSign, 
      permission: "finance_management"
    },
    
    // Admissions Management
    { 
      href: userRole === "director" ? "/director/admissions" : "/staff/admissions", 
      label: "Admissions", 
      icon: FileText, 
      permission: "admission_review",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    
    // Staff Management (Director only)
    { 
      href: "/director/staff-management", 
      label: "Staff Management", 
      icon: UserCheck, 
      permission: "staff_management",
      roles: ["director"] as UserRole[],
    },
    { 
      href: "/director/lecturer-management", 
      label: "Lecturer Management", 
      icon: GraduationCap, 
      permission: "lecturer_management",
      roles: ["director"] as UserRole[],
    },
    
    // Academic Administration
    { 
      href: "/director/academic-management", 
      label: "Academic Year", 
      icon: Calendar, 
      permission: "academic_administration",
      roles: ["director"] as UserRole[],
    },
    { 
      href: "/director/deferment", 
      label: "Deferment", 
      icon: Calendar, 
      permission: "academic_administration",
      roles: ["director"] as UserRole[],
    },
    
    // Reports
    { 
      href: userRole === "director" ? "/director/daily-reports" : "/staff/daily-report", 
      label: "Daily Report", 
      icon: userRole === "director" ? ClipboardList : Clock, 
      permission: "daily_reports",
      roles: (["director", ...STAFF_TYPES] as UserRole[]),
    },
    // Users visibility for staff-type roles
    { 
      href: "/staff/users", 
      label: "Users", 
      icon: Users, 
      permission: "daily_reports", // minimal permission so most officers can view scope users
      roles: (STAFF_TYPES as UserRole[]),
    },
    { 
      href: "/staff/submissions", 
      label: "Submission Status", 
      icon: ClipboardList, 
      permission: "daily_reports",
      roles: (STAFF_TYPES as UserRole[]),
    },
    
    // System Administration (Director only)
    { 
      href: "/director/audit-trail", 
      label: "Audit Trail", 
      icon: Clock, 
      permission: "audit_trail",
      roles: ["director"] as UserRole[],
    },
    { 
      href: "/director/settings", 
      label: "Settings", 
      icon: Settings, 
      permission: "system_settings",
      roles: ["director"] as UserRole[],
    },
    { 
      href: "/director/test-data", 
      label: "Test Data", 
      icon: Users, 
      permission: "full_access",
      roles: ["director"] as UserRole[],
    },
  ]

  // Filter menu items based on user permissions and role visibility
  const menuItems = allMenuItems.filter(item => {
    if (item.roles && !item.roles.includes(userRole)) return false
    // If no permission required, show to everyone
    if (!item.permission) return true
    // Otherwise check if user has the required permission
    return hasPermission(userPermissions, item.permission)
  })

  // Group finance sublinks under a collapsible section
  const financeSubItems = menuItems.filter(i => i.href.startsWith("/staff/finance?tab="))
  const menuWithoutFinanceSubs = menuItems.filter(i => !i.href.startsWith("/staff/finance?tab="))

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    if (pathname === href) return
    setLoadingLink(href)
    // Use replace for rapid transitions on same stack to reduce history bloat
    router.push(href)
  }

  // Clear loading state when pathname changes
  useEffect(() => {
    setLoadingLink(null)
  }, [pathname])

  // Prevent scroll propagation
  const handleScroll = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className={cn("flex flex-col border-r bg-background transition-all duration-300 fixed left-0 top-0 h-screen z-50", collapsed ? "w-20" : "w-80")}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
        {!collapsed && <span className="text-lg font-semibold">Menu</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav 
        className="flex-1 space-y-2 p-4 overflow-y-auto overflow-x-hidden" 
        onWheel={handleScroll}
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {menuWithoutFinanceSubs.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isLoading = loadingLink === item.href

          const isFinanceRoot = item.label === "Finance" && financeSubItems.length > 0

          if (isFinanceRoot) {
            return (
              <div key={`${item.href}-${item.label}`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigation(item.href)}
                    disabled={isLoading || isActive}
                    className={cn(
                      "flex-1 justify-start transition-all duration-200 text-left",
                      collapsed && "px-2",
                      isActive
                        ? "bg-secondary text-secondary-foreground cursor-default"
                        : isLoading
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      "h-12 px-4 rounded-md text-sm font-medium"
                    )}
                  >
                    <div className="flex items-center">
                      {isLoading ? (
                        <Loader className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      )}
                      {!collapsed && (
                        <span className="ml-3 text-sm leading-tight break-words">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </button>
                  {!collapsed && (
                    <button
                      type="button"
                      onClick={() => setFinanceOpen(!financeOpen)}
                      className={cn(
                        "text-xs px-2 py-1 rounded border",
                        financeOpen ? "bg-muted" : "bg-background hover:bg-muted"
                      )}
                    >
                      {financeOpen ? "Hide" : "Show"}
                    </button>
                  )}
                </div>

                {/* Collapsed finance submenu */}
                {!collapsed && financeOpen && (
                  <div className="mt-1 space-y-1">
                    {financeSubItems.map((sub) => {
                      const SubIcon = sub.icon
                      const subActive = pathname === sub.href
                      const subLoading = loadingLink === sub.href
                      return (
                        <button
                          key={`${sub.href}-${sub.label}`}
                          onClick={() => handleNavigation(sub.href)}
                          disabled={subLoading || subActive}
                          className={cn(
                            "w-full justify-start transition-all duration-200 text-left",
                            subActive
                              ? "bg-secondary/60 text-secondary-foreground cursor-default"
                              : subLoading
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            "h-10 pl-10 pr-3 rounded-md text-sm"
                          )}
                        >
                          <div className="flex items-center">
                            {subLoading ? (
                              <Loader className="h-3.5 w-3.5 flex-shrink-0" />
                            ) : (
                              <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            <span className="ml-2 text-sm truncate">{sub.label.replace("Finance • ", "")}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <button
              key={`${item.href}-${item.label}`}
              onClick={() => handleNavigation(item.href)}
              disabled={isLoading || isActive}
              className={cn(
                "w-full justify-start transition-all duration-200 text-left",
                collapsed && "px-2",
                isActive
                  ? "bg-secondary text-secondary-foreground cursor-default"
                  : isLoading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                "h-12 px-4 rounded-md text-sm font-medium"
              )}
            >
              <div className="flex items-center">
                {isLoading ? (
                  <Loader className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 flex-shrink-0" />
                )}
                {!collapsed && (
                  <span className="ml-3 text-sm leading-tight break-words">
                    {item.label}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
