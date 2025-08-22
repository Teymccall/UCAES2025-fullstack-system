"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  FileText, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ShoppingCart,
  ArrowLeft,
  Settings,
  Wallet,
  GraduationCap,
  Receipt
} from "lucide-react"
import Link from "next/link"
import ServiceRequest from "@/components/student/fees/service-request"
import ServiceRequestDashboard from "@/components/student/fees/service-request-dashboard"

import { CurrentSemesterFees } from "@/components/student/fees/current-semester-fees"
import WalletBalanceCard from "@/components/student/fees/wallet-balance-card"
import { StudentInvoices } from "@/components/student-invoices"
import { ScholarshipSummary } from "@/components/scholarship-summary"

import { useAuth } from "@/lib/auth-context"

interface FeeItem {
  id: string
  name: string
  type: 'Mandatory' | 'Service' | 'Optional'
  bill: number
  paid: number
  balance: number
  paymentAmount: number
  status: 'Paid' | 'Not Paid' | 'Partial' | 'Pending'
  dueDate?: string
  description?: string
}

export default function FeesPage() {
  const { user } = useAuth()
  const [fees, setFees] = useState<FeeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("fees")
  const [selectedServices, setSelectedServices] = useState<any[]>([])

  useEffect(() => {
    if (user?.studentId) {
      fetchFees()
    }
  }, [user?.studentId])

  const handlePaymentAmountChange = (feeId: string, amount: string) => {
    const newFees = fees.map(fee => {
      if (fee.id === feeId) {
        return { ...fee, paymentAmount: parseFloat(amount) || 0 }
      }
      return fee
    })
    setFees(newFees)
  }


  const handleServicesSelected = (services: any[]) => {
    setSelectedServices(services)
  }

  const handleRequestSubmitted = () => {
    // Refresh the service requests dashboard
    setActiveTab("requests")
  }

  const fetchFees = async () => {
    try {
      setLoading(true)
      
      if (!user?.studentId) {
        console.warn('No student ID available for fee fetching')
        setFees([])
        return
      }

      // Use real fee calculation system
      const { getStudentFees } = await import('@/lib/firebase')
      const feesData = await getStudentFees(user.studentId)
      
      console.log('📊 Real fees data fetched:', feesData)
      
      // Convert feesData to FeeItem format for the UI
      const feeItems: FeeItem[] = feesData.feeItems?.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        bill: item.bill,
        paid: item.paid,
        balance: item.balance,
        paymentAmount: 0, // Initialize paymentAmount
        status: item.status,
  dueDate: (item as any).dueDate,
        description: `${item.type} fee for academic purposes`
      })) || []
      
      setFees(feeItems)
      } catch (error) {
      console.error('Error fetching fees:', error)
      } finally {
        setLoading(false)
      }
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Not Paid':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const totalBill = fees.reduce((sum, fee) => sum + fee.bill, 0)
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paid, 0)
  const totalBalance = fees.reduce((sum, fee) => sum + fee.balance, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Wallet Balance */}
        <div className="mb-6">
          <WalletBalanceCard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bill</p>
                  <p className="text-2xl font-bold text-gray-900">¢{totalBill.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">¢{totalPaid.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-600">¢{totalBalance.toLocaleString()}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fees">Current Fees</TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Scholarships
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="services">Request Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>



          {/* Current Fees Tab */}
          <TabsContent value="fees" className="space-y-6">
            {user?.programmeType && user?.level ? (
              <CurrentSemesterFees 
                programmeType={user.programmeType}
                level={user.level}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p>Loading student information...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <ScholarshipSummary />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <StudentInvoices />
          </TabsContent>

          {/* Service Request Tab */}
          <TabsContent value="services">
            <ServiceRequest 
              onServicesSelected={handleServicesSelected}
              onRequestSubmitted={handleRequestSubmitted}
            />
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests">
            <ServiceRequestDashboard />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
