import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { SystemConfigProvider } from './contexts/SystemConfigContext';
import ErrorBoundary from './components/ErrorBoundary';
import './utils/debugUtils'; // Load debug utilities
import LandingPage from './pages/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import ApplicationPage from './pages/ApplicationPage';
import PaymentPage from './pages/PaymentPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import StatusPage from './pages/StatusPage';
import AdmissionLetterPage from './pages/AdmissionLetterPage';
import StaffDashboard from './pages/StaffDashboard';
import StaffApplications from './pages/StaffApplications';
import StaffApplicants from './pages/StaffApplicants';
import StaffReports from './pages/StaffReports';
import AdminDashboard from './pages/AdminDashboard';
import AdminStaff from './pages/AdminStaff';
import AdminSettings from './pages/AdminSettings';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDeadlines from './pages/AdminDeadlines';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import AdmissionStatus from './components/AdmissionStatus';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If user is authenticated and on an auth page, redirect to dashboard
  if (user && isAuthPage) {
    // Small delay to ensure all contexts are ready
    setTimeout(() => {
      console.log('🔄 Redirecting authenticated user to dashboard...');
    }, 100);
    return <Navigate to="/dashboard" replace />;
  }

  // If no user, show auth routes
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <AdmissionStatus>
      <ApplicationProvider>
        <div className="min-h-screen bg-gray-50">
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex pt-16">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
              <Routes>
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/application" element={
                <PrivateRoute roles={['applicant']}>
                  <ApplicationPage />
                </PrivateRoute>
              } />
              <Route path="/payment" element={
                <PrivateRoute roles={['applicant']}>
                  <PaymentPage />
                </PrivateRoute>
              } />
              <Route path="/payment/callback" element={
                <PrivateRoute roles={['applicant']}>
                  <PaymentCallbackPage />
                </PrivateRoute>
              } />
              <Route path="/status" element={
                <PrivateRoute roles={['applicant']}>
                  <StatusPage />
                </PrivateRoute>
              } />
              <Route path="/admission-letter" element={
                <PrivateRoute roles={['applicant']}>
                  <AdmissionLetterPage />
                </PrivateRoute>
              } />
            
            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={
              <PrivateRoute roles={['staff', 'admin']}>
                <StaffDashboard />
              </PrivateRoute>
            } />
            <Route path="/staff/applications" element={
              <PrivateRoute roles={['staff', 'admin']}>
                <StaffApplications />
              </PrivateRoute>
            } />
            <Route path="/staff/applicants" element={
              <PrivateRoute roles={['staff', 'admin']}>
                <StaffApplicants />
              </PrivateRoute>
            } />
            <Route path="/staff/reports" element={
              <PrivateRoute roles={['staff', 'admin']}>
                <StaffReports />
              </PrivateRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/staff" element={
              <PrivateRoute roles={['admin']}>
                <AdminStaff />
              </PrivateRoute>
            } />
            <Route path="/admin/settings" element={
              <PrivateRoute roles={['admin']}>
                <AdminSettings />
              </PrivateRoute>
            } />
            <Route path="/admin/analytics" element={
              <PrivateRoute roles={['admin']}>
                <AdminAnalytics />
              </PrivateRoute>
            } />
            <Route path="/admin/deadlines" element={
              <PrivateRoute roles={['admin']}>
                <AdminDeadlines />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
            </main>
          </div>
        </div>
      </ApplicationProvider>
    </AdmissionStatus>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SystemConfigProvider>
            <AppContent />
          </SystemConfigProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;