import { NextRequest, NextResponse } from 'next/server'
import { paystackConfig } from '@/lib/paystack-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Paystack initialization request received');
    
    const body = await request.json()
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    const { amount, email, reference, callbackUrl, channels, metadata } = body

    // Validate required fields
    if (!amount || !email || !reference) {
      console.log('❌ Missing required fields:', { amount, email, reference });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid email format. Please ensure you have a valid email address.' },
        { status: 400 }
      )
    }

    // Prepare Paystack request data
    const paystackRequestData = {
      amount: amount, // Amount in pesewas (already formatted)
      email: email,
      reference: reference,
      callback_url: callbackUrl,
      channels: channels || ['card', 'bank', 'mobile_money'], // Default to all channels
      metadata: metadata,
      currency: paystackConfig.currency,
    };
    
    console.log('📤 Paystack request data:', JSON.stringify(paystackRequestData, null, 2));
    console.log('🔑 Using secret key:', paystackConfig.secretKey.substring(0, 10) + '...');
    
    // Call Paystack API to initialize payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackRequestData),
    })

    console.log('📥 Paystack response status:', paystackResponse.status);
    
    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      console.error('❌ Paystack API error:', errorData)
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to initialize payment' },
        { status: paystackResponse.status }
      )
    }

    const paystackData = await paystackResponse.json()

    if (paystackData.status && paystackData.data) {
      // Log successful initialization
      console.log('Payment initialized successfully:', {
        reference: reference,
        amount: amount,
        email: email,
        authorizationUrl: paystackData.data.authorization_url
      })

      return NextResponse.json({
        success: true,
        message: 'Payment initialized successfully',
        data: paystackData.data
      })
    } else {
      throw new Error('Invalid response from Paystack')
    }

  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
