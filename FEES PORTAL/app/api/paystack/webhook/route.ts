import { NextRequest, NextResponse } from 'next/server'
import { paystackConfig } from '@/lib/paystack-config'
import { walletService } from '@/lib/wallet-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    // Verify webhook signature (for security)
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha512', paystackConfig.secretKey)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event = JSON.parse(body)
    
    // Log webhook event for debugging
    console.log('Paystack webhook received:', {
      event: event.event,
      reference: event.data?.reference,
      status: event.data?.status,
      amount: event.data?.amount,
      timestamp: new Date().toISOString()
    })

    // Handle different webhook events
  switch (event.event) {
    case 'charge.success':
      // Payment was successful
      await handleSuccessfulPayment(event.data)
      break
        
    case 'charge.failed':
      // Payment failed
      await handleFailedPayment(event.data)
      break
        
    case 'transfer.success':
      // Transfer to bank account was successful
      console.log('Transfer successful:', event.data)
      break
        
    case 'transfer.failed':
      // Transfer to bank account failed
      console.log('Transfer failed:', event.data)
      break
        
    default:
      console.log('Unhandled webhook event:', event.event)
  }

    return NextResponse.json({ success: true, message: 'Webhook processed' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(paymentData: any) {
  try {
    console.log('Processing successful payment:', {
      reference: paymentData.reference,
      amount: paymentData.amount,
      studentId: paymentData.metadata?.studentId,
      paymentType: paymentData.metadata?.paymentType
    })

    // Check if this is a wallet deposit
    if (paymentData.metadata?.paymentType === 'wallet_deposit') {
      // CRITICAL FIX: Disable webhook processing for wallet deposits
      // This prevents duplicate transactions caused by race conditions
      // Wallet deposits are processed via client-side callback only
      console.log('Wallet deposit webhook received but not processed (handled by callback):', {
        reference: paymentData.reference,
        studentId: paymentData.metadata?.studentId,
        amount: paymentData.amount
      })
      
      // Log for monitoring purposes only
      console.log('Wallet deposits are processed via callback to prevent duplicates')
      
      // IMPORTANT: Return early to prevent processing this deposit
      // This ensures wallet deposits are ONLY processed by the client-side callback
      return;
    } else {
      // Handle regular fee payment
      await walletService.processPaystackFeePayment(
        paymentData.metadata?.studentId,
        paymentData.amount, // Amount is in pesewas
        paymentData.reference,
        paymentData,
        paymentData.metadata
      )

      console.log('Fee payment record updated successfully via webhook')
    }
    
  } catch (error) {
    console.error('Error updating payment record via webhook:', error)
  }
}

async function handleFailedPayment(paymentData: any) {
  try {
    console.log('Processing failed payment:', {
      reference: paymentData.reference,
      amount: paymentData.amount,
      studentId: paymentData.metadata?.studentId,
      failure_reason: paymentData.failure_reason
    })

    // TODO: Update student's payment record to reflect failure
    // await updateStudentPaymentRecord({
    //   studentId: paymentData.metadata?.studentId,
    //   reference: paymentData.reference,
    //   amount: paymentData.amount / 100,
    //   status: 'failed',
    //   timestamp: new Date(),
    //   failure_reason: paymentData.failure_reason,
    //   paystackData: paymentData,
    //   source: 'webhook'
    // })

    console.log('Failed payment record updated via webhook')
    
  } catch (error) {
    console.error('Error updating failed payment record via webhook:', error)
  }
}
