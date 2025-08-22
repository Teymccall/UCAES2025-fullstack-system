import React, { useEffect, useState } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { paystackService } from '../../utils/paystackService';
import { CheckCircle, Warning, Loop } from '@mui/icons-material';

interface PaymentVerificationProps {
  reference: string;
  onVerificationComplete?: (success: boolean) => void;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({ 
  reference, 
  onVerificationComplete 
}) => {
  const { applicationData, updatePaymentStatus } = useApplication();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      setStatus('verifying');
      setError('');

      const verification = await paystackService.verifyPayment(reference);
      
      if (paystackService.isPaymentSuccessful(verification)) {
        setStatus('success');
        updatePaymentStatus('paid');
        
        // Save payment record to Firebase
        const paymentRecord = paystackService.createPaymentRecord(
          verification, 
          applicationData.id
        );
        
        if (paymentRecord) {
          // Here you would typically save to Firebase
          console.log('Payment record:', paymentRecord);
        }
        
        if (onVerificationComplete) {
          onVerificationComplete(true);
        }
      } else {
        setStatus('failed');
        updatePaymentStatus('failed');
        setError('Payment verification failed');
        
        if (onVerificationComplete) {
          onVerificationComplete(false);
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setError('Error verifying payment');
      
      if (onVerificationComplete) {
        onVerificationComplete(false);
      }
    }
  };

  const handleRetry = () => {
    verifyPayment();
  };

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loop className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Verifying Payment...
        </h3>
        <p className="text-gray-600">
          Please wait while we confirm your payment
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Payment Confirmed!
        </h3>
        <p className="text-gray-600 text-center">
          Your payment has been successfully processed. You can now proceed with your application.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Reference: {reference}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Warning className="h-12 w-12 text-red-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Payment Verification Failed
      </h3>
      <p className="text-gray-600 text-center mb-4">
        {error || 'We could not verify your payment. Please try again or contact support.'}
      </p>
      <div className="mt-4 text-sm text-gray-500">
        Reference: {reference}
      </div>
      <button
        onClick={handleRetry}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Retry Verification
      </button>
    </div>
  );
};

export default PaymentVerification;