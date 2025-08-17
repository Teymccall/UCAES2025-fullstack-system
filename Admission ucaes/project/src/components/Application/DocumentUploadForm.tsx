import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import CloudinaryService from '../../utils/cloudinaryService';

const DocumentUploadForm: React.FC = () => {
  const { applicationData, updateDocuments, setCurrentStep } = useApplication();
  const { user } = useAuth();
  const [documents, setDocuments] = useState(applicationData.documents);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDocuments(applicationData.documents);
  }, [applicationData.documents]);

  const handleFileChange = (documentType: keyof typeof documents) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      console.log('📁 DocumentUploadForm: File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        documentType: documentType,
        userId: user.id
      });

      // Validate file
      const validation = CloudinaryService.validateFile(file);
      if (!validation.valid) {
        console.error('❌ DocumentUploadForm: File validation failed:', validation.error);
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

      // Set uploading state
      setUploading(documentType);

      try {
        console.log('🚀 DocumentUploadForm: Starting upload to Cloudinary...');
        
        // Upload to Cloudinary
        const result = await CloudinaryService.uploadDocument(file, documentType, user.id);
        
        console.log('📡 DocumentUploadForm: Upload result:', result);
        
        if (result.success && result.url && result.publicId) {
          console.log('✅ DocumentUploadForm: Upload successful, updating documents state');
          
          setDocuments(prev => ({
            ...prev,
            [documentType]: {
              url: result.url,
              publicId: result.publicId
            }
          }));
          
          console.log('✅ DocumentUploadForm: Documents state updated successfully');
        } else {
          console.error('❌ DocumentUploadForm: Upload failed:', result.error);
          setUploadErrors(prev => ({
            ...prev,
            [documentType]: result.error || 'Upload failed'
          }));
        }
      } catch (error) {
        console.error('💥 DocumentUploadForm: Upload error:', error);
        setUploadErrors(prev => ({
          ...prev,
          [documentType]: error instanceof Error ? error.message : 'Upload failed. Please try again.'
        }));
      } finally {
        setUploading(null);
      }
    } else {
      console.warn('⚠️ DocumentUploadForm: No file selected or no user ID');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 DocumentUploadForm: Submitting documents:', documents);
    updateDocuments(documents);
    setCurrentStep(6);
  };

  const handlePrevious = () => {
    console.log('⬅️ DocumentUploadForm: Going back, saving documents:', documents);
    updateDocuments(documents);
    setCurrentStep(4);
  };

  const DocumentUploadBox: React.FC<{
    title: string;
    description: string;
    documentType: keyof typeof documents;
    required?: boolean;
  }> = ({ title, description, documentType, required = false }) => {
    const document = documents[documentType];
    const isUploading = uploading === documentType;
    const error = uploadErrors[documentType];
    
    return (
      <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        error ? 'border-red-300 bg-red-50' : 
        isUploading ? 'border-blue-300 bg-blue-50' :
        document ? 'border-green-300 bg-green-50' : 
        'border-gray-300 hover:border-green-400'
      }`}>
        <div className="text-center">
          <div className="flex justify-center mb-3">
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            ) : error ? (
              <AlertCircle className="h-12 w-12 text-red-600" />
            ) : document ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
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
          ) : document ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✓ Document uploaded successfully
              </p>
              {typeof document === 'object' && 'url' in document && (
                <div className="space-y-1">
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-green-600 text-xs font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                  >
                    View Document
                  </a>
                </div>
              )}
              <label
                htmlFor={documentType}
                className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 cursor-pointer"
              >
                Change File
              </label>
            </div>
          ) : (
            <label
              htmlFor={documentType}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </label>
          )}
          
          <input
            id={documentType}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange(documentType)}
            className="hidden"
            disabled={isUploading}
          />
          
          <p className="text-xs text-gray-500 mt-2">
            PDF, JPG, PNG (Max: 5MB)
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Document Upload</h2>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All documents must be clear and legible</li>
            <li>• Accepted formats: PDF, JPG, PNG</li>
            <li>• Maximum file size: 5MB per document</li>
            <li>• Required documents must be uploaded to proceed</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top-up Application Alert */}
          {applicationData.programSelection?.applicationType === 'topup' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Top-Up Application Requirements</h3>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                As a top-up student, you must provide documentation of your previous qualification 
                ({applicationData.programSelection?.previousQualification || 'qualification'}).
              </p>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>Official transcript from your previous institution</li>
                <li>Certificate of completion/graduation</li>
                <li>Any additional certificates or credentials</li>
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentUploadBox
              title="National ID/Passport"
              description="Valid government-issued identification document"
              documentType="idDocument"
              required
            />
            
            <DocumentUploadBox
              title={applicationData.programSelection?.applicationType === 'topup' ? "Previous Qualification Certificate" : "Academic Certificate"}
              description={applicationData.programSelection?.applicationType === 'topup' ? "Certificate from your previous qualification" : "Latest academic qualification certificate"}
              documentType="certificate"
              required
            />
            
            <DocumentUploadBox
              title={applicationData.programSelection?.applicationType === 'topup' ? "Official Transcript" : "Academic Transcript"}
              description={applicationData.programSelection?.applicationType === 'topup' ? "Official transcript from your previous institution" : "Official transcript of academic records"}
              documentType="transcript"
              required
            />

            {/* Additional document for top-up students */}
            {applicationData.programSelection?.applicationType === 'topup' && (
              <DocumentUploadBox
                title="Supporting Documents"
                description="Any additional certificates, credentials, or supporting documents"
                documentType="additionalDocs"
                required={false}
              />
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Document Verification:</h3>
            <p className="text-sm text-yellow-800">
              Uploaded documents will be verified by our admissions team. Please ensure all documents 
              are authentic and belong to you. Any false or misleading information may result in 
              application rejection.
            </p>
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
              Next: Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadForm;