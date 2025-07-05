"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, CreditCard, Calculator, Bell, User, ChevronDown, LogOut } from "lucide-react"
import { getStudentFees } from "@/lib/firebase"
import type { FeesData, FeeItem } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function FeesContent() {
  const [feesData, setFeesData] = useState<FeesData | null>(null)
  const [feeItems, setFeeItems] = useState<FeeItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedFees, setSelectedFees] = useState<string[]>([])
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.studentId) {
          const fees = await getStudentFees(user.studentId)
          setFeesData(fees)
          setFeeItems(fees.feeItems || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const filteredFees = feeItems.filter(
    (fee) =>
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const mandatoryFeesDue = feeItems
    .filter((fee) => fee.type === "Mandatory" && fee.balance > 0)
    .reduce((sum, fee) => sum + fee.balance, 0)

  const totalPaid = feeItems.reduce((sum, fee) => sum + fee.paid, 0)
  const totalPaymentsMade = feeItems.filter((fee) => fee.paid > 0).length

  const handleFeeSelection = (feeId: string, checked: boolean) => {
    if (checked) {
      setSelectedFees([...selectedFees, feeId])
    } else {
      setSelectedFees(selectedFees.filter((id) => id !== feeId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-20 bg-blue-900"></div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                <Link href="/">
                  <Button variant="ghost" className="text-white hover:bg-blue-800 px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Portal Home</span>
                    </div>
                  </Button>
                </Link>
                <Button className="bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>My Fees</span>
                  </div>
                </Button>
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

      {/* Breadcrumb */}
      <div className="bg-blue-900 text-white pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-300 hover:text-white">
              Fees Portal
            </Link>
            <span className="text-blue-300">{">"}</span>
            <span>My Fees</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">My Fees</h1>
          <p className="text-blue-200 mt-1">View and manage your university fees</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-6 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Wallet Balance */}
          <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Wallet</h3>
                  <h3 className="text-sm font-medium text-gray-600">Balance</h3>
                </div>
                <div className="w-16 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">¢0</div>
            </CardContent>
          </Card>

          {/* Mandatory Fees Due */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Mandatory Fees</h3>
                  <h3 className="text-sm font-medium text-gray-600">Due</h3>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">¢{mandatoryFeesDue}</div>
              <div className="text-sm text-orange-500 mt-1">
                {feeItems.filter((fee) => fee.type === "Mandatory" && fee.balance > 0).length} Fee(s) left
              </div>
            </CardContent>
          </Card>

          {/* Amount Paid */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Amount paid</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900">¢{totalPaid}</div>
            </CardContent>
          </Card>

          {/* Total Payments Made */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Payment</h3>
                  <h3 className="text-sm font-medium text-gray-600">Made</h3>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalPaymentsMade}</div>
            </CardContent>
          </Card>
        </div>

        {/* Fees Section */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Fees</h2>
              <div className="flex items-center space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Request for service
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search fees"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Fees Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">FEE</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">FEE TYPE</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">BILL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">PAID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">BALANCE</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">PAYMENT AMOUNT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedFees.includes(fee.id)}
                            onCheckedChange={(checked) => handleFeeSelection(fee.id, checked as boolean)}
                          />
                          <span className="text-gray-600 text-sm">{fee.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={fee.type === "Mandatory" ? "default" : "secondary"}
                          className={
                            fee.type === "Mandatory" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {fee.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">¢{fee.bill}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">¢{fee.paid}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">¢{fee.balance}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">¢ {fee.paymentAmount || 0}</td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={fee.status === "Paid" ? "default" : "destructive"}
                          className={fee.status === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {fee.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredFees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No fees found matching your search</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FeesPage() {
  return (
    <ProtectedRoute>
      <FeesContent />
    </ProtectedRoute>
  )
}
