"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

interface SidebarProps {
  userRole: "director" | "staff"
}

export function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const directorMenuItems = [
    { href: "/director/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/director/courses", label: "Course Management", icon: BookOpen },
    { href: "/director/courses/program-assignment", label: "Program Course Assignment", icon: BookMarked },
    { href: "/director/student-management", label: "Student Management", icon: Users },
    { href: "/director/results", label: "Results", icon: FileText },
    { href: "/director/staff-management", label: "Staff Management", icon: UserCheck },
    { href: "/director/academic-management", label: "Academic Year", icon: Calendar },
    { href: "/director/daily-reports", label: "Daily Reports", icon: ClipboardList },
    { href: "/director/audit-trail", label: "Audit Trail", icon: Clock },
    { href: "/director/settings", label: "Settings", icon: Settings },
  ]

  const staffMenuItems = [
    { href: "/staff/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/staff/courses", label: "My Courses", icon: BookOpen },
    { href: "/staff/student-management", label: "Student Management", icon: Users },
    { href: "/staff/results", label: "Result Entry", icon: GraduationCap },
    { href: "/staff/submissions", label: "Submission Status", icon: ClipboardList },
    { href: "/staff/students", label: "Student Records", icon: Users },
    { href: "/staff/daily-report", label: "Daily Report", icon: Clock },
  ]

  const menuItems = userRole === "director" ? directorMenuItems : staffMenuItems

  return (
    <div
      className={cn("flex flex-col border-r bg-background transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && <span className="text-lg font-semibold">Menu</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "px-2")}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
