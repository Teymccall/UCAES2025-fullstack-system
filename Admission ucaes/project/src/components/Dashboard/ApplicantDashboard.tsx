import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';
import ApplicationIdDisplay from './ApplicationIdDisplay';
import { downloadApplication, downloadApplicationAsPDF } from '../../utils/applicationDownload';
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  User,
  BookOpen,
  RefreshCw,
  Trash2,
  FileDown
} from 'lucide-react';

const ApplicantDashboard: React.FC = () => {
  const { user, clearLocalData } = useAuth();
  const { applicationData, clearApplicationData, isLoading } = useApplication();

  console.log('ApplicantDashboard rendered with user:', user);
  console.log('ApplicantDashboard application data:', applicationData);

  // Use real application data from Firebase instead of mock data
  const applicationStatus = {
    status: applicationData.applicationStatus || 'draft',
    submissionDate: applicationData.submittedAt ? new Date(applicationData.submittedAt).toLocaleDateString() : 'Not submitted',
    paymentStatus: applicationData.paymentStatus || 'pending',
    documentsVerified: applicationData.documents && Object.keys(applicationData.documents).length > 0,
    applicationId: user?.applicationId || applicationData.applicationId || 'Not generated'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-5 w-5" />;
      case 'under_review': return <Clock className="h-5 w-5" />;
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <AlertCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading application data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-gray-600">Track your application progress and manage your admission journey.</p>
            <p className="text-sm text-gray-500 mt-2">Debug: User role: {user?.role}, Application ID: {user?.applicationId}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearApplicationData}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
              title="Reset Application Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Application</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear ALL local data? This will log you out and clear all stored information.')) {
                  clearLocalData();
                  window.location.reload();
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Clear All Local Data"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Application ID Display */}
      <ApplicationIdDisplay />

      {/* Application Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicationStatus.status)}`}>
            {getStatusIcon(applicationStatus.status)}
            <span className="ml-1 capitalize">{applicationStatus.status.replace('_', ' ')}</span>
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{applicationStatus.applicationId}</div>
            <div className="text-sm text-gray-600">Application ID</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{applicationStatus.submissionDate}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${applicationStatus.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
              {applicationStatus.paymentStatus === 'paid' ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-600">Payment</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/application"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">My Application</h3>
              <p className="text-sm text-gray-600">View and edit application</p>
            </div>
          </div>
        </Link>

        <Link
          to="/payment"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Payment</h3>
              <p className="text-sm text-gray-600">Manage payments</p>
            </div>
          </div>
        </Link>

        <Link
          to="/status"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <p className="text-sm text-gray-600">Track progress</p>
            </div>
          </div>
        </Link>

        <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <p className="text-sm text-gray-600">Download forms</p>
            </div>
          </div>
        </button>
      </div>

      {/* Application Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h2>
        
        <div className="space-y-4">
          {/* Application Submitted Step */}
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              applicationStatus.status !== 'draft' ? 'bg-green-600' : 'bg-gray-300'
            }`}>
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">Application Submitted</h3>
              <p className="text-sm text-gray-600">
                {applicationStatus.status !== 'draft' 
                  ? 'Your application has been successfully submitted'
                  : 'Complete your application to submit'
                }
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {applicationStatus.status !== 'draft' ? applicationStatus.submissionDate : 'Pending'}
            </div>
          </div>
          
          {/* Payment Step */}
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              applicationStatus.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-gray-300'
            }`}>
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">Payment Confirmed</h3>
              <p className="text-sm text-gray-600">
                {applicationStatus.paymentStatus === 'paid' 
                  ? 'Application fee payment received'
                  : 'Payment required to proceed'
                }
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {applicationStatus.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </div>
          </div>
          
          {/* Review Step */}
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              applicationStatus.status === 'under_review' ? 'bg-yellow-500' : 
              applicationStatus.status === 'accepted' || applicationStatus.status === 'rejected' ? 'bg-green-600' : 'bg-gray-300'
            }`}>
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">Under Review</h3>
              <p className="text-sm text-gray-600">
                {applicationStatus.status === 'under_review' ? 'Admissions team is reviewing your application' :
                 applicationStatus.status === 'accepted' ? 'Application has been accepted' :
                 applicationStatus.status === 'rejected' ? 'Application has been reviewed' :
                 'Application will be reviewed after submission and payment'
                }
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {applicationStatus.status === 'under_review' ? 'In Progress' :
               applicationStatus.status === 'accepted' ? 'Accepted' :
               applicationStatus.status === 'rejected' ? 'Reviewed' : 'Pending'
              }
            </div>
          </div>
          
          {/* Final Decision Step */}
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              applicationStatus.status === 'accepted' ? 'bg-green-600' :
              applicationStatus.status === 'rejected' ? 'bg-red-600' : 'bg-gray-300'
            }`}>
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">Admission Decision</h3>
              <p className="text-sm text-gray-600">
                {applicationStatus.status === 'accepted' ? 'Congratulations! Your application has been accepted' :
                 applicationStatus.status === 'rejected' ? 'Application decision has been made' :
                 'Final decision on your application'
                }
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {applicationStatus.status === 'accepted' ? 'Accepted' :
               applicationStatus.status === 'rejected' ? 'Decision Made' : 'Pending'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Important Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {applicationStatus.status !== 'draft' && (
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">Application submitted successfully</p>
                  <p className="text-xs text-gray-500">{applicationStatus.submissionDate}</p>
                </div>
              </div>
            )}
            {applicationStatus.paymentStatus === 'paid' && (
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">Payment of GHS 200 confirmed</p>
                  <p className="text-xs text-gray-500">{applicationStatus.submissionDate}</p>
                </div>
              </div>
            )}
            {applicationStatus.documentsVerified && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">Documents uploaded and verified</p>
                  <p className="text-xs text-gray-500">{applicationStatus.submissionDate}</p>
                </div>
              </div>
            )}
            {applicationStatus.status === 'draft' && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">Application draft created</p>
                  <p className="text-xs text-gray-500">Complete your application to proceed</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h2>
          <div className="space-y-3">
            {/* Dynamic Admission Decision */}
            {applicationStatus.status === 'accepted' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-green-900">🎉 Congratulations! Admission Accepted</h3>
                <p className="text-sm text-green-800 mt-1">
                  Your application has been accepted! Welcome to UCAES. Please check your email for further instructions on registration and enrollment.
                </p>
              </div>
            )}
            
            {applicationStatus.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-red-900">Admission Decision</h3>
                <p className="text-sm text-red-800 mt-1">
                  Your application has been reviewed. Unfortunately, we are unable to offer you admission at this time. You may reapply in the next academic year.
                </p>
              </div>
            )}
            
            {applicationStatus.status === 'under_review' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-yellow-900">Application Under Review</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Your application is currently being reviewed by our admissions committee. You will receive a decision within 2-3 weeks.
                </p>
              </div>
            )}
            
            {applicationStatus.status === 'submitted' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-900">Application Submitted</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Your application has been successfully submitted and is awaiting review. You will be notified once the review process begins.
                </p>
              </div>
            )}
            
            {applicationStatus.status === 'draft' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900">Application Incomplete</h3>
                <p className="text-sm text-gray-800 mt-1">
                  Please complete your application and submit it to proceed with the admission process.
                </p>
              </div>
            )}

            {/* Document Verification - Always show */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-yellow-900">Document Verification</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Original documents must be presented during registration
              </p>
            </div>
            
            {/* Contact Support - Always show */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-green-900">Contact Support</h3>
              <div className="text-sm text-green-800 mt-1 space-y-1">
                <p><strong>Email:</strong> admissions@ucaes.edu.gh</p>
                <p><strong>Phone:</strong> +233 54 237 7435</p>
                <p><strong>Admissions Helpdesk:</strong> +233 50 034 2659</p>
                <p className="text-xs mt-1"><strong>Office Hours:</strong> Mon-Fri, 8:00 AM - 4:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Application Section - Only show if application is submitted */}
        {applicationStatus.status !== 'draft' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Application</h2>
            <p className="text-sm text-gray-600 mb-4">
              Download a copy of your submitted application for your records.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => await downloadApplication(applicationData)}
                className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download as Text
              </button>
              <button
                onClick={async () => await downloadApplicationAsPDF(applicationData)}
                className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;