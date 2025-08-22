import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiCheckCircle, FiArrowRight, FiUnlock, FiLock, FiClock } from 'react-icons/fi';
import ucesLogo from '../images/uceslogo.png';
import { useSystemConfig } from '../contexts/SystemConfigContext';

const LandingPage: React.FC = () => {
  const { currentAcademicYear, admissionStatus, isLoading } = useSystemConfig();
  
  const admissionInfo = {
    isOpen: admissionStatus === 'open',
    currentYear: currentAcademicYear,
    admissionStatus: admissionStatus,
    message: admissionStatus === 'open' ? "Admissions are open" : "Admissions are currently closed"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src={ucesLogo} alt="UCAES Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">UCAES</h1>
                <p className="text-xs text-gray-500">University College of Agriculture and Environmental Studies</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admission Status Banner */}
      {!isLoading && admissionInfo && (
        <div className={`${
          admissionInfo.isOpen 
            ? 'bg-gradient-to-r from-green-600 to-green-700' 
            : 'bg-gradient-to-r from-red-600 to-red-700'
        } text-white shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${
                  admissionInfo.isOpen ? 'bg-green-500' : 'bg-red-500'
                } bg-opacity-20 rounded-full flex items-center justify-center`}>
                  {admissionInfo.isOpen ? (
                    <FiUnlock className="w-5 h-5 text-white" />
                  ) : (
                    <FiLock className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {admissionInfo.isOpen ? '🎉 Admissions are Currently Open!' : '🔒 Admissions are Currently Closed'}
                  </p>
                  {admissionInfo.currentYear && (
                    <p className="text-sm opacity-90">
                      Academic Year: {admissionInfo.currentYear} | {admissionInfo.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {admissionInfo.isOpen ? (
                  <>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      🟢 ACCEPTING APPLICATIONS
                    </span>
                    <Link
                      to="/register"
                      className="bg-white text-green-700 px-4 py-2 rounded-md text-sm font-bold hover:bg-green-50 transition-colors"
                    >
                      Apply Now
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      🔴 APPLICATIONS CLOSED
                    </span>
                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium">
                      <FiClock className="w-4 h-4 inline mr-1" />
                      Contact Admissions Office
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Future in <span className="text-green-600">Agriculture</span> Starts Here
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join Ghana's premier institution for agricultural and environmental studies. 
              Apply online in minutes and take the first step towards a rewarding career.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {isLoading ? (
                <div className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-600 bg-gray-50">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                  Checking Admission Status...
                </div>
              ) : admissionInfo?.isOpen ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Start Application
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center px-8 py-3 border border-gray-400 text-base font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                    <FiLock className="mr-2 h-5 w-5" />
                    Applications Closed
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Admission Info Section - Only show when closed */}
      {!isLoading && admissionInfo && !admissionInfo.isOpen && (
        <section className="py-16 bg-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🔔 Stay Updated on Admission Reopening
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                While admissions are currently closed, you can prepare for the next application period
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Prepare Documents</h3>
                <p className="text-gray-600 text-sm">
                  Gather your academic transcripts, certificates, and other required documents
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Contact Admissions</h3>
                <div className="text-gray-600 text-sm space-y-1">
                  <p><strong>Email:</strong> admissions@ucaes.edu.gh</p>
                  <p><strong>Phone:</strong> +233 54 237 7435</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Explore Programs</h3>
                <p className="text-gray-600 text-sm">
                  Learn about our agriculture and environmental science programs
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Fast, and Secure Application Process
            </h2>
            <p className="text-lg text-gray-600">
              Our online portal makes applying to UCAES easier than ever
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Application</h3>
              <p className="text-gray-600">
                Fill out your application form step-by-step with our guided process
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Status Updates</h3>
              <p className="text-gray-600">
                Track your application status in real-time from submission to admission
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Get help from our admissions team throughout your application journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Academic Programs
            </h2>
            <p className="text-lg text-gray-600">
              Explore our diverse range of agricultural and environmental programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Agricultural Engineering',
              'Animal Science',
              'Crop Science',
              'Environmental Science',
              'Food Science and Technology',
              'Forestry',
              'Horticulture',
              'Soil Science',
              'Agricultural Economics'
            ].map((program) => (
              <div key={program} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{program}</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive program designed to prepare students for careers in {program.toLowerCase()}.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of students who have chosen UCAES for their agricultural education
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50"
          >
            Apply Now
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={ucesLogo} alt="UCAES Logo" className="h-12 w-12" />
                <span className="text-lg font-bold">UCAES</span>
              </div>
              <p className="text-gray-400">
                Leading Ghana's agricultural education and research for sustainable development.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Programs</a></li>
                <li><a href="#" className="hover:text-white">Admissions</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li><strong>Address:</strong></li>
                <li>University College of Agriculture and Environmental Studies</li>
                <li>P.O. Box 27, Bunso</li>
                <li>Eastern Region, Ghana</li>
                <li><strong>Phone:</strong> +233 54 237 7435</li>
                <li><strong>Mobile:</strong> +233 54 399 0554</li>
                <li><strong>Email:</strong> admissions@ucaes.edu.gh</li>
                <li><strong>Website:</strong> www.ucaes.edu.gh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 University College of Agriculture and Environmental Studies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;