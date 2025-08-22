import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Receipt, CheckCircle, Warning, Loop } from '@mui/icons-material';
import { useApplication } from '../contexts/ApplicationContext';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage: React.FC = () => {
  const { applicationData, initializePaystackPayment, checkPaymentStatus } = useApplication();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contextError, setContextError] = useState('');

  useEffect(() => {
    try {
      // Check payment status when component mounts
      console.log('🔄 PaymentPage: Component mounted');
      console.log('👤 User from AuthContext:', user);
      console.log('📋 Application data from ApplicationContext:', applicationData);
      
      if (user?.id) {
        console.log('✅ User authenticated, checking payment status...');
        checkPaymentStatus();
      } else {
        console.log('❌ No user found in AuthContext');
      }
    } catch (err) {
      console.error('❌ Error in PaymentPage useEffect:', err);
      setContextError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [user?.id, checkPaymentStatus]);

  // Debug render
  try {
    console.log('🔄 PaymentPage: Rendering with:', {
      user,
      applicationData,
      paymentStatus: applicationData?.paymentStatus,
      activeTab,
      loading,
      error
    });
  } catch (err) {
    console.error('❌ Error in PaymentPage render logging:', err);
  }

  const handlePayment = async () => {
    console.log('🖱️ Payment button clicked');
    console.log('👤 Current user:', user);
    console.log('📋 Current application data:', applicationData);
    
    if (!user) {
      console.error('❌ No user found - cannot proceed with payment');
      setError('Please sign in to make payment');
      return;
    }

    if (!applicationData.contactInfo.email || !applicationData.personalInfo.firstName) {
      console.error('❌ Missing required application data:', {
        email: applicationData.contactInfo.email,
        firstName: applicationData.personalInfo.firstName
      });
      setError('Please complete your application details before making payment');
      return;
    }

    console.log('✅ All checks passed, starting payment...');
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Calling initializePaystackPayment...');
      const result = await initializePaystackPayment();
      console.log('✅ Payment initialization result:', result);
      // The initialize function will redirect to Paystack
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const paymentHistory = [
    {
      id: 'PAY-2024-001',
      date: '2024-01-15',
      amount: 200,
      description: 'Application Fee',
      status: 'paid',
      method: 'Mobile Money'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Center</h1>
        <p className="text-gray-600">Manage your application payments and view transaction history</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Current Payment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payment History
          </button>
        </nav>
      </div>

      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Current Payment Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Application Fee</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                applicationData.paymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : applicationData.paymentStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {applicationData.paymentStatus === 'paid' && <CheckCircle className="h-4 w-4 mr-1" />}
                {applicationData.paymentStatus === 'failed' && <Warning className="h-4 w-4 mr-1" />
                {applicationData.paymentStatus.charAt(0).toUpperCase() + applicationData.paymentStatus.slice(1)}
              </span>
            </div>

            {applicationData.paymentStatus === 'paid' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-green-900">Payment Successful</h3>
                    <p className="text-green-800">Your application fee has been paid successfully.</p>
                  </div>
                </div>
                
                {applicationData.paymentDetails && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-900">Amount Paid</label>
                      <p className="text-lg font-semibold text-green-800">GHS {(applicationData.paymentDetails.amount / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-900">Payment Date</label>
                      <p className="text-lg font-semibold text-green-800">
                        {new Date(applicationData.paymentDetails.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-900">Transaction ID</label>
                      <p className="text-lg font-semibold text-green-800">{applicationData.paymentDetails.transactionId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-900">Payment Method</label>
                      <p className="text-lg font-semibold text-green-800">{applicationData.paymentDetails.paymentMethod}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <button className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50">
                    <Receipt className="h-4 w-4 mr-2" />
                    Download Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-medium text-red-800 mb-2">Payment Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Application Fee</h3>
                      <p className="text-sm text-blue-800">One-time payment to process your application</p>
                      <p className="text-sm text-blue-800 mt-1">Application ID: {user?.applicationId || 'Not set'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">GHS 200</div>
                      <div className="text-sm text-blue-800">Non-refundable</div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Payment Method</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-green-400 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Mobile Money</h4>
                          <p className="text-sm text-gray-600">MTN, Vodafone, AirtelTigo</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-green-400 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Card Payment</h4>
                          <p className="text-sm text-gray-600">Visa, Mastercard</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-900">Important Note</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Payment must be completed before your application can be reviewed. 
                    Keep your payment receipt for your records.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loop className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Processing...
                    </>
                  ) : (
                    'Pay GHS 200'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Section - Always visible for testing */}
      <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🔧 Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>User:</strong> {user ? `ID: ${user.id}, Role: ${user.role}` : 'Not authenticated'}</p>
            <p><strong>Application ID:</strong> {user?.applicationId || 'Not set'}</p>
            <p><strong>Payment Status:</strong> {applicationData?.paymentStatus || 'Not set'}</p>
            <p><strong>Email:</strong> {applicationData?.contactInfo?.email || 'Not provided'}</p>
            <p><strong>First Name:</strong> {applicationData?.personalInfo?.firstName || 'Not provided'}</p>
          </div>
          <div>
            <p><strong>Active Tab:</strong> {activeTab}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>Context Error:</strong> {contextError || 'None'}</p>
            <p><strong>Context Loaded:</strong> {applicationData ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {/* Always visible test payment button */}
        <div className="mt-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loop className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </>
            ) : (
              '🧪 TEST: Pay GHS 200 (Always Visible)'
            )}
          </button>
          
          {/* Simple test button */}
          <button
            onClick={() => {
              console.log('🧪 Simple test button clicked!');
              alert('Test button works!');
            }}
            className="mt-2 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            🧪 Simple Test Button
          </button>
        </div>
      </div>

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      GHS {payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-green-600 hover:text-green-900">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;