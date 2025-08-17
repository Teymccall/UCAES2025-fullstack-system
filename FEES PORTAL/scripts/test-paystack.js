// Test script for Paystack integration
// Run this to verify your Paystack setup

const testPaystackIntegration = async () => {
  console.log('🧪 Testing Paystack Integration...\n')

  try {
    // Test 1: Check if environment variables are loaded
    console.log('1️⃣ Checking environment variables...')
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    
    if (!publicKey || publicKey.includes('your_public_key_here')) {
      console.log('❌ Public key not configured properly')
      console.log('   Create a .env.local file with your Paystack keys')
      return
    }
    
    if (!secretKey || secretKey.includes('your_secret_key_here')) {
      console.log('❌ Secret key not configured properly')
      console.log('   Create a .env.local file with your Paystack keys')
      return
    }
    
    console.log('✅ Environment variables loaded successfully')
    console.log(`   Public Key: ${publicKey.substring(0, 20)}...`)
    console.log(`   Secret Key: ${secretKey.substring(0, 20)}...\n`)

    // Test 2: Test Paystack API connectivity
    console.log('2️⃣ Testing Paystack API connectivity...')
    const testResponse = await fetch('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (testResponse.ok) {
      console.log('✅ Paystack API is accessible')
      const banks = await testResponse.json()
      console.log(`   Available banks: ${banks.data?.length || 0} banks found\n`)
    } else {
      console.log('❌ Paystack API is not accessible')
      console.log(`   Status: ${testResponse.status}`)
      return
    }

    // Test 3: Test payment initialization endpoint
    console.log('3️⃣ Testing payment initialization endpoint...')
    const testPaymentData = {
      amount: 5000, // 50.00 GHS in pesewas
      email: 'test@example.com',
      reference: `TEST-${Date.now()}`,
      callbackUrl: 'http://localhost:3000/payment/callback',
      metadata: {
        studentId: 'TEST123',
        studentName: 'Test Student',
        paymentType: 'card',
        services: ['Test Fee'],
        academicYear: '2024/2025',
        semester: 'Test Semester'
      }
    }

    const initResponse = await fetch('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData),
    })

    if (initResponse.ok) {
      const initResult = await initResponse.json()
      if (initResult.success) {
        console.log('✅ Payment initialization endpoint working')
        console.log(`   Reference: ${initResult.data.reference}`)
        console.log(`   Authorization URL: ${initResult.data.authorization_url.substring(0, 50)}...\n`)
      } else {
        console.log('❌ Payment initialization failed')
        console.log(`   Error: ${initResult.message}`)
      }
    } else {
      console.log('❌ Payment initialization endpoint not accessible')
      console.log(`   Status: ${initResponse.status}`)
      console.log('   Make sure your development server is running')
    }

    console.log('🎉 Paystack integration test completed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Start your development server: npm run dev')
    console.log('   2. Navigate to the fees payment page')
    console.log('   3. Click "Pay with Paystack"')
    console.log('   4. Use test card: 4084 0840 8408 4081')
    console.log('   5. Complete the payment flow')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check if your .env.local file exists')
    console.log('   2. Verify your Paystack API keys')
    console.log('   3. Ensure your development server is running')
    console.log('   4. Check the console for detailed error messages')
  }
}

// Run the test
testPaystackIntegration()

