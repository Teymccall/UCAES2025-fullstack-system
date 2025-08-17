'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { getCurrentSemesterFees, shouldDisplayCurrentFees } from '@/lib/academic-period-service'
import { useAuth } from '@/lib/auth-context'

interface CurrentSemesterFeesProps {
  programmeType: 'regular' | 'weekend'
  level: number
  onPayNow?: () => void
}

export default function CurrentSemesterFees({ 
  programmeType, 
  level, 
  onPayNow 
}: CurrentSemesterFeesProps) {
  const { user } = useAuth()
  const [semesterFees, setSemesterFees] = useState<any>(null)
  const [shouldDisplay, setShouldDisplay] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCurrentSemesterFees() {
      if (!user?.studentId) return

      try {
        setLoading(true)
        setError(null)

        // Check if we should display current fees
        const displayFees = await shouldDisplayCurrentFees(programmeType)
        setShouldDisplay(displayFees)

        if (displayFees) {
          // Get current semester fees
          const fees = await getCurrentSemesterFees(user.studentId, programmeType, level)
          setSemesterFees(fees)
          
          console.log('📊 Current semester fees loaded:', fees)
        }
      } catch (err) {
        console.error('❌ Error fetching current semester fees:', err)
        setError('Failed to load current semester fees')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentSemesterFees()
  }, [user?.studentId, programmeType, level])

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

  if (!shouldDisplay || !semesterFees) {
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
    new Date(semesterFees.dueDate).getTime() - new Date().getTime() < (7 * 24 * 60 * 60 * 1000) // 7 days

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
        {/* Fee Amount */}
        <div className="text-center py-4 bg-white rounded-lg border">
          <p className="text-sm text-gray-600 mb-1">
            {semesterFees.balance > 0 ? 'Amount Due' : 'Semester Fees'}
          </p>
          <p className="text-3xl font-bold text-gray-900">
            ¢{(semesterFees.balance > 0 ? semesterFees.balance : semesterFees.currentSemesterFees).toLocaleString()}
          </p>
          {semesterFees.paidAmount > 0 && (
            <div className="mt-2 text-sm">
              <p className="text-green-600">Paid: ¢{semesterFees.paidAmount.toLocaleString()}</p>
              {semesterFees.balance > 0 && (
                <p className="text-gray-600">of ¢{semesterFees.currentSemesterFees.toLocaleString()} total</p>
              )}
            </div>
          )}
        </div>

        {/* Due Date Information */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${
              isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-xs text-gray-600">
                {new Date(semesterFees.dueDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {semesterFees.status === 'Paid' ? (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              PAID
            </Badge>
          ) : isOverdue ? (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              OVERDUE
            </Badge>
          ) : isDueSoon ? (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
              <Clock className="h-3 w-3 mr-1" />
              DUE SOON
            </Badge>
          ) : (
            <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              ON TIME
            </Badge>
          )}
        </div>

        {/* Payment Status Alert */}
        {semesterFees.status === 'Paid' ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Payment Complete!</strong> You have successfully paid this semester's fees. 
              Thank you for your timely payment.
            </AlertDescription>
          </Alert>
        ) : isOverdue ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Payment Overdue!</strong> This fee was due on {' '}
              {new Date(semesterFees.dueDate).toLocaleDateString('en-GB')}. 
              Please make payment immediately to avoid penalties.
            </AlertDescription>
          </Alert>
        ) : isDueSoon ? (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Payment Due Soon!</strong> This fee is due in less than 7 days. 
              Pay now to avoid late penalties.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Action Button */}
        {semesterFees.status !== 'Paid' && (
          <Button 
            onClick={onPayNow}
            className={`w-full ${
              isOverdue ? 'bg-red-600 hover:bg-red-700' : 
              isDueSoon ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-green-600 hover:bg-green-700'
            }`}
            size="lg"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Pay {semesterFees.semesterName} {semesterFees.balance > 0 ? 'Balance' : 'Fees'} Now
          </Button>
        )}

        {/* Additional Info */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            This amount is automatically determined by the current academic semester 
            set by Academic Affairs for {programmeType} students.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
