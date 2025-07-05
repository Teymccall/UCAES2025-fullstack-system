"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  DollarSign,
  Calendar,
  AlertTriangle,
  CreditCard,
  FileText,
  TrendingUp,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { getStudentFees } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FeesStatus {
  totalTuition: number
  paidAmount: number
  outstandingBalance: number
  status: "paid" | "partial" | "overdue"
  dueDate: string
}

function DashboardContent() {
  const [feesStatus, setFeesStatus] = useState<FeesStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchFeesStatus = async () => {
      try {
        if (user?.studentId) {
          const fees = await getStudentFees(user.studentId)
          setFeesStatus(fees)
        }
      } catch (error) {
        console.error("Error fetching fees:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeesStatus()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isOverdue = feesStatus?.status === "overdue"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-sm">UCAES</span>
                </div>
              </div>

              <nav className="flex space-x-1">
                <Button className="bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Portal Home</span>
                  </div>
                </Button>
                <Link href="/fees">
                  <Button variant="ghost" className="text-white hover:bg-blue-800 px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>My Fees</span>
                    </div>
                  </Button>
                </Link>
                <Button variant="ghost" className="text-white hover:bg-blue-800 px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Payment History</span>
                  </div>
                </Button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-blue-800">
                    <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-blue-200">{user?.studentId}</p>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to UCAES Fees Portal</h1>
            <p className="text-gray-600">
              Manage your fees and payments - University College of Agriculture and Environmental Studies
            </p>
          </div>
        </div>

        {/* Overdue Alert */}
        {isOverdue && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Your fees payment is overdue. Please make a payment to avoid late fees.
              <Link href="/fees" className="ml-2 underline font-medium">
                Pay Now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Fees Status Card */}
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Fees Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : feesStatus ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    ¢{feesStatus.outstandingBalance.toLocaleString()}
                  </div>
                  <Badge className={getStatusColor(feesStatus.status)}>
                    {feesStatus.status.charAt(0).toUpperCase() + feesStatus.status.slice(1)}
                  </Badge>
                  {feesStatus.status !== "paid" && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due: {feesStatus.dueDate}
                    </div>
                  )}
                  <Link href="/fees">
                    <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700">
                      <CreditCard className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-gray-500">Unable to load fees data</div>
              )}
            </CardContent>
          </Card>

          {/* Academic Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Current GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3.75</div>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />↑ 0.15 from last semester
              </p>
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">6</div>
              <p className="text-sm text-gray-600">Spring 2025 Semester</p>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">92%</div>
              <p className="text-sm text-green-600">Above average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fees Portal Actions</CardTitle>
              <CardDescription>Quick access to fees and payment features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/fees">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View My Fees
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Payment History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download Receipt
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fees Announcements</CardTitle>
              <CardDescription>Important updates about fees and payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Fee Payment Deadline Extended</p>
                <p className="text-gray-600">Due date moved to June 15, 2025</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">New Payment Methods Available</p>
                <p className="text-gray-600">Mobile money and online banking now supported</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Payment Plan Options</p>
                <p className="text-gray-600">Contact finance office for installment plans</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
              <CardDescription>Key fees and payment deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Semester Fees Due</p>
                <p className="text-gray-600">June 15, 2025</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Late Payment Penalty</p>
                <p className="text-gray-600">Starts June 16, 2025</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Payment Verification</p>
                <p className="text-gray-600">1-2 business days processing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
