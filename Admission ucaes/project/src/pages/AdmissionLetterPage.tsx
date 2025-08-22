import React, { useState } from 'react';
import { Download, Description, CheckCircle, Schedule, Warning } from '@mui/icons-material';
import { useApplication } from '../contexts/ApplicationContext';
import { useAuth } from '../contexts/AuthContext';
import { getApplicationDataByUserId } from '../utils/firebaseApplicationService';
import { API_ENDPOINTS } from '../utils/api-config';

const AdmissionLetterPage: React.FC = () => {
  const { user } = useAuth();
  const { applicationData } = useApplication(); // Still used for initial status check
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user can access admission letter
  if (!applicationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your application data.</p>
        </div>
      </div>
    );
  }

  if (applicationData.applicationStatus !== 'accepted') {
    const statusConfig = {
      'pending': {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        title: 'Application Under Review',
        message: 'Your application is currently being reviewed. The admission letter will be available once your application is accepted.'
      },
      'rejected': {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        title: 'Application Not Approved',
        message: 'Unfortunately, your application was not approved for admission. Please contact the admissions office for more information.'
      }
    };

    const config = statusConfig[applicationData.applicationStatus as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className={`${config.bgColor} rounded-lg shadow-lg p-8 max-w-md w-full text-center`}>
          <Icon className={`h-16 w-16 ${config.color} mx-auto mb-4`} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h2>
          <p className="text-gray-600">{config.message}</p>
        </div>
      </div>
    );
  }

  const handleDownloadLetter = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      // Get fresh application data directly from Firebase
      console.log('🔄 Fetching fresh application data for user:', user.id);
      const freshApplicationData = await getApplicationDataByUserId(user.id);

      if (!freshApplicationData?.applicationId) {
        throw new Error('Application ID not found');
      }

      console.log('📄 Downloading admission letter for:', freshApplicationData.applicationId);

      // Call the Academic Affairs API endpoint
      // Use relative URL to avoid CORS issues and ensure it works in all environments
      const response = await fetch(API_ENDPOINTS.generateAdmissionLetter, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin, // Add origin header for CORS
        },
        body: JSON.stringify({
          applicationId: freshApplicationData.applicationId
        }),
        credentials: 'include', // Include credentials for CORS requests
        mode: 'cors', // Explicitly set CORS mode
      });

      if (response.ok) {
        try {
        // Check if the response is valid
        if (!response.body) {
          throw new Error('Response body is empty');
        }
        
        const blob = await response.blob();
        
        // Verify that we received a PDF
        if (blob.type !== 'application/pdf' && blob.size < 1000) {
          // If it's not a PDF and very small, it might be an error message
          const text = await blob.text();
          console.error('❌ Received non-PDF response:', text);
          throw new Error('Server returned an invalid response. Please try again later.');
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers.get('content-disposition');
        let filename = `UCAES_Admission_Letter_${freshApplicationData.applicationId}.pdf`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ Admission letter downloaded successfully');
      } catch (blobError) {
        console.error('❌ Error processing PDF blob:', blobError);
        setError('Error processing the admission letter. Please try again later.');
      }
      } else {
        try {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          const errorMessage = errorData.error || `HTTP ${response.status}: Failed to download admission letter`;
          console.error('❌ Server error:', errorMessage);
          throw new Error(errorMessage);
        } catch (jsonError) {
          console.error('❌ Error parsing error response:', jsonError);
          throw new Error(`HTTP ${response.status}: Failed to download admission letter. The server may be unavailable.`);
        }
      }
    } catch (error) {
      console.error('❌ Error downloading admission letter:', error);
      setError(error instanceof Error ? error.message : 'Failed to download admission letter. Please check your network connection and try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admission Letter</h1>
              <p className="text-gray-600">Download your official admission letter</p>
            </div>
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FileText className="h-24 w-24 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Your application has been <span className="font-semibold text-green-600">accepted</span>
            </p>
            <p className="text-gray-600">
              You can now download your official admission letter for the {applicationData.programSelection?.firstChoice || 'selected program'}.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Download Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadLetter}
                disabled={downloading}
                className={`
                  flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white
                  ${downloading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300'
                  }
                  transition-colors duration-200
                `}
              >
                <Download className="h-5 w-5 mr-2" />
                {downloading ? 'Generating PDF...' : 'Download Admission Letter'}
              </button>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                This letter contains important details about your admission, including program information, fees, and next steps.
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Please keep this letter safe as you may need it for registration and other administrative purposes.
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Follow the instructions in the letter regarding payment and registration deadlines.
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                You can access the student portal using your application ID as index number and your date of birth (DD-MM-YYYY) as password.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionLetterPage;




























