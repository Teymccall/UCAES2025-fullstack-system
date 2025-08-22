import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Description, AttachMoney, CheckCircle, Download, Close } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useApplication } from '../../contexts/ApplicationContext';

interface ApplicantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplicantSidebar: React.FC<ApplicantSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { applicationData } = useApplication();
  const location = useLocation();

  // Base applicant menu items
  const baseApplicantMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Description, label: 'Application', path: '/application' },
    { icon: AttachMoney, label: 'Payment', path: '/payment' },
    { icon: CheckCircle, label: 'Status', path: '/status' }
  ];

  // Add Admission Letter menu item only for accepted applications
  const applicantMenuItems = applicationData?.applicationStatus === 'accepted' 
    ? [
        ...baseApplicantMenuItems,
        { icon: Download, label: 'Admission Letter', path: '/admission-letter' }
      ]
    : baseApplicantMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-16 left-0 w-64 bg-white h-screen shadow-sm border-r border-green-100 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {user?.role} Portal
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6">
          {applicantMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default ApplicantSidebar;




























