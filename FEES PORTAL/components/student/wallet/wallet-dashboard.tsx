"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Wallet, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { walletService } from "@/lib/wallet-service"
import type { WalletSummary, WalletTransaction } from "@/lib/models/wallet"
import { WalletDepositForm } from "./wallet-deposit-form"
import { WalletTransactionHistory } from "./wallet-transaction-history"

interface WalletDashboardProps {
  studentId: string
  studentName: string
  studentEmail: string
}

export default function WalletDashboard({ 
  studentId, 
  studentName, 
  studentEmail 
}: WalletDashboardProps) {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    if (studentId) {
      fetchWalletData()
    }
  }, [studentId])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [summary, transactionHistory] = await Promise.all([
        walletService.getWalletSummary(studentId),
        walletService.getWalletTransactions(studentId, 20)
      ])
      
      setWalletSummary(summary)
      setTransactions(transactionHistory)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDepositSuccess = () => {
    setShowDepositForm(false)
    fetchWalletData() // Refresh data
    toast({
      title: "Success",
      description: "Deposit initiated successfully",
    })
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ¢{(walletSummary?.currentBalance || 0) / 100}
            </div>
            <p className="text-xs text-green-700">
              Available for payments
            </p>
          </CardContent>
        </Card>

        {/* Total Deposits */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              ¢{(walletSummary?.totalDeposits || 0) / 100}
            </div>
            <p className="text-xs text-blue-700">
              All time deposits
            </p>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ¢{(walletSummary?.totalPayments || 0) / 100}
            </div>
            <p className="text-xs text-purple-700">
              Fees paid from wallet
            </p>
          </CardContent>
        </Card>

        {/* Last Transaction */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Last Transaction</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">
              {walletSummary?.lastTransactionDate 
                ? new Date(walletSummary.lastTransactionDate).toLocaleDateString()
                : 'No transactions'
              }
            </div>
            <p className="text-xs text-gray-700">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Actions</span>
            <Button
              onClick={() => setShowDepositForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Money to Wallet
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Wallet Balance</h3>
              <p className="text-sm text-gray-600">
                Use your wallet balance to pay for fees instantly
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Pay Fees</h3>
              <p className="text-sm text-gray-600">
                Pay fees directly from your wallet balance
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Download className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Transaction History</h3>
              <p className="text-sm text-gray-600">
                View all your wallet transactions and payments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Recent Transactions</TabsTrigger>
          <TabsTrigger value="history">Full History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Make your first deposit to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'}¢{transaction.amount / 100}
                        </p>
                        <Badge className={`text-xs ${getTransactionColor(transaction.type)}`}>
                          {transaction.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <WalletTransactionHistory 
            studentId={studentId}
            transactions={transactions}
            onRefresh={fetchWalletData}
          />
        </TabsContent>
      </Tabs>

      {/* Deposit Form Modal */}
      {showDepositForm && (
        <WalletDepositForm
          studentId={studentId}
          studentName={studentName}
          studentEmail={studentEmail}
          onSuccess={handleDepositSuccess}
          onCancel={() => setShowDepositForm(false)}
        />
      )}
    </div>
  )
}

