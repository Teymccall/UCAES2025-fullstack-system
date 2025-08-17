"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Plus
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PaymentStatusTracker } from "./payment-status-tracker"
import type { PaymentRecord, PaymentAnalytics } from "@/lib/types"

interface PaymentDashboardProps {
  payments: PaymentRecord[]
  analytics: PaymentAnalytics
  onCreatePayment?: () => void
  onViewReceipt?: (paymentId: string) => void
  onRetryPayment?: (paymentId: string) => void
}

export function PaymentDashboard({ 
  payments, 
  analytics, 
  onCreatePayment,
  onViewReceipt,
  onRetryPayment 
}: PaymentDashboardProps) {
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filteredPayments, setFilteredPayments] = useState(payments)

  useEffect(() => {
    let filtered = payments
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(payment => payment.status === filterStatus)
    }
    
    setFilteredPayments(filtered)
  }, [payments, searchTerm, filterStatus])

  const getStatusCounts = () => {
    return {
      total: payments.length,
      pending: payments.filter(p => p.status === "submitted" || p.status === "under_review").length,
      verified: payments.filter(p => p.status === "verified").length,
      rejected: payments.filter(p => p.status === "rejected").length,
      draft: payments.filter(p => p.status === "draft").length
    }
  }

  const statusCounts = getStatusCounts()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-full p-1.5 sm:p-2 bg-green-100">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(analytics.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-full p-1.5 sm:p-2 bg-red-100">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(analytics.totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-full p-1.5 sm:p-2 bg-blue-100">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-lg sm:text-2xl font-bold">{analytics.paymentsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-full p-1.5 sm:p-2 bg-yellow-100">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Processing</p>
                <p className="text-lg sm:text-2xl font-bold">{analytics.averagePaymentTime}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <CardTitle className="text-base sm:text-lg">Payment History</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track and manage all your payment submissions</CardDescription>
            </div>
            {onCreatePayment && (
              <Button onClick={onCreatePayment} size="sm" className="w-full sm:w-auto">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-xs sm:text-sm">New Payment</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="space-y-3 sm:space-y-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
                  <TabsTrigger value="all" className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                    All ({statusCounts.total})
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Draft</span> ({statusCounts.draft})
                  </TabsTrigger>
                  <TabsTrigger value="submitted" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Pending</span> ({statusCounts.pending})
                  </TabsTrigger>
                  <TabsTrigger value="verified" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Verified</span> ({statusCounts.verified})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Rejected</span> ({statusCounts.rejected})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 w-full sm:w-64 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment List */}
            <TabsContent value={filterStatus} className="space-y-3 sm:space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                  <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-4">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "You haven't made any payments yet"}
                  </p>
                  {onCreatePayment && !searchTerm && filterStatus === "all" && (
                    <Button onClick={onCreatePayment} size="sm" className="text-xs sm:text-sm">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Make Your First Payment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <PaymentStatusTracker
                      key={payment.id}
                      payment={payment}
                      onViewReceipt={() => onViewReceipt?.(payment.id)}
                      onRetryPayment={() => onRetryPayment?.(payment.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}