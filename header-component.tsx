import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

export default function RegistrationHeader({ currentStep, totalSteps }: HeaderProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
            <p className="text-gray-600">University College of Agriculture and Environmental Studies</p>
          </div>
        </div>
      </div>
      
      {/* Welcome card */}
      <Card className="bg-green-50 border-green-100 p-5">
        <h2 className="text-lg font-semibold text-green-800">Welcome to Registration!</h2>
        <p className="text-green-700">Complete all {totalSteps} steps to register as a student. Your progress is automatically saved as you go.</p>
      </Card>
      
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-700">Step {currentStep} of {totalSteps}</div>
        <div className="text-gray-700">{progress}% Complete</div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
} 