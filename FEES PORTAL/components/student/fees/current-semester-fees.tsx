'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { DollarSign, Calendar, Loader2, AlertTriangle } from 'lucide-react'
import { getCurrentSemesterFees } from '@/lib/academic-period-service'
import { walletService } from '@/lib/wallet-service'
import { useAuth } from '@/lib/auth-context'

interface CurrentSemesterFeesProps {
  programmeType: string
  level: number
}

export function CurrentSemesterFees({ programmeType, level }: CurrentSemesterFeesProps) {
  const [semesterFees, setSemesterFees] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchCurrentSemesterFees = async () => {
    if (!user?.studentId) return

    try {
      setLoading(true)
      setError(null)
      
      const fees = await getCurrentSemesterFees(
        user.studentId,
        programmeType,
        level
      )
      
      setSemesterFees(fees)
    } catch (error) {
      console.error('Error fetching semester fees:', error)
      setError('Failed to load current semester fees. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBalance = async () => {
    if (!user?.studentId) return
    
    try {
      const balance = await walletService.getWalletBalance(user.studentId)
      setWalletBalance(balance)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const handleDirectPayment = async () => {
    if (!semesterFees || semesterFees.balance <= 0 || !user?.studentId) return

    try {
      setProcessing(true)

      // Check if wallet has sufficient balance
      if (walletBalance < semesterFees.balance) {
        toast({
          title: "Insufficient Wallet Balance",
          description: `Your wallet balance (¢${walletBalance.toLocaleString()}) is less than the amount due (¢${semesterFees.balance.toLocaleString()})`,
          variant: "destructive"
        })
        setProcessing(false)
        return
      }

      const amount = semesterFees.balance
      const metadata = {
        semester: semesterFees.semesterName,
        paymentType: 'wallet',
        paymentTimestamp: Date.now(),
        transactionId: `fee-${user.studentId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }
      
      const description = `Fee payment for ${semesterFees.semesterName}`
      
      const success = await walletService.processFeePayment(
        user.studentId,
        amount,
        description,
        metadata
      )
      
      if (success) {
        toast({
          title: "Payment Successful!",
          description: `Payment of ¢${semesterFees.balance.toLocaleString()} has been processed from your wallet`,
        })
        
        setTimeout(() => {
          fetchCurrentSemesterFees()
          setTimeout(() => {
            fetchWalletBalance()
          }, 500)
        }, 1000)
      } else {
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error processing direct payment:', error)
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchCurrentSemesterFees()
  }, [user?.studentId, programmeType, level])
  
  useEffect(() => {
    if (user?.studentId) {
      fetchWalletBalance()
    }
  }, [user?.studentId])

  if (loading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">Loading current semester fees...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!semesterFees) {
    return (
      <Card className="border-l-4 border-l-gray-300">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">No Active Semester</p>
              <p className="text-xs text-gray-500">
                No fees are currently due for {programmeType} students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isOverdue = semesterFees.dueDate && new Date() > new Date(semesterFees.dueDate)
  const isDueSoon = semesterFees.dueDate && 
    new Date(semesterFees.dueDate).getTime() - new Date().getTime() < (7 * 24 * 60 * 60 * 1000)

  return (
    <Card className={`border-l-4 ${
      isOverdue ? 'border-l-red-500 bg-red-50' : 
      isDueSoon ? 'border-l-yellow-500 bg-yellow-50' : 
      'border-l-green-500 bg-green-50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current {semesterFees.semesterName} Fees
          </CardTitle>
          <Badge 
            variant={isOverdue ? "destructive" : isDueSoon ? "outline" : "default"}
            className="text-xs"
          >
            {programmeType.toUpperCase()} - Level {level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-gray-600 mb-1">
            {semesterFees.balance > 0 ? 'Amount Due' : 'Semester Fees'}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            ¢{(semesterFees.balance > 0 ? semesterFees.balance : semesterFees.currentSemesterFees).toLocaleString()}
          </p>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Paid:</span>
          <span className="font-medium text-green-600">¢{semesterFees.paidAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Balance:</span>
          <span className="font-medium text-red-600">¢{semesterFees.balance.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Due:</span>
          <span className="font-medium">
            {new Date(semesterFees.dueDate).toLocaleDateString('en-GB')}
          </span>
        </div>

        <div className="text-center">
          {semesterFees.status === 'Paid' ? (
            <Badge className="bg-green-100 text-green-800">PAID</Badge>
          ) : isOverdue ? (
            <Badge variant="destructive">OVERDUE</Badge>
          ) : isDueSoon ? (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700">DUE SOON</Badge>
          ) : (
            <Badge variant="default">PENDING</Badge>
          )}
        </div>

        {semesterFees.status !== 'Paid' && (
          <div className="space-y-2">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleDirectPayment}
              disabled={processing}
              size="sm"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
