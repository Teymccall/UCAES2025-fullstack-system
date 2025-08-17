import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import CloudinaryService from '../../utils/cloudinaryService';
import SchoolAutocomplete from '../UI/SchoolAutocomplete';

const AcademicBackgroundForm: React.FC = () => {
  const { applicationData, updateAcademicBackground, setCurrentStep } = useApplication();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    shsProgram: '',
    waecIndexNumber: '',
    qualificationType: '',
    yearCompleted: '',
    subjects: [],
    coreSubjects: [
      { subject: '', grade: '' },
      { subject: '', grade: '' },
      { subject: '', grade: '' }
    ],
    electiveSubjects: [
      { subject: '', grade: '' },
      { subject: '', grade: '' },
      { subject: '', grade: '' }
    ],
    certificates: []
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    // Safely load data with null checks and defaults
    const academicBackground = applicationData.academicBackground || {};
    setFormData({
      schoolName: academicBackground.schoolName || '',
      shsProgram: academicBackground.shsProgram || '',
      waecIndexNumber: academicBackground.waecIndexNumber || '',
      qualificationType: academicBackground.qualificationType || '',
      yearCompleted: academicBackground.yearCompleted || '',
      subjects: academicBackground.subjects || [],
      coreSubjects: academicBackground.coreSubjects || [
        { subject: '', grade: '' },
        { subject: '', grade: '' },
        { subject: '', grade: '' }
      ],
      electiveSubjects: academicBackground.electiveSubjects || [
        { subject: '', grade: '' },
        { subject: '', grade: '' },
        { subject: '', grade: '' }
      ],
      certificates: academicBackground.certificates || []
    });
  }, [applicationData.academicBackground]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle school name change from autocomplete
  const handleSchoolNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      schoolName: value
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { subject: '', grade: '' }]
    }));
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const updateSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const updateCoreSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    setFormData(prev => ({
      ...prev,
      coreSubjects: prev.coreSubjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const updateElectiveSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    setFormData(prev => ({
      ...prev,
      electiveSubjects: prev.electiveSubjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  // WAEC Core subjects (compulsory)
  const coreSubjects = [
    'English Language',
    'Core Mathematics', 
    'Integrated Science',
    'Social Studies'
  ];

  // WAEC Elective subjects
  const electiveSubjects = [
    'Biology', 'Chemistry', 'Physics', 'Elective Mathematics',
    'Geography', 'Economics', 'Government', 'History', 
    'Literature in English', 'Business Management', 'Accounting',
    'Cost Accounting', 'CRS', 'Food and Nutrition', 
    'Clothing and Textiles', 'Technical Drawing', 'General Agriculture',
    'Animal Husbandry', 'ICT', 'French', 'Further Mathematics'
  ];

  // Get available subjects for dropdowns (exclude already selected ones)
  const getAvailableCoreSubjects = (currentIndex: number) => {
    const selectedSubjects = formData.coreSubjects
      .map((s, i) => i !== currentIndex ? s.subject : '')
      .filter(Boolean);
    return coreSubjects.filter(subject => !selectedSubjects.includes(subject));
  };

  const getAvailableElectiveSubjects = (currentIndex: number) => {
    const selectedSubjects = formData.electiveSubjects
      .map((s, i) => i !== currentIndex ? s.subject : '')
      .filter(Boolean);
    return electiveSubjects.filter(subject => !selectedSubjects.includes(subject));
  };

  // Validation function for WAEC subjects
  const validateSubjects = () => {
    // Check if all 3 core subjects are filled
    const validCoreSubjects = formData.coreSubjects.filter(s => s.subject && s.grade).length;
    // Check if all 3 elective subjects are filled  
    const validElectiveSubjects = formData.electiveSubjects.filter(s => s.subject && s.grade).length;
    
    return validCoreSubjects === 3 && validElectiveSubjects === 3;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0 || !user?.id) {
      console.warn('⚠️ AcademicBackgroundForm: No files selected or no user ID');
      return;
    }

    console.log('📁 AcademicBackgroundForm: Files selected for upload:', {
      count: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      userId: user.id
    });

    setUploading(true);
    setUploadStatus('uploading');
    setUploadError('');

    try {
      const uploadedCertificates = [];
      
      // Upload each file to Cloudinary
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`🚀 AcademicBackgroundForm: Uploading file ${i + 1}/${files.length}: ${file.name}`);
        
        // Validate file
        const validation = CloudinaryService.validateFile(file);
        if (!validation.valid) {
          throw new Error(`File "${file.name}": ${validation.error}`);
        }
        
        // Upload to Cloudinary
        const result = await CloudinaryService.uploadDocument(file, 'certificate', user.id);
        
        if (result.success && result.url && result.publicId) {
          uploadedCertificates.push({
            name: file.name,
            url: result.url,
            publicId: result.publicId,
            uploadedAt: new Date().toISOString()
          });
          console.log(`✅ AcademicBackgroundForm: File ${i + 1} uploaded successfully:`, result.url);
        } else {
          throw new Error(`Failed to upload "${file.name}": ${result.error || 'Unknown error'}`);
        }
      }

      // Update form data with uploaded certificate URLs
      setFormData(prev => ({
        ...prev,
        certificates: uploadedCertificates
      }));

      setUploadStatus('success');
      console.log('🎉 AcademicBackgroundForm: All files uploaded successfully!', uploadedCertificates);
      
    } catch (error) {
      console.error('❌ AcademicBackgroundForm: Upload failed:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all required subjects are filled
    if (!validateSubjects()) {
      alert('Please fill in all 3 core subjects and 3 elective subjects with their grades before proceeding.');
      return;
    }
    
    // Combine all subjects for storage
    const allSubjects = [
      ...formData.coreSubjects.filter(s => s.subject && s.grade),
      ...formData.electiveSubjects.filter(s => s.subject && s.grade)
    ];
    
    const updatedFormData = {
      ...formData,
      subjects: allSubjects // Keep backward compatibility
    };
    
    updateAcademicBackground(updatedFormData);
    setCurrentStep(4);
  };

  const handlePrevious = () => {
    updateAcademicBackground(formData);
    setCurrentStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <GraduationCap className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Academic Background</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Name with Autocomplete */}
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                School/Institution Name *
              </label>
              <SchoolAutocomplete
                value={formData.schoolName}
                onChange={handleSchoolNameChange}
                placeholder="Type to search for your school (e.g., Achimota School, Prempeh College)..."
                required
                className="mt-1"
                region={applicationData.personalInfo?.region}
              />
              <p className="mt-1 text-xs text-gray-500">
                🔍 Start typing your school name to see suggestions from Ghanaian Senior High Schools
              </p>
            </div>

            <div>
              <label htmlFor="shsProgram" className="block text-sm font-medium text-gray-700">
                SHS Program *
              </label>
              <select
                id="shsProgram"
                name="shsProgram"
                required
                value={formData.shsProgram}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select your SHS Program</option>
                <option value="General Science">General Science</option>
                <option value="General Arts">General Arts</option>
                <option value="Business">Business</option>
                <option value="Home Economics">Home Economics</option>
                <option value="Visual Arts">Visual Arts</option>
                <option value="Agricultural Science">Agricultural Science</option>
                <option value="Technical">Technical</option>
                <option value="Vocational">Vocational</option>
              </select>
            </div>

            <div>
              <label htmlFor="waecIndexNumber" className="block text-sm font-medium text-gray-700">
                WAEC Index Number *
              </label>
              <input
                type="text"
                id="waecIndexNumber"
                name="waecIndexNumber"
                required
                value={formData.waecIndexNumber}
                onChange={handleChange}
                placeholder="e.g., 1234567890"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="qualificationType" className="block text-sm font-medium text-gray-700">
                Qualification Type *
              </label>
              <select
                id="qualificationType"
                name="qualificationType"
                required
                value={formData.qualificationType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Qualification</option>
                <option value="wassce">WASSCE</option>
                <option value="ssce">SSCE</option>
                <option value="novdec">Nov/Dec</option>
                <option value="diploma">Diploma</option>
                <option value="hnd">HND</option>
                <option value="degree">Bachelor's Degree</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="yearCompleted" className="block text-sm font-medium text-gray-700">
                Year Completed *
              </label>
              <input
                type="number"
                id="yearCompleted"
                name="yearCompleted"
                required
                min="1980"
                max="2025"
                value={formData.yearCompleted}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* WAEC Subject Results - Restructured */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">WAEC/WASSCE Subject Results *</h3>
              <p className="text-sm text-gray-600 mb-6">
                Please enter your 3 best core subjects and 3 best elective subjects. All fields are required.
              </p>
            </div>

            {/* Core Subjects */}
            <div>
              <h4 className="text-md font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Core Subjects (3 required)
              </h4>
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                {formData.coreSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <select
                        value={subject.subject}
                        onChange={(e) => updateCoreSubject(index, 'subject', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select Core Subject</option>
                        {getAvailableCoreSubjects(index).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        {/* Show currently selected subject if it exists */}
                        {subject.subject && (
                          <option value={subject.subject}>{subject.subject}</option>
                        )}
                      </select>
                    </div>
                    <div className="w-24">
                      <select
                        value={subject.grade}
                        onChange={(e) => updateCoreSubject(index, 'grade', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Grade</option>
                        <option value="A1">A1</option>
                        <option value="B2">B2</option>
                        <option value="B3">B3</option>
                        <option value="C4">C4</option>
                        <option value="C5">C5</option>
                        <option value="C6">C6</option>
                        <option value="D7">D7</option>
                        <option value="E8">E8</option>
                        <option value="F9">F9</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elective Subjects */}
            <div>
              <h4 className="text-md font-semibold text-blue-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Elective Subjects (3 required)
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                {formData.electiveSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <select
                        value={subject.subject}
                        onChange={(e) => updateElectiveSubject(index, 'subject', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select Elective Subject</option>
                        {getAvailableElectiveSubjects(index).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        {/* Show currently selected subject if it exists */}
                        {subject.subject && (
                          <option value={subject.subject}>{subject.subject}</option>
                        )}
                      </select>
                    </div>
                    <div className="w-24">
                      <select
                        value={subject.grade}
                        onChange={(e) => updateElectiveSubject(index, 'grade', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Grade</option>
                        <option value="A1">A1</option>
                        <option value="B2">B2</option>
                        <option value="B3">B3</option>
                        <option value="C4">C4</option>
                        <option value="C5">C5</option>
                        <option value="C6">C6</option>
                        <option value="D7">D7</option>
                        <option value="E8">E8</option>
                        <option value="F9">F9</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Status */}
            <div className={`p-3 rounded-lg border ${validateSubjects() 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {validateSubjects() ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {validateSubjects() 
                    ? 'All required subjects completed ✓' 
                    : 'Please complete all 6 subjects (3 core + 3 elective) to proceed'
                  }
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Certificates/Transcripts
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
              uploadStatus === 'error' ? 'border-red-300 bg-red-50' : 
              uploadStatus === 'uploading' ? 'border-blue-300 bg-blue-50' :
              uploadStatus === 'success' ? 'border-green-300 bg-green-50' : 
              'border-gray-300 hover:border-green-400'
            }`}>
              <div className="space-y-1 text-center">
                {uploadStatus === 'uploading' ? (
                  <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
                ) : uploadStatus === 'success' ? (
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                
                {uploadStatus === 'uploading' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600 font-medium">
                      Uploading to Cloudinary...
                    </p>
                    <p className="text-xs text-blue-500">
                      Please wait, this may take a few seconds
                    </p>
                  </div>
                ) : uploadStatus === 'error' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 font-medium">
                      Upload Failed
                    </p>
                    <p className="text-xs text-red-500">
                      {uploadError}
                    </p>
                    <label
                      htmlFor="certificates"
                      className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 cursor-pointer"
                    >
                      Try Again
                    </label>
                  </div>
                ) : uploadStatus === 'success' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Files uploaded successfully to Cloudinary!
                    </p>
                    <div className="space-y-1">
                      {formData.certificates.map((cert, index) => (
                        <div key={index} className="text-xs text-green-600">
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            📄 {cert.name}
                          </a>
                        </div>
                      ))}
                    </div>
                    <label
                      htmlFor="certificates"
                      className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 cursor-pointer"
                    >
                      Upload More Files
                    </label>
                  </div>
                ) : (
                  <div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="certificates"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload files</span>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG up to 5MB each
                    </p>
                  </div>
                )}
                
                <input
                  id="certificates"
                  name="certificates"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Previous
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Next: Program Selection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicBackgroundForm;