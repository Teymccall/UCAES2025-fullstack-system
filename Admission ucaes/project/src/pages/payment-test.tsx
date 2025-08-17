import React from 'react';
import PaymentSection from '../components/Application/PaymentSection';
import PaymentTestComponent from '../components/Application/PaymentTestComponent';

const PaymentTestPage: React.FC = () => {
  const [showTestMode, setShowTestMode] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Payment System
          </h1>
          <p className="text-gray-600">
            Test the new payment system before integration
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowTestMode(!showTestMode)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            {showTestMode ? 'Show Production Mode' : 'Show Test Mode'}
          </button>
        </div>

        {showTestMode ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Test Mode - Payment System Validation
              </h2>
              <PaymentTestComponent />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Production Mode - Enhanced Payment Section
            </h2>
            <PaymentSection />
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Integration Instructions
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Quick Start:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Run the test component to validate setup</li>
                <li>Replace PaymentForm with PaymentSection</li>
                <li>Test with test card: 4084084084084081</li>
                <li>Deploy to production</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Test Data:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Test Card: 4084084084084081</li>
                <li>Test Phone: 0242000000</li>
                <li>Test Email: test@example.com</li>
                <li>Amount: GHS 200</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTestPage;