import React from 'react';
import ApplicationWizard from '../components/Application/ApplicationWizard';

const ApplicationPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">UCAES Application Form</h1>
        <p className="text-sm sm:text-base text-gray-600">Complete all sections to submit your application</p>
      </div>
      <ApplicationWizard />
    </div>
  );
};

export default ApplicationPage;