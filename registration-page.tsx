"use client"

import { useState } from "react"
import RegistrationHeader from "./header-component"

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 4
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <RegistrationHeader currentStep={currentStep} totalSteps={totalSteps} />
        
        {/* Registration form area */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-green-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">Registration Form</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex justify-between bg-gray-100 p-3 rounded-sm mt-4">
              <button 
                className={`px-4 py-2 rounded ${currentStep === 1 ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentStep(1)}
              >
                1. Personal Info
              </button>
              <button 
                className={`px-4 py-2 rounded ${currentStep === 2 ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentStep(2)}
              >
                2. Contact Details
              </button>
              <button 
                className={`px-4 py-2 rounded ${currentStep === 3 ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentStep(3)}
              >
                3. Guardian Info
              </button>
              <button 
                className={`px-4 py-2 rounded ${currentStep === 4 ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentStep(4)}
              >
                4. Academic Info
              </button>
            </div>
            
            {/* Form would go here - just showing the Personal Information section as placeholder */}
            {currentStep === 1 && (
              <div className="p-4 mt-6">
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <p className="text-gray-600 mb-6">Please provide your basic personal details</p>
                
                {/* Form fields would go here */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-gray-700">Surname *</label>
                    <input 
                      type="text" 
                      placeholder="Enter your surname"
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-700">Religion</label>
                    <select className="w-full border border-gray-300 rounded p-2">
                      <option>Select your religion</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 