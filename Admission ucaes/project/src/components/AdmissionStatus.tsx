import React from 'react'
import { Lock, Unlock, Clock, AlertCircle } from 'lucide-react'
import { useSystemConfig } from '../contexts/SystemConfigContext'
import ucesLogo from '../images/uceslogo.png'

interface AdmissionStatusProps {
  children: React.ReactNode
  showStatus?: boolean
}

export const AdmissionStatus: React.FC<AdmissionStatusProps> = ({ children, showStatus = true }) => {
  const { currentAcademicYear, admissionStatus, isLoading } = useSystemConfig();
  
  const admissionInfo = {
    isOpen: admissionStatus === 'open',
    currentYear: currentAcademicYear,
    admissionStatus: admissionStatus,
    message: admissionStatus === 'open' ? "Admissions are open" : "Admissions are currently closed"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          {/* School Logo */}
          <div className="mx-auto w-20 h-20 mb-6 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-100">
            <img 
              src={ucesLogo} 
              alt="UCAES Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          
          {/* Loading Spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-xl font-bold text-green-800 mb-2">UCAES Admissions Portal</h2>
          <p className="text-green-600">Checking admission status...</p>
        </div>
      </div>
    )
  }

  // If admissions are closed, show closed message
  if (!admissionInfo?.isOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* School Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 mb-4 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-100">
              <img 
                src={ucesLogo} 
                alt="UCAES Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden text-green-700 font-bold text-sm">UCAES</div>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">University College of Agriculture and Environmental Studies</h2>
            <p className="text-green-600 font-medium">UCAES Online Admissions Portal</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            {/* Header with status */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-6">
              <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Admissions Currently Closed</h1>
              <p className="text-red-100">
                {admissionInfo?.message || "Applications are not being accepted at this time"}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {admissionInfo?.currentYear && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6 border border-green-200">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 text-center mb-3">Academic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="font-medium text-green-700">Academic Year:</span>
                      <span className="font-bold text-green-800">{admissionInfo.currentYear}</span>
                    </div>
                    {admissionInfo.admissionStatus && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-green-700">Status:</span>
                        <span className="font-bold text-red-600 uppercase">{admissionInfo.admissionStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Contact Information */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
                  <span className="text-lg font-medium text-gray-700">What can you do now?</span>
                </div>
                
                <div className="grid gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">📧 Contact Admissions Office</h4>
                    <div className="space-y-1 text-sm text-green-700">
                      <p><strong>Email:</strong> admissions@ucaes.edu.gh</p>
                      <p><strong>Phone:</strong> +233 54 237 7435</p>
                      <p><strong>Admissions Helpdesk:</strong> +233 50 034 2659</p>
                      <p>Get updates on when applications will reopen</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">🏢 Visit Our Campus</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p><strong>Address:</strong></p>
                      <p>University College of Agriculture and Environmental Studies</p>
                      <p>P.O. Box 27, Bunso</p>
                      <p>Eastern Region, Ghana</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">📚 Prepare Your Documents</h4>
                    <p className="text-sm text-purple-700">Use this time to gather required documents for when admissions reopen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-green-600 text-white text-center py-4">
              <p className="text-sm">
                <strong>Admissions Office:</strong> admissions@ucaes.edu.gh | <strong>Phone:</strong> +233 54 237 7435
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If admissions are open, show status banner and render children
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {showStatus && admissionInfo && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg border-b border-green-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-3">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                {/* School Logo */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <img 
                    src={ucesLogo} 
                    alt="UCAES Logo" 
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-green-700 font-bold text-xs">UCAES</div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold text-white">
                      🎉 Admissions are Currently Open!
                    </p>
                    {admissionInfo.currentYear && (
                      <p className="text-xs sm:text-sm text-green-100 truncate">
                        Academic Year: {admissionInfo.currentYear} | University College of Agriculture and Environmental Studies
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="bg-white text-green-700 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md whitespace-nowrap">
                  🟢 ACCEPTING APPLICATIONS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`relative z-10 bg-white min-h-screen ${showStatus && admissionInfo ? 'pt-16' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default AdmissionStatus