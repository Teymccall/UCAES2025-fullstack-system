"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, LogOut, Search, Calendar, DollarSign, FileText, Download } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import Image from "next/image"
import { getStudentTransactions } from "@/lib/firebase"
import { TransactionReceipt } from "@/components/student/fees/transaction-receipt"
import type { PaymentRecord } from "@/lib/types"

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
  source?: 'regular' | 'wallet'
  services?: string[]
}

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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
  }, [transactions, searchTerm, statusFilter])

  const fetchTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log('📊 Fetching transaction history for student:', user.studentId)
      
      // Get real transaction data from Firebase
      const realTransactions = await getStudentTransactions(user.studentId)
      
      // Only show real transactions from Firebase
      setTransactions(realTransactions)
      console.log('✅ Real transaction history loaded:', realTransactions.length, 'transactions')
      
      if (realTransactions.length === 0) {
        console.log('ℹ️ No payment transactions found for student')
      }
      
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTotalAmountByStatus = (status: string) => {
    return filteredTransactions
      .filter(txn => txn.status === status)
      .reduce((sum, txn) => sum + txn.amount, 0)
  }

  const handlePrintTransactions = () => {
    window.print()
  }

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Reference', 'Method', 'Amount', 'Status'],
      ...filteredTransactions.map(txn => [
        formatDate(txn.transactionDate),
        txn.description,
        txn.referenceNumber,
        txn.paymentMethod,
        txn.amount,
        txn.status
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 space-y-3 sm:space-y-0 min-h-[64px] sm:h-16">
            <div className="flex items-center w-full sm:w-auto">
              <Image
                src="/logo.png"
                alt="UCAES Logo"
                width={32}
                height={32}
                className="mr-2 sm:mr-3 sm:w-[40px] sm:h-[40px]"
              />
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold">UCAES Fees Portal</h1>
                <p className="text-blue-200 text-xs sm:text-sm">Transaction History</p>
              </div>
              
              {/* Mobile Back Button */}
              <Button
                variant="ghost" 
                onClick={() => router.push('/')}
                className="text-white hover:bg-blue-600 sm:hidden p-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto space-x-2 sm:space-x-4">
              {/* Desktop Back Button */}
              <Button
                variant="ghost" 
                onClick={() => router.push('/')}
                className="text-white hover:bg-blue-600 hidden sm:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="text-xs sm:text-sm">
                  <p className="font-medium max-w-[120px] sm:max-w-none truncate">{user?.name}</p>
                  <p className="text-blue-200">{user?.studentId}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-white hover:bg-blue-600 p-1 sm:p-2"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

              {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Transaction History</h2>
            <p className="text-sm sm:text-base text-gray-600">View and manage your payment transaction records</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Verified Payments</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">¢{getTotalAmountByStatus('verified').toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Pending Payments</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">¢{getTotalAmountByStatus('pending').toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Total Transactions</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Filter Transactions</CardTitle>
                  <CardDescription className="text-sm">Search and filter your payment history</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button onClick={handlePrintTransactions} size="sm" className="w-full sm:w-auto">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
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
                <>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4">
                    {filteredTransactions.map((transaction) => (
                      <Card key={transaction.id} className="p-4 border border-gray-200">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{transaction.description}</div>
                          {transaction.services && transaction.services.length > 0 && (
                            <div className="text-xs text-blue-600 font-medium">
                              Services: {transaction.services.join(', ')}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">{transaction.academicYear} - {transaction.semester}</div>
                            </div>
                            <Badge className={`${getStatusColor(transaction.status)} text-xs`}>
                              {transaction.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <div className="font-medium">{formatDate(transaction.transactionDate)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <div className="font-bold text-green-600">¢{transaction.amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Method:</span>
                              <div className="font-medium">{transaction.paymentMethod}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Reference:</span>
                              <div>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{transaction.referenceNumber}</code>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-3 border-t border-gray-100">
                            <TransactionReceipt 
                              payment={transaction as PaymentRecord}
                              onPrint={() => console.log('Receipt printed for', transaction.id)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{formatDate(transaction.transactionDate)}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{transaction.description}</div>
                                {transaction.services && transaction.services.length > 0 && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Services: {transaction.services.join(', ')}
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {transaction.category === 'service_payment' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      Service Payment
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Fee Payment
                                    </span>
                                  )}
                                  {' • '}{transaction.academicYear} - {transaction.semester}
                                </div>
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
                                {transaction.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <TransactionReceipt 
                                payment={transaction as PaymentRecord}
                                onPrint={() => console.log('Receipt printed for', transaction.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
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
