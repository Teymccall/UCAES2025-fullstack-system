import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import EnhancedPaymentForm from './EnhancedPaymentForm';
import PaymentTestComponent from './PaymentTestComponent';

const PaymentSection: React.FC = () => {
  const { 
    applicationData, 
    updatePaymentStatus, 
    savePaymentDetails,
    checkPaymentStatus 
  } = useApplication();

  const [showTestMode, setShowTestMode] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'success'>('info');

  // Check if payment is already completed
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (applicationData.paymentDetails?.status === 'success') {
        setPaymentCompleted(true);
        setCurrentStep('success');
      }
    };
    checkExistingPayment();
  }, [applicationData.paymentDetails]);

  const isApplicationComplete = () => {
    return (
      applicationData.personalInfo?.firstName &&
      applicationData.personalInfo?.lastName &&
      applicationData.contactInfo?.email &&
      applicationData.programSelection?.program &&
      (applicationData.programSelection?.studyLevel || applicationData.programSelection?.level)
    );
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    await savePaymentDetails({
      ...paymentData,
      status: 'success',
      amount: 200,
      currency: 'GHS'
    });
    
    await updatePaymentStatus('paid');
    setPaymentCompleted(true);
    setCurrentStep('success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
  };

  if (!isApplicationComplete()) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Incomplete Application
          </h3>
          <p className="text-red-700 mb-4">
            Please complete all required sections before proceeding to payment:
          </p>
          <ul className="text-sm text-red-600 space-y-1">
            {!applicationData.personalInfo?.firstName && <li>• Personal Information (First Name)</li>}
            {!applicationData.personalInfo?.lastName && <li>• Personal Information (Last Name)</li>}
            {!applicationData.contactInfo?.email && <li>• Contact Information (Email)</li>}
            {!applicationData.programSelection?.program && <li>• Program Selection (Program)</li>}
            {!(applicationData.programSelection?.studyLevel || applicationData.programSelection?.level) && <li>• Program Selection (Study Level)</li>}
          </ul>
        </div>
      </div>
    );
  }

  if (showTestMode) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Payment Test Mode</h2>
          <button
            onClick={() => setShowTestMode(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Exit Test Mode
          </button>
        </div>
        <PaymentTestComponent />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold mb-2">Application Fee Payment</h1>
        <p className="text-blue-100">
          Complete your application by paying the one-time processing fee
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 'info' ? 'bg-blue-600 text-white' : 
              currentStep === 'payment' || currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Application Details</span>
          </div>
          
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-1 bg-blue-600 transition-all duration-300 ${
              currentStep === 'payment' || currentStep === 'success' ? 'w-full' : 'w-0'
            }`}></div>
          </div>

          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 'payment' ? 'bg-blue-600 text-white' : 
              currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>

          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-1 bg-blue-600 transition-all duration-300 ${
              currentStep === 'success' ? 'w-full' : 'w-0'
            }`}></div>
          </div>

          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-b-lg">
        {currentStep === 'info' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Applicant Information</h3>
                  <p className="text-sm text-gray-600">
                    Name: {applicationData.personalInfo?.firstName} {applicationData.personalInfo?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {applicationData.contactInfo?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {applicationData.contactInfo?.phone}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Program Details</h3>
                  <p className="text-sm text-gray-600">
                    Program: {applicationData.programSelection?.program}
                  </p>
                  <p className="text-sm text-gray-600">
                    Level: {applicationData.programSelection?.studyLevel}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Payment Details</h3>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-900">Application Fee</span>
                <span className="text-2xl font-bold text-blue-900">GHS 200.00</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                One-time, non-refundable processing fee
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('payment')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
              >
                Proceed to Payment
              </button>
              
              <button
                onClick={() => setShowTestMode(true)}
                className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Test Mode
              </button>
            </div>
          </div>
        )}

        {currentStep === 'payment' && !paymentCompleted && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
            <EnhancedPaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        )}

        {currentStep === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your application fee has been processed successfully.
            </p>
            
            {applicationData.paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Receipt</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Reference:</strong> {applicationData.paymentDetails.reference}</p>
                  <p><strong>Amount:</strong> GHS {applicationData.paymentDetails.amount}</p>
                  <p><strong>Date:</strong> {new Date(applicationData.paymentDetails.paidAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {applicationData.paymentDetails.status}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => window.location.href = '/application/submit'}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
            >
              Submit Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSection;