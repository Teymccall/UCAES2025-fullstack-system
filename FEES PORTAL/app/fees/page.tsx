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
  Settings
} from "lucide-react"
import ServiceRequest from "@/components/student/fees/service-request"
import ServiceRequestDashboard from "@/components/student/fees/service-request-dashboard"
import InlinePaymentForm from "@/components/student/fees/inline-payment-form"
import CurrentSemesterFees from "@/components/student/fees/current-semester-fees"
import PortalHeader from "@/components/shared/portal-header"
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
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedServices, setSelectedServices] = useState<any[]>([])

  useEffect(() => {
    if (user?.studentId) {
      fetchFees()
    }
  }, [user?.studentId])

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
        paymentAmount: 0,
        status: item.status,
        dueDate: item.dueDate,
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
      <PortalHeader />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Fees & Services</h1>
          <p className="text-gray-600 mt-2">Manage your academic fees and request additional services</p>
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fees">Current Fees</TabsTrigger>
            <TabsTrigger value="services">Request Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="payment">Make Payment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <CurrentSemesterFees fees={fees} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab("services")}
                  className="h-20 text-left p-4 justify-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-semibold">Request Services</div>
                      <div className="text-sm text-gray-600">Request additional academic services</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab("payment")}
                  className="h-20 text-left p-4 justify-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="font-semibold">Make Payment</div>
                      <div className="text-sm text-gray-600">Pay fees using your wallet or card</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Fees Tab */}
          <TabsContent value="fees">
            <CurrentSemesterFees fees={fees} />
          </TabsContent>

          {/* Request Services Tab */}
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

          {/* Make Payment Tab */}
          <TabsContent value="payment">
            <InlinePaymentForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
