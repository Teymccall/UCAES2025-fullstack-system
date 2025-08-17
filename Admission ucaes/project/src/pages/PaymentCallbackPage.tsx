import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApplication } from '../contexts/ApplicationContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPaystackPayment } = useApplication();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      console.log('🔄 PaymentCallbackPage: Component mounted, processing callback...');
      console.log('🔍 URL search params:', Object.fromEntries(searchParams.entries()));
      
      try {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        
        console.log('🔍 Payment references found:', { reference, trxref });
        
        if (!reference && !trxref) {
          console.error('❌ No payment reference found in URL');
          setStatus('failed');
          setError('No payment reference found');
          return;
        }

        const paymentRef = reference || trxref!;
        console.log('🔍 Processing payment callback for reference:', paymentRef);
        
        // Verify the payment
        console.log('🔍 Calling verifyPaystackPayment...');
        await verifyPaystackPayment(paymentRef);
        
        console.log('✅ Payment verification successful');
        setStatus('success');
        setMessage('Payment verified successfully! Redirecting to payment page to submit your application...');
        
        // Redirect to payment page after 3 seconds so applicant can submit form
        console.log('⏰ Setting redirect timer...');
        setTimeout(() => {
          console.log('🔄 Redirecting to /payment...');
          navigate('/payment');
        }, 3000);
        
      } catch (error) {
        console.error('❌ Payment callback error:', error);
        setStatus('failed');
        setError(error instanceof Error ? error.message : 'Payment verification failed');
      }
    };

    handlePaymentCallback();
  }, [searchParams, verifyPaystackPayment, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Payment
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/payment')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Submit Your Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Failed
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate('/payment')}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentCallbackPage;
