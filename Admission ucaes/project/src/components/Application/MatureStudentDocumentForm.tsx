import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Description, CheckCircle, Loop, Warning, EmojiEvents, Work, School, Person } from '@mui/icons-material';
import CloudinaryService from '../../utils/cloudinaryService';

interface MatureStudentDocuments {
  // Identity and Personal Documents
  nationalId?: { url: string; publicId: string };
  passportPhoto?: { url: string; publicId: string };
  
  // Work Experience Documents
  employmentLetters?: Array<{ url: string; publicId: string; name: string }>;
  payslips?: Array<{ url: string; publicId: string; name: string }>;
  workCertificates?: Array<{ url: string; publicId: string; name: string }>;
  
  // Professional Qualifications
  professionalCertificates?: Array<{ url: string; publicId: string; name: string }>;
  trainingCertificates?: Array<{ url: string; publicId: string; name: string }>;
  
  // Educational Documents (if any)
  previousCertificates?: Array<{ url: string; publicId: string; name: string }>;
  transcripts?: Array<{ url: string; publicId: string; name: string }>;
  
  // Supporting Documents
  motivationLetter?: { url: string; publicId: string };
  references?: Array<{ url: string; publicId: string; name: string }>;
  portfolioWork?: Array<{ url: string; publicId: string; name: string }>;
  
  // Special Circumstances
  medicalCertificate?: { url: string; publicId: string };
  disabilityDocuments?: Array<{ url: string; publicId: string; name: string }>;
  financialDocuments?: Array<{ url: string; publicId: string; name: string }>;
}

const MatureStudentDocumentForm: React.FC = () => {
  const { applicationData, updateMatureStudentDocuments, setCurrentStep } = useApplication();
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<MatureStudentDocuments>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(1);

  useEffect(() => {
    // Load existing documents if available
    const matureStudentDocs = applicationData.matureStudentDocuments || {};
    setDocuments(matureStudentDocs);
  }, [applicationData.matureStudentDocuments]);

  const handleSingleFileUpload = (documentType: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      console.log('📁 MatureStudentDocumentForm: Single file selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        documentType: documentType,
        userId: user.id
      });

      // Validate file
      const validation = CloudinaryService.validateFile(file);
      if (!validation.valid) {
        console.error('❌ File validation failed:', validation.error);
        setUploadErrors(prev => ({
          ...prev,
          [documentType]: validation.error || 'Invalid file'
        }));
        return;
      }

      // Clear previous error
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[documentType];
        return newErrors;
      });

      setUploading(documentType);

      try {
        console.log('🚀 Starting upload to Cloudinary...');
        
        const result = await CloudinaryService.uploadDocument(file, documentType, user.id);
        
        if (result.success && result.url && result.publicId) {
          console.log('✅ Upload successful, updating documents state');
          
          setDocuments(prev => ({
            ...prev,
            [documentType]: {
              url: result.url,
              publicId: result.publicId
            }
          }));
          
          console.log('✅ Documents state updated successfully');
        } else {
          console.error('❌ Upload failed:', result.error);
          setUploadErrors(prev => ({
            ...prev,
            [documentType]: result.error || 'Upload failed'
          }));
        }
      } catch (error) {
        console.error('💥 Upload error:', error);
        setUploadErrors(prev => ({
          ...prev,
          [documentType]: error instanceof Error ? error.message : 'Upload failed. Please try again.'
        }));
      } finally {
        setUploading(null);
      }
    }
  };

  const handleMultipleFileUpload = (documentType: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user?.id) {
      console.warn('⚠️ No files selected or no user ID');
      return;
    }

    console.log('📁 Multiple files selected:', {
      count: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      documentType: documentType,
      userId: user.id
    });

    setUploading(documentType);
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[documentType];
      return newErrors;
    });

    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`🚀 Uploading file ${i + 1}/${files.length}: ${file.name}`);
        
        // Validate file
        const validation = CloudinaryService.validateFile(file);
        if (!validation.valid) {
          throw new Error(`File "${file.name}": ${validation.error}`);
        }
        
        // Upload to Cloudinary
        const result = await CloudinaryService.uploadDocument(file, documentType, user.id);
        
        if (result.success && result.url && result.publicId) {
          uploadedFiles.push({
            name: file.name,
            url: result.url,
            publicId: result.publicId
          });
          console.log(`✅ File ${i + 1} uploaded successfully:`, result.url);
        } else {
          throw new Error(`Failed to upload "${file.name}": ${result.error || 'Unknown error'}`);
        }
      }

      // Update documents state
      setDocuments(prev => ({
        ...prev,
        [documentType]: uploadedFiles
      }));

      console.log('🎉 All files uploaded successfully!', uploadedFiles);
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadErrors(prev => ({
        ...prev,
        [documentType]: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      }));
    } finally {
      setUploading(null);
    }
  };

  const DocumentUploadBox: React.FC<{
    title: string;
    description: string;
    documentType: string;
    required?: boolean;
    multiple?: boolean;
    icon?: React.ComponentType<any>;
  }> = ({ title, description, documentType, required = false, multiple = false, icon: Icon = FileText }) => {
    const document = documents[documentType as keyof MatureStudentDocuments];
    const isUploading = uploading === documentType;
    const error = uploadErrors[documentType];
    
    const hasDocument = multiple 
      ? Array.isArray(document) && document.length > 0
      : document && typeof document === 'object' && 'url' in document;
    
    return (
      <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        error ? 'border-red-300 bg-red-50' : 
        isUploading ? 'border-blue-300 bg-blue-50' :
        hasDocument ? 'border-green-300 bg-green-50' : 
        'border-gray-300 hover:border-green-400'
      }`}>
        <div className="text-center">
          <div className="flex justify-center mb-3">
            {isUploading ? (
              <Loop className="h-12 w-12 text-blue-600 animate-spin" />
            ) : error ? (
              <Warning className="h-12 w-12 text-red-600" />
            ) : hasDocument ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <Icon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title} {required && <span className="text-red-500">*</span>}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          
          {isUploading ? (
            <div className="space-y-2">
              <p className="text-sm text-blue-600 font-medium">
                Uploading to Cloudinary...
              </p>
              <p className="text-xs text-blue-500">
                Please wait, this may take a few seconds
              </p>
            </div>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
              <p className="text-xs text-red-500">
                Please check your file and try again
              </p>
              <label
                htmlFor={documentType}
                className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 cursor-pointer"
              >
                Try Again
              </label>
            </div>
          ) : hasDocument ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✓ {multiple ? `${Array.isArray(document) ? document.length : 0} file(s)` : 'Document'} uploaded successfully
              </p>
              {multiple && Array.isArray(document) ? (
                <div className="space-y-1">
                  {document.map((doc, index) => (
                    <div key={index} className="text-xs text-green-600">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        📄 {doc.name}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                typeof document === 'object' && 'url' in document && (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-green-600 text-xs font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                  >
                    View Document
                  </a>
                )
              )}
              <label
                htmlFor={documentType}
                className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 cursor-pointer"
              >
                {multiple ? 'Add More Files' : 'Change File'}
              </label>
            </div>
          ) : (
            <label
              htmlFor={documentType}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              {multiple ? 'Choose Files' : 'Choose File'}
            </label>
          )}
          
          <input
            id={documentType}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple={multiple}
            onChange={multiple ? handleMultipleFileUpload(documentType) : handleSingleFileUpload(documentType)}
            className="hidden"
            disabled={isUploading}
          />
          
          <p className="text-xs text-gray-500 mt-2">
            PDF, JPG, PNG, DOC, DOCX (Max: 5MB {multiple ? 'each' : ''})
          </p>
        </div>
      </div>
    );
  };

  const renderSection1 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <Person className="h-6 w-6 text-green-600 mr-2" />
          Identity and Personal Documents
        </h3>
        <p className="text-gray-600">
          Upload your identification documents and passport photo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadBox
          title="National ID or Passport"
          description="Valid government-issued identification document"
          documentType="nationalId"
          required
          icon={User}
        />
        
        <DocumentUploadBox
          title="Passport Photo"
          description="Recent passport-size photograph"
          documentType="passportPhoto"
          required
          icon={User}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Document Requirements:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>�� ID document must be clear and all text must be legible</li>
          <li>• Passport photo should be recent (taken within the last 6 months)</li>
          <li>• Documents must be in color and high resolution</li>
        </ul>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <Work className="h-6 w-6 text-green-600 mr-2" />
          Work Experience Documentation
        </h3>
        <p className="text-gray-600">
          Upload documents that verify your work experience and employment history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadBox
          title="Employment Letters"
          description="Letters from employers confirming your employment and roles"
          documentType="employmentLetters"
          required
          multiple
          icon={Briefcase}
        />
        
        <DocumentUploadBox
          title="Pay Slips"
          description="Recent pay slips or salary statements (last 3-6 months)"
          documentType="payslips"
          multiple
          icon={Briefcase}
        />
        
        <DocumentUploadBox
          title="Work Certificates"
          description="Certificates of service, completion letters, or work references"
          documentType="workCertificates"
          multiple
          icon={Award}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Work Experience Guidelines:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Employment letters should be on company letterhead</li>
          <li>• Include start and end dates, position held, and key responsibilities</li>
          <li>• Self-employed applicants can provide business registration documents</li>
          <li>• Volunteer work certificates are also acceptable</li>
        </ul>
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <EmojiEvents className="h-6 w-6 text-green-600 mr-2" />
          Professional Qualifications & Training
        </h3>
        <p className="text-gray-600">
          Upload certificates and documentation of your professional qualifications and training.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadBox
          title="Professional Certificates"
          description="Industry certifications, professional licenses, or trade qualifications"
          documentType="professionalCertificates"
          multiple
          icon={Award}
        />
        
        <DocumentUploadBox
          title="Training Certificates"
          description="Workshop certificates, course completion certificates, or skill training"
          documentType="trainingCertificates"
          multiple
          icon={GraduationCap}
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Professional Documentation Tips:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Include all relevant professional certifications</li>
          <li>• Training certificates from recognized institutions are preferred</li>
          <li>• Online course certificates are acceptable if from accredited providers</li>
          <li>• Include any industry-specific qualifications related to your chosen program</li>
        </ul>
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <School className="h-6 w-6 text-green-600 mr-2" />
          Educational Background (If Applicable)
        </h3>
        <p className="text-gray-600">
          If you have any previous formal education, upload the relevant certificates and transcripts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadBox
          title="Previous Certificates"
          description="Any certificates from previous formal education (secondary, tertiary, etc.)"
          documentType="previousCertificates"
          multiple
          icon={GraduationCap}
        />
        
        <DocumentUploadBox
          title="Academic Transcripts"
          description="Official transcripts from previous educational institutions"
          documentType="transcripts"
          multiple
          icon={FileText}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Educational Documents Note:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only upload if you have completed formal education beyond secondary school</li>
          <li>• Transcripts should be official copies from the institution</li>
          <li>• Include any incomplete qualifications if relevant to your application</li>
          <li>• International qualifications should include translation if not in English</li>
        </ul>
      </div>
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <Description className="h-6 w-6 text-green-600 mr-2" />
          Supporting Documents & References
        </h3>
        <p className="text-gray-600">
          Upload additional supporting documents that strengthen your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadBox
          title="Motivation Letter"
          description="A detailed letter explaining your motivation for pursuing higher education"
          documentType="motivationLetter"
          icon={FileText}
        />
        
        <DocumentUploadBox
          title="Reference Letters"
          description="Letters of recommendation from employers, colleagues, or community leaders"
          documentType="references"
          multiple
          icon={FileText}
        />
        
        <DocumentUploadBox
          title="Portfolio/Work Samples"
          description="Examples of your work, projects, or achievements (if relevant to your program)"
          documentType="portfolioWork"
          multiple
          icon={Award}
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">Supporting Documents Guidelines:</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Motivation letter should be 1-2 pages explaining your goals and aspirations</li>
          <li>• Reference letters should be from people who know your work or character well</li>
          <li>• Portfolio items should demonstrate skills relevant to your chosen program</li>
          <li>• All documents should be recent (within the last 2 years)</li>
        </ul>
      </div>
    </div>
  );

  const renderSection6 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <Warning className="h-6 w-6 text-green-600 mr-2" />
          Special Circumstances (Optional)
        </h3>
        <p className="text-gray-600">
          Upload any additional documents related to special circumstances or support needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadBox
          title="Medical Certificate"
          description="Medical documentation if you have health conditions affecting your studies"
          documentType="medicalCertificate"
          icon={AlertCircle}
        />
        
        <DocumentUploadBox
          title="Disability Support Documents"
          description="Documentation for any disability accommodations needed"
          documentType="disabilityDocuments"
          multiple
          icon={AlertCircle}
        />
        
        <DocumentUploadBox
          title="Financial Documents"
          description="Documents related to financial circumstances or hardship (if applicable)"
          documentType="financialDocuments"
          multiple
          icon={FileText}
        />
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2">Confidentiality Notice:</h4>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• All medical and personal information will be kept strictly confidential</li>
          <li>• Documents will only be shared with relevant support staff with your consent</li>
          <li>• You can choose not to upload these documents if you prefer</li>
          <li>• Support services are available regardless of documentation provided</li>
        </ul>
      </div>

      {/* Document Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Document Upload Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-green-800">Identity Documents:</p>
            <p className={documents.nationalId ? 'text-green-600' : 'text-gray-500'}>
              {documents.nationalId ? '✓' : '○'} National ID
            </p>
            <p className={documents.passportPhoto ? 'text-green-600' : 'text-gray-500'}>
              {documents.passportPhoto ? '✓' : '○'} Passport Photo
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-green-800">Work Experience:</p>
            <p className={documents.employmentLetters ? 'text-green-600' : 'text-gray-500'}>
              {documents.employmentLetters ? '✓' : '○'} Employment Letters
            </p>
            <p className={documents.workCertificates ? 'text-green-600' : 'text-gray-500'}>
              {documents.workCertificates ? '✓' : '○'} Work Certificates
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-green-800">Professional:</p>
            <p className={documents.professionalCertificates ? 'text-green-600' : 'text-gray-500'}>
              {documents.professionalCertificates ? '✓' : '○'} Professional Certs
            </p>
            <p className={documents.references ? 'text-green-600' : 'text-gray-500'}>
              {documents.references ? '✓' : '○'} References
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 1, title: 'Identity Documents', icon: User },
    { id: 2, title: 'Work Experience', icon: Briefcase },
    { id: 3, title: 'Professional Qualifications', icon: Award },
    { id: 4, title: 'Educational Background', icon: GraduationCap },
    { id: 5, title: 'Supporting Documents', icon: FileText },
    { id: 6, title: 'Special Circumstances', icon: AlertCircle }
  ];

  const handleNext = () => {
    if (currentSection < 6) {
      setCurrentSection(currentSection + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    } else {
      // Go back to mature student form
      setCurrentStep(2); // Adjust based on your flow
    }
  };

  const handleSubmit = () => {
    // Validate required documents
    const requiredDocs = ['nationalId', 'passportPhoto', 'employmentLetters'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc as keyof MatureStudentDocuments]);
    
    if (missingDocs.length > 0) {
      alert(`Please upload the following required documents: ${missingDocs.join(', ')}`);
      return;
    }

    updateMatureStudentDocuments(documents);
    setCurrentStep(4); // Move to next step in main application flow
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mature Student Document Upload</h2>
          <p className="text-gray-600">
            Upload all required and supporting documents for your mature student application. 
            All documents will be securely stored using Cloudinary.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="flex items-center flex-shrink-0">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentSection > section.id
                          ? 'bg-green-600 border-green-600 text-white'
                          : currentSection === section.id
                          ? 'border-green-600 text-green-600'
                          : 'border-gray-300 text-gray-300'
                      }`}
                    >
                      {currentSection > section.id ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-2 min-w-0">
                      <p
                        className={`text-xs font-medium ${
                          currentSection >= section.id ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {section.title}
                      </p>
                    </div>
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        currentSection > section.id ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {currentSection === 1 && renderSection1()}
          {currentSection === 2 && renderSection2()}
          {currentSection === 3 && renderSection3()}
          {currentSection === 4 && renderSection4()}
          {currentSection === 5 && renderSection5()}
          {currentSection === 6 && renderSection6()}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {currentSection === 1 ? 'Back to Form' : 'Previous'}
            </button>
            
            <div className="text-sm text-gray-600">
              Section {currentSection} of {sections.length} • Document Upload
            </div>
            
            <button
              type="button"
              onClick={handleNext}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {currentSection === 6 ? 'Complete Upload' : 'Next Section'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatureStudentDocumentForm;