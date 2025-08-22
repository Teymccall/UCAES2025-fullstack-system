"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Wallet,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { paystackService } from "@/lib/paystack-service"
import { walletService } from "@/lib/wallet-service"
import Link from "next/link"

export default function WalletCallback() {
  const searchParams = useSearchParams()
  const [depositStatus, setDepositStatus] = useState<'pending' | 'success' | 'failed' | 'verifying'>('pending')
  const [depositData, setDepositData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const reference = searchParams.get('reference')
  const status = searchParams.get('status')
  const amount = searchParams.get('amount')

  useEffect(() => {
    console.log(`🔄 CALLBACK useEffect triggered`);
    console.log(`   Reference: ${reference}`);
    console.log(`   Loading: ${loading}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    // Prevent multiple executions of the same deposit
    if (!reference || loading === false) {
      console.log(`⏭️ Skipping execution: ${!reference ? 'No reference' : 'Loading already false'}`);
      return;
    }

    // CRITICAL: Add a flag to prevent multiple executions
    let isProcessing = false;
    
    console.log(`✅ Proceeding with deposit verification`);
    
    const verifyDeposit = async () => {
      // Prevent multiple simultaneous executions
      if (isProcessing) {
        console.log(`🚨 ALREADY PROCESSING: Skipping duplicate execution`);
        return;
      }
      
      isProcessing = true;
      
      if (!reference) {
        setDepositStatus('failed')
        setLoading(false)
        isProcessing = false;
        return
      }

      try {
        setDepositStatus('verifying')
        
        // Verify payment with Paystack
        const verification = await paystackService.verifyPayment(reference)
        
        if (verification.success && verification.data) {
          // Process the deposit to wallet
          try {
            console.log('Processing wallet deposit with data:', {
              reference,
              amount: verification.data.amount,
              metadata: verification.data.metadata
            });

            const studentId = verification.data.metadata?.studentId
            if (!studentId) {
              console.error('Student ID missing from metadata:', verification.data.metadata);
              throw new Error('Student ID not found in payment metadata')
            }

            console.log(`Processing deposit for student: ${studentId}`);

            // 🚨 CRITICAL: SINGLE SOURCE OF TRUTH FOR WALLET DEPOSITS
            // This is the ONLY place where wallet deposits are processed
            // Webhook processing is disabled to prevent duplicate transactions
            // DO NOT call this function from anywhere else!
            console.log(`🚀 CALLING WALLET SERVICE - SINGLE SOURCE OF TRUTH`);
            console.log(`   Student ID: ${studentId}`);
            console.log(`   Reference: ${reference}`);
            console.log(`   Amount: ¢${(verification.data.amount || 0) / 100}`);
            console.log(`   Timestamp: ${new Date().toISOString()}`);
            
            const result = await walletService.processPaystackPayment(
              studentId,
              reference,
              verification.data
            )

            console.log('Wallet deposit processed successfully:', result);

            setDepositStatus('success')
            setDepositData(verification.data)
            
            toast({
              title: "Deposit Successful!",
              description: `¢${(verification.data.amount / 100).toLocaleString()} has been added to your wallet`,
            })
          } catch (walletError) {
            console.error('Wallet processing error:', walletError)
            console.error('Error details:', {
              message: walletError.message,
              stack: walletError.stack,
              reference,
              studentId: verification.data.metadata?.studentId
            });
            setDepositStatus('failed')
            toast({
              title: "Wallet Processing Error",
              description: "Payment verified but failed to add to wallet. Please contact support.",
              variant: "destructive"
            })
          }
        } else {
          setDepositStatus('failed')
          toast({
            title: "Payment Verification Failed",
            description: verification.error || "Unable to verify payment status",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setDepositStatus('failed')
        toast({
          title: "Verification Error",
          description: "An error occurred while verifying your payment",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
        isProcessing = false;
      }
    }

    verifyDeposit()
  }, [reference, loading]) // Add loading dependency to prevent multiple executions

  const getStatusIcon = () => {
    switch (depositStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />
      case 'verifying':
        return <Clock className="w-16 h-16 text-blue-600 animate-pulse" />
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-600" />
    }
  }

  const getStatusTitle = () => {
    switch (depositStatus) {
      case 'success':
        return 'Deposit Successful!'
      case 'failed':
        return 'Deposit Failed'
      case 'verifying':
        return 'Verifying Deposit...'
      default:
        return 'Deposit Pending'
    }
  }

  const getStatusDescription = () => {
    switch (depositStatus) {
      case 'success':
        return 'Your money has been successfully added to your wallet and is ready to use for fee payments.'
      case 'failed':
        return 'There was an issue processing your deposit. Please try again or contact support.'
      case 'verifying':
        return 'We are verifying your deposit with our payment processor. This may take a few moments.'
      default:
        return 'Your deposit is being processed. Please wait while we confirm the transaction.'
    }
  }

  const getStatusColor = () => {
    switch (depositStatus) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'verifying':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Processing Deposit...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your deposit</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/wallet" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallet
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Deposit Status</h1>
        </div>

        {/* Deposit Status Card */}
        <Card className={`${getStatusColor()} mb-6`}>
          <CardContent className="p-8 text-center">
            {getStatusIcon()}
            <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              {getStatusTitle()}
            </h2>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              {getStatusDescription()}
            </p>

            {/* Deposit Details */}
            {depositData && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Deposit Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{depositData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">¢{(depositData.amount / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{depositData.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {depositData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(depositData.paid_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {depositStatus === 'success' && (
                <>
                  <Link href="/wallet" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Wallet className="w-4 h-4 mr-2" />
                      View Wallet Balance
                    </Button>
                  </Link>
                  <Link href="/fees" className="block">
                    <Button variant="outline" className="w-full">
                      Pay Fees with Wallet
                    </Button>
                  </Link>
                </>
              )}
              
              {depositStatus === 'failed' && (
                <>
                  <Link href="/wallet" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/wallet" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Wallet
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/dashboard" className="block">
                <Button variant="ghost" className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {depositStatus === 'success' && (
              <>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Money Added to Wallet</p>
                    <p className="text-sm text-green-700">Your deposit has been added to your wallet balance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Ready to Use</p>
                    <p className="text-sm text-green-700">You can now use your wallet balance to pay for fees</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Instant Payments</p>
                    <p className="text-sm text-green-700">Pay fees instantly without additional payment processing</p>
                  </div>
                </div>
              </>
            )}
            
            {depositStatus === 'failed' && (
              <>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Deposit Not Processed</p>
                    <p className="text-sm text-red-700">Your deposit was not completed successfully</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">No Charges Made</p>
                    <p className="text-sm text-red-700">No money was deducted from your account</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Try Again</p>
                    <p className="text-sm text-red-700">You can attempt the deposit again or contact support</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
