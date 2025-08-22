import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { Person, School, Work, Schedule, Warning, CheckCircle } from '@mui/icons-material';

const MatureStudentSelection: React.FC = () => {
  const { applicationData, setMatureStudent, setCurrentStep } = useApplication();
  const [selectedType, setSelectedType] = useState<'traditional' | 'mature' | ''>('');
  const [showAgeWarning, setShowAgeWarning] = useState(false);

  useEffect(() => {
    // Check if user is already marked as mature student
    if (applicationData.isMatureStudent !== undefined) {
      setSelectedType(applicationData.isMatureStudent ? 'mature' : 'traditional');
    }
    
    // Check age from personal info to show warning
    if (applicationData.personalInfo?.dateOfBirth) {
      const birthDate = new Date(applicationData.personalInfo.dateOfBirth.split('-').reverse().join('-'));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age >= 21 && selectedType === 'traditional') {
        setShowAgeWarning(true);
      } else {
        setShowAgeWarning(false);
      }
    }
  }, [applicationData.personalInfo?.dateOfBirth, applicationData.isMatureStudent, selectedType]);

  const handleSelection = (type: 'traditional' | 'mature') => {
    setSelectedType(type);
    setMatureStudent(type === 'mature');
  };

  const handleContinue = () => {
    if (selectedType === 'mature') {
      // Go to mature student form
      setCurrentStep(1.5); // Special step for mature student form
    } else {
      // Continue with traditional flow
      setCurrentStep(2); // Go to contact info
    }
  };

  const getAge = () => {
    if (!applicationData.personalInfo?.dateOfBirth) return null;
    
    const birthDate = new Date(applicationData.personalInfo.dateOfBirth.split('-').reverse().join('-'));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Type Selection</h2>
          <p className="text-gray-600">
            Please select the type of application that best describes your situation. This helps us 
            provide the most appropriate application process and support for your needs.
          </p>
          {age && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Your Age:</strong> {age} years old
                {age >= 21 && (
                  <span className="ml-2 text-blue-600">
                    • You may be eligible for mature student admission
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Traditional Student */}
          <div 
            className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
              selectedType === 'traditional' 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-300 hover:border-green-300 hover:shadow-sm'
            }`}
            onClick={() => handleSelection('traditional')}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${
                selectedType === 'traditional' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <School className={`h-8 w-8 ${
                  selectedType === 'traditional' ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Traditional Student</h3>
                <p className="text-gray-600 mb-4">
                  Recent secondary school graduate or student following the standard academic pathway.
                </p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Standard WAEC/WASSCE requirements</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Traditional academic background verification</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Standard application timeline</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Age typically under 21 years</span>
                  </div>
                </div>
              </div>
            </div>
            
            <input
              type="radio"
              name="applicationType"
              value="traditional"
              checked={selectedType === 'traditional'}
              onChange={() => handleSelection('traditional')}
              className="absolute top-4 right-4"
            />
          </div>

          {/* Mature Student */}
          <div 
            className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
              selectedType === 'mature' 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => handleSelection('mature')}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${
                selectedType === 'mature' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Work className={`h-8 w-8 ${
                  selectedType === 'mature' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mature Student</h3>
                <p className="text-gray-600 mb-4">
                  Adult learner with work experience, life experience, or returning to education after a break.
                </p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Alternative entry pathways available</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Work experience considered</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Additional support services</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Age typically 21 years or older</span>
                  </div>
                </div>
              </div>
            </div>
            
            <input
              type="radio"
              name="applicationType"
              value="mature"
              checked={selectedType === 'mature'}
              onChange={() => handleSelection('mature')}
              className="absolute top-4 right-4"
            />
          </div>
        </div>

        {/* Age Warning */}
        {showAgeWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Warning className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Consider Mature Student Application</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Based on your age ({age} years), you may benefit from applying as a mature student. 
                  This pathway offers additional support and may have more flexible entry requirements 
                  that recognize your life and work experience.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mature Student Information */}
        {selectedType === 'mature' && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Mature Student Application Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">What to Expect:</h5>
                <ul className="space-y-1">
                  <li>• Additional forms to complete</li>
                  <li>• Work experience documentation</li>
                  <li>• Personal statement required</li>
                  <li>• Professional references</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Benefits:</h5>
                <ul className="space-y-1">
                  <li>• Recognition of prior learning</li>
                  <li>• Flexible study options</li>
                  <li>• Dedicated support services</li>
                  <li>• Alternative entry pathways</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <h5 className="font-medium text-blue-900 mb-1">Eligibility Criteria:</h5>
              <p className="text-sm text-blue-800">
                You may be eligible as a mature student if you are 21 years or older and have:
              </p>
              <ul className="text-sm text-blue-800 mt-1 ml-4">
                <li>• At least 3 years of work experience, OR</li>
                <li>• Professional qualifications relevant to your chosen program, OR</li>
                <li>• Significant life experience that demonstrates readiness for higher education</li>
              </ul>
            </div>
          </div>
        )}

        {/* Traditional Student Information */}
        {selectedType === 'traditional' && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Traditional Student Application Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <h5 className="font-medium mb-2">Required Documents:</h5>
                <ul className="space-y-1">
                  <li>• WAEC/WASSCE certificate</li>
                  <li>• Academic transcripts</li>
                  <li>• Passport photograph</li>
                  <li>• National ID or passport</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Entry Requirements:</h5>
                <ul className="space-y-1">
                  <li>• Minimum of 6 credits in WAEC/WASSCE</li>
                  <li>• Including English and Mathematics</li>
                  <li>• Relevant subjects for chosen program</li>
                  <li>• Meet program-specific requirements</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Personal Info
          </button>
          
          <div className="text-sm text-gray-600">
            Application Type Selection
          </div>
          
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedType}
            className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
              selectedType
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedType === 'mature' ? 'Continue as Mature Student' : 'Continue Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatureStudentSelection;