import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import ucesLogo from '../../images/uceslogo.png';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-60 bg-white shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <FiMenu className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <img src={ucesLogo} alt="UCAES Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">UCAES</h1>
                <p className="text-xs text-gray-500">Admissions Portal</p>
              </div>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiUser className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <FiLogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;