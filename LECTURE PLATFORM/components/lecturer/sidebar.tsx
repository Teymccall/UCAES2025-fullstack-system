"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, GraduationCap, Home, Megaphone, PenTool, Settings, User } from "lucide-react"
import Image from "next/image"

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
    title: "Dashboard",
    url: "/lecturer",
    icon: Home,
  },
  {
    title: "My Courses",
    url: "/lecturer/courses",
    icon: BookOpen,
  },
  {
    title: "Grade Submission",
    url: "/lecturer/grade-submission",
    icon: PenTool,
  },
  {
    title: "Announcements",
    url: "/lecturer/announcements",
    icon: Megaphone,
  },
]

const quickActions = [
  {
    title: "Profile Settings",
    url: "/lecturer/profile",
    icon: User,
  },
  {
    title: "System Settings",
    url: "/lecturer/settings",
    icon: Settings,
  },
]

export function LecturerSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-green-100">
      <SidebarHeader className="border-b border-green-100 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10">
            <Image
              src="/uces.png"
              alt="UCAES Logo" 
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-green-800">UCAES</span>
            <span className="text-sm text-green-600">Lecturer Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700 font-medium">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800 hover:bg-green-50"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700 font-medium">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800 hover:bg-green-50"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
