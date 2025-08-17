import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useApplication } from '../../contexts/ApplicationContext';
import { CreditCard, Smartphone, DollarSign, CheckCircle, AlertCircle, Loader2, Shield, Clock } from 'lucide-react';
import { paystackService } from '../../utils/paystackService';

interface PaymentStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

const EnhancedPaymentForm: React.FC = () => {
  const { 
    applicationData, 
    updatePaymentStatus, 
    setCurrentStep, 
    submitApplication,
    savePaymentDetails 
  } = useApplication();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | ''>('');
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirm' | 'processing' | 'success' | 'error'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const applicationFee = 200; // GHS 200

  // Payment steps for progress tracking
  const [steps, setSteps] = useState<PaymentStep[]>([
    { id: 1, title: 'Select Method', description: 'Choose payment option', completed: false, active: true },
    { id: 2, title: 'Confirm Details', description: 'Review payment information', completed: false, active: false },
    { id: 3, title: 'Complete Payment', description: 'Process your payment', completed: false, active: false },
    { id: 4, title: 'Payment Success', description: 'Payment confirmed', completed: false, active: false },
  ]);

  // Validate application data before payment
  const validatePaymentData = (): string[] => {
    const errors: string[] = [];
    
    if (!applicationData.contactInfo?.email) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationData.contactInfo.email)) {
      errors.push('Please provide a valid email address');
    }

    if (!applicationData.personalInfo?.firstName || !applicationData.personalInfo?.lastName) {
      errors.push('Full name is required');
    }

    if (!applicationData.id) {
      errors.push('Application ID is missing. Please complete previous steps');
    }

    if (!applicationData.programSelection?.program) {
      errors.push('Program selection is required');
    }

    return errors;
  };

  // Enhanced Paystack configuration
  const getPaystackConfig = () => {
    const reference = paystackService.generateReference();
    setPaymentReference(reference);

    return {
      reference,
      email: applicationData.contactInfo?.email?.trim() || '',
      amount: paystackService.convertToPesewas(applicationFee),
      publicKey: paystackService.publicKey,
      currency: 'GHS',
      channels: paymentMethod === 'mobile_money' 
        ? ['mobile_money'] 
        : ['card', 'bank', 'ussd', 'qr', 'bank_transfer'],
      metadata: {
        custom_fields: [
          {
            display_name: 'Application ID',
            variable_name: 'application_id',
            value: applicationData.id || 'N/A'
          },
          {
            display_name: 'Applicant Name',
            variable_name: 'applicant_name',
            value: `${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}`.trim()
          },
          {
            display_name: 'Program',
            variable_name: 'program',
            value: applicationData.programSelection?.program || 'N/A'
          },
          {
            display_name: 'Study Level',
            variable_name: 'study_level',
            value: applicationData.programSelection?.studyLevel || 'N/A'
          }
        ]
      },
      // Enhanced configuration for better UX
      style: {
        theme: {
          colors: {
            primary: '#059669',
            secondary: '#065f46'
          }
        }
      }
    };
  };

  const initializePayment = usePaystackPayment(getPaystackConfig());

  // Update steps progress
  const updateSteps = (currentStep: number) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      active: step.id === currentStep,
      completed: step.id < currentStep
    })));
  };

  const handlePaymentMethodSelect = (method: 'card' | 'mobile_money') => {
    const errors = validatePaymentData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setPaymentMethod(method);
    setPaymentStep('confirm');
    updateSteps(2);
    setValidationErrors([]);
  };

  const handleProceedToPayment = () => {
    setPaymentStep('processing');
    updateSteps(3);
    processPayment();
  };

  const processPayment = async () => {
    const errors = validatePaymentData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setPaymentStep('select');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const config = getPaystackConfig();
      
      initializePayment({
        ...config,
        onSuccess: async (response: any) => {
          try {
            // Verify payment with backend
            const verification = await paystackService.verifyPayment(response.reference);
            
            if (paystackService.isPaymentSuccessful(verification)) {
              // Save payment details to Firebase
              const paymentDetails = {
                transactionId: response.reference,
                reference: response.reference,
                amount: applicationFee,
                currency: 'GHS',
                paymentMethod: paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Card Payment',
                paidAt: new Date().toISOString(),
                status: 'success',
                customerEmail: applicationData.contactInfo?.email || '',
                customerName: `${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}`.trim()
              };

              await savePaymentDetails(paymentDetails);
              updatePaymentStatus('paid');
              setPaymentStep('success');
              updateSteps(4);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setErrorMessage('Payment verification failed. Please contact support.');
            setPaymentStep('error');
            updatePaymentStatus('failed');
          } finally {
            setIsProcessing(false);
          }
        },
        onClose: () => {
          console.log('Payment window closed by user');
          setIsProcessing(false);
          setPaymentStep('select');
          updateSteps(1);
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      setErrorMessage('Failed to initialize payment. Please try again.');
      setPaymentStep('error');
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentStep('select');
    setErrorMessage('');
    setValidationErrors([]);
    updateSteps(1);
  };

  const handleSubmitApplication = () => {
    submitApplication();
    setCurrentStep(7);
  };

  const handlePrevious = () => {
    setCurrentStep(5);
  };

  // Payment method icons
  const PaymentMethodCard = ({ method, icon, title, description, selected }: {
    method: 'card' | 'mobile_money';
    icon: React.ReactNode;
    title: string;
    description: string;
    selected: boolean;
  }) => (
    <div
      className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-green-600 bg-green-50 shadow-lg'
          : 'border-gray-200 hover:border-green-400 hover:shadow-md'
      }`}
      onClick={() => handlePaymentMethodSelect(method)}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
      )}
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${selected ? 'bg-green-100' : 'bg-gray-100'}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  // Progress indicator
  const ProgressSteps = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.completed
                    ? 'bg-green-600 text-white'
                    : step.active
                    ? 'bg-green-600 text-white ring-4 ring-green-200'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.completed ? <CheckCircle className="h-5 w-5" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-full h-1 mx-2 ${step.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render different views based on payment step
  const renderPaymentView = () => {
    switch (paymentStep) {
      case 'select':
        return (
          <div>
            <ProgressSteps />
            
            {validationErrors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <h3 className="text-sm font-medium text-red-800">Please fix the following issues:</h3>
                </div>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PaymentMethodCard
                    method="mobile_money"
                    icon={<Smartphone className="h-6 w-6 text-green-600" />}
                    title="Mobile Money"
                    description="MTN, Vodafone, AirtelTigo"
                    selected={paymentMethod === 'mobile_money'}
                  />
                  <PaymentMethodCard
                    method="card"
                    icon={<CreditCard className="h-6 w-6 text-green-600" />}
                    title="Card Payment"
                    description="Visa, Mastercard, Verve"
                    selected={paymentMethod === 'card'}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment information is encrypted and secure. We use Paystack for all transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div>
            <ProgressSteps />
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Payment Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Address:</span>
                    <span className="font-medium text-gray-900">{applicationData.personalInfo?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium text-gray-900">
                      {applicationData.personalInfo?.firstName} {applicationData.personalInfo?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Program:</span>
                    <span className="font-medium text-gray-900">{applicationData.program?.program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">
                      {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Card Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">GHS {applicationFee}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• This payment is non-refundable</li>
                      <li>• Ensure your email address is correct for payment confirmation</li>
                      {paymentMethod === 'mobile_money' && (
                        <li>• Use test mobile number: <strong>0242000000</strong> for testing</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStep('select');
                    updateSteps(1);
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-green-600 mx-auto animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please complete the payment in the secure window...</p>
            <div className="mt-4">
              <button
                onClick={() => {
                  setPaymentStep('select');
                  setIsProcessing(false);
                  updateSteps(1);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel and go back
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div>
            <ProgressSteps />
            
            <div className="text-center py-8">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your application fee has been paid successfully. You can now submit your application.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-6">
                <h4 className="font-semibold text-green-900 mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Reference:</span>
                    <span className="font-medium text-green-900">{paymentReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount Paid:</span>
                    <span className="font-medium text-green-900">GHS {applicationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Method:</span>
                    <span className="font-medium text-green-900">
                      {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Card Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Date:</span>
                    <span className="font-medium text-green-900">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSubmitApplication}
                  className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-20 w-20 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRetryPayment}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={handlePrevious}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back to Application
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-8">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Payment</h2>
            <p className="text-gray-600">Complete your application fee payment to finalize your application</p>
          </div>
        </div>

        <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Application Fee</h3>
              <p className="text-gray-600 mt-1">One-time non-refundable payment</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">GHS {applicationFee}</div>
              <div className="text-sm text-gray-500">Ghana Cedis</div>
            </div>
          </div>
        </div>

        {renderPaymentView()}
      </div>
    </div>
  );
};

export default EnhancedPaymentForm;