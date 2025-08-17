import React from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import PersonalInfoForm from './PersonalInfoForm';
import MatureStudentSelection from './MatureStudentSelection';
import MatureStudentForm from './MatureStudentForm';
import MatureStudentDocumentForm from './MatureStudentDocumentForm';
import ContactInfoForm from './ContactInfoForm';
import AcademicBackgroundForm from './AcademicBackgroundForm';
import ProgramSelectionForm from './ProgramSelectionForm';
import DocumentUploadForm from './DocumentUploadForm';
import PaymentForm from './PaymentForm';
import ApplicationSummary from './ApplicationSummary';
import { CheckCircle, Circle } from 'lucide-react';

const ApplicationWizard: React.FC = () => {
  const { currentStep, applicationData } = useApplication();

  // Handle special mature student steps
  if (currentStep === 1.1) {
    return <MatureStudentSelection />;
  }
  
  if (currentStep === 1.5) {
    return <MatureStudentForm />;
  }
  
  if (currentStep === 1.6) {
    return <MatureStudentDocumentForm />;
  }

  const steps = [
    { id: 1, title: 'Personal Info', component: PersonalInfoForm },
    { id: 2, title: 'Contact Info', component: ContactInfoForm },
    { id: 3, title: 'Academic Background', component: AcademicBackgroundForm },
    { id: 4, title: 'Program Selection', component: ProgramSelectionForm },
    { id: 5, title: 'Documents', component: DocumentUploadForm },
    { id: 6, title: 'Payment', component: PaymentForm },
    { id: 7, title: 'Summary', component: ApplicationSummary }
  ];

  // Adjust steps for mature students
  const adjustedSteps = applicationData.isMatureStudent 
    ? [
        { id: 1, title: 'Personal Info', component: PersonalInfoForm },
        { id: 2, title: 'Mature Student Info', component: MatureStudentForm },
        { id: 3, title: 'Mature Documents', component: MatureStudentDocumentForm },
        { id: 4, title: 'Program Selection', component: ProgramSelectionForm },
        { id: 5, title: 'Payment', component: PaymentForm },
        { id: 6, title: 'Summary', component: ApplicationSummary }
      ]
    : steps;

  const CurrentStepComponent = adjustedSteps.find(step => step.id === currentStep)?.component || PersonalInfoForm;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Progress Indicator */}
      <div className="mb-4 sm:mb-8">
        {/* Mobile: Simplified Progress Bar */}
        <div className="block sm:hidden">
          <div className="text-center mb-3">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-green-600">
              {steps.find(step => step.id === currentStep)?.title}
            </span>
          </div>
        </div>

        {/* Desktop: Full Progress Stepper */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center min-w-0">
                  <div
                    className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex-shrink-0 ${
                      currentStep > step.id
                        ? 'bg-green-600 border-green-600 text-white'
                        : currentStep === step.id
                        ? 'border-green-600 text-green-600'
                        : 'border-gray-300 text-gray-300'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                    ) : (
                      <span className="text-xs lg:text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                    <p
                      className={`text-xs lg:text-sm font-medium truncate ${
                        currentStep >= step.id ? 'text-green-600' : 'text-gray-500'
                      }`}
                      title={step.title}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 lg:mx-4 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <CurrentStepComponent />
    </div>
  );
};

export default ApplicationWizard;