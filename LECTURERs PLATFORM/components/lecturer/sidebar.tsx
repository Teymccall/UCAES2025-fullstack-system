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
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    url: "/lecturer/grade-submission-new",
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
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <TooltipProvider>
      <Sidebar className="border-r border-green-100">
        <SidebarHeader className="border-b border-green-100 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="UCAES Logo" 
                width={40}
                height={40}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-lg font-semibold text-green-800 truncate">UCAES</span>
                <span className="text-xs sm:text-sm text-green-600 truncate">Lecturer Portal</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 sm:p-4">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-green-700 font-medium text-xs sm:text-sm">Main Navigation</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800 hover:bg-green-50 h-8 sm:h-10"
                        >
                          <Link href={item.url} className="flex items-center gap-2 sm:gap-3">
                            <item.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            {!isCollapsed && <span className="truncate text-xs sm:text-sm">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-green-50 border-green-200">
                          <p className="text-green-800 text-xs sm:text-sm">{item.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-green-700 font-medium text-xs sm:text-sm">Quick Actions</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800 hover:bg-green-50 h-8 sm:h-10"
                        >
                          <Link href={item.url} className="flex items-center gap-2 sm:gap-3">
                            <item.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            {!isCollapsed && <span className="truncate text-xs sm:text-sm">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-green-50 border-green-200">
                          <p className="text-green-800 text-xs sm:text-sm">{item.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
