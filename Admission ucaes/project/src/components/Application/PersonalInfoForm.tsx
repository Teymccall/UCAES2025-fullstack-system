import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Person, Warning, CheckCircle, Upload, Close, CameraAlt } from '@mui/icons-material';
import { CloudinaryService } from '../../utils/cloudinaryService';

const PersonalInfoForm: React.FC = () => {
  const { applicationData, updatePersonalInfo, setCurrentStep } = useApplication();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    region: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    // Safely load data with null checks and defaults
    console.log('🔄 PersonalInfoForm: Loading data from applicationData');
    console.log('📋 Raw applicationData.personalInfo:', applicationData.personalInfo);
    
    const personalInfo = applicationData.personalInfo || {};
    console.log('🔍 Processed personalInfo:', personalInfo);
    
    const formDataToSet = {
      firstName: personalInfo.firstName || '',
      lastName: personalInfo.lastName || '',
      dateOfBirth: personalInfo.dateOfBirth || '',
      gender: personalInfo.gender || '',
      nationality: personalInfo.nationality || '',
      region: personalInfo.region || ''
    };
    
    console.log('📝 Setting form data to:', formDataToSet);
    setFormData(formDataToSet);
    
    // Load existing passport photo if available
    if (personalInfo.passportPhoto?.url) {
      console.log('📸 Loading existing passport photo:', personalInfo.passportPhoto.url);
      setPhotoPreview(personalInfo.passportPhoto.url);
    } else {
      console.log('📸 No existing passport photo found');
    }
  }, [applicationData.personalInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    console.log('🔄 handleChange called:', {
      field: e.target.name,
      value: e.target.value,
      currentFormData: formData
    });
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [e.target.name]: e.target.value
      };
      console.log('📝 New form data:', newData);
      return newData;
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = CloudinaryService.validateFile(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, passportPhoto: validation.error || 'Invalid file' }));
        return;
      }

      setPassportPhoto(file);
      setErrors(prev => ({ ...prev, passportPhoto: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary immediately
      setPhotoUploading(true);
      try {
        const userId = user?.id || 'unknown';
        
        const result = await CloudinaryService.uploadDocument(
          file,
          'passportPhoto',
          userId
        );

        if (result.success && result.url && result.publicId) {
          // Update form data with the uploaded photo
          setFormData(prev => ({
            ...prev,
            passportPhoto: { url: result.url, publicId: result.publicId }
          }));
          
          console.log('✅ Passport photo uploaded successfully:', result.url);
        } else {
          setErrors(prev => ({ ...prev, passportPhoto: result.error || 'Upload failed' }));
          setPassportPhoto(null);
          setPhotoPreview(null);
        }
      } catch (error) {
        console.error('Error uploading passport photo:', error);
        setErrors(prev => ({ ...prev, passportPhoto: 'Upload failed' }));
        setPassportPhoto(null);
        setPhotoPreview(null);
      } finally {
        setPhotoUploading(false);
      }
    }
  };



  const removePhoto = () => {
    setPassportPhoto(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, passportPhoto: undefined }));
    setErrors(prev => ({ ...prev, passportPhoto: '' }));
  };



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Validate date format (dd-mm-yyyy)
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Please enter date in dd-mm-yyyy format';
      } else {
        const [day, month, year] = formData.dateOfBirth.split('-');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        
        // Check if birthday has occurred this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 16 || age > 100) {
          newErrors.dateOfBirth = 'Age must be between 16 and 100 years';
        }
      }
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    // Validate nationality
    if (!formData.nationality) {
      newErrors.nationality = 'Please select your nationality';
    }

    // Validate region
    if (!formData.region) {
      newErrors.region = 'Please select your region';
    }

    // Validate passport photo
    if (!photoPreview && !formData.passportPhoto?.url) {
      newErrors.passportPhoto = 'Please upload a passport photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🧪 PersonalInfoForm: Form submitted');
    console.log('📋 Form data to save:', formData);
    console.log('👤 Current user:', user);
    
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }

    console.log('✅ Validation passed, saving data...');
    setIsSubmitting(true);
    
    try {
      // Photo is already uploaded, just save the form data
      console.log('💾 Calling updatePersonalInfo with:', formData);
      updatePersonalInfo(formData);
      
      console.log('✅ Personal info updated, checking age for mature student...');
      
      // Check if user should be prompted for mature student selection
      const birthDate = new Date(formData.dateOfBirth.split('-').reverse().join('-'));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      console.log('🎂 Calculated age:', age);
      
      // If user is 21 or older and hasn't selected mature student type, show selection
      if (age >= 21 && applicationData.isMatureStudent === undefined) {
        console.log('👴 User is mature student, going to step 1.1');
        setCurrentStep(1.1); // Go to mature student selection
      } else {
        console.log('👶 User is regular student, going to step 2');
        setCurrentStep(2); // Go to contact info
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save information' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Person className="h-5 w-5 text-green-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs md:text-sm">
            <span className="text-gray-500">Completion:</span>
            <div className="w-16 md:w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(formData).filter(val => val && val.toString().trim() !== '').length + (photoPreview || formData.passportPhoto?.url ? 1 : 0)) / 7 * 100}%` 
                }}
              ></div>
            </div>
            <span className="text-gray-600 font-medium">
              {Math.round((Object.values(formData).filter(val => val && val.toString().trim() !== '').length + (photoPreview || formData.passportPhoto?.url ? 1 : 0)) / 7 * 100)}%
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Test button to manually save data */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <h4 className="font-medium text-yellow-900 mb-2">🧪 Debug Test</h4>
            <p className="text-sm text-yellow-800 mb-2">Current form data: {JSON.stringify(formData)}</p>
            <button
              type="button"
              onClick={() => {
                console.log('🧪 Manual test: Current form data:', formData);
                console.log('🧪 Manual test: Calling updatePersonalInfo directly...');
                updatePersonalInfo(formData);
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
            >
              🧪 Test: Save Personal Info Manually
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.firstName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder=""
              />
              {errors.firstName && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <Warning className="h-4 w-4 mr-1" />
                  {errors.firstName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.lastName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder=""
              />
              {errors.lastName && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <Warning className="h-4 w-4 mr-1" />
                  {errors.lastName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                type="text"
                id="dateOfBirth"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                placeholder=""
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.dateOfBirth 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <Warning className="h-4 w-4 mr-1" />
                  {errors.dateOfBirth}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.gender 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <Warning className="h-4 w-4 mr-1" />
                  {errors.gender}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                Nationality *
              </label>
              <select
                id="nationality"
                name="nationality"
                required
                value={formData.nationality}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Nationality</option>
                <option value="ghanaian">Ghanaian</option>
                <option value="nigerian">Nigerian</option>
                <option value="ivorian">Ivorian</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                Region *
              </label>
              <select
                id="region"
                name="region"
                required
                value={formData.region}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Region</option>
                <option value="greater-accra">Greater Accra</option>
                <option value="ashanti">Ashanti</option>
                <option value="northern">Northern</option>
                <option value="eastern">Eastern</option>
                <option value="western">Western</option>
                <option value="central">Central</option>
                <option value="volta">Volta</option>
                <option value="upper-east">Upper East</option>
                <option value="upper-west">Upper West</option>
                <option value="brong-ahafo">Brong Ahafo</option>
              </select>
            </div>
          </div>

          {/* Passport Photo Upload */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passport Photo *
            </label>
            <div className="space-y-4">
              {/* Photo Preview */}
              {photoPreview && (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Passport photo preview"
                    className="w-32 h-40 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Close className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload Area */}
              {!photoPreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    id="passportPhoto"
                    name="passportPhoto"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="passportPhoto"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <CameraAlt className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload passport photo
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG up to 5MB. Clear, recent photo required.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Upload Button for New Photo */}
              {photoPreview && (
                <div>
                  <input
                    type="file"
                    id="passportPhotoNew"
                    name="passportPhotoNew"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="passportPhotoNew"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </label>
                </div>
              )}

              {/* Error Message */}
              {errors.passportPhoto && (
                <div className="flex items-center text-sm text-red-600">
                  <Warning className="h-4 w-4 mr-1" />
                  {errors.passportPhoto}
                </div>
              )}

              {/* Upload Progress */}
              {photoUploading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span>Uploading passport photo...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-600">
              Step 1 of 6 • Personal Information
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Next: Contact Information
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoForm;