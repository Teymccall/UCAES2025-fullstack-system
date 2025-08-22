import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiSettings, 
  FiBarChart2, 
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiX,
  FiDownload
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import ApplicantSidebar from './ApplicantSidebar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Use specialized sidebar for applicants
  if (user?.role === 'applicant') {
    return <ApplicantSidebar isOpen={isOpen} onClose={onClose} />;
  }

  // Regular menu items for non-applicants
  const applicantMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiFileText, label: 'Application', path: '/application' },
    { icon: FiDollarSign, label: 'Payment', path: '/payment' },
    { icon: FiCheckCircle, label: 'Status', path: '/status' }
  ];

  const staffMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/staff/dashboard' },
    { icon: FiFileText, label: 'Applications', path: '/staff/applications' },
    { icon: FiUsers, label: 'Applicants', path: '/staff/applicants' },
    { icon: FiBarChart2, label: 'Reports', path: '/staff/reports' }
  ];

  const adminMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FiUsers, label: 'Staff Management', path: '/admin/staff' },
    { icon: FiSettings, label: 'System Settings', path: '/admin/settings' },
    { icon: FiBarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: FiClock, label: 'Deadlines', path: '/admin/deadlines' }
  ];

  const getMenuItems = () => {
    if (user?.role === 'admin') return adminMenuItems;
    if (user?.role === 'staff') return staffMenuItems;
    return applicantMenuItems;
  };

  const menuItems = getMenuItems();

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
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
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

export default Sidebar;