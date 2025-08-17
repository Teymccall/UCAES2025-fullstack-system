import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, CheckCircle, XCircle, UserCheck, Briefcase, Award, Heart, AlertCircle, Users } from 'lucide-react';
import { 
  getAllApplications, 
  updateApplicationStatus,
  type ApplicationData 
} from '../utils/firebaseApplicationService';

const StaffApplicationsEnhanced: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // New filter for application type
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const allApps = await getAllApplications();
      setApplications(allApps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demonstration - this will be replaced by real data from Firebase
  const sampleApplications = [
    // Traditional Students
    {
      id: 'APP-2024-156',
      personalInfo: { firstName: 'John', lastName: 'Doe', dateOfBirth: '15-03-2005' },
      contactInfo: { email: 'john.doe@email.com' },
      programSelection: { firstChoice: 'Agricultural Engineering', studyMode: 'regular' },
      applicationStatus: 'pending_review',
      paymentStatus: 'paid',
      submittedAt: '2024-01-16',
      isMatureStudent: false,
      documentsVerified: true,
      academicBackground: { subjects: [{ grade: 'B3' }, { grade: 'C4' }] }
    },
    // Mature Students
    {
      id: 'APP-2024-155',
      personalInfo: { firstName: 'Mary', lastName: 'Asante', dateOfBirth: '10-08-1992' },
      contactInfo: { email: 'mary.asante@email.com' },
      programSelection: { firstChoice: 'B.Sc. Sustainable Agriculture', studyMode: 'weekend' },
      applicationStatus: 'under_review',
      paymentStatus: 'paid',
      submittedAt: '2024-01-16',
      isMatureStudent: true,
      matureStudentInfo: {
        age: 32,
        eligibilityType: 'work_experience',
        totalWorkYears: 8,
        needsSupport: true,
        supportType: ['Study Skills Training', 'Flexible Scheduling'],
        employmentStatus: 'employed'
      },
      documentsVerified: true
    },
    {
      id: 'APP-2024-154',
      personalInfo: { firstName: 'Kwame', lastName: 'Osei', dateOfBirth: '22-11-1996' },
      contactInfo: { email: 'kwame.osei@email.com' },
      programSelection: { firstChoice: 'Certificate in Business Administration', studyMode: 'regular' },
      applicationStatus: 'submitted',
      paymentStatus: 'paid',
      submittedAt: '2024-01-15',
      isMatureStudent: true,
      matureStudentInfo: {
        age: 28,
        eligibilityType: 'professional_qualification',
        totalWorkYears: 5,
        needsSupport: false,
        supportType: [],
        employmentStatus: 'self_employed'
      },
      documentsVerified: true
    },
    {
      id: 'APP-2024-153',
      personalInfo: { firstName: 'Sarah', lastName: 'Wilson', dateOfBirth: '05-07-2004' },
      contactInfo: { email: 'sarah.wilson@email.com' },
      programSelection: { firstChoice: 'Environmental Science', studyMode: 'regular' },
      applicationStatus: 'accepted',
      paymentStatus: 'paid',
      submittedAt: '2024-01-15',
      isMatureStudent: false,
      documentsVerified: true,
      academicBackground: { subjects: [{ grade: 'A1' }, { grade: 'B2' }] }
    },
    {
      id: 'APP-2024-152',
      personalInfo: { firstName: 'Emmanuel', lastName: 'Tetteh', dateOfBirth: '18-04-1979' },
      contactInfo: { email: 'emmanuel.tetteh@email.com' },
      programSelection: { firstChoice: 'Diploma in Organic Agriculture', studyMode: 'regular' },
      applicationStatus: 'under_review',
      paymentStatus: 'paid',
      submittedAt: '2024-01-14',
      isMatureStudent: true,
      matureStudentInfo: {
        age: 45,
        eligibilityType: 'life_experience',
        totalWorkYears: 15,
        needsSupport: true,
        supportType: ['Academic Writing Support', 'IT Support'],
        employmentStatus: 'retired'
      },
      documentsVerified: true
    }
  ];

  // Use sample data if no real data loaded
  const displayApplications = applications.length > 0 ? applications : sampleApplications;

  const programs = [
    'Agricultural Engineering',
    'Animal Science',
    'B.Sc. Sustainable Agriculture',
    'Certificate in Business Administration',
    'Crop Science',
    'Diploma in Organic Agriculture',
    'Environmental Science',
    'Food Science and Technology'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending_documents': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityIcon = (type: string) => {
    switch (type) {
      case 'work_experience': return <Briefcase className="h-4 w-4 text-green-600" />;
      case 'professional_qualification': return <Award className="h-4 w-4 text-purple-600" />;
      case 'life_experience': return <Heart className="h-4 w-4 text-red-600" />;
      default: return <Users className="h-4 w-4 text-blue-600" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const [day, month, year] = dateOfBirth.split('-');
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(applicationId, newStatus as any);
      await loadApplications(); // Reload applications
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const filteredApplications = displayApplications.filter(app => {
    const fullName = `${app.personalInfo.firstName} ${app.personalInfo.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || app.applicationStatus === selectedStatus;
    const matchesProgram = selectedProgram === 'all' || app.programSelection.firstChoice === selectedProgram;
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'traditional' && !app.isMatureStudent) ||
                       (selectedType === 'mature' && app.isMatureStudent);
    
    return matchesSearch && matchesStatus && matchesProgram && matchesType;
  });

  const stats = {
    total: displayApplications.length,
    traditional: displayApplications.filter(app => !app.isMatureStudent).length,
    mature: displayApplications.filter(app => app.isMatureStudent).length,
    needingSupport: displayApplications.filter(app => app.matureStudentInfo?.needsSupport).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
        <p className="text-gray-600">Review and manage both traditional and mature student applications</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Traditional Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.traditional}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mature Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.mature}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Need Support</p>
              <p className="text-2xl font-bold text-gray-900">{stats.needingSupport}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, ID, or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Application Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="traditional">Traditional Students</option>
              <option value="mature">Mature Students</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="pending_review">Pending Review</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({filteredApplications.length})
            </h2>
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Eligibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience/Grades
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
                <tr 
                  key={application.id} 
                  className={`hover:bg-gray-50 ${application.isMatureStudent ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-green-400'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {application.personalInfo.firstName} {application.personalInfo.lastName}
                          </div>
                          {application.isMatureStudent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Mature
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{application.id}</div>
                        <div className="text-sm text-gray-500">{application.contactInfo.email}</div>
                        <div className="text-xs text-gray-400">
                          Age: {calculateAge(application.personalInfo.dateOfBirth)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.isMatureStudent ? (
                      <div className="flex items-center">
                        {getEligibilityIcon(application.matureStudentInfo?.eligibilityType || '')}
                        <div className="ml-2">
                          <div className="text-sm text-gray-900">
                            {application.matureStudentInfo?.eligibilityType?.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {application.matureStudentInfo?.totalWorkYears} years exp
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-600" />
                        <div className="ml-2">
                          <div className="text-sm text-gray-900">Traditional</div>
                          <div className="text-xs text-gray-500">Academic pathway</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.programSelection.firstChoice}</div>
                    <div className="text-sm text-gray-500 capitalize">{application.programSelection.studyMode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.isMatureStudent ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.matureStudentInfo?.totalWorkYears} years
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {application.matureStudentInfo?.employmentStatus}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.academicBackground?.subjects?.[0]?.grade || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">WAEC/WASSCE</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                      {application.applicationStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.matureStudentInfo?.needsSupport ? (
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                        <span className="text-xs text-yellow-800 font-medium">
                          {application.matureStudentInfo.supportType.length} services
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900" title="View Application">
                        <Eye className="h-4 w-4" />
                      </button>
                      {(application.applicationStatus === 'pending_review' || application.applicationStatus === 'submitted') && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(application.id!, 'accepted')}
                            className="text-green-600 hover:text-green-900"
                            title="Accept Application"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id!, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Application"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffApplicationsEnhanced;