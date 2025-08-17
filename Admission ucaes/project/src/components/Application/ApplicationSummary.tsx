import React from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { CheckCircle, Download, FileText, FileDown } from 'lucide-react';
import { downloadApplication, downloadApplicationAsPDF } from '../../utils/applicationDownload';
import ucesLogo from '../../images/uceslogo.png';

const ApplicationSummary: React.FC = () => {
  const { applicationData, setCurrentStep } = useApplication();

  const handleDownloadApplication = async () => {
    await downloadApplication(applicationData);
  };

  const handleDownloadApplicationAsPDF = async () => {
    await downloadApplicationAsPDF(applicationData);
  };

  const handleEditSection = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={ucesLogo} alt="UCAES Logo" className="h-16 w-16" />
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600">
            Your application has been submitted and is now under review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Application Status</h3>
            <p className="text-sm text-green-800 capitalize">
              {applicationData.applicationStatus.replace('_', ' ')}
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Payment Status</h3>
            <p className="text-sm text-blue-800 capitalize">
              {applicationData.paymentStatus}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <button
                onClick={() => handleEditSection(1)}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">
                  {applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth:</span>
                <span className="ml-2 text-gray-900">{applicationData.personalInfo.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-gray-600">Gender:</span>
                <span className="ml-2 text-gray-900 capitalize">{applicationData.personalInfo.gender}</span>
              </div>
              <div>
                <span className="text-gray-600">Nationality:</span>
                <span className="ml-2 text-gray-900 capitalize">{applicationData.personalInfo.nationality}</span>
              </div>
              <div>
                <span className="text-gray-600">Region:</span>
                <span className="ml-2 text-gray-900 capitalize">{applicationData.personalInfo.region}</span>
              </div>
              <div>
                <span className="text-gray-600">Passport Photo:</span>
                <span className="ml-2 text-gray-900">
                  {applicationData.personalInfo.passportPhoto?.url ? (
                    <span className="text-green-600">✓ Uploaded</span>
                  ) : (
                    <span className="text-red-600">✗ Not uploaded</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Program Selection</h3>
              <button
                onClick={() => handleEditSection(4)}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Level:</span>
                <span className="ml-2 text-gray-900 capitalize">{applicationData.programSelection.level}</span>
              </div>
              {applicationData.programSelection.studyLevel && (
                <div>
                  <span className="text-gray-600">Study Level:</span>
                  <span className="ml-2 text-gray-900">Level {applicationData.programSelection.studyLevel}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Study Mode:</span>
                <span className="ml-2 text-gray-900 capitalize">{applicationData.programSelection.studyMode}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">First Choice:</span>
                <span className="ml-2 text-gray-900">{applicationData.programSelection.firstChoice}</span>
              </div>
              {applicationData.programSelection.secondChoice && (
                <div className="col-span-2">
                  <span className="text-gray-600">Second Choice:</span>
                  <span className="ml-2 text-gray-900">{applicationData.programSelection.secondChoice}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Document Verification</p>
                  <p className="text-gray-600">Our admissions team will verify your submitted documents.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Application Review</p>
                  <p className="text-gray-600">Your application will be reviewed by the admissions committee.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Admission Decision</p>
                  <p className="text-gray-600">You will receive notification of the admission decision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleDownloadApplication}
            className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Application
          </button>
          <button
            onClick={handleDownloadApplicationAsPDF}
            className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download as PDF
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSummary;