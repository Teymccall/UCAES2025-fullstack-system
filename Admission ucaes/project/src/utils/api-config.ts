const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  const academicAffairsUrl = import.meta.env.VITE_ACADEMIC_AFFAIRS_API_URL;
  const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL;

  if (isDevelopment) {
    return academicAffairsUrl || 'http://localhost:3000';
  }
  
  return productionUrl || 'https://ucaes.edu.gh';
};

export const API_ENDPOINTS = {
  generateAdmissionLetter: `${getApiBaseUrl()}/api/admissions/generate-letter`,
  transferToStudentPortal: `${getApiBaseUrl()}/api/admissions/transfer`,
  checkAdmissionStatus: `${getApiBaseUrl()}/api/admissions/status`,
};

export const getApiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};