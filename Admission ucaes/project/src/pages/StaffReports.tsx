import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp, FileText } from 'lucide-react';

const StaffReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('last_30_days');

  const reportStats = {
    totalApplications: 2847,
    newApplications: 156,
    approvedApplications: 1284,
    rejectedApplications: 984,
    conversionRate: 56.8,
    averageProcessingTime: 12
  };

  const programStats = [
    { program: 'Agricultural Engineering', applications: 456, approved: 234, rejected: 145, pending: 77 },
    { program: 'Crop Science', applications: 389, approved: 198, rejected: 120, pending: 71 },
    { program: 'Animal Science', applications: 334, approved: 167, rejected: 98, pending: 69 },
    { program: 'Environmental Science', applications: 298, approved: 156, rejected: 89, pending: 53 },
    { program: 'Food Science and Technology', applications: 267, approved: 134, rejected: 78, pending: 55 }
  ];

  const monthlyData = [
    { month: 'Jan', applications: 234, approved: 145, rejected: 67 },
    { month: 'Feb', applications: 345, approved: 198, rejected: 89 },
    { month: 'Mar', applications: 456, approved: 267, rejected: 123 },
    { month: 'Apr', applications: 389, approved: 234, rejected: 98 },
    { month: 'May', applications: 298, approved: 178, rejected: 87 }
  ];

  const generateReport = (type: string) => {
    // In a real application, this would generate and download a report
    console.log(`Generating ${type} report for ${dateRange}`);
    alert(`${type} report would be generated for ${dateRange}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and view admissions reports</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="overview">Overview Report</option>
              <option value="program">Program Analysis</option>
              <option value="trends">Trends & Patterns</option>
              <option value="demographics">Demographics</option>
              <option value="payment">Payment Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_3_months">Last 3 months</option>
              <option value="last_6_months">Last 6 months</option>
              <option value="last_year">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => generateReport(selectedReport)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{reportStats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{reportStats.newApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{reportStats.approvedApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{reportStats.rejectedApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{reportStats.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Processing</p>
              <p className="text-2xl font-semibold text-gray-900">{reportStats.averageProcessingTime} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Program Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Program</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-900">Program</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-900">Total</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-900">Approved</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-900">Rate</th>
                </tr>
              </thead>
              <tbody>
                {programStats.map((stat) => (
                  <tr key={stat.program} className="border-b border-gray-100">
                    <td className="py-2 text-sm text-gray-900">{stat.program}</td>
                    <td className="py-2 text-sm text-gray-600 text-right">{stat.applications}</td>
                    <td className="py-2 text-sm text-gray-600 text-right">{stat.approved}</td>
                    <td className="py-2 text-sm text-gray-600 text-right">
                      {((stat.approved / stat.applications) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-900">{data.month}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(data.approved / data.applications) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {data.approved}/{data.applications}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Report Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generateReport('applications_summary')}
            className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Applications Summary</div>
            <div className="text-xs text-gray-600">Complete overview of all applications</div>
          </button>

          <button
            onClick={() => generateReport('admitted_students')}
            className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Admitted Students</div>
            <div className="text-xs text-gray-600">List of approved applicants</div>
          </button>

          <button
            onClick={() => generateReport('payment_report')}
            className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Payment Report</div>
            <div className="text-xs text-gray-600">Financial summary and transactions</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffReports;