"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  User, 
  BookOpen, 
  FileText, 
  Settings, 
  GraduationCap,
  Bell,
  LogOut
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Loader from "./ui/loader"

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [loadingLink, setLoadingLink] = useState<string | null>(null)

  // Check for unread notifications
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("read", "==", false)
        )
        const snapshot = await getDocs(notificationsQuery)
        setUnreadNotifications(snapshot.size)
      } catch (error) {
        console.error("Error checking notifications:", error)
      }
    }

    checkNotifications()
    // Check every 30 seconds for new notifications
    const interval = setInterval(checkNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    setLoadingLink(href)
    router.push(href)
  }

  // Clear loading state when pathname changes
  useEffect(() => {
    setLoadingLink(null)
  }, [pathname])

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home
    },
    {
      title: "Personal Info",
      href: "/personal-info",
      icon: User
    },
    {
      title: "Course Registration",
      href: "/course-registration",
      icon: BookOpen
    },
    {
      title: "Grades & Results",
      href: "/grades",
      icon: GraduationCap
    },
    {
      title: "Defer Program",
      href: "/defer-program",
      icon: FileText
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    }
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="UCAES Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">UCAES Portal</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Student Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isLoading = loadingLink === item.href
          const isActive = pathname === item.href
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              disabled={isLoading || isActive}
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors w-full text-left",
                isActive
                  ? "bg-blue-50 text-blue-700 cursor-default"
                  : isLoading
                  ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
              )}
            >
              {isLoading ? (
                <Loader className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              ) : (
                <item.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              )}
              <span className="truncate">{item.title}</span>
              {item.title === "Defer Program" && unreadNotifications > 0 && (
                <div className="ml-auto">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {unreadNotifications}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </nav>
      
      <div className="p-3 sm:p-4 border-t">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start gap-2 sm:gap-3 text-xs sm:text-sm"
          size="sm"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </div>
  )
}
