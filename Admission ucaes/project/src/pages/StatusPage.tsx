import React, { useEffect, useState } from 'react';
import { CheckCircle, Schedule, Warning, Download, Visibility, Description, Refresh } from '@mui/icons-material';
import { useApplication } from '../contexts/ApplicationContext';
import { useAuth } from '../contexts/AuthContext';

const StatusPage: React.FC = () => {
  const { user } = useAuth();
  const { applicationData, isLoading, refreshApplicationData } = useApplication();
  const [refreshing, setRefreshing] = useState(false);

  // Function to refresh data manually
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshApplicationData();
    } catch (error) {
      console.error('Error refreshing application data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to safely format Firestore timestamps
  const formatFirestoreDate = (timestamp: any): string => {
    if (!timestamp) return 'Not available';
    
    try {
      // Handle Firestore Timestamp objects
      if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle Firestore Timestamp with seconds and nanoseconds
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      // Handle string dates
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
      }
      // Handle JavaScript Date objects
      if (timestamp instanceof Date) {
        return isNaN(timestamp.getTime()) ? 'Invalid Date' : timestamp.toLocaleDateString();
      }
      
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Get real application status data
  const applicationStatus = {
    id: user?.applicationId || applicationData?.applicationId || 'Not Generated',
    status: applicationData?.applicationStatus || 'draft',
    submittedDate: formatFirestoreDate(applicationData?.submittedAt) || 'Not submitted',
    lastUpdated: formatFirestoreDate(applicationData?.updatedAt) || 'Not updated',
    program: applicationData?.programSelection?.firstChoice || applicationData?.programSelection?.program || 'Not selected',
    level: applicationData?.programSelection?.level || 'Not selected',
    programType: applicationData?.programSelection?.programType || 'Not selected',
    paymentStatus: applicationData?.paymentStatus || 'pending',
    documents: [
      { 
        name: 'Academic Certificate', 
        status: applicationData?.documents?.certificate ? 'verified' : 'pending', 
        uploadDate: applicationData?.documents?.certificate ? 'Uploaded' : 'Not uploaded',
        url: applicationData?.documents?.certificate?.url
      },
      { 
        name: 'Academic Transcript', 
        status: applicationData?.documents?.transcript ? 'verified' : 'pending', 
        uploadDate: applicationData?.documents?.transcript ? 'Uploaded' : 'Not uploaded',
        url: applicationData?.documents?.transcript?.url
      },
      { 
        name: 'ID Document', 
        status: applicationData?.documents?.idDocument ? 'verified' : 'pending', 
        uploadDate: applicationData?.documents?.idDocument ? 'Uploaded' : 'Not uploaded',
        url: applicationData?.documents?.idDocument?.url
      },
      { 
        name: 'Passport Photo', 
        status: applicationData?.documents?.photo ? 'verified' : 'pending', 
        uploadDate: applicationData?.documents?.photo ? 'Uploaded' : 'Not uploaded',
        url: applicationData?.documents?.photo?.url
      }
    ]
  };

  // Generate dynamic status timeline based on real data
  const generateStatusTimeline = () => {
    const timeline = [];
    
    // 1. Application Submitted
    const isSubmitted = applicationStatus.status !== 'draft';
    timeline.push({
      status: 'Application Submitted',
      date: isSubmitted ? applicationStatus.submittedDate : 'Pending',
      completed: isSubmitted,
      current: !isSubmitted,
      description: isSubmitted ? 'Your application has been successfully submitted' : 'Complete your application and submit it'
    });

    // 2. Payment Confirmed
    const isPaymentConfirmed = applicationStatus.paymentStatus === 'paid';
    timeline.push({
      status: 'Payment Confirmed',
      date: isPaymentConfirmed ? applicationStatus.submittedDate : 'Pending',
      completed: isPaymentConfirmed,
      current: isSubmitted && !isPaymentConfirmed,
      description: isPaymentConfirmed ? 'Application fee payment received and confirmed' : 'Payment of application fee required'
    });

    // 3. Document Verification
    const allDocumentsUploaded = applicationStatus.documents.every(doc => doc.status === 'verified');
    timeline.push({
      status: 'Document Verification',
      date: allDocumentsUploaded ? applicationStatus.lastUpdated : 'Pending',
      completed: allDocumentsUploaded,
      current: isPaymentConfirmed && !allDocumentsUploaded,
      description: allDocumentsUploaded ? 'All uploaded documents have been verified' : 'Upload all required documents'
    });

    // 4. Application Review
    const isUnderReview = applicationStatus.status === 'under_review' || applicationStatus.status === 'submitted';
    const isAccepted = applicationStatus.status === 'accepted';
    const isRejected = applicationStatus.status === 'rejected';
    
    timeline.push({
      status: 'Application Review',
      date: isUnderReview ? 'In Progress' : (isAccepted || isRejected) ? applicationStatus.lastUpdated : 'Pending',
      completed: isAccepted || isRejected,
      current: isUnderReview && allDocumentsUploaded,
      description: isUnderReview ? 'Admissions committee is reviewing your application' : 
                   isAccepted || isRejected ? 'Review completed' : 'Waiting for review to begin'
    });

    // 5. Admission Decision
    timeline.push({
      status: 'Admission Decision',
      date: (isAccepted || isRejected) ? applicationStatus.lastUpdated : 'Pending',
      completed: isAccepted || isRejected,
      current: false,
      description: isAccepted ? 'Congratulations! You have been accepted' : 
                   isRejected ? 'Application was not successful' : 'Final decision on your application'
    });

    return timeline;
  };

  const statusTimeline = generateStatusTimeline();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Description className="h-5 w-5" />;
      case 'submitted': return <Description className="h-5 w-5" />;
      case 'under_review': return <Schedule className="h-5 w-5" />;
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <Warning className="h-5 w-5" />;
      default: return <Description className="h-5 w-5" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <Refresh className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-lg">Loading application status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
          <p className="text-gray-600">Track the progress of your UCAES application</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm bg-white text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          <Refresh className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Application Overview</h2>
            <p className="text-sm text-gray-600">Application ID: {applicationStatus.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(applicationStatus.status)}`}>
            {getStatusIcon(applicationStatus.status)}
            <span className="ml-2 capitalize">{applicationStatus.status.replace('_', ' ')}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900">Program</h3>
            <p className="text-lg font-semibold text-gray-700">{applicationStatus.program}</p>
            <p className="text-sm text-gray-600">{applicationStatus.programType} • {applicationStatus.level}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900">Submitted</h3>
            <p className="text-lg font-semibold text-gray-700">{applicationStatus.submittedDate}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900">Last Updated</h3>
            <p className="text-lg font-semibold text-gray-700">{applicationStatus.lastUpdated}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900">Documents</h3>
            <p className={`text-lg font-semibold ${applicationStatus.documents.every(doc => doc.status === 'verified') ? 'text-green-600' : 'text-yellow-600'}`}>
              {applicationStatus.documents.every(doc => doc.status === 'verified') ? 'All Verified' : 'Pending Upload'}
            </p>
          </div>
        </div>
      </div>

      {/* Application Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h2>
        
        <div className="space-y-6">
          {statusTimeline.map((item, index) => (
            <div key={index} className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                item.completed 
                  ? 'bg-green-600' 
                  : item.current 
                  ? 'bg-yellow-500' 
                  : 'bg-gray-300'
              }`}>
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : item.current ? (
                  <Schedule className="h-5 w-5 text-white" />
                ) : (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${
                    item.completed || item.current ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {item.status}
                  </h3>
                  <span className={`text-sm ${
                    item.completed || item.current ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {item.date}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  item.completed || item.current ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Verification Status</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Upload Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {applicationStatus.documents.map((doc, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{doc.name}</td>
                  <td className="py-3 px-4 text-gray-600">{doc.uploadDate}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.status === 'verified' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {doc.url ? (
                      <button 
                        onClick={() => window.open(doc.url, '_blank')}
                        className="text-green-600 hover:text-green-700 text-sm flex items-center"
                      >
                        <Visibility className="h-4 w-4 mr-1" />
                        View
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Not uploaded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
        
        <div className="space-y-4">
          {/* Dynamic Admission Decision */}
          {applicationStatus.status === 'accepted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900">🎉 Congratulations! Admission Accepted</h3>
              <p className="text-sm text-green-800 mt-1">
                Your application has been accepted! Welcome to UCAES. Please check your email for detailed instructions on registration, enrollment, and next steps.
              </p>
            </div>
          )}
          
          {applicationStatus.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-900">Admission Decision</h3>
              <p className="text-sm text-red-800 mt-1">
                Your application has been reviewed. Unfortunately, we are unable to offer you admission at this time. You may reapply in the next academic year.
              </p>
            </div>
          )}
          
          {applicationStatus.status === 'under_review' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900">Application Under Review</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Your application is currently being reviewed by our admissions committee. This process typically takes 2-4 weeks.
              </p>
            </div>
          )}
          
          {applicationStatus.status === 'submitted' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900">Application Submitted</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your application has been successfully submitted and is awaiting review. You will be notified once the review process begins.
              </p>
            </div>
          )}
          
          {applicationStatus.status === 'draft' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900">Application Incomplete</h3>
              <p className="text-sm text-gray-800 mt-1">
                Please complete your application and submit it to proceed with the admission process.
              </p>
            </div>
          )}

          {/* Expected Timeline - Show for pending applications */}
          {(applicationStatus.status === 'submitted' || applicationStatus.status === 'under_review') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900">Expected Timeline</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Admission decisions will be communicated within 2-4 weeks. You will receive an email notification once a decision is made.
              </p>
            </div>
          )}
          
          {/* Need Help - Always show */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Need Help?</h3>
            <div className="text-sm text-green-800 mt-2 space-y-1">
              <p>If you have any questions about your application status, contact our admissions office:</p>
              <div className="space-y-1 mt-2">
                <p><strong>Email:</strong> <span className="font-medium">admissions@ucaes.edu.gh</span></p>
                <p><strong>Phone:</strong> <span className="font-medium">+233 54 237 7435</span></p>
                <p><strong>Admissions Helpdesk:</strong> <span className="font-medium">+233 50 034 2659</span></p>
              </div>
              <p className="mt-2 text-xs">
                <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 4:30 PM (GMT)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;