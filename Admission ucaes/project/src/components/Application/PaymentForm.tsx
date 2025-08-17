import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { CreditCard, Smartphone, DollarSign, CheckCircle, Loader2 } from 'lucide-react';

const PaymentForm: React.FC = () => {
  const { applicationData, updatePaymentStatus, setCurrentStep, submitApplication, initializePaystackPayment, refreshApplicationData } = useApplication();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(applicationData.paymentStatus === 'paid');
  const [error, setError] = useState('');

  const applicationFee = 200; // GHS 200

  useEffect(() => {
    // Check if payment is already complete
    if (applicationData.paymentStatus === 'paid') {
      setPaymentComplete(true);
    }
  }, [applicationData.paymentStatus]);

  // Debug: Log all available data
  useEffect(() => {
    console.log('🔍 PaymentForm: Component loaded with data:', {
      personalInfo: applicationData.personalInfo,
      contactInfo: applicationData.contactInfo,
      academicBackground: applicationData.academicBackground,
      programSelection: applicationData.programSelection,
      paymentStatus: applicationData.paymentStatus,
      id: applicationData.id,
      applicationId: applicationData.applicationId
    });
    
    console.log('🔍 Validation check:', {
      hasFirstName: !!applicationData.personalInfo?.firstName,
      hasLastName: !!applicationData.personalInfo?.lastName,
      hasEmail: !!applicationData.contactInfo?.email,
      hasPhone: !!applicationData.contactInfo?.phone,
      firstName: applicationData.personalInfo?.firstName,
      lastName: applicationData.personalInfo?.lastName,
      email: applicationData.contactInfo?.email,
      phone: applicationData.contactInfo?.phone
    });
  }, [applicationData]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    // Validate email before proceeding
    if (!applicationData.contactInfo?.email) {
      setError('Please provide a valid email address in your contact information');
      return;
    }

    if (!applicationData.personalInfo?.firstName || !applicationData.personalInfo?.lastName) {
      setError('Please complete your personal information first');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      console.log('🚀 Starting payment for application flow...');
      console.log('📧 Email:', applicationData.contactInfo.email);
      console.log('👤 Name:', `${applicationData.personalInfo.firstName} ${applicationData.personalInfo.lastName}`);
      console.log('💳 Payment method:', paymentMethod);
      
      // Use the updated payment function from ApplicationContext
      await initializePaystackPayment();
      
      // The initialize function will redirect to Paystack, so we won't reach this point
      // unless there's an error
      
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleSubmitApplication = () => {
    submitApplication();
    setCurrentStep(7);
  };

  const handlePrevious = () => {
    setCurrentStep(5);
  };

  if (paymentComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your application fee has been paid successfully. You can now submit your application.
            </p>
            
            {applicationData.paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900">Payment Reference:</span>
                  <span className="text-sm text-green-800">{applicationData.paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-green-900">Amount Paid:</span>
                  <span className="text-sm text-green-800">GHS {(applicationData.paymentDetails.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-green-900">Payment Method:</span>
                  <span className="text-sm text-green-800">{applicationData.paymentDetails.paymentMethod}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Previous
              </button>
              <button
                onClick={handleSubmitApplication}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Application Payment</h2>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-medium text-red-800 mb-2">Payment Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Application Fee</h3>
              <p className="text-sm text-blue-800">
                One-time payment to process your application
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">GHS {applicationFee}</div>
              <div className="text-sm text-blue-800">Non-refundable</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Select Payment Method</h3>
          
          {/* Debug Panel - Always visible */}
          <div className="bg-gray-100 border border-gray-300 rounded-md p-4">
            <h4 className="font-medium text-gray-900 mb-2">🔧 Debug Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Personal Info:</strong></p>
                <p>• First Name: <span className={applicationData.personalInfo?.firstName ? 'text-green-600' : 'text-red-600'}>{applicationData.personalInfo?.firstName || 'Missing'}</span></p>
                <p>• Last Name: <span className={applicationData.personalInfo?.lastName ? 'text-green-600' : 'text-red-600'}>{applicationData.personalInfo?.lastName || 'Missing'}</span></p>
                <p>• Date of Birth: <span className={applicationData.personalInfo?.dateOfBirth ? 'text-green-600' : 'text-red-600'}>{applicationData.personalInfo?.dateOfBirth || 'Missing'}</span></p>
              </div>
              <div>
                <p><strong>Contact Info:</strong></p>
                <p>• Email: <span className={applicationData.contactInfo?.email ? 'text-green-600' : 'text-red-600'}>{applicationData.contactInfo?.email || 'Missing'}</span></p>
                <p>• Phone: <span className={applicationData.contactInfo?.phone ? 'text-green-600' : 'text-red-600'}>{applicationData.contactInfo?.phone || 'Missing'}</span></p>
                <p>• Address: <span className={applicationData.contactInfo?.address ? 'text-green-600' : 'text-red-600'}>{applicationData.contactInfo?.address || 'Missing'}</span></p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p><strong>Application ID:</strong> {applicationData.id || applicationData.applicationId || 'Not set'}</p>
              <p><strong>Payment Status:</strong> {applicationData.paymentStatus || 'Not set'}</p>
            </div>
            
            {/* Test button to check data */}
            <button
              onClick={() => {
                console.log('🧪 Manual data check:', applicationData);
                alert(`Data Check:\nFirst Name: ${applicationData.personalInfo?.firstName || 'Missing'}\nLast Name: ${applicationData.personalInfo?.lastName || 'Missing'}\nEmail: ${applicationData.contactInfo?.email || 'Missing'}\nPhone: ${applicationData.contactInfo?.phone || 'Missing'}`);
              }}
              className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              🧪 Test: Check Available Data
            </button>
            
            {/* Force refresh page button */}
            <button
              onClick={() => {
                console.log('🔄 Force refreshing application data...');
                window.location.reload();
              }}
              className="mt-2 w-full bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
            >
              🔄 Force Refresh Page
            </button>
            
            {/* Refresh data from Firebase */}
            <button
              onClick={async () => {
                console.log('🔄 Refreshing application data from Firebase...');
                try {
                  await refreshApplicationData();
                  console.log('✅ Data refreshed from Firebase');
                } catch (error) {
                  console.error('❌ Error refreshing data:', error);
                }
              }}
              className="mt-2 w-full bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
            >
              🔄 Refresh Data from Firebase
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'mobile'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onClick={() => setPaymentMethod('mobile')}
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Mobile Money</h4>
                  <p className="text-sm text-gray-600">MTN, Vodafone, AirtelTigo</p>
                </div>
              </div>
            </div>

            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'card'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Card Payment</h4>
                  <p className="text-sm text-gray-600">Visa, Mastercard, Verve</p>
                </div>
              </div>
            </div>
          </div>

          {paymentMethod && (
            <div className="mt-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Ensure your email address is correct: <strong>{applicationData.contactInfo?.email || 'Not provided'}</strong></li>
                  <li>• Amount: <strong>GHS {applicationFee}</strong> (GHS {applicationFee * 100} pesewas)</li>
                  <li>• Payment is non-refundable</li>
                  {paymentMethod === 'mobile' && (
                    <li>• Use test mobile number: <strong>0242000000</strong> for testing</li>
                  )}
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !applicationData.contactInfo?.email}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Processing...
                    </>
                  ) : (
                    `Pay GHS ${applicationFee}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Always visible Previous button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          ← Go Back to Documents
        </button>
        <p className="text-sm text-gray-600 mt-2">
          You need to complete your Personal Information first before making payment.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;