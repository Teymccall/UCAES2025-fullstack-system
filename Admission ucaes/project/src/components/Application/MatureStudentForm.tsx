import React, { useState, useEffect } from 'react';
import { useApplication } from '../../contexts/ApplicationContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Briefcase, GraduationCap, AlertCircle, CheckCircle, Calendar, Award } from 'lucide-react';

interface MatureStudentData {
  // Age and eligibility
  age: number;
  dateOfBirth: string;
  eligibilityType: 'age' | 'work_experience' | 'professional_qualification' | 'life_experience';
  
  // Work Experience
  workExperience: Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
    isCurrentJob: boolean;
  }>;
  totalWorkYears: number;
  
  // Professional Qualifications
  professionalQualifications: Array<{
    qualification: string;
    institution: string;
    yearObtained: string;
    relevantToProgram: boolean;
  }>;
  
  // Life Experience and Skills
  lifeExperience: string;
  relevantSkills: string[];
  volunteerWork: string;
  
  // Educational Background (if any)
  hasFormaleducation: boolean;
  lastEducationLevel: string;
  lastEducationYear: string;
  
  // Motivation and Goals
  motivationStatement: string;
  careerGoals: string;
  whyThisProgram: string;
  
  // Support and Accessibility
  needsSupport: boolean;
  supportType: string[];
  hasDisability: boolean;
  disabilityDetails: string;
  
  // Financial and Family Circumstances
  employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired';
  familyResponsibilities: boolean;
  familyDetails: string;
  studyTimeAvailable: string;
}

const MatureStudentForm: React.FC = () => {
  const { applicationData, updateMatureStudentInfo, setCurrentStep } = useApplication();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<MatureStudentData>({
    age: 0,
    dateOfBirth: '',
    eligibilityType: 'age',
    workExperience: [{ employer: '', position: '', startDate: '', endDate: '', responsibilities: '', isCurrentJob: false }],
    totalWorkYears: 0,
    professionalQualifications: [{ qualification: '', institution: '', yearObtained: '', relevantToProgram: false }],
    lifeExperience: '',
    relevantSkills: [],
    volunteerWork: '',
    hasFormaleducation: false,
    lastEducationLevel: '',
    lastEducationYear: '',
    motivationStatement: '',
    careerGoals: '',
    whyThisProgram: '',
    needsSupport: false,
    supportType: [],
    hasDisability: false,
    disabilityDetails: '',
    employmentStatus: 'employed',
    familyResponsibilities: false,
    familyDetails: '',
    studyTimeAvailable: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(1);

  useEffect(() => {
    // Load existing data if available
    const matureStudentData = applicationData.matureStudentInfo || {};
    if (Object.keys(matureStudentData).length > 0) {
      setFormData(prev => ({ ...prev, ...matureStudentData }));
    }
    
    // Calculate age from personal info if available
    if (applicationData.personalInfo?.dateOfBirth) {
      const birthDate = new Date(applicationData.personalInfo.dateOfBirth.split('-').reverse().join('-'));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age, dateOfBirth: applicationData.personalInfo.dateOfBirth }));
    }
  }, [applicationData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { 
        employer: '', position: '', startDate: '', endDate: '', responsibilities: '', isCurrentJob: false 
      }]
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addProfessionalQualification = () => {
    setFormData(prev => ({
      ...prev,
      professionalQualifications: [...prev.professionalQualifications, { 
        qualification: '', institution: '', yearObtained: '', relevantToProgram: false 
      }]
    }));
  };

  const removeProfessionalQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      professionalQualifications: prev.professionalQualifications.filter((_, i) => i !== index)
    }));
  };

  const updateProfessionalQualification = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      professionalQualifications: prev.professionalQualifications.map((qual, i) => 
        i === index ? { ...qual, [field]: value } : qual
      )
    }));
  };

  const handleSkillsChange = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      relevantSkills: prev.relevantSkills.includes(skill)
        ? prev.relevantSkills.filter(s => s !== skill)
        : [...prev.relevantSkills, skill]
    }));
  };

  const handleSupportTypeChange = (supportType: string) => {
    setFormData(prev => ({
      ...prev,
      supportType: prev.supportType.includes(supportType)
        ? prev.supportType.filter(s => s !== supportType)
        : [...prev.supportType, supportType]
    }));
  };

  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (section === 1) {
      // Eligibility validation
      if (formData.age < 21) {
        newErrors.age = 'Mature students must be at least 21 years old';
      }
      
      if (!formData.eligibilityType) {
        newErrors.eligibilityType = 'Please select your eligibility type';
      }
      
      if (formData.eligibilityType === 'work_experience' && formData.totalWorkYears < 3) {
        newErrors.totalWorkYears = 'Minimum 3 years of work experience required';
      }
    }

    if (section === 2) {
      // Work experience validation
      if (formData.eligibilityType === 'work_experience' && formData.workExperience.length === 0) {
        newErrors.workExperience = 'Please add at least one work experience';
      }
      
      formData.workExperience.forEach((exp, index) => {
        if (!exp.employer || !exp.position) {
          newErrors[`workExperience_${index}`] = 'Please fill in all required fields';
        }
      });
    }

    if (section === 3) {
      // Motivation validation
      if (!formData.motivationStatement || formData.motivationStatement.length < 100) {
        newErrors.motivationStatement = 'Please provide a detailed motivation statement (minimum 100 characters)';
      }
      
      if (!formData.careerGoals || formData.careerGoals.length < 50) {
        newErrors.careerGoals = 'Please describe your career goals (minimum 50 characters)';
      }
      
      if (!formData.whyThisProgram || formData.whyThisProgram.length < 50) {
        newErrors.whyThisProgram = 'Please explain why you chose this program (minimum 50 characters)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < 4) {
        setCurrentSection(currentSection + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    } else {
      // Go back to previous step in main application
      setCurrentStep(1); // Adjust based on where this fits in your flow
    }
  };

  const handleSubmit = () => {
    if (validateSection(currentSection)) {
      updateMatureStudentInfo(formData);
      setCurrentStep(2); // Move to next step in main application flow
    }
  };

  const skillOptions = [
    'Leadership', 'Project Management', 'Communication', 'Problem Solving',
    'Team Work', 'Customer Service', 'Sales', 'Marketing', 'Finance',
    'IT Skills', 'Research', 'Training', 'Supervision', 'Planning',
    'Organization', 'Time Management', 'Negotiation', 'Public Speaking'
  ];

  const supportOptions = [
    'Academic Writing Support', 'Study Skills Training', 'IT Support',
    'Flexible Scheduling', 'Childcare Information', 'Financial Advice',
    'Career Guidance', 'Peer Mentoring', 'Disability Support'
  ];

  const renderSection1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Mature Student Eligibility</h3>
        <p className="text-sm text-blue-800">
          Mature students are typically 21 years or older and may enter university through alternative pathways 
          based on work experience, professional qualifications, or demonstrated life experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age *
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="21"
            max="100"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.age ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {errors.age && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.age}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligibility Pathway *
          </label>
          <select
            name="eligibilityType"
            value={formData.eligibilityType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="age">Age-based (21+ years)</option>
            <option value="work_experience">Work Experience (3+ years)</option>
            <option value="professional_qualification">Professional Qualification</option>
            <option value="life_experience">Significant Life Experience</option>
          </select>
        </div>
      </div>

      {formData.eligibilityType === 'work_experience' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Years of Work Experience *
          </label>
          <input
            type="number"
            name="totalWorkYears"
            value={formData.totalWorkYears}
            onChange={handleChange}
            min="3"
            max="50"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.totalWorkYears ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {errors.totalWorkYears && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.totalWorkYears}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status *
          </label>
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="employed">Employed</option>
            <option value="self_employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Study Time per Week *
          </label>
          <select
            name="studyTimeAvailable"
            value={formData.studyTimeAvailable}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select study time</option>
            <option value="10-15 hours">10-15 hours</option>
            <option value="15-20 hours">15-20 hours</option>
            <option value="20-25 hours">20-25 hours</option>
            <option value="25+ hours">25+ hours</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="familyResponsibilities"
            name="familyResponsibilities"
            checked={formData.familyResponsibilities}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="familyResponsibilities" className="text-sm text-gray-700">
            I have family responsibilities that may affect my study schedule
          </label>
        </div>

        {formData.familyResponsibilities && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please describe your family responsibilities
            </label>
            <textarea
              name="familyDetails"
              value={formData.familyDetails}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., caring for children, elderly parents, etc."
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience & Professional Background</h3>
        <button
          type="button"
          onClick={addWorkExperience}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
        >
          Add Experience
        </button>
      </div>

      {formData.workExperience.map((exp, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Work Experience {index + 1}</h4>
            {formData.workExperience.length > 1 && (
              <button
                type="button"
                onClick={() => removeWorkExperience(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employer/Company *
              </label>
              <input
                type="text"
                value={exp.employer}
                onChange={(e) => updateWorkExperience(index, 'employer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position/Job Title *
              </label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={exp.isCurrentJob}
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id={`currentJob_${index}`}
                  checked={exp.isCurrentJob}
                  onChange={(e) => updateWorkExperience(index, 'isCurrentJob', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`currentJob_${index}`} className="text-sm text-gray-700">
                  This is my current job
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Responsibilities and Achievements
            </label>
            <textarea
              value={exp.responsibilities}
              onChange={(e) => updateWorkExperience(index, 'responsibilities', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your main responsibilities and any notable achievements..."
            />
          </div>
        </div>
      ))}

      {/* Professional Qualifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Professional Qualifications</h3>
          <button
            type="button"
            onClick={addProfessionalQualification}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Add Qualification
          </button>
        </div>

        {formData.professionalQualifications.map((qual, index) => (
          <div key={index} className="bg-blue-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Professional Qualification {index + 1}</h4>
              {formData.professionalQualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProfessionalQualification(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification Name
                </label>
                <input
                  type="text"
                  value={qual.qualification}
                  onChange={(e) => updateProfessionalQualification(index, 'qualification', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Project Management Certificate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution/Organization
                </label>
                <input
                  type="text"
                  value={qual.institution}
                  onChange={(e) => updateProfessionalQualification(index, 'institution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Obtained
                </label>
                <input
                  type="number"
                  value={qual.yearObtained}
                  onChange={(e) => updateProfessionalQualification(index, 'yearObtained', e.target.value)}
                  min="1980"
                  max="2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`relevant_${index}`}
                  checked={qual.relevantToProgram}
                  onChange={(e) => updateProfessionalQualification(index, 'relevantToProgram', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`relevant_${index}`} className="text-sm text-gray-700">
                  This qualification is relevant to my chosen program
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Relevant Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Relevant Skills (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {skillOptions.map(skill => (
            <div key={skill} className="flex items-center">
              <input
                type="checkbox"
                id={`skill_${skill}`}
                checked={formData.relevantSkills.includes(skill)}
                onChange={() => handleSkillsChange(skill)}
                className="mr-2"
              />
              <label htmlFor={`skill_${skill}`} className="text-sm text-gray-700">
                {skill}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Work */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volunteer Work and Community Involvement
        </label>
        <textarea
          name="volunteerWork"
          value={formData.volunteerWork}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe any volunteer work, community involvement, or leadership roles..."
        />
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Motivation and Academic Goals</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personal Statement - Why do you want to pursue higher education now? *
        </label>
        <textarea
          name="motivationStatement"
          value={formData.motivationStatement}
          onChange={handleChange}
          rows={5}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.motivationStatement ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Explain your motivation for returning to education, what has changed in your life, and how this fits with your personal and professional goals..."
          required
        />
        <div className="flex justify-between items-center mt-1">
          {errors.motivationStatement && (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.motivationStatement}
            </div>
          )}
          <span className="text-xs text-gray-500">
            {formData.motivationStatement.length}/500 characters (minimum 100)
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Goals - What do you hope to achieve after completing this program? *
        </label>
        <textarea
          name="careerGoals"
          value={formData.careerGoals}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.careerGoals ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your career aspirations and how this program will help you achieve them..."
          required
        />
        {errors.careerGoals && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.careerGoals}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Why This Program? - Why have you chosen this specific program at UCAES? *
        </label>
        <textarea
          name="whyThisProgram"
          value={formData.whyThisProgram}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.whyThisProgram ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Explain why you chose this program and how it aligns with your goals and interests..."
          required
        />
        {errors.whyThisProgram && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.whyThisProgram}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Life Experience and Learning
        </label>
        <textarea
          name="lifeExperience"
          value={formData.lifeExperience}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe significant life experiences that have contributed to your personal growth and learning..."
        />
      </div>

      {/* Previous Education */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Previous Formal Education</h4>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="hasFormaleducation"
            name="hasFormaleducation"
            checked={formData.hasFormaleducation}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="hasFormaleducation" className="text-sm text-gray-700">
            I have completed some formal education beyond secondary school
          </label>
        </div>

        {formData.hasFormaleducation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highest Level Completed
              </label>
              <select
                name="lastEducationLevel"
                value={formData.lastEducationLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select level</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
                <option value="degree">Bachelor's Degree</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Completed
              </label>
              <input
                type="number"
                name="lastEducationYear"
                value={formData.lastEducationYear}
                onChange={handleChange}
                min="1980"
                max="2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Support Needs and Accessibility</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          UCAES is committed to supporting all students. Please let us know if you need any additional 
          support to succeed in your studies. All information will be kept confidential.
        </p>
      </div>

      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="needsSupport"
            name="needsSupport"
            checked={formData.needsSupport}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="needsSupport" className="text-sm font-medium text-gray-700">
            I would like information about support services available to mature students
          </label>
        </div>

        {formData.needsSupport && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Types of Support Needed (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {supportOptions.map(support => (
                <div key={support} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`support_${support}`}
                    checked={formData.supportType.includes(support)}
                    onChange={() => handleSupportTypeChange(support)}
                    className="mr-2"
                  />
                  <label htmlFor={`support_${support}`} className="text-sm text-gray-700">
                    {support}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="hasDisability"
            name="hasDisability"
            checked={formData.hasDisability}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="hasDisability" className="text-sm font-medium text-gray-700">
            I have a disability or health condition that may affect my studies
          </label>
        </div>

        {formData.hasDisability && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please provide details (optional - this helps us provide appropriate support)
            </label>
            <textarea
              name="disabilityDetails"
              value={formData.disabilityDetails}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe any accommodations or support you might need..."
            />
            <p className="text-xs text-gray-600 mt-1">
              This information is confidential and will only be shared with relevant support staff with your consent.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Application Summary</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p><strong>Age:</strong> {formData.age} years</p>
          <p><strong>Eligibility:</strong> {formData.eligibilityType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Work Experience:</strong> {formData.totalWorkYears} years</p>
          <p><strong>Employment Status:</strong> {formData.employmentStatus.replace('_', ' ')}</p>
          <p><strong>Study Time Available:</strong> {formData.studyTimeAvailable}</p>
          {formData.familyResponsibilities && <p><strong>Family Responsibilities:</strong> Yes</p>}
          {formData.needsSupport && <p><strong>Support Services:</strong> Requested</p>}
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 1, title: 'Eligibility & Background', icon: User },
    { id: 2, title: 'Experience & Skills', icon: Briefcase },
    { id: 3, title: 'Motivation & Goals', icon: GraduationCap },
    { id: 4, title: 'Support & Summary', icon: Award }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mature Student Application</h2>
          <p className="text-gray-600">
            Complete this additional form as a mature student applicant. This information helps us understand 
            your background and provide appropriate support.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="flex items-center flex-1">
                  <div className="flex items-center min-w-0">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${
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
                    <div className="ml-3 min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          currentSection >= section.id ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {section.title}
                      </p>
                    </div>
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
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
        <form className="space-y-6">
          {currentSection === 1 && renderSection1()}
          {currentSection === 2 && renderSection2()}
          {currentSection === 3 && renderSection3()}
          {currentSection === 4 && renderSection4()}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {currentSection === 1 ? 'Back to Application' : 'Previous'}
            </button>
            
            <div className="text-sm text-gray-600">
              Section {currentSection} of {sections.length} • Mature Student Information
            </div>
            
            <button
              type="button"
              onClick={handleNext}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {currentSection === 4 ? 'Complete & Continue' : 'Next Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatureStudentForm;