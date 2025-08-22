import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { MenuBook, School, EmojiEvents, Schedule } from '@mui/icons-material';

const ProgramSelectionForm: React.FC = () => {
  const { applicationData, updateProgramSelection, setCurrentStep } = useApplication();
  const [formData, setFormData] = useState({
    programType: '',
    studyLevel: '', // Field for 100, 200, 300, 400
    studyMode: '',
    firstChoice: '',
    secondChoice: '',
    applicationType: '',
    previousQualification: '',
    hasTranscript: false
  });

  // Program categories from new student information system
  const PROGRAM_CATEGORIES = {
    degree: {
      title: "Degree Programmes",
      programs: [
        "B.Sc. Sustainable Agriculture",
        "B.Sc. Environmental Science and Management",
        "Certificate in Agriculture", // This is a degree program (2-year)
        "Certificate in Environmental Science" // Added degree program (2-year)
      ]
    },
    diploma: {
      title: "2-Year Diploma Programme",
      programs: [
        "Diploma in Organic Agriculture" // Only diploma program
      ]
    },
    certificate: {
      title: "1-Year Certificate Courses",
      programs: [
        "Certificate in Sustainable Agriculture",
        "Certificate in Waste Management & Environmental Health", 
        "Certificate in Bee Keeping",
        "Certificate in Agribusiness",
        "Certificate in Business Administration"
      ]
    }
  };

  useEffect(() => {
    // Safely load data with null checks and defaults
    const programSelection = applicationData.programSelection || {};
    setFormData({
      programType: programSelection.programType || '',
      studyLevel: programSelection.studyLevel || '', // Load study level
      studyMode: programSelection.studyMode || '',
      firstChoice: programSelection.firstChoice || '',
      secondChoice: programSelection.secondChoice || '',
      applicationType: programSelection.applicationType || 'fresh',
      previousQualification: programSelection.previousQualification || '',
      hasTranscript: programSelection.hasTranscript || false
    });
  }, [applicationData.programSelection]);

  // Get available programs based on selected program type
  const getAvailablePrograms = () => {
    if (formData.applicationType === 'topup') {
      // For top-up applications, only show degree programs
      return PROGRAM_CATEGORIES.degree.programs;
    }
    
    if (formData.programType === 'degree') {
      return PROGRAM_CATEGORIES.degree.programs;
    } else if (formData.programType === 'diploma') {
      return PROGRAM_CATEGORIES.diploma.programs;
    } else if (formData.programType === 'certificate') {
      return PROGRAM_CATEGORIES.certificate.programs;
    }
    return [];
  };

  // Get program duration text
  const getProgramDuration = () => {
    if (formData.programType === 'degree') {
      if (formData.firstChoice === 'Certificate in Agriculture' || formData.firstChoice === 'Certificate in Environmental Science') {
        return '2 years';
      }
      return '4 years';
    } else if (formData.programType === 'diploma') {
      return '2 years';
    } else if (formData.programType === 'certificate') {
      return '1 year';
    }
    return '';
  };

  // Check if diploma programs have weekend options
  const hasWeekendOption = () => {
    return formData.programType !== 'diploma'; // Diploma only has regular sessions
  };

  // Get available top-up programs for certificate/diploma holders
  const getTopUpPrograms = () => {
    // Only show degree programs for top-up
    return PROGRAM_CATEGORIES.degree.programs;
  };

  // Get study mode description
  const getStudyModeDescription = () => {
    if (formData.studyMode === 'regular') {
      return 'Weekday classes, 2 semesters per year';
    } else if (formData.studyMode === 'weekend') {
      return 'Weekend classes, 3 trimesters per year';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset program choices when program type changes
      if (name === 'programType') {
        newData.firstChoice = '';
        newData.secondChoice = '';
      }
      

      
      // Handle application type changes
      if (name === 'applicationType') {
        if (value === 'fresh') {
          // Fresh applications - let user select Level 100
          newData.studyLevel = '';
        } else if (value === 'topup') {
          // Top-up applications - clear level so it can be set based on qualification
          newData.studyLevel = '';
        }
      }
      
      // Handle previous qualification changes for top-up students
      if (name === 'previousQualification' && prev.applicationType === 'topup') {
        // Reset study level when qualification changes
        newData.studyLevel = '';
        
        // Set default level based on qualification
        if (value?.includes('Certificate')) {
          newData.studyLevel = '200'; // Certificate holders go to Level 200
        } else if (value?.includes('Diploma')) {
          newData.studyLevel = '200'; // Diploma holders default to Level 200 (can choose 300)
        } else if (value === 'Other') {
          newData.studyLevel = '400'; // Other qualifications go to Level 400
        }
      }
      
      // Reset second choice if it matches first choice
      if (name === 'firstChoice' && value === prev.secondChoice) {
        newData.secondChoice = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProgramSelection(formData);
    setCurrentStep(5);
  };

  const handlePrevious = () => {
    updateProgramSelection(formData);
    setCurrentStep(3);
  };

  const availablePrograms = getAvailablePrograms();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MenuBook className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Program Selection</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Application Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Application Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.applicationType === 'fresh' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, applicationType: 'fresh', programType: '', firstChoice: '', secondChoice: '' }))}
              >
                <div className="flex items-center space-x-3">
                  <School className={`h-6 w-6 ${formData.applicationType === 'fresh' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Fresh Application</h3>
                    <p className="text-sm text-gray-600">First-time university application</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="applicationType"
                  value="fresh"
                  checked={formData.applicationType === 'fresh'}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                />
              </div>

              <div 
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.applicationType === 'topup' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, applicationType: 'topup', programType: 'degree', firstChoice: '', secondChoice: '' }))}
              >
                <div className="flex items-center space-x-3">
                  <EmojiEvents className={`h-6 w-6 ${formData.applicationType === 'topup' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Top-Up Application</h3>
                    <p className="text-sm text-gray-600">Continue from Certificate/Diploma to Degree</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="applicationType"
                  value="topup"
                  checked={formData.applicationType === 'topup'}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                />
              </div>
            </div>
          </div>

          {/* Previous Qualification (Top-up only) */}
          {formData.applicationType === 'topup' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Previous Qualification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Qualification *
                  </label>
                  <select
                    name="previousQualification"
                    value={formData.previousQualification}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select your previous qualification</option>
                    <option value="Certificate in Sustainable Agriculture">Certificate in Sustainable Agriculture</option>
                    <option value="Certificate in Business Administration">Certificate in Business Administration</option>
                    <option value="Certificate in Agribusiness">Certificate in Agribusiness</option>
                    <option value="Diploma in Organic Agriculture">Diploma in Organic Agriculture</option>
                    <option value="Other">Other (Please specify in documents)</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasTranscript"
                    name="hasTranscript"
                    checked={formData.hasTranscript}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasTranscript: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="hasTranscript" className="text-sm text-gray-700">
                    I have my official transcript/certificate ready for upload
                  </label>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-100 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Note:</strong> Top-up students must upload their official transcript and certificate from their previous qualification. 
                  You'll be required to upload these documents in the next step.
                </p>
                <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded border">
                  <strong>Updated Level Progression Rules:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Certificate Courses (1-Year):</strong> Proceed to Level 200 (Second Year)</li>
                    <li><strong>Diploma Courses (2-Year):</strong> Proceed to Level 300 or 400 (based on courses completed)</li>
                  </ul>
                  <p className="text-xs mt-2 text-blue-600">
                    * Final level placement will be determined by Academic Affairs based on transcript evaluation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Program Type Selection - Only for fresh applications */}
          {formData.applicationType === 'fresh' && (
            <div>
              <label htmlFor="programType" className="block text-sm font-medium text-gray-700 mb-3">
                Program Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.programType === 'degree' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, programType: 'degree', firstChoice: '', secondChoice: '' }))}
              >
                <div className="flex items-center space-x-3">
                  <School className={`h-8 w-8 ${formData.programType === 'degree' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Degree Programs</h3>
                    <p className="text-sm text-gray-600">4-year undergraduate degree programs</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="programType"
                  value="degree"
                  checked={formData.programType === 'degree'}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                />
              </div>

              <div 
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.programType === 'diploma' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, programType: 'diploma', firstChoice: '', secondChoice: '' }))}
              >
                <div className="flex items-center space-x-3">
                  <EmojiEvents className={`h-8 w-8 ${formData.programType === 'diploma' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Diploma Programs</h3>
                    <p className="text-sm text-gray-600">2-year diploma programs</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="programType"
                  value="diploma"
                  checked={formData.programType === 'diploma'}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                />
              </div>

              <div 
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.programType === 'certificate' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, programType: 'certificate', firstChoice: '', secondChoice: '' }))}
              >
                <div className="flex items-center space-x-3">
                  <EmojiEvents className={`h-8 w-8 ${formData.programType === 'certificate' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Certificate Courses</h3>
                    <p className="text-sm text-gray-600">1-year professional certificate programs</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="programType"
                  value="certificate"
                  checked={formData.programType === 'certificate'}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                />
              </div>
            </div>
            </div>
          )}

          {/* Level and Study Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="studyLevel" className="block text-sm font-medium text-gray-700">
                Level of Study *
              </label>
              <select
                id="studyLevel"
                name="studyLevel"
                required
                value={formData.studyLevel}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Level</option>
                {formData.applicationType === 'fresh' && (
                  <option value="100">Level 100 (First Year)</option>
                )}
                {formData.applicationType === 'topup' && (
                  <>
                    {/* Show Level 200 for Certificate qualifications */}
                    {(formData.previousQualification?.includes('Certificate') || !formData.previousQualification) && (
                      <option value="200">Level 200 (Second Year) - Top-up from Certificate</option>
                    )}
                    {/* Show Level 200 and 300 for Diploma qualifications */}
                    {formData.previousQualification?.includes('Diploma') && (
                      <>
                        <option value="200">Level 200 (Second Year) - Top-up from Diploma</option>
                        <option value="300">Level 300 (Third Year) - Top-up from Diploma</option>
                      </>
                    )}
                    {/* Show Level 400 for other advanced qualifications */}
                    {formData.previousQualification === 'Other' && (
                      <option value="400">Level 400 (Fourth Year) - Top-up from Advanced Qualification</option>
                    )}
                  </>
                )}
                {/* Fallback for other cases */}
                {!formData.applicationType && (
                  <>
                    <option value="100">Level 100 (First Year)</option>
                    <option value="200">Level 200 (Second Year)</option>
                    <option value="300">Level 300 (Third Year)</option>
                    <option value="400">Level 400 (Fourth Year)</option>
                  </>
                )}
              </select>
              {/* Show level selection info */}
              {formData.applicationType === 'fresh' && (
                <p className="text-xs text-green-600 mt-1">
                  Fresh students select Level 100 (First Year) to start their program
                </p>
              )}
              {formData.applicationType === 'topup' && (
                <p className="text-xs text-blue-600 mt-1">
                  Available levels depend on your previous qualification: Certificate → Level 200, Diploma → Level 200 or 300
                </p>
              )}
            </div>

            <div>
              <label htmlFor="studyMode" className="block text-sm font-medium text-gray-700">
                Study Mode *
              </label>
              <select
                id="studyMode"
                name="studyMode"
                required
                value={formData.studyMode}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Mode</option>
                <option value="regular">Regular</option>
                {hasWeekendOption() && <option value="weekend">Weekend</option>}
              </select>
              {formData.programType === 'diploma' && (
                <p className="text-xs text-orange-600 mt-1">
                  Note: Diploma programs are only available in regular sessions (weekdays)
                </p>
              )}
              {formData.studyMode && (
                <p className="text-xs text-gray-600 mt-1">
                  <Schedule className="h-3 w-3 inline mr-1" />
                  {getStudyModeDescription()}
                </p>
              )}
            </div>
          </div>



          {/* Program Selection - Show for fresh apps with program type or top-up apps */}
          {((formData.applicationType === 'fresh' && formData.programType) || formData.applicationType === 'topup') && (
            <>
              <div>
                <label htmlFor="firstChoice" className="block text-sm font-medium text-gray-700">
                  First Choice Program *
                </label>
                <select
                  id="firstChoice"
                  name="firstChoice"
                  required
                  value={formData.firstChoice}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Program</option>
                  {availablePrograms.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="secondChoice" className="block text-sm font-medium text-gray-700">
                  Second Choice Program (Optional)
                </label>
                <select
                  id="secondChoice"
                  name="secondChoice"
                  value={formData.secondChoice}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Program (Optional)</option>
                  {availablePrograms
                    .filter(program => program !== formData.firstChoice)
                    .map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                </select>
              </div>

              {/* Program Information */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <MenuBook className="h-4 w-4 mr-2 text-green-600" />
                  Program Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-700">
                      <strong>Program Type:</strong> {formData.programType === 'degree' ? 'Degree Program' : 'Certificate Course'}
                    </p>
                    {getProgramDuration() && (
                      <p className="text-gray-700">
                        <strong>Duration:</strong> {getProgramDuration()}
                      </p>
                    )}
                    {formData.studyLevel && (
                      <p className="text-gray-700">
                        <strong>Study Level:</strong> Level {formData.studyLevel}
                      </p>
                    )}
                  </div>
                  <div>
                    {formData.studyMode && (
                      <p className="text-gray-700">
                        <strong>Schedule:</strong> {formData.studyMode === 'regular' ? 'Regular (Weekdays)' : 'Weekend'}
                      </p>
                    )}
                    {formData.programType === 'certificate' && (
                      <p className="text-blue-700 font-medium">
                        ✓ Professional certification upon completion
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Please ensure you meet the minimum entry requirements for your selected programs. 
                  Detailed program information is available on our website.
                </p>
              </div>
            </>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Step 4 of 6 • Program Selection
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Next: Document Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramSelectionForm;