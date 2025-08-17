"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import PersonalInformationForm from "@/components/personal-information-form"
import ContactDetailsForm from "@/components/contact-details-form"
import GuardianDetailsForm from "@/components/guardian-details-form"
import AcademicInformationForm from "@/components/academic-information-form"
import RegistrationDebug from "@/components/registration-debug"
import { useToast } from "@/hooks/use-toast"

export interface FormData {
  // Personal Information
  surname: string
  otherNames: string
  gender: string
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  religion: string
  maritalStatus: string
  nationalId: string
  ssnitNumber: string
  physicalChallenge: string
  profilePicture: File | { 
    file?: File | null;
    url: string;
    previewUrl?: string | null;
    name: string;
    type: string;
    size: number;
    hasImage: boolean;
    cloudinaryId?: string;
  } | null
  profilePictureUrl?: string // Added after submission to Firebase
  profilePicturePublicId?: string // Added after submission to Firebase
  studentIndexNumber: string

  // Contact Details
  email: string
  mobile: string
  street: string
  city: string
  country: string

  // Guardian Details
  guardianName: string
  relationship: string
  guardianContact: string
  guardianEmail: string
  guardianAddress: string

  // Academic Information
  programme: string
  yearOfEntry: string
  entryQualification: string
  entryLevel: string
  hallOfResidence: string
  scheduleType: string
  currentLevel: string
  entryAcademicYear: string
  currentPeriod: string
}

// Default form data
const defaultFormData: FormData = {
  surname: "",
  otherNames: "",
  gender: "",
  dateOfBirth: "",
  placeOfBirth: "",
  nationality: "",
  religion: "",
  maritalStatus: "",
  nationalId: "",
  ssnitNumber: "",
  physicalChallenge: "",
  profilePicture: null,
  studentIndexNumber: "",
  email: "",
  mobile: "",
  street: "",
  city: "",
  country: "",
  guardianName: "",
  relationship: "",
  guardianContact: "",
  guardianEmail: "",
  guardianAddress: "",
  programme: "",
  yearOfEntry: "",
  entryQualification: "",
  entryLevel: "",
  hallOfResidence: "",
  scheduleType: "",
  currentLevel: "",
  entryAcademicYear: "",
  currentPeriod: "",
}

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [isLoaded, setIsLoaded] = useState(false)
  const [fileObjectInMemory, setFileObjectInMemory] = useState<File | null>(null) // Store File object separately

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("registrationFormInProgress")
      const savedTab = localStorage.getItem("registrationActiveTab")
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        
        // Handle special case for profile picture which can't be directly serialized
        if (parsedData.profilePicture && typeof parsedData.profilePicture === 'object') {
          // If it's a custom photo object with URL, we can restore it
          if ('url' in parsedData.profilePicture) {
            // This is a custom photo object, which can be restored
            console.log("📸 Restoring profile picture from localStorage:", {
              hasUrl: !!parsedData.profilePicture.url,
              isFileObject: parsedData.profilePicture.isFileObject
            });
            
            // Note: File object cannot be restored from localStorage, so we'll need to re-upload
            if (parsedData.profilePicture.isFileObject) {
              console.log("⚠️ File object was lost during localStorage serialization - user will need to re-upload");
              // Clear the profile picture since we can't restore the File object
              parsedData.profilePicture = null;
            }
          } else {
            // This was a File object which can't be restored from localStorage
            parsedData.profilePicture = null
          }
        }
        
        setFormData(parsedData)
      }
      
      if (savedTab) {
        setActiveTab(savedTab)
      }
    } catch (error) {
      console.error("Error loading saved registration data:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return // Skip initial render before data is loaded
    
    try {
      // Prepare data for localStorage by handling special objects
      const prepareDataForStorage = (data: FormData): any => {
        const storageData = { ...data }
        
        // Handle profilePicture specially
        if (storageData.profilePicture) {
          if (storageData.profilePicture instanceof File) {
            // For File objects, we can't serialize them, so we'll store metadata
            console.log("📸 Converting File object for localStorage storage");
            // Store the File object in memory for later use
            setFileObjectInMemory(storageData.profilePicture);
            // Create a blob URL for preview that can be stored
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
            // For custom photo objects, preserve the structure but remove the File object
            console.log("📸 Converting custom photo object for localStorage storage");
            const photoObj = storageData.profilePicture as any;
            // Store the File object in memory if it exists and is valid
            if (photoObj.file instanceof File) {
              console.log("📄 Storing File object in memory:", photoObj.file.name);
              setFileObjectInMemory(photoObj.file);
              
              // Also store the file data as base64 for review page
              const reader = new FileReader();
              reader.onload = () => {
                const base64Data = reader.result as string;
                const fileDataToStore = {
                  name: photoObj.file.name,
                  type: photoObj.file.type,
                  size: photoObj.file.size,
                  data: base64Data
                };
                localStorage.setItem("registrationFileData", JSON.stringify(fileDataToStore));
                console.log("💾 File data saved to localStorage for review page:", {
                  name: fileDataToStore.name,
                  type: fileDataToStore.type,
                  size: fileDataToStore.size,
                  dataLength: fileDataToStore.data.length
                });
              };
              reader.readAsDataURL(photoObj.file);
            } else if (photoObj.file && Object.keys(photoObj.file).length === 0) {
              console.log("⚠️ File object is empty, clearing it");
              photoObj.file = null;
            }
            
            // Check if we have a previewUrl (which indicates a file was uploaded)
            // and store the file data if we haven't already
            if (photoObj.previewUrl && photoObj.previewUrl.startsWith('blob:') && !localStorage.getItem("registrationFileData")) {
              console.log("📄 Detected blob URL, attempting to store file data from memory");
              // Try to get the file from memory
              if (fileObjectInMemory) {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64Data = reader.result as string;
                  localStorage.setItem("registrationFileData", JSON.stringify({
                    name: fileObjectInMemory.name,
                    type: fileObjectInMemory.type,
                    size: fileObjectInMemory.size,
                    data: base64Data
                  }));
                  console.log("💾 File data saved to localStorage for review page (from memory)");
                };
                reader.readAsDataURL(fileObjectInMemory);
              }
            }
            storageData.profilePicture = {
              file: null, // File objects can't be serialized
              url: photoObj.url,
              previewUrl: photoObj.previewUrl,
              name: photoObj.name,
              type: photoObj.type,
              size: photoObj.size,
              hasImage: photoObj.hasImage,
              isFileObject: photoObj.file instanceof File || (photoObj.previewUrl && photoObj.previewUrl.startsWith('blob:')) // Flag if it had a File object or has blob URL
            };
          }
        }
        
        return storageData
      }
      
      const storageData = prepareDataForStorage(formData);
      console.log("💾 Saving to localStorage:", {
        hasProfilePicture: !!storageData.profilePicture,
        profilePictureType: typeof storageData.profilePicture,
        isFileObject: storageData.profilePicture?.isFileObject,
        fileObjectInMemory: !!fileObjectInMemory
      });
      
      localStorage.setItem("registrationFormInProgress", JSON.stringify(storageData))
      localStorage.setItem("registrationActiveTab", activeTab)
    } catch (error) {
      console.error("Error saving registration data:", error)
    }
  }, [formData, activeTab, isLoaded, fileObjectInMemory])

  const tabs = [
    { id: "personal", label: "Personal Info", step: 1 },
    { id: "contact", label: "Contact Details", step: 2 },
    { id: "guardian", label: "Guardian Info", step: 3 },
    { id: "academic", label: "Academic Info", step: 4 },
  ]

  const currentStep = tabs.find((tab) => tab.id === activeTab)?.step || 1
  const progress = (currentStep / 4) * 100

  const updateFormData = (section: string, data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const validateCurrentStep = () => {
    switch (activeTab) {
      case "personal":
        return (
          formData.surname &&
          formData.otherNames &&
          formData.gender &&
          formData.dateOfBirth &&
          formData.nationality &&
          formData.maritalStatus
        )
      case "contact":
        return formData.email && formData.mobile && formData.street && formData.city && formData.country
      case "guardian":
        return formData.guardianName && formData.relationship && formData.guardianContact && formData.guardianAddress
      case "academic":
        return formData.programme && formData.yearOfEntry && formData.entryQualification && formData.entryLevel
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      })
      return
    }

    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id)
      toast({
        title: "Progress Saved",
        description: `Moving to ${tabs[currentIndex + 1].label}. Your progress is automatically saved.`,
        variant: "default",
      })
    }
  }

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id)
    }
  }

  const handleSubmit = () => {
    console.log("🚀 REGISTER PAGE: handleSubmit called");
    console.log("📋 Form data being stored:", {
      hasProfilePicture: !!formData.profilePicture,
      profilePictureType: typeof formData.profilePicture,
      isFile: formData.profilePicture instanceof File
    });
    
    // Store form data in localStorage for the confirmation page
    localStorage.setItem("registrationData", JSON.stringify(formData))
    
    // Clear the in-progress data since we're moving to confirmation
    localStorage.removeItem("registrationFormInProgress")
    localStorage.removeItem("registrationActiveTab")
    
    console.log("💾 Form data stored in localStorage, redirecting to confirmation");
    
    toast({
      title: "Form Completed",
      description: "Moving to review and submission page.",
      variant: "default",
    })
    
    router.push("/confirmation")
  }

  const handleClearForm = () => {
    if (confirm("Are you sure you want to clear all form data and start over?")) {
      setFormData(defaultFormData)
      setActiveTab("personal")
      localStorage.removeItem("registrationFormInProgress")
      localStorage.removeItem("registrationActiveTab")
      toast({
        title: "Form Cleared",
        description: "All form data has been cleared. You can start over.",
        variant: "default",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <Link href="/" className="mb-4 sm:mb-0">
              <Button variant="ghost" size="sm" className="flex items-center">
                <span className="mr-2">←</span>
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center justify-center">
              <div className="bg-green-600 p-3 rounded-full mr-3">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
                <p className="text-sm text-gray-600">University College of Agriculture and Environmental Studies</p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center justify-center mb-3">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="font-semibold text-green-900 text-xl mb-2">Welcome to Registration!</h2>
            </div>
            <p className="text-green-800 mb-4 max-w-2xl mx-auto">
              Complete all 4 steps to register as a student. Your progress is automatically saved as you go.
            </p>
            {isLoaded && Object.values(formData).some(val => val !== "" && val !== null) && (
              <div className="mt-3 border-t border-green-200 pt-3 flex flex-col sm:flex-row justify-center items-center gap-3">
                <p className="text-sm text-green-700 font-medium">
                  <span className="inline-block mr-1">✓</span>
                  Your progress has been saved. You can safely refresh the page.
                </p>
                <Button variant="outline" size="sm" onClick={handleClearForm} className="text-xs">
                  Clear Form & Start Over
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
              <span className="text-sm font-medium text-green-600">{Math.round(progress)}% Complete</span>
            </div>
            <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between mt-3">
              {tabs.map((tab, index) => (
                <div key={tab.id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < currentStep ? 'bg-green-600 text-white' : 
                      index === currentStep - 1 ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.step}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">{tab.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <CardTitle className="text-xl flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className={`text-xs sm:text-sm py-2 ${
                        activeTab === tab.id ? 'font-medium' : ''
                      }`}
                    >
                      {tab.step}. {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="personal">
                  <PersonalInformationForm data={formData} updateData={(data) => updateFormData("personal", data)} />
                </TabsContent>

                <TabsContent value="contact">
                  <ContactDetailsForm data={formData} updateData={(data) => updateFormData("contact", data)} />
                </TabsContent>

                <TabsContent value="guardian">
                  <GuardianDetailsForm data={formData} updateData={(data) => updateFormData("guardian", data)} />
                </TabsContent>

                <TabsContent value="academic">
                  <AcademicInformationForm data={formData} updateData={(data) => updateFormData("academic", data)} />
                </TabsContent>
              </Tabs>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious} 
                  disabled={currentStep === 1}
                  className="flex items-center justify-center border-gray-300"
                >
                  <span className="mr-2">←</span>
                  Previous Step
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center justify-center"
                    disabled={!validateCurrentStep()}
                  >
                    Next Step
                    <span className="ml-2">→</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center justify-center"
                    disabled={!validateCurrentStep()}
                  >
                    Review & Submit
                    <span className="ml-2">✓</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Component */}
        <RegistrationDebug formData={formData} />
      </div>
    </div>
  )
}
