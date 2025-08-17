import { NextRequest, NextResponse } from 'next/server'
import { paystackConfig } from '@/lib/paystack-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Reference is required' },
        { status: 400 }
      )
    }

    // Call Paystack API to verify payment
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      console.error('Paystack verification error:', errorData)
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to verify payment' },
        { status: paystackResponse.status }
      )
    }

    const paystackData = await paystackResponse.json()

    if (paystackData.status && paystackData.data) {
      const paymentData = paystackData.data
      
      // Log verification result
      console.log('Payment verification result:', {
        reference: reference,
        status: paymentData.status,
        amount: paymentData.amount,
        gateway_response: paymentData.gateway_response
      })

      // If payment is successful, update student's payment record
      if (paymentData.status === 'success') {
        try {
          // TODO: Update student's payment record in database
          // This is where you would update the student's fees balance
          console.log('Payment successful, updating student record...')
          
          // Example database update (replace with your actual database logic)
          // await updateStudentPaymentRecord({
          //   studentId: paymentData.metadata?.studentId,
          //   reference: reference,
          //   amount: paymentData.amount / 100, // Convert from pesewas
          //   status: 'completed',
          //   timestamp: new Date(),
          //   paystackData: paymentData
          // })
          
        } catch (dbError) {
          console.error('Database update error:', dbError)
          // Don't fail the verification if database update fails
          // Payment is still verified with Paystack
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: paymentData
      })
    } else {
      throw new Error('Invalid response from Paystack')
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

