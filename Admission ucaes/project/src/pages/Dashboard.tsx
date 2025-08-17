import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApplicantDashboard from '../components/Dashboard/ApplicantDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('Dashboard rendered with user:', user);

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If no user, show login prompt
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Route based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'staff') {
    return <StaffDashboard />;
  }

  // Default to ApplicantDashboard for applicants or any other role
  return <ApplicantDashboard />;
};

export default Dashboard;