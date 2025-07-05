"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Banknote, Download, FileSpreadsheet, Filter, MoreVertical, Printer, Search, Upload } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getAllPayments, updatePaymentStatus, getFeeStatistics, processBulkPayments } from "@/lib/firebase-services"
import type { Payment, FeeStats } from "@/lib/types"
import { toast } from "sonner"

export default function FeesManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [feeStats, setFeeStats] = useState<FeeStats>({
    totalCollected: 0,
    pendingVerification: 0,
    overdueAccounts: 0,
    categoryBreakdown: {
      tuition: 0,
      hostel: 0,
      library: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch payments and statistics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch payments
        const paymentsData = await getAllPayments()
        setPayments(paymentsData)
        
        // Fetch statistics
        const stats = await getFeeStatistics()
        setFeeStats(stats)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load payment data")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Filter payments based on status, category, and search query
  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus
    const matchesCategory = filterCategory === "all" || payment.category.toLowerCase() === filterCategory.toLowerCase()
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesCategory && matchesSearch
  })

  // Handle payment verification
  const handleVerify = async (paymentId: string) => {
    try {
      await updatePaymentStatus(paymentId, "verified", "Admin User")
      
      // Update local state
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: "verified", verifiedBy: "Admin User", verifiedAt: new Date().toISOString() } 
            : payment
        )
      )
      
      // Refresh statistics
      const stats = await getFeeStatistics()
      setFeeStats(stats)
      
      toast.success("Payment verified successfully")
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast.error("Failed to verify payment")
    } finally {
      setShowVerificationDialog(false)
    }
  }

  // Handle payment rejection
  const handleReject = async (paymentId: string) => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection")
      return
    }
    
    try {
      await updatePaymentStatus(paymentId, "rejected", undefined, rejectionReason)
      
      // Update local state
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: "rejected", rejectionReason } 
            : payment
        )
      )
      
      toast.success("Payment rejected successfully")
    } catch (error) {
      console.error("Error rejecting payment:", error)
      toast.error("Failed to reject payment")
    } finally {
      setRejectionReason("")
      setShowRejectionDialog(false)
    }
  }

  // Handle bulk upload
  const handleBulkUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const formData = new FormData(event.currentTarget)
    const file = formData.get('csv-upload') as File
    const defaultStatus = formData.get('default-status') as string
    
    if (!file || file.size === 0) {
      toast.error("Please select a CSV file")
      return
    }
    
    try {
      // Read the CSV file
      const text = await file.text()
      const rows = text.split('\n').filter(row => row.trim())
      
      const payments = rows.map(row => {
        const [studentId, category, amountStr, method, date] = row.split(',')
        return {
          studentId: studentId.trim(),
          category: category.trim(),
          amount: parseFloat(amountStr.trim()),
          method: method.trim(),
          date: date.trim()
        }
      })
      
      // Process the payments
      const result = await processBulkPayments(
        payments, 
        (defaultStatus === "verified" ? "verified" : "pending") as any
      )
      
      // Show result
      if (result.successful > 0) {
        toast.success(`Successfully processed ${result.successful} payments`)
        
        // Refresh data
        const paymentsData = await getAllPayments()
        setPayments(paymentsData)
        
        const stats = await getFeeStatistics()
        setFeeStats(stats)
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to process ${result.failed} payments`)
        console.error("Errors:", result.errors)
      }
    } catch (error) {
      console.error("Error processing bulk upload:", error)
      toast.error("Failed to process bulk upload")
    }
  }

  // Chart data
  const chartData = [
    { name: 'Tuition', amount: feeStats.categoryBreakdown.tuition },
    { name: 'Hostel', amount: feeStats.categoryBreakdown.hostel },
    { name: 'Library', amount: feeStats.categoryBreakdown.library },
    { name: 'Other', amount: feeStats.categoryBreakdown.other || 0 },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600">Verified</Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
        <p className="text-gray-600">Manage student payments, verifications, and fee reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <Banknote className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">GH₵ {feeStats.totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Academic Year 2024/2025</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Filter className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">GH₵ {feeStats.pendingVerification.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{feeStats.overdueAccounts}</div>
            <p className="text-xs text-muted-foreground">Students with outstanding balances</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verification" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verification">Payment Verification</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="reminders">Send Reminders</TabsTrigger>
        </TabsList>

        {/* Payment Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tuition">Tuition</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Index Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount (GH₵)</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.studentName}</TableCell>
                    <TableCell>{payment.studentId}</TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowVerificationDialog(true)
                            }}
                            disabled={payment.status === "verified"}
                          >
                            Verify Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowRejectionDialog(true)
                            }}
                            disabled={payment.status === "rejected"}
                          >
                            Reject Payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <Download className="mr-2 h-4 w-4" />
                              Download Receipt
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fee Collection by Category</CardTitle>
                <CardDescription>Breakdown of fees collected by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `GH₵ ${value}`} />
                      <Legend />
                      <Bar dataKey="amount" fill="#15803d" name="Amount (GH₵)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>Export fee collection data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select defaultValue="total-by-programme">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total-by-programme">Total Fees by Programme</SelectItem>
                      <SelectItem value="overdue-accounts">Overdue Accounts</SelectItem>
                      <SelectItem value="category-breakdown">Category Breakdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select defaultValue="2024-2025">
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024/2025</SelectItem>
                      <SelectItem value="2023-2024">2023/2024</SelectItem>
                      <SelectItem value="2022-2023">2022/2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button variant="secondary" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Payments</CardTitle>
              <CardDescription>Upload CSV file with payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag and drop your CSV file here, or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">Format: studentId,category,amount,method,date</p>
                <Input type="file" className="hidden" accept=".csv" id="csv-upload" />
                <Button variant="outline" className="mt-4" onClick={() => document.getElementById('csv-upload').click()}>
                  Select File
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Default Payment Status</Label>
                <Select defaultValue="verified">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload and Process
              </Button>

              <div className="text-xs text-gray-500">
                <p className="font-semibold">Template Format:</p>
                <p>AG/2021/001234,Tuition,2000,Bank Transfer,2025-05-20</p>
                <p>AG/2021/001235,Hostel,1000,Mobile Money,2025-05-19</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Payment Reminders</CardTitle>
              <CardDescription>Notify students about upcoming or overdue payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Students</Label>
                <Select defaultValue="overdue">
                  <SelectTrigger>
                    <SelectValue placeholder="Select target students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="overdue">Students with Overdue Payments</SelectItem>
                    <SelectItem value="programme">By Programme</SelectItem>
                    <SelectItem value="level">By Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reminder Title</Label>
                <Input placeholder="e.g., Tuition Fee Payment Reminder" defaultValue="Tuition Fee Payment Reminder" />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  placeholder="Enter reminder message..." 
                  className="min-h-[100px]"
                  defaultValue="Dear Student, this is a reminder that your tuition fees for the 2024/2025 academic year are due by June 1, 2025. Please ensure prompt payment to avoid any penalties. Thank you."
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" defaultValue="2025-06-01" />
              </div>

              <Button className="w-full">
                Send Reminders
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Confirmation Dialog */}
      {selectedPayment && (
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Payment</DialogTitle>
              <DialogDescription>
                Are you sure you want to verify this payment? This action will update the student's account balance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Student:</p>
                  <p className="text-sm text-gray-500">{selectedPayment.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Index Number:</p>
                  <p className="text-sm text-gray-500">{selectedPayment.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category:</p>
                  <p className="text-sm text-gray-500">{selectedPayment.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount:</p>
                  <p className="text-sm text-gray-500">GH₵ {selectedPayment.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>Cancel</Button>
              <Button onClick={() => handleVerify(selectedPayment.id)}>Verify Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {selectedPayment && (
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this payment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Student:</p>
                  <p className="text-sm text-gray-500">{selectedPayment.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Index Number:</p>
                  <p className="text-sm text-gray-500">{selectedPayment.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category:</p>
                  <p className="text-sm text-gray-500">{selectedPayment.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount:</p>
                  <p className="text-sm text-gray-500">GH₵ {selectedPayment.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Enter reason for rejection..." 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleReject(selectedPayment.id)}>Reject Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 