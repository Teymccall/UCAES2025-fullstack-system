"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  User, 
  ChevronDown, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PortalHeaderProps {
  currentPage?: string
}

export default function PortalHeader({ currentPage = "home" }: PortalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const navigationItems = [
    { name: "My Fees", href: "/fees", current: currentPage === "fees" },
    { name: "My Wallet", href: "/wallet", current: currentPage === "wallet" },
    { name: "Transactions", href: "/transactions", current: currentPage === "transactions" },
  ]

  return (
    <div className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Logo and Title */}
          <div className="flex items-center justify-between sm:justify-start">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Image 
                src="/logo.png" 
                alt="UCAES Logo" 
                width={32}
                height={32}
                priority
                className="object-contain sm:w-[40px] sm:h-[40px]"
              />
              <div>
                <div className="font-bold text-base sm:text-lg">UCAES</div>
                <div className="text-xs text-blue-200">Fees Portal</div>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-blue-800 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="sm:hidden">
              <div className="space-y-1 pt-2 pb-3 border-t border-blue-800">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-blue-800 mt-3 pt-3">
                  <div className="px-3 py-2 text-xs text-blue-300">
                    Logged in as: {user?.name || user?.studentId || 'Student'}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-200 hover:bg-blue-700 hover:text-white px-3 py-3"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      // Add logout logic here if needed
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`px-4 py-2 ${
                    item.current
                      ? 'bg-blue-800 text-white'
                      : 'text-white hover:bg-blue-800'
                  }`}
                >
                  {item.name}
                  {item.current && (
                    <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" className="text-white hover:bg-blue-800 p-2">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-blue-800 flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base">
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="max-w-[120px] lg:max-w-none truncate">
                    {user?.name || user?.studentId || 'Student'}
                  </span>
                  <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

