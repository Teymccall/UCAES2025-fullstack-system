import { ApplicationData } from '../contexts/ApplicationContext';

export const downloadApplication = async (applicationData: ApplicationData) => {
  // Create a formatted text document with all application details
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDocumentStatus = (doc: any) => {
    return doc?.url ? '✓ Uploaded' : '✗ Not uploaded';
  };

  const applicationText = `
UCAES ADMISSIONS APPLICATION
=====================================

Application ID: ${applicationData.applicationId || 'N/A'}
Submission Date: ${formatDate(applicationData.submittedAt || '')}
Status: ${applicationData.applicationStatus?.replace('_', ' ').toUpperCase() || 'N/A'}
Payment Status: ${applicationData.paymentStatus?.toUpperCase() || 'N/A'}

PERSONAL INFORMATION
-------------------
Name: ${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}
Date of Birth: ${applicationData.personalInfo?.dateOfBirth || 'N/A'}
Gender: ${applicationData.personalInfo?.gender || 'N/A'}
Nationality: ${applicationData.personalInfo?.nationality || 'N/A'}
Region: ${applicationData.personalInfo?.region || 'N/A'}
Passport Photo: ${applicationData.personalInfo?.passportPhoto?.url ? '✓ Uploaded' : '✗ Not uploaded'}
${applicationData.personalInfo?.passportPhoto?.url ? `Passport Photo URL: ${applicationData.personalInfo.passportPhoto.url}` : ''}

CONTACT INFORMATION
------------------
Email: ${applicationData.contactInfo?.email || 'N/A'}
Phone: ${applicationData.contactInfo?.phone || 'N/A'}
Address: ${applicationData.contactInfo?.address || 'N/A'}
City: ${applicationData.contactInfo?.city || 'N/A'}
Postal Code: ${applicationData.contactInfo?.postalCode || 'N/A'}

ACADEMIC BACKGROUND
------------------
Previous Institution: ${applicationData.academicBackground?.previousInstitution || 'N/A'}
Year Completed: ${applicationData.academicBackground?.yearCompleted || 'N/A'}
Certificate Type: ${applicationData.academicBackground?.certificateType || 'N/A'}
SHS Program: ${applicationData.academicBackground?.shsProgram || 'N/A'}
WAEC Index Number: ${applicationData.academicBackground?.waecIndexNumber || 'N/A'}

PROGRAM SELECTION
---------------
Level: ${applicationData.programSelection?.level || 'N/A'}
Study Level: ${applicationData.programSelection?.studyLevel ? `Level ${applicationData.programSelection.studyLevel}` : 'N/A'}
Program Type: ${applicationData.programSelection?.programType || 'N/A'}
Study Mode: ${applicationData.programSelection?.studyMode || 'N/A'}
First Choice: ${applicationData.programSelection?.firstChoice || 'N/A'}
Second Choice: ${applicationData.programSelection?.secondChoice || 'N/A'}

DOCUMENTS
---------
ID Document: ${formatDocumentStatus(applicationData.documents?.idDocument)}
${applicationData.documents?.idDocument?.url ? `ID Document URL: ${applicationData.documents.idDocument.url}` : ''}

Certificate: ${formatDocumentStatus(applicationData.documents?.certificate)}
${applicationData.documents?.certificate?.url ? `Certificate URL: ${applicationData.documents.certificate.url}` : ''}

Transcript: ${formatDocumentStatus(applicationData.documents?.transcript)}
${applicationData.documents?.transcript?.url ? `Transcript URL: ${applicationData.documents.transcript.url}` : ''}

GUARDIAN INFORMATION
-------------------
Guardian Name: ${applicationData.contactInfo?.guardianName || 'N/A'}
Guardian Phone: ${applicationData.contactInfo?.guardianPhone || 'N/A'}
Guardian Email: ${applicationData.contactInfo?.guardianEmail || 'N/A'}
Guardian Address: ${applicationData.contactInfo?.guardianAddress || 'N/A'}

APPLICATION TIMELINE
-------------------
Created: ${formatDate(applicationData.createdAt || '')}
Last Updated: ${formatDate(applicationData.updatedAt || '')}
Submitted: ${formatDate(applicationData.submittedAt || '')}

=====================================
This document was generated on ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}

For any inquiries, please contact:
Email: admissions@ucaes.edu.gh
Phone: +233 30 123 4567
  `.trim();

  // Create a blob with the application text
  const blob = new Blob([applicationText], { type: 'text/plain' });
  
  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UCAES_Application_${applicationData.applicationId || 'Draft'}_${new Date().toISOString().split('T')[0]}.txt`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  // Download individual files if they exist
  await downloadIndividualFiles(applicationData);
};

const downloadIndividualFiles = async (applicationData: ApplicationData) => {
  const filesToDownload = [];

  // Add passport photo
  if (applicationData.personalInfo?.passportPhoto?.url) {
    filesToDownload.push({
      url: applicationData.personalInfo.passportPhoto.url,
      filename: `Passport_Photo_${applicationData.applicationId || 'Draft'}.jpg`
    });
  }

  // Add documents
  if (applicationData.documents?.idDocument?.url) {
    filesToDownload.push({
      url: applicationData.documents.idDocument.url,
      filename: `ID_Document_${applicationData.applicationId || 'Draft'}.pdf`
    });
  }

  if (applicationData.documents?.certificate?.url) {
    filesToDownload.push({
      url: applicationData.documents.certificate.url,
      filename: `Certificate_${applicationData.applicationId || 'Draft'}.pdf`
    });
  }

  if (applicationData.documents?.transcript?.url) {
    filesToDownload.push({
      url: applicationData.documents.transcript.url,
      filename: `Transcript_${applicationData.applicationId || 'Draft'}.pdf`
    });
  }

  // Download each file
  for (const file of filesToDownload) {
    try {
      await downloadFile(file.url, file.filename);
    } catch (error) {
      console.error(`Error downloading ${file.filename}:`, error);
    }
  }
};

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};

export const downloadApplicationAsPDF = async (applicationData: ApplicationData) => {
  try {
    // For a more advanced PDF generation, you would typically use a library like jsPDF
    // For now, we'll create a simple HTML-based PDF using browser print functionality
    
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const formatDocumentStatus = (doc: any) => {
      return doc?.url ? '✓ Uploaded' : '✗ Not uploaded';
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>UCAES Application - ${applicationData.applicationId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .status-uploaded { color: green; }
          .status-not-uploaded { color: red; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
          .passport-photo { max-width: 200px; max-height: 200px; border: 1px solid #ccc; margin: 10px 0; }
          .document-links { margin-top: 10px; }
          .document-links a { color: #0066cc; text-decoration: underline; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>UCAES ADMISSIONS APPLICATION</h1>
          <p>Application ID: ${applicationData.applicationId || 'N/A'}</p>
          <p>Submission Date: ${formatDate(applicationData.submittedAt || '')}</p>
        </div>

        <div class="section">
          <h2>PERSONAL INFORMATION</h2>
          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}</span>
          </div>
          <div class="field">
            <span class="label">Date of Birth:</span>
            <span class="value">${applicationData.personalInfo?.dateOfBirth || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Gender:</span>
            <span class="value">${applicationData.personalInfo?.gender || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Nationality:</span>
            <span class="value">${applicationData.personalInfo?.nationality || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Region:</span>
            <span class="value">${applicationData.personalInfo?.region || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Passport Photo:</span>
            <span class="value ${applicationData.personalInfo?.passportPhoto?.url ? 'status-uploaded' : 'status-not-uploaded'}">${formatDocumentStatus(applicationData.personalInfo?.passportPhoto)}</span>
            ${applicationData.personalInfo?.passportPhoto?.url ? `<br><img src="${applicationData.personalInfo.passportPhoto.url}" alt="Passport Photo" class="passport-photo">` : ''}
          </div>
        </div>

        <div class="section">
          <h2>CONTACT INFORMATION</h2>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${applicationData.contactInfo?.email || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Phone:</span>
            <span class="value">${applicationData.contactInfo?.phone || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Address:</span>
            <span class="value">${applicationData.contactInfo?.address || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <h2>PROGRAM SELECTION</h2>
          <div class="field">
            <span class="label">Level:</span>
            <span class="value">${applicationData.programSelection?.level || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Study Level:</span>
            <span class="value">${applicationData.programSelection?.studyLevel ? `Level ${applicationData.programSelection.studyLevel}` : 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Program Type:</span>
            <span class="value">${applicationData.programSelection?.programType || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Study Mode:</span>
            <span class="value">${applicationData.programSelection?.studyMode || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">First Choice:</span>
            <span class="value">${applicationData.programSelection?.firstChoice || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Second Choice:</span>
            <span class="value">${applicationData.programSelection?.secondChoice || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <h2>DOCUMENTS</h2>
          <div class="field">
            <span class="label">ID Document:</span>
            <span class="value ${applicationData.documents?.idDocument?.url ? 'status-uploaded' : 'status-not-uploaded'}">${formatDocumentStatus(applicationData.documents?.idDocument)}</span>
            ${applicationData.documents?.idDocument?.url ? `<br><a href="${applicationData.documents.idDocument.url}" target="_blank" class="document-links">View ID Document</a>` : ''}
          </div>
          <div class="field">
            <span class="label">Certificate:</span>
            <span class="value ${applicationData.documents?.certificate?.url ? 'status-uploaded' : 'status-not-uploaded'}">${formatDocumentStatus(applicationData.documents?.certificate)}</span>
            ${applicationData.documents?.certificate?.url ? `<br><a href="${applicationData.documents.certificate.url}" target="_blank" class="document-links">View Certificate</a>` : ''}
          </div>
          <div class="field">
            <span class="label">Transcript:</span>
            <span class="value ${applicationData.documents?.transcript?.url ? 'status-uploaded' : 'status-not-uploaded'}">${formatDocumentStatus(applicationData.documents?.transcript)}</span>
            ${applicationData.documents?.transcript?.url ? `<br><a href="${applicationData.documents.transcript.url}" target="_blank" class="document-links">View Transcript</a>` : ''}
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>For inquiries: admissions@ucaes.edu.gh | +233 30 123 4567</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    // Also download individual files
    await downloadIndividualFiles(applicationData);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try downloading as text file instead.');
  }
};
