import React, { useState, useEffect } from 'react';
import { 
  getMatureStudentApplications, 
  getApplicationsByEligibilityType, 
  getApplicationsRequiringSupport,
  getApplicationStatistics,
  updateApplicationStatus,
  type ApplicationData,
  type MatureStudentInfo 
} from '../../utils/firebaseApplicationService';
import { 
  Users, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Heart, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const MatureStudentApplicationsView: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationData[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);
  const [filters, setFilters] = useState({
    eligibilityType: '',
    status: '',
    needsSupport: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, statsData] = await Promise.all([
        getMatureStudentApplications(),
        getApplicationStatistics()
      ]);
      
      setApplications(appsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading mature student applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.eligibilityType) {
      filtered = filtered.filter(app => 
        app.matureStudentInfo?.eligibilityType === filters.eligibilityType
      );
    }

    if (filters.status) {
      filtered = filtered.filter(app => app.applicationStatus === filters.status);
    }

    if (filters.needsSupport) {
      const needsSupport = filters.needsSupport === 'true';
      filtered = filtered.filter(app => 
        app.matureStudentInfo?.needsSupport === needsSupport
      );
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
        app.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
        app.contactInfo.email.toLowerCase().includes(searchTerm) ||
        app.applicationId?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationData['applicationStatus']) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityIcon = (type: string) => {
    switch (type) {
      case 'age': return <Users className="h-4 w-4" />;
      case 'work_experience': return <Briefcase className="h-4 w-4" />;
      case 'professional_qualification': return <Award className="h-4 w-4" />;
      case 'life_experience': return <Heart className="h-4 w-4" />;
      default: return <GraduationCap className="h-4 w-4" />;
    }
  };

  const ApplicationDetailModal: React.FC<{ application: ApplicationData; onClose: () => void }> = ({ 
    application, 
    onClose 
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {application.personalInfo.firstName} {application.personalInfo.lastName}
              </h2>
              <p className="text-gray-600">Application ID: {application.applicationId || application.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium">{application.matureStudentInfo?.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{application.personalInfo.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nationality</p>
                <p className="font-medium">{application.personalInfo.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Region</p>
                <p className="font-medium">{application.personalInfo.region}</p>
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
                <span>{application.contactInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{application.contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{application.contactInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Mature Student Information */}
          {application.matureStudentInfo && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {getEligibilityIcon(application.matureStudentInfo.eligibilityType)}
                <span className="ml-2">Mature Student Profile</span>
              </h3>
              
              <div className="space-y-6">
                {/* Eligibility */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Eligibility Type</h4>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {application.matureStudentInfo.eligibilityType.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Work Experience */}
                {application.matureStudentInfo.workExperience.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Work Experience ({application.matureStudentInfo.totalWorkYears} years)</h4>
                    <div className="space-y-3">
                      {application.matureStudentInfo.workExperience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-green-400 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{exp.position}</p>
                              <p className="text-gray-600">{exp.employer}</p>
                              <p className="text-sm text-gray-500">
                                {exp.startDate} - {exp.isCurrentJob ? 'Present' : exp.endDate}
                              </p>
                            </div>
                          </div>
                          {exp.responsibilities && (
                            <p className="text-sm text-gray-700 mt-2">{exp.responsibilities}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Qualifications */}
                {application.matureStudentInfo.professionalQualifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Professional Qualifications</h4>
                    <div className="space-y-2">
                      {application.matureStudentInfo.professionalQualifications.map((qual, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                          <div>
                            <p className="font-medium">{qual.qualification}</p>
                            <p className="text-sm text-gray-600">{qual.institution} ({qual.yearObtained})</p>
                          </div>
                          {qual.relevantToProgram && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Relevant
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivation Statement */}
                {application.matureStudentInfo.motivationStatement && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personal Statement</h4>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-gray-700">{application.matureStudentInfo.motivationStatement}</p>
                    </div>
                  </div>
                )}

                {/* Career Goals */}
                {application.matureStudentInfo.careerGoals && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Career Goals</h4>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-gray-700">{application.matureStudentInfo.careerGoals}</p>
                    </div>
                  </div>
                )}

                {/* Support Needs */}
                {application.matureStudentInfo.needsSupport && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Support Services Requested</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.matureStudentInfo.supportType.map((support, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {support}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Program Selection */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Program Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">First Choice</p>
                <p className="font-medium">{application.programSelection.firstChoice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Study Mode</p>
                <p className="font-medium">{application.programSelection.studyMode}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documents Submitted
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regular Documents */}
              {application.documents.idDocument && (
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>ID Document</span>
                  <a 
                    href={application.documents.idDocument.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              )}
              
              {/* Mature Student Documents */}
              {application.matureStudentDocuments?.employmentLetters && (
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>Employment Letters ({application.matureStudentDocuments.employmentLetters.length})</span>
                  <div className="flex space-x-2">
                    {application.matureStudentDocuments.employmentLetters.map((doc, index) => (
                      <a 
                        key={index}
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title={doc.name}
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {application.matureStudentDocuments?.professionalCertificates && (
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>Professional Certificates ({application.matureStudentDocuments.professionalCertificates.length})</span>
                  <div className="flex space-x-2">
                    {application.matureStudentDocuments.professionalCertificates.map((doc, index) => (
                      <a 
                        key={index}
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title={doc.name}
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {application.matureStudentDocuments?.references && (
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>Reference Letters ({application.matureStudentDocuments.references.length})</span>
                  <div className="flex space-x-2">
                    {application.matureStudentDocuments.references.map((doc, index) => (
                      <a 
                        key={index}
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title={doc.name}
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.applicationStatus)}`}>
                {application.applicationStatus.replace('_', ' ').toUpperCase()}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusUpdate(application.id!, 'under_review')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleStatusUpdate(application.id!, 'accepted')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(application.id!, 'rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mature Student Applications</h1>
        <p className="text-gray-600">
          Manage and review applications from mature students with alternative entry pathways
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mature Students</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.mature}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Work Experience</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.byEligibilityType.work_experience || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Professional Quals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.byEligibilityType.professional_qualification || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need Support</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.needingSupport}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eligibility Type
            </label>
            <select
              value={filters.eligibilityType}
              onChange={(e) => setFilters(prev => ({ ...prev, eligibilityType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="age">Age-Based</option>
              <option value="work_experience">Work Experience</option>
              <option value="professional_qualification">Professional Qualification</option>
              <option value="life_experience">Life Experience</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Needs
            </label>
            <select
              value={filters.needsSupport}
              onChange={(e) => setFilters(prev => ({ ...prev, needsSupport: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All</option>
              <option value="true">Needs Support</option>
              <option value="false">No Support Needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eligibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Support
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.personalInfo.firstName} {application.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.contactInfo.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          Age: {application.matureStudentInfo?.age}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getEligibilityIcon(application.matureStudentInfo?.eligibilityType || '')}
                      <span className="ml-2 text-sm text-gray-900">
                        {application.matureStudentInfo?.eligibilityType.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.programSelection.firstChoice}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.programSelection.studyMode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.matureStudentInfo?.totalWorkYears || 0} years
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.matureStudentInfo?.employmentStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.applicationStatus)}`}>
                      {application.applicationStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.matureStudentInfo?.needsSupport ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(application.id!, 'accepted')}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(application.id!, 'rejected')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default MatureStudentApplicationsView;