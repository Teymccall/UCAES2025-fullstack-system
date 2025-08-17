"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  FileText,
  AlertCircle,
  ShoppingCart,
  CreditCard
} from "lucide-react"
import { getStudentServiceRequests } from "@/lib/services"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import ServicePayment from "./service-payment"

interface ServiceRequest {
  id: string
  studentId: string
  studentName: string
  services: Array<{
    serviceId: string
    serviceName: string
    quantity: number
    amount: number
    total: number
  }>
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requestDate: string
  processedBy?: string
  processedDate?: string
  notes?: string
}

export default function ServiceRequestDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    if (user?.studentId) {
      fetchServiceRequests()
    }
  }, [user?.studentId])

  const fetchServiceRequests = async () => {
    try {
      setLoading(true)
      console.log('🔍 Dashboard: Starting to fetch service requests for student:', user?.studentId)
      
      if (!user?.studentId) {
        console.warn('⚠️ Dashboard: No student ID available')
        setServiceRequests([])
        return
      }
      
      const requests = await getStudentServiceRequests(user.studentId)
      console.log('🔍 Dashboard: Received requests:', requests)
      
      setServiceRequests(requests)
    } catch (error) {
      console.error('❌ Dashboard: Error fetching service requests:', error)
      toast({
        title: "Error",
        description: "Failed to fetch service requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredRequests = serviceRequests.filter(request => {
    if (activeTab === "all") return true
    return request.status === activeTab
  })

  const handlePayForService = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowPayment(true)
  }

  const handlePaymentComplete = () => {
    // Refresh the service requests to show updated status
    fetchServiceRequests()
    setShowPayment(false)
    setSelectedRequest(null)
    
    toast({
      title: "Payment Complete",
      description: "Your service request has been marked as paid!",
    })
  }

  const handleClosePayment = () => {
    setShowPayment(false)
    setSelectedRequest(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading service requests...</div>
        </CardContent>
      </Card>
    )
  }

  // Show payment component if a service is selected for payment
  if (showPayment && selectedRequest) {
    return (
      <ServicePayment
        serviceRequest={selectedRequest}
        onPaymentComplete={handlePaymentComplete}
        onClose={handleClosePayment}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Service Requests
        </CardTitle>
        <CardDescription>
          Track your service requests and make payments for approved services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>User ID: {user?.studentId || 'Not logged in'}</p>
          <p>Total Requests: {serviceRequests.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Active Tab: {activeTab}</p>
          <p>Filtered Requests: {filteredRequests.length}</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({serviceRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({serviceRequests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({serviceRequests.filter(r => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({serviceRequests.filter(r => r.status === 'rejected').length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({serviceRequests.filter(r => r.status === 'paid').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No service requests found</p>
                <p className="text-sm">
                  {activeTab === "all" 
                    ? "You haven't made any service requests yet" 
                    : `No ${activeTab} service requests`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Requested: {new Date(request.requestDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {request.services && Array.isArray(request.services) ? (
                              request.services.map((service, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">
                                    {service.serviceName} (Qty: {service.quantity})
                                  </span>
                                  <span className="font-medium">¢{service.total.toLocaleString()}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-600">
                                Service: {request.serviceName || 'Unknown Service'}
                              </div>
                            )}
                          </div>
                          
                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Notes:</strong> {request.notes}
                            </p>
                          )}
                          
                          {request.processedBy && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Processed by:</strong> {request.processedBy}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ¢{request.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Total Amount</div>
                          </div>
                          
                          {request.status === 'approved' && (
                            <Button 
                              onClick={() => handlePayForService(request)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                          
                          {request.status === 'rejected' && (
                            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              Request rejected
                            </div>
                          )}

                          {request.status === 'paid' && (
                            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Payment completed
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
