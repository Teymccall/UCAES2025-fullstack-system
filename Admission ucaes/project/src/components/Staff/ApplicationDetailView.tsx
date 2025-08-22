import React from 'react';
import { Person, Phone, Mail, LocationOn, School, Description, CalendarToday, AlertTriangle, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { ApplicationData } from '../../utils/firebaseApplicationService';

interface ApplicationDetailViewProps {
  application: ApplicationData;
  onClose: () => void;
  onStatusUpdate: (applicationId: string, status: string) => void;
}

const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  application,
  onClose,
  onStatusUpdate
}) => {
  // Helper function to safely display data or show "Not Provided"
  const safeDisplay = (value: any, fallback: string = "Not Provided") => {
    if (value === null || value === undefined || value === '' || value === 'N/A') {
      return <span className="text-gray-400 italic">{fallback}</span>;
    }
    return <span className="text-gray-900">{value}</span>;
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Personal Info (required)
    total += 6;
    if (application.personalInfo?.firstName) completed++;
    if (application.personalInfo?.lastName) completed++;
    if (application.personalInfo?.dateOfBirth) completed++;
    if (application.personalInfo?.gender) completed++;
    if (application.personalInfo?.nationality) completed++;
    if (application.personalInfo?.region) completed++;

    // Contact Info (required)
    total += 5;
    if (application.contactInfo?.email) completed++;
    if (application.contactInfo?.phone) completed++;
    if (application.contactInfo?.address) completed++;
    if (application.contactInfo?.emergencyContact) completed++;
    if (application.contactInfo?.emergencyPhone) completed++;

    // Academic Background (required for traditional students)
    if (!application.isMatureStudent) {
      total += 4;
      if (application.academicBackground?.schoolName) completed++;
      if (application.academicBackground?.qualificationType) completed++;
      if (application.academicBackground?.yearCompleted) completed++;
      if (application.academicBackground?.subjects?.length > 0) completed++;
    }

    // Program Selection (required)
    total += 3;
    if (application.programSelection?.firstChoice) completed++;
    if (application.programSelection?.studyMode) completed++;
    if (application.programSelection?.applicationType) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isIncomplete = completionPercentage < 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {safeDisplay(application.personalInfo?.firstName)} {safeDisplay(application.personalInfo?.lastName)}
            </h2>
            <p className="text-gray-600">Application ID: {application.applicationId || application.id}</p>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                {application.applicationStatus?.replace('_', ' ').toUpperCase() || 'DRAFT'}
              </span>
              {isIncomplete && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Incomplete ({completionPercentage}%)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Cancel className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Completion Status */}
          {isIncomplete && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <h3 className="font-medium text-orange-900">Incomplete Application</h3>
                  <p className="text-sm text-orange-800 mt-1">
                    This application is only {completionPercentage}% complete. The student may have started but not finished the application process.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Person className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">
                  {safeDisplay(application.personalInfo?.firstName)} {safeDisplay(application.personalInfo?.lastName)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{safeDisplay(application.personalInfo?.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium capitalize">{safeDisplay(application.personalInfo?.gender)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nationality</p>
                <p className="font-medium capitalize">{safeDisplay(application.personalInfo?.nationality)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Region</p>
                <p className="font-medium">{safeDisplay(application.personalInfo?.region?.replace('-', ' '))}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{safeDisplay(application.contactInfo?.email)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{safeDisplay(application.contactInfo?.phone)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <LocationOn className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{safeDisplay(application.contactInfo?.address)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Emergency Contact</p>
                <p className="font-medium">{safeDisplay(application.contactInfo?.emergencyContact)}</p>
                <p className="text-sm text-gray-500">{safeDisplay(application.contactInfo?.emergencyPhone)}</p>
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <School className="h-5 w-5 mr-2" />
              Academic Background
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">School/Institution</p>
                <p className="font-medium">{safeDisplay(application.academicBackground?.schoolName)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Qualification</p>
                <p className="font-medium">{safeDisplay(application.academicBackground?.qualificationType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year Completed</p>
                <p className="font-medium">{safeDisplay(application.academicBackground?.yearCompleted)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WAEC Index Number</p>
                <p className="font-medium">{safeDisplay(application.academicBackground?.waecIndexNumber)}</p>
              </div>
            </div>
            
            {application.academicBackground?.subjects && application.academicBackground.subjects.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Subjects & Grades</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {application.academicBackground.subjects.map((subject, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      <span className="text-sm">{subject.subject}: </span>
                      <span className="font-medium">{subject.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Program Selection */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Description className="h-5 w-5 mr-2" />
              Program Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Application Type</p>
                <p className="font-medium">{safeDisplay(application.programSelection?.applicationType, 'Fresh Application')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Study Mode</p>
                <p className="font-medium capitalize">{safeDisplay(application.programSelection?.studyMode)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Academic Year</p>
                <p className="font-medium">{safeDisplay(application.programSelection?.level, '2025/2026')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">First Choice Program</p>
                <p className="font-medium">{safeDisplay(application.programSelection?.firstChoice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Second Choice Program</p>
                <p className="font-medium">{safeDisplay(application.programSelection?.secondChoice, 'Not specified')}</p>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarToday className="h-5 w-5 mr-2" />
              Application Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Schedule className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Application Started</p>
                  <p className="font-medium">{safeDisplay(application.createdAt ? new Date(application.createdAt).toLocaleDateString() : null)}</p>
                </div>
              </div>
              {application.submittedAt && (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Application Submitted</p>
                    <p className="font-medium">{new Date(application.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <Schedule className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{safeDisplay(application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : null)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {application.applicationStatus === 'submitted' && (
                <>
                  <button
                    onClick={() => onStatusUpdate(application.id!, 'under_review')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => onStatusUpdate(application.id!, 'accepted')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Accept Application
                  </button>
                  <button
                    onClick={() => onStatusUpdate(application.id!, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject Application
                  </button>
                </>
              )}
              
              {isIncomplete && (
                <div className="text-sm text-orange-600 bg-orange-100 px-3 py-2 rounded">
                  ⚠️ This application is incomplete. Consider contacting the student to complete their application.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailView;