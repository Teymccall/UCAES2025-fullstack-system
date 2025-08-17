"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Download, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from "lucide-react"
import { walletService } from "@/lib/wallet-service"
import type { WalletTransaction } from "@/lib/models/wallet"

interface WalletTransactionHistoryProps {
  studentId: string
  transactions: WalletTransaction[]
  onRefresh: () => void
}

export function WalletTransactionHistory({
  studentId,
  transactions,
  onRefresh
}: WalletTransactionHistoryProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<WalletTransaction[]>(transactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, filterType])

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
      )
    }

    setFilteredTransactions(filtered)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'withdrawal':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      case 'payment':
      case 'fee_deduction':
        return <DollarSign className="w-4 h-4 text-blue-600" />
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'withdrawal':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'payment':
      case 'fee_deduction':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'refund':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
      ...filteredTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.type.replace('_', ' '),
        t.description,
        `¢${t.amount / 100}`,
        t.status,
        t.reference
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await onRefresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportTransactions}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'deposit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('deposit')}
              >
                Deposits
              </Button>
              <Button
                variant={filterType === 'fee_deduction' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('fee_deduction')}
              >
                Payments
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions found</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Make your first deposit to get started'
                }
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{transaction.description}</p>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                        <span className="font-mono text-xs">{transaction.reference}</span>
                      </div>
                      {transaction.paystackData && (
                        <div className="text-xs text-gray-400 mt-1">
                          Via {transaction.paystackData.channel} • {transaction.paystackData.gateway_response}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}¢{transaction.amount / 100}
                    </p>
                    <Badge className={`text-xs ${getTransactionColor(transaction.type)}`}>
                      {transaction.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
              <span>
                Total: ¢{filteredTransactions.reduce((sum, t) => 
                  t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0
                ) / 100}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

