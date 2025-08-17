import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react';

const AdminDeadlines: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<number | null>(null);

  const [deadlines, setDeadlines] = useState([
    {
      id: 1,
      title: 'Undergraduate Applications',
      description: 'Final deadline for undergraduate program applications',
      date: '2024-06-30',
      time: '23:59',
      category: 'Application',
      status: 'active',
      programs: ['All Undergraduate Programs'],
      reminderDays: 7
    },
    {
      id: 2,
      title: 'Postgraduate Applications',
      description: 'Final deadline for postgraduate program applications',
      date: '2024-07-15',
      time: '23:59',
      category: 'Application',
      status: 'active',
      programs: ['All Postgraduate Programs'],
      reminderDays: 14
    },
    {
      id: 3,
      title: 'Document Submission',
      description: 'Last date for submitting required documents',
      date: '2024-08-01',
      time: '17:00',
      category: 'Documents',
      status: 'active',
      programs: ['All Programs'],
      reminderDays: 5
    },
    {
      id: 4,
      title: 'Payment Deadline',
      description: 'Final deadline for application fee payment',
      date: '2024-08-15',
      time: '23:59',
      category: 'Payment',
      status: 'active',
      programs: ['All Programs'],
      reminderDays: 3
    },
    {
      id: 5,
      title: 'Admission Results',
      description: 'Publication of admission results',
      date: '2024-09-01',
      time: '09:00',
      category: 'Results',
      status: 'scheduled',
      programs: ['All Programs'],
      reminderDays: 1
    }
  ]);

  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'Application',
    programs: ['All Programs'],
    reminderDays: 7
  });

  const categories = ['Application', 'Documents', 'Payment', 'Results', 'Interview', 'Registration'];
  const programOptions = [
    'All Programs',
    'All Undergraduate Programs',
    'All Postgraduate Programs',
    'Agricultural Engineering',
    'Crop Science',
    'Animal Science',
    'Environmental Science'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Application': return 'bg-blue-100 text-blue-800';
      case 'Documents': return 'bg-yellow-100 text-yellow-800';
      case 'Payment': return 'bg-green-100 text-green-800';
      case 'Results': return 'bg-purple-100 text-purple-800';
      case 'Interview': return 'bg-orange-100 text-orange-800';
      case 'Registration': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = (date: string) => {
    const deadlineDate = new Date(date);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...deadlines.map(d => d.id)) + 1;
    setDeadlines([...deadlines, { 
      ...newDeadline, 
      id: newId, 
      status: 'active' 
    }]);
    setNewDeadline({
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'Application',
      programs: ['All Programs'],
      reminderDays: 7
    });
    setShowAddModal(false);
  };

  const handleDeleteDeadline = (id: number) => {
    if (confirm('Are you sure you want to delete this deadline?')) {
      setDeadlines(deadlines.filter(d => d.id !== id));
    }
  };

  const handleEditDeadline = (deadline: any) => {
    setNewDeadline(deadline);
    setEditingDeadline(deadline.id);
    setShowAddModal(true);
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deadline Management</h1>
            <p className="text-gray-600">Manage application deadlines and schedules</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Deadline
          </button>
        </div>
      </div>

      {/* Upcoming Deadlines Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedDeadlines.slice(0, 4).map((deadline) => {
            const daysUntil = getDaysUntilDeadline(deadline.date);
            return (
              <div key={deadline.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(deadline.category)}`}>
                    {deadline.category}
                  </span>
                  <span className={`text-sm font-medium ${daysUntil <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                    {daysUntil > 0 ? `${daysUntil} days` : 'Expired'}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{deadline.title}</h3>
                <p className="text-sm text-gray-600">{deadline.date} at {deadline.time}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadlines Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Deadlines</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title & Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDeadlines.map((deadline) => {
                const daysUntil = getDaysUntilDeadline(deadline.date);
                return (
                  <tr key={deadline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{deadline.title}</div>
                        <div className="text-sm text-gray-500">{deadline.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{deadline.date}</div>
                          <div className="text-sm text-gray-500">{deadline.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(deadline.category)}`}>
                        {deadline.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deadline.programs.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                        {deadline.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm font-medium ${daysUntil <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysUntil > 0 ? `${daysUntil} days` : 'Expired'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDeadline(deadline)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeadline(deadline.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingDeadline ? 'Edit Deadline' : 'Add New Deadline'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDeadline(null);
                    setNewDeadline({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      category: 'Application',
                      programs: ['All Programs'],
                      reminderDays: 7
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddDeadline} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newDeadline.description}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newDeadline.date}
                      onChange={(e) => setNewDeadline(prev => ({ ...prev, date: e.target.value }))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={newDeadline.time}
                      onChange={(e) => setNewDeadline(prev => ({ ...prev, time: e.target.value }))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newDeadline.category}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder (days before)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newDeadline.reminderDays}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, reminderDays: parseInt(e.target.value) }))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingDeadline(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {editingDeadline ? 'Update Deadline' : 'Add Deadline'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeadlines;