import React, { useState } from 'react';
import { Search, Mail, Phone, Download, Eye } from 'lucide-react';

const StaffApplicants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');

  const applicants = [
    {
      id: 'APP-2024-156',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+233 24 123 4567',
      program: 'Agricultural Engineering',
      level: 'Undergraduate',
      region: 'Greater Accra',
      gpa: 3.8,
      status: 'pending_review',
      submittedDate: '2024-01-16'
    },
    {
      id: 'APP-2024-155',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+233 26 789 0123',
      program: 'Crop Science',
      level: 'Undergraduate',
      region: 'Ashanti',
      gpa: 3.6,
      status: 'under_review',
      submittedDate: '2024-01-16'
    },
    {
      id: 'APP-2024-154',
      name: 'Michael Johnson',
      email: 'michael.j@email.com',
      phone: '+233 27 456 7890',
      program: 'Animal Science',
      level: 'Postgraduate',
      region: 'Northern',
      gpa: 3.9,
      status: 'approved',
      submittedDate: '2024-01-15'
    },
    {
      id: 'APP-2024-153',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+233 23 345 6789',
      program: 'Environmental Science',
      level: 'Undergraduate',
      region: 'Eastern',
      gpa: 4.0,
      status: 'approved',
      submittedDate: '2024-01-15'
    },
    {
      id: 'APP-2024-152',
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+233 28 234 5678',
      program: 'Food Science and Technology',
      level: 'Undergraduate',
      region: 'Western',
      gpa: 2.8,
      status: 'rejected',
      submittedDate: '2024-01-14'
    }
  ];

  const programs = [
    'Agricultural Engineering',
    'Animal Science',
    'Crop Science',
    'Environmental Science',
    'Food Science and Technology',
    'Forestry',
    'Horticulture'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram === 'all' || applicant.program === selectedProgram;
    
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applicants Directory</h1>
        <p className="text-gray-600">View and manage all applicant information</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Applicants</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Program</label>
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
        </div>
      </div>

      {/* Applicants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplicants.map((applicant) => (
          <div key={applicant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {applicant.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                  <p className="text-sm text-gray-600">{applicant.id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                {applicant.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{applicant.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{applicant.phone}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Program:</span>
                  <p className="font-medium text-gray-900 truncate">{applicant.program}</p>
                </div>
                <div>
                  <span className="text-gray-600">Level:</span>
                  <p className="font-medium text-gray-900">{applicant.level}</p>
                </div>
                <div>
                  <span className="text-gray-600">Region:</span>
                  <p className="font-medium text-gray-900">{applicant.region}</p>
                </div>
                <div>
                  <span className="text-gray-600">GPA:</span>
                  <p className="font-medium text-gray-900">{applicant.gpa}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <span>Submitted: {applicant.submittedDate}</span>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm flex items-center justify-center">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 text-sm flex items-center justify-center">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No applicants found</div>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default StaffApplicants;