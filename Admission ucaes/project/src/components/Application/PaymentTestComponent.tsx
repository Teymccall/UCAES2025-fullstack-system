import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import EnhancedPaymentForm from './EnhancedPaymentForm';
import { paystackService } from '../../services/paystackService';

interface PaymentTestComponentProps {
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

const PaymentTestComponent: React.FC<PaymentTestComponentProps> = ({
  onPaymentSuccess,
  onPaymentError
}) => {
  const { 
    applicationData, 
    updatePaymentStatus, 
    savePaymentDetails,
    checkPaymentStatus 
  } = useApplication();

  const [testMode, setTestMode] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Test data for validation
  const testApplicationData = {
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '0242000000'
    },
    programSelection: {
      selectedProgram: 'Computer Science',
      selectedLevel: '100'
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runPaymentValidationTest = async () => {
    setTestResults([]);
    setPaymentStatus('testing');
    addTestResult('Starting payment validation tests...');

    try {
      // Test 1: Check Paystack configuration
      addTestResult('Testing Paystack configuration...');
      const publicKey = paystackService.publicKey;
      const secretKey = paystackService.secretKey;
      
      if (publicKey && publicKey.startsWith('pk_test')) {
        addTestResult('✅ Test mode public key configured correctly');
      } else if (publicKey && publicKey.startsWith('pk_live')) {
        addTestResult('⚠️ Live mode public key configured');
      } else {
        addTestResult('❌ Invalid or missing public key');
      }

      // Test 2: Validate application data
      addTestResult('Testing application data validation...');
      const requiredFields = [
        applicationData.personalInfo?.firstName,
        applicationData.personalInfo?.lastName,
        applicationData.personalInfo?.email,
        applicationData.programSelection?.selectedProgram,
        applicationData.programSelection?.selectedLevel
      ];

      const missingFields = requiredFields.filter(field => !field);
      if (missingFields.length === 0) {
        addTestResult('✅ All required fields are present');
      } else {
        addTestResult(`❌ Missing fields: ${missingFields.length}`);
      }

      // Test 3: Test email format
      const email = applicationData.personalInfo?.email;
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        addTestResult('✅ Email format is valid');
      } else {
        addTestResult('❌ Invalid email format');
      }

      // Test 4: Test amount calculation
      const amount = 200; // GHS 200
      const amountInPesewas = paystackService.convertToPesewas(amount);
      addTestResult(`✅ Amount conversion: GHS ${amount} = ${amountInPesewas} pesewas`);

      // Test 5: Test reference generation
      const reference = paystackService.generateReference('test-user');
      if (reference && reference.length > 10) {
        addTestResult(`✅ Reference generated: ${reference}`);
      } else {
        addTestResult('❌ Failed to generate reference');
      }

      // Test 6: Test payment initialization endpoint
      addTestResult('Testing payment initialization endpoint...');
      const testData = {
        applicantId: 'test-user-id',
        applicantName: `${testApplicationData.personalInfo.firstName} ${testApplicationData.personalInfo.lastName}`,
        applicantEmail: testApplicationData.personalInfo.email,
        applicantPhone: testApplicationData.personalInfo.phone,
        program: testApplicationData.programSelection.selectedProgram,
        level: testApplicationData.programSelection.selectedLevel
      };

      try {
        const response = await fetch('/api/admission-payment/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        });

        if (response.ok) {
          addTestResult('✅ Payment initialization endpoint accessible');
          try {
            const data = await response.json();
            addTestResult(`✅ Initialization response: ${JSON.stringify(data)}`);
          } catch (jsonError) {
            const textResponse = await response.text();
            addTestResult(`❌ Failed to parse JSON response: ${textResponse}`);
          }
        } else {
          let errorMessage = `Initialization failed: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage += ` - ${errorData.message || errorData.error || ''}`;
          } catch (jsonError) {
            const textResponse = await response.text();
            errorMessage += ` - ${textResponse}`;
          }
          addTestResult(`❌ ${errorMessage}`);
        }
      } catch (error) {
        addTestResult(`❌ Initialization endpoint error: ${error}`);
      }

      setPaymentStatus('success');
      addTestResult('🎉 All tests completed!');

    } catch (error) {
      setPaymentStatus('error');
      addTestResult(`❌ Test failed: ${error}`);
      if (onPaymentError) onPaymentError(error as string);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setPaymentStatus('idle');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment System Test Suite</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test Configuration</h3>
          <p className="text-sm text-blue-600">
            Mode: {testMode ? 'Test' : 'Live'} | Amount: GHS 200 | Test Phone: 0242000000
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={runPaymentValidationTest}
            disabled={paymentStatus === 'testing'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {paymentStatus === 'testing' ? 'Testing...' : 'Run Tests'}
          </button>
          
          <button
            onClick={resetTests}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        {paymentStatus === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ All Tests Passed!</h3>
            <p className="text-sm text-green-600">
              Your payment system is properly configured. You can now proceed with the enhanced payment form.
            </p>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-red-800 mb-2">❌ Tests Failed</h3>
            <p className="text-sm text-red-600">
              Please check the test results below and fix any issues before proceeding.
            </p>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Test Results</h3>
            <div className="max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-700 py-1 border-b border-gray-200 last:border-0">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Enhanced Payment Form</h3>
        <EnhancedPaymentForm 
          onPaymentSuccess={() => {
            addTestResult('✅ Payment completed successfully');
            if (onPaymentSuccess) onPaymentSuccess();
          }}
          onPaymentError={(error) => {
            addTestResult(`❌ Payment failed: ${error}`);
            if (onPaymentError) onPaymentError(error);
          }}
        />
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Quick Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Use test card: 4084084084084081 for successful payment</li>
          <li>• Use test phone: 0242000000 for mobile money testing</li>
          <li>• Ensure all application fields are completed before payment</li>
          <li>• Check browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTestComponent;