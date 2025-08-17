import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Copy, CheckCircle } from 'lucide-react';
import ucesLogo from '../../images/uceslogo.png';

const ApplicationIdDisplay: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  // Only show for applicants with application IDs
  if (!user?.applicationId || user.role !== 'applicant') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={ucesLogo} alt="UCAES Logo" className="h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Application ID</h3>
              <p className="text-sm text-gray-600 mt-1">
                Loading your application ID...
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user.applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy application ID:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={ucesLogo} alt="UCAES Logo" className="h-12 w-12" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Application ID</h3>
            <p className="text-sm text-gray-600 mt-1">
              Keep this ID safe. You'll need it for all communications with the admissions office.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <span className="font-mono text-lg font-bold text-green-700">
              {user.applicationId}
            </span>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="Copy Application ID"
          >
            {copied ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900">Year</div>
          <div className="text-gray-600">{user.applicationId.slice(5, 9)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900">Sequence</div>
          <div className="text-gray-600">{user.applicationId.slice(9)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900">Status</div>
          <div className="text-green-600 font-medium">Active</div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationIdDisplay;