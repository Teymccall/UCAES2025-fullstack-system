"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  User, 
  LogOut, 
  Search, 
  Calendar,
  DollarSign,
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Clock
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getStudentTransactions } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface Transaction {
  id: string
  studentId: string
  amount: number
  category: string
  description: string
  status: 'pending' | 'verified' | 'approved' | 'rejected'
  paymentMethod: string
  transactionDate: string
  submittedAt: string
  verifiedAt?: string
  referenceNumber: string
  academicYear: string
  semester: string
}

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchTransactions()
  }, [user, router])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter, dateFilter])

  const fetchTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log('📊 Fetching transaction history for student:', user.studentId)
      
      // Get real transaction data from Firebase
      const realTransactions = await getStudentTransactions(user.studentId)
      
      // If no real transactions, show some mock data for demo
      const transactionsToShow = realTransactions.length > 0 ? realTransactions : [
        {
          id: "demo_001",
          studentId: user.studentId,
          amount: 1500,
          category: "tuition",
          description: "Tuition Fee Payment - Level 100 (Demo)",
          status: "verified",
          paymentMethod: "Mobile Money",
          transactionDate: "2024-12-15",
          submittedAt: "2024-12-15T10:30:00Z",
          verifiedAt: "2024-12-15T14:20:00Z",
          referenceNumber: "MM240001234",
          academicYear: "2024/2025",
          semester: "First Semester"
        },
        {
          id: "demo_002", 
          studentId: user.studentId,
          amount: 350,
          category: "facilities",
          description: "Facility Subsidy Fee (Demo)",
          status: "verified",
          paymentMethod: "Bank Transfer",
          transactionDate: "2024-12-10",
          submittedAt: "2024-12-10T09:15:00Z", 
          verifiedAt: "2024-12-11T11:30:00Z",
          referenceNumber: "BT240005678",
          academicYear: "2024/2025",
          semester: "First Semester"
        }
      ]

      setTransactions(transactionsToShow)
      console.log('✅ Transaction history loaded:', transactionsToShow.length, 'transactions')
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(txn => 
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(txn => txn.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "semester":
          filterDate.setMonth(now.getMonth() - 6)
          break
      }
      
      filtered = filtered.filter(txn => 
        new Date(txn.transactionDate) >= filterDate
      )
    }

    setFilteredTransactions(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
      case "approved":
        return "✅"
      case "pending":
        return "⏳"
      case "rejected":
        return "❌"
      default:
        return "❓"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalAmountByStatus = (status: string) => {
    return filteredTransactions
      .filter(txn => txn.status === status)
      .reduce((sum, txn) => sum + txn.amount, 0)
  }

  const handlePrintTransactions = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction History - ${user?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { width: 60px; height: 60px; margin: 0 auto 10px; }
          .student-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-item { text-align: center; }
          .transactions-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .transactions-table th, .transactions-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .transactions-table th { background-color: #1e40af; color: white; }
          .transactions-table tr:nth-child(even) { background-color: #f9fafb; }
          .status-verified { color: #16a34a; font-weight: bold; }
          .status-approved { color: #2563eb; font-weight: bold; }
          .status-pending { color: #d97706; font-weight: bold; }
          .status-rejected { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">📄</div>
          <h1>UCAES - University College of Applied and Environmental Sciences</h1>
          <h2>Student Transaction History</h2>
          <p>Generated on: ${new Date().toLocaleString('en-GB')}</p>
        </div>

        <div class="student-info">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> ${user?.name}</p>
          <p><strong>Student ID:</strong> ${user?.studentId}</p>
          <p><strong>Programme:</strong> ${user?.programme || 'N/A'}</p>
          <p><strong>Level:</strong> ${user?.currentLevel || 'N/A'}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h4>Total Verified</h4>
            <p>¢${getTotalAmountByStatus('verified').toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h4>Total Approved</h4>
            <p>¢${getTotalAmountByStatus('approved').toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h4>Total Pending</h4>
            <p>¢${getTotalAmountByStatus('pending').toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h4>Total Transactions</h4>
            <p>${filteredTransactions.length}</p>
          </div>
        </div>

        <table class="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map(txn => `
              <tr>
                <td>${formatDate(txn.transactionDate)}</td>
                <td>${txn.description}</td>
                <td>${txn.referenceNumber}</td>
                <td>${txn.paymentMethod}</td>
                <td>¢${txn.amount.toLocaleString()}</td>
                <td class="status-${txn.status}">${txn.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This is an official document generated from the UCAES Student Fees Portal</p>
          <p>For inquiries, contact the Finance Office</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Reference', 'Method', 'Amount', 'Status', 'Category'],
      ...filteredTransactions.map(txn => [
        formatDate(txn.transactionDate),
        txn.description,
        txn.referenceNumber,
        txn.paymentMethod,
        txn.amount,
        txn.status,
        txn.category
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${user?.studentId}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="UCAES Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <div>
                <h1 className="text-xl font-bold">UCAES Fees Portal</h1>
                <p className="text-blue-200 text-sm">Transaction History</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost" 
                onClick={() => router.push('/')}
                className="text-white hover:bg-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center space-x-3">
                {user?.passportPhotoUrl ? (
                  <Image
                    src={user.passportPhotoUrl}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-blue-300"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-blue-200">{user?.studentId}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-white hover:bg-blue-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h2>
          <p className="text-gray-600">View and manage your payment transaction records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Verified Payments</p>
                  <p className="text-2xl font-bold text-gray-900">¢{getTotalAmountByStatus('verified').toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved Payments</p>
                  <p className="text-2xl font-bold text-gray-900">¢{getTotalAmountByStatus('approved').toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">¢{getTotalAmountByStatus('pending').toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Filter Transactions</CardTitle>
                <CardDescription>Search and filter your payment history</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleDownloadCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
                <Button onClick={handlePrintTransactions}>
                  <FileText className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by description, reference, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="semester">This Semester</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{formatDate(transaction.transactionDate)}</div>
                            <div className="text-sm text-gray-500">{formatDateTime(transaction.submittedAt)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-500">{transaction.academicYear} - {transaction.semester}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{transaction.referenceNumber}</code>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900">¢{transaction.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusIcon(transaction.status)} {transaction.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  )
}
