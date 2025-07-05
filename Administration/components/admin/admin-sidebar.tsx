"use client"

import type * as React from "react"
import {
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  Award,
  Settings,
  MessageSquare,
  FileText,
  UserCog,
  Home,
  Banknote,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: Home,
      },
    ],
  },
  {
    title: "Academic Management",
    items: [
      {
        title: "Student Management",
        url: "/admin/students",
        icon: Users,
      },
      {
        title: "Course Management",
        url: "/admin/courses",
        icon: BookOpen,
      },
      {
        title: "Course Registration",
        url: "/admin/course-registration",
        icon: UserCheck,
      },
      {
        title: "Academic Records",
        url: "/admin/academic-records",
        icon: GraduationCap,
      },
      {
        title: "Fees Management",
        url: "/admin/fees",
        icon: Banknote,
      },
      {
        title: "Graduation Manager",
        url: "/admin/graduation",
        icon: Award,
      },
      {
        title: "Program Management",
        url: "/admin/programs",
        icon: Settings,
      },
    ],
  },
  {
    title: "Communication & Reports",
    items: [
      {
        title: "Communications",
        url: "/admin/communications",
        icon: MessageSquare,
      },
      {
        title: "Reports",
        url: "/admin/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "User Management",
        url: "/admin/users",
        icon: UserCog,
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
    ],
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-green-700">UCAES</span>
            <span className="truncate text-xs text-gray-600">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-green-700 font-medium">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="data-[active=true]:bg-green-100 data-[active=true]:text-green-700 hover:bg-green-50"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
