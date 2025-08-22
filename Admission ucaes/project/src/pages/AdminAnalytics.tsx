import React, { useState } from 'react';
import { 
  TrendingUp, 
  People, 
  Description, 
  AttachMoney, 
  CalendarToday, 
  Download,
  Assessment,
  Speed
} from '@mui/icons-material';

const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedMetric, setSelectedMetric] = useState('applications');

  const analyticsData = {
    overview: {
      totalApplications: 2847,
      totalRevenue: 427050,
      conversionRate: 56.8,
      averageProcessingTime: 12,
      applicantSatisfaction: 4.3,
      systemUptime: 99.8
    },
    trends: {
      applications: [
        { period: 'Week 1', value: 234 },
        { period: 'Week 2', value: 345 },
        { period: 'Week 3', value: 456 },
        { period: 'Week 4', value: 389 }
      ],
      revenue: [
        { period: 'Week 1', value: 35100 },
        { period: 'Week 2', value: 51750 },
        { period: 'Week 3', value: 68400 },
        { period: 'Week 4', value: 58350 }
      ]
    },
    demographics: {
      byRegion: [
        { region: 'Greater Accra', count: 856, percentage: 30.1 },
        { region: 'Ashanti', count: 612, percentage: 21.5 },
        { region: 'Northern', count: 398, percentage: 14.0 },
        { region: 'Eastern', count: 341, percentage: 12.0 },
        { region: 'Western', count: 284, percentage: 10.0 },
        { region: 'Other', count: 356, percentage: 12.4 }
      ],
      byProgram: [
        { program: 'Agricultural Engineering', count: 456 },
        { program: 'Crop Science', count: 389 },
        { program: 'Animal Science', count: 334 },
        { program: 'Environmental Science', count: 298 },
        { program: 'Food Science', count: 267 }
      ],
      byGender: [
        { gender: 'Male', count: 1567, percentage: 55.1 },
        { gender: 'Female', count: 1280, percentage: 44.9 }
      ]
    },
    performance: {
      applicationsByStatus: [
        { status: 'Approved', count: 1284, percentage: 45.1 },
        { status: 'Rejected', count: 984, percentage: 34.6 },
        { status: 'Under Review', count: 423, percentage: 14.9 },
        { status: 'Pending', count: 156, percentage: 5.5 }
      ],
      processingTimes: [
        { range: '0-5 days', count: 1423, percentage: 50.0 },
        { range: '6-10 days', count: 854, percentage: 30.0 },
        { range: '11-15 days', count: 427, percentage: 15.0 },
        { range: '15+ days', count: 143, percentage: 5.0 }
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data for ${dateRange}`);
    alert(`${type} data would be exported for ${dateRange}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into system performance and user behavior</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_3_months">Last 3 months</option>
              <option value="last_year">Last year</option>
            </select>
            <button
              onClick={() => exportData('analytics')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
                              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                             <Description className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.totalApplications.toLocaleString()}</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                             <AttachMoney className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">GHS {analyticsData.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">+8% from last month</p>
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
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.conversionRate}%</p>
              <p className="text-xs text-green-600">+2.1% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarToday className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Processing</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.averageProcessingTime} days</p>
              <p className="text-xs text-red-600">+1 day from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <People className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.applicantSatisfaction}/5</p>
              <p className="text-xs text-green-600">+0.2 from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Speed className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.systemUptime}%</p>
              <p className="text-xs text-green-600">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Application Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-300 rounded-md py-1 px-2"
            >
              <option value="applications">Applications</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {analyticsData.trends[selectedMetric as keyof typeof analyticsData.trends].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-gray-900">{item.period}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-3 w-48">
                      <div 
                        className="bg-green-600 h-3 rounded-full"
                        style={{ 
                          width: `${selectedMetric === 'applications' 
                            ? (item.value / 500) * 100 
                            : (item.value / 70000) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedMetric === 'revenue' ? `GHS ${item.value.toLocaleString()}` : item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics by Region */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Region</h3>
          <div className="space-y-3">
            {analyticsData.demographics.byRegion.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-24 text-sm text-gray-900">{region.region}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {region.count} ({region.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Application Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
          <div className="space-y-3">
            {analyticsData.performance.applicationsByStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                    {status.status}
                  </span>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2 w-40">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {status.count} ({status.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Time Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Time Distribution</h3>
          <div className="space-y-3">
            {analyticsData.performance.processingTimes.map((time, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-20 text-sm text-gray-900">{time.range}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2 w-40">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${time.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {time.count} ({time.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Program Popularity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Programs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Program</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Applications</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Percentage</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.demographics.byProgram.map((program, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{program.program}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">{program.count}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">
                    {((program.count / analyticsData.overview.totalApplications) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600">↑ {Math.floor(Math.random() * 10 + 1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;