"use client"

import * as React from "react"
import { Bell, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

interface TopBarProps {
  user?: {
    name: string
    email: string
    profileImage?: string
  }
}

export function TopBar({ user }: TopBarProps) {
  const [notifications] = React.useState(3) // Mock notification count

  const handleLogout = () => {
    // Implement logout logic
    console.log("Logging out...")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-green-100 bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-green-600 hover:bg-green-50" />
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-green-800">
            University College of Agriculture and Environmental Studies
          </h1>
          <p className="text-sm text-green-600">Lecturer Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-green-600 hover:bg-green-50">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
              {notifications}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-green-700 hover:bg-green-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                {user?.profileImage ? (
                  <img src={user.profileImage || "/placeholder.svg"} alt={user.name} className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || "Dr. Sarah Johnson"}</p>
                <p className="text-xs text-green-600">{user?.email || "sarah.johnson@ucaes.edu.gh"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
      </div>
    </header>
  )
}
