"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  Clock,
  Download,
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
import Image from "next/image"
import { getStudentFees } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PageLoader, CardLoader } from "@/components/ui/loader"

interface FeesStatus {
  totalTuition: number
  paidAmount: number
  outstandingBalance: number
  status: "paid" | "partial" | "overdue"
  dueDate: string
}

interface WalletBalance {
  balance: number
  currency: string
}

function DashboardContent() {
  const [feesStatus, setFeesStatus] = useState<FeesStatus | null>(null)
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.studentId) {
          // Fetch fees status
          const fees = await getStudentFees(user.studentId)
          setFeesStatus(fees)
          
          // Fetch wallet balance
          const { WalletService } = await import('@/lib/wallet-service')
          const walletService = WalletService.getInstance()
          const wallet = await walletService.getStudentWallet(user.studentId)
          setWalletBalance({
            balance: wallet.balance,
            currency: wallet.currency
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  if (loading) {
    return <PageLoader color="#1e40af" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation is provided by shared PortalHeader; remove duplicate here */}

      <div className="max-w-7xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
              Welcome{user?.name ? `, ${user.name}` : ' to UCAES Fees Portal'}
            </h1>
            <p className="text-xs sm:text-base text-gray-600">
              Manage your fees and payments - University College of Agriculture and Environmental Studies
            </p>
          </div>
        </div>

        {/* Academic Year Information */}
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Current Academic Year</strong> - Fees are automatically calculated based on the current semester set by Academic Affairs.
            <span className="block text-xs mt-1 text-blue-600">
              Your fees are updated in real-time when the administration updates the academic calendar.
            </span>
          </AlertDescription>
        </Alert>

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

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                  <p className="text-3xl font-bold text-red-600">
                    ¢{(feesStatus?.outstandingBalance || 0).toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Wallet Balance</p>
                  <p className="text-3xl font-bold text-green-900">
                    ¢{(walletBalance?.balance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <Card className="border-l-4 border-l-blue-600 mb-6">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Your Fees Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {feesStatus ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tuition</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ¢{(feesStatus.totalTuition || 0).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(feesStatus.status)} text-sm px-3 py-1`}>
                    {feesStatus.status.charAt(0).toUpperCase() + feesStatus.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/fees" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                      <CreditCard className="h-5 w-5 mr-2" />
                      View Fees Details
                    </Button>
                  </Link>
                  <Link href="/wallet" className="w-full">
                    <Button variant="outline" className="w-full text-lg py-3 border-green-600 text-green-700 hover:bg-green-50">
                      <div className="w-5 h-5 bg-green-600 rounded-full mr-2"></div>
                      My Wallet
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 py-8 text-center">Loading fees information...</div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/transactions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Transactions</p>
                    <p className="text-sm text-gray-600">View payment history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/fees">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Fee Statement</p>
                    <p className="text-sm text-gray-600">Download your statement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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
