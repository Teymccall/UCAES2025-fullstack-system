import { useState } from "react"
import { StudentInfoForm } from "./student-info-form"
import { ContactDetailsForm } from "./contact-details-form"
import { GuardianDetailsForm } from "./guardian-details-form"
import { AcademicInformationForm } from "./academic-information-form"
import { FormData } from "@/app/register/page"
import { submitStudentRegistration } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

const steps = [
  "Student Information",
  "Contact Details",
  "Guardian Details",
  "Academic Information",
]

export function RegistrationFormWrapper() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const { toast } = useToast()

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStudentInfoSubmit = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    nextStep()
  }

  const handleContactDetailsSubmit = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    nextStep()
  }

  const handleGuardianDetailsSubmit = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    nextStep()
  }

  const handleAcademicInfoSubmit = async (data: Partial<FormData>) => {
    try {
      setIsSubmitting(true)
      const completeFormData = { ...formData, ...data } as FormData

      console.log("📋 FORM COMPLETED - SAVING FOR REVIEW")
      console.log("📋 Complete form data:", completeFormData)
      console.log("👤 Student name:", completeFormData.surname, completeFormData.otherNames)
      console.log("📧 Email:", completeFormData.email)
      console.log("📸 Profile picture data:", {
        hasProfilePicture: !!completeFormData.profilePicture,
        profilePictureType: typeof completeFormData.profilePicture,
        isFile: completeFormData.profilePicture instanceof File,
        hasUrl: completeFormData.profilePicture && typeof completeFormData.profilePicture === 'object' && 'url' in completeFormData.profilePicture,
        hasPreviewUrl: completeFormData.profilePicture && typeof completeFormData.profilePicture === 'object' && 'previewUrl' in completeFormData.profilePicture
      });
      
      // Store the File object separately for Cloudinary upload
      let fileForUpload: File | null = null;
      if (completeFormData.profilePicture instanceof File) {
        fileForUpload = completeFormData.profilePicture;
        console.log("📄 File object preserved for upload:", fileForUpload.name);
      } else if (completeFormData.profilePicture && typeof completeFormData.profilePicture === 'object' && 'file' in completeFormData.profilePicture) {
        const photoObj = completeFormData.profilePicture as any;
        if (photoObj.file instanceof File) {
          fileForUpload = photoObj.file;
          console.log("📄 File object extracted from photo object:", fileForUpload.name);
        }
      }
      
      // Prepare data for localStorage by handling File objects
      const prepareDataForStorage = (data: FormData): any => {
        const storageData = { ...data };
        
        // Handle profilePicture specially
        if (storageData.profilePicture) {
          if (storageData.profilePicture instanceof File) {
            // For File objects, create a blob URL and store it as previewUrl
            console.log("📸 Converting File object for localStorage storage");
            const blobUrl = URL.createObjectURL(storageData.profilePicture);
            storageData.profilePicture = {
              file: null, // File objects can't be serialized
              url: null,
              previewUrl: blobUrl, // Store the blob URL for preview
              name: storageData.profilePicture.name,
              type: storageData.profilePicture.type,
              size: storageData.profilePicture.size,
              hasImage: true,
              isFileObject: true // Flag to indicate this was originally a File
            };
          } else if (typeof storageData.profilePicture === 'object' && 'url' in storageData.profilePicture) {
            // For custom photo objects, preserve the structure but ensure previewUrl exists
            console.log("📸 Converting custom photo object for localStorage storage");
            const photoObj = storageData.profilePicture as any;
            storageData.profilePicture = {
              file: null, // File objects can't be serialized
              url: photoObj.url,
              previewUrl: photoObj.previewUrl || photoObj.url, // Use url as fallback for previewUrl
              name: photoObj.name,
              type: photoObj.type,
              size: photoObj.size,
              hasImage: photoObj.hasImage,
              isFileObject: photoObj.file instanceof File // Flag if it had a File object
            };
          }
        }
        
        return storageData;
      };
      
      const storageData = prepareDataForStorage(completeFormData);
      console.log("💾 Saving to localStorage:", {
        hasProfilePicture: !!storageData.profilePicture,
        profilePictureType: typeof storageData.profilePicture,
        hasPreviewUrl: storageData.profilePicture && typeof storageData.profilePicture === 'object' && 'previewUrl' in storageData.profilePicture,
        previewUrl: storageData.profilePicture && typeof storageData.profilePicture === 'object' ? (storageData.profilePicture as any).previewUrl : 'N/A',
        fileForUpload: fileForUpload ? fileForUpload.name : 'None'
      });
      
      // Save form data to localStorage for review page
      localStorage.setItem("registrationData", JSON.stringify(storageData))
      
      // We no longer persist the image file in localStorage; it is uploaded directly to Cloudinary on selection
      
      // Clear any in-progress data since we're moving to review
      localStorage.removeItem("registrationFormInProgress")
      localStorage.removeItem("registrationActiveTab")
      
      toast({
        title: "Form Completed",
        description: "Moving to review and submission page.",
        variant: "default",
      })
      
      // Redirect to confirmation page for review (without ID)
      console.log("🌐 Redirecting to confirmation page for review")
      window.location.href = `/confirmation`
      
    } catch (error) {
      console.error("Error saving form data:", error)
      toast({
        title: "Error",
        description: "Failed to save form data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <StudentInfoForm
            onSubmit={handleStudentInfoSubmit}
            initialValues={formData}
          />
        )
      case 1:
        return (
          <ContactDetailsForm
            onSubmit={handleContactDetailsSubmit}
            onBack={prevStep}
            initialValues={formData}
          />
        )
      case 2:
        return (
          <GuardianDetailsForm
            onSubmit={handleGuardianDetailsSubmit}
            onBack={prevStep}
            initialValues={formData}
          />
        )
      case 3:
        return (
          <AcademicInformationForm
            onSubmit={handleAcademicInfoSubmit}
            onBack={prevStep}
            initialValues={formData}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Student Registration</h1>
        <div className="flex items-center mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  currentStep >= index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`ml-2 ${
                  currentStep >= index ? "text-foreground" : "text-muted-foreground"
                } ${index === steps.length - 1 ? "" : "mr-6"}`}
              >
                {step}
              </div>
              {index < steps.length - 1 && (
                <div className="h-0.5 w-8 bg-muted mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      {renderForm()}
    </div>
  )
} 