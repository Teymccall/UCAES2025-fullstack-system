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

      console.log("Submitting registration with data:", completeFormData)
      
      // Direct Firestore submission
      const id = await submitStudentRegistration(completeFormData)
      
      setRegistrationId(id)
      toast({
        title: "Registration submitted successfully",
        description: "Your registration has been received. Please write down your registration ID: " + id,
      })
      
      // Redirect to confirmation page
      window.location.href = `/confirmation?id=${id}`
    } catch (error) {
      console.error("Registration submission error:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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