import { jsPDF } from 'jspdf';
import { getFeeStructure, formatCurrency, numberToWords, getAcademicDates, BANK_DETAILS, HOSTEL_FEES } from './fee-structure';
import { getDb } from './firebase-admin';

export interface StudentData {
  applicationId: string;
  name: string;
  program: string;
  level: string;
  studyMode: 'Regular' | 'Weekend';
  email?: string;
  address?: string;
  previousQualification?: string;
  applicationType?: 'fresh' | 'topup';
  directorApprovedProgram?: string;
  directorApprovedLevel?: string;
}

export interface AdmissionLetterData extends StudentData {
  referenceNumber: string;
  dateIssued: string;
  academicYear: string;
  feeStructure: {
    total: number;
    firstPayment: number;
    secondPayment: number;
    thirdPayment?: number;
  } | null;
}

/**
 * Generate reference number for admission letter
 */
function generateReferenceNumber(applicationId: string): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const sequence = applicationId.replace('UCAES', '').replace(/\D/g, '');
  
  return `UCAES/REC/ADM/${year}.${sequence}`;
}

/**
 * Format date for admission letter
 */
function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                 day === 2 || day === 22 ? 'nd' :
                 day === 3 || day === 23 ? 'rd' : 'th';
  
  return `${day}${suffix} ${month}, ${year}`;
}

/**
 * Get current academic year from centralized system
 */
async function getCentralizedAcademicYear(): Promise<string> {
  try {
    const adminDb = getDb();
    
    // Try centralized system first
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
    const systemConfigDoc = await systemConfigRef.get();
    
    if (systemConfigDoc.exists) {
      const systemData = systemConfigDoc.data();
      const academicYear = systemData?.currentAcademicYear;
      if (academicYear) {
        console.log(`✅ Using centralized academic year: ${academicYear}`);
        return academicYear;
      }
    }
    
    // Fallback to current calendar year format with slash
    const currentYear = new Date().getFullYear();
    const fallbackYear = `${currentYear}/${currentYear + 1}`;
    console.log(`⚠️ Using fallback academic year: ${fallbackYear}`);
    return fallbackYear;
    
  } catch (error) {
    console.error("❌ Error getting centralized academic year:", error);
    const currentYear = new Date().getFullYear();
    const fallbackYear = `${currentYear}/${currentYear + 1}`;
    console.log(`🔄 Using emergency fallback academic year: ${fallbackYear}`);
    return fallbackYear;
  }
}

/**
 * Add watermark and security features to prevent copying
 */
function addWatermarkAndSecurity(pdf: jsPDF, pageWidth: number, pageHeight: number, applicationId: string) {
  // Save the current settings
  const originalTextColor = pdf.getTextColor();
  const originalFontSize = pdf.getFontSize();
  
  // Add diagonal watermark in center
  pdf.setTextColor(220, 220, 220); // Light gray
  pdf.setFontSize(50);
  pdf.setFont('helvetica', 'bold');
  
  // Center of page - simple diagonal text
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Main watermark (simplified without angle for compatibility)
  pdf.text('UCAES OFFICIAL', centerX - 40, centerY, { maxWidth: 80 });
  
  // Add smaller watermark text around the page
  pdf.setFontSize(16);
  pdf.setTextColor(240, 240, 240); // Even lighter gray
  
  // Corner watermarks (simplified positioning)
  pdf.text('UCAES', 30, 60);
  pdf.text('OFFICIAL', pageWidth - 50, 60);
  pdf.text('VERIFIED', 30, pageHeight - 40);
  pdf.text('GENUINE', pageWidth - 50, pageHeight - 40);
  
  // Add application ID watermark in multiple locations
  pdf.setFontSize(10);
  pdf.setTextColor(250, 250, 250); // Very light gray
  
  // Multiple positions for application ID
  pdf.text(applicationId, 60, 120);
  pdf.text(applicationId, pageWidth - 80, 180);
  pdf.text(applicationId, 90, 240);
  pdf.text(applicationId, pageWidth - 90, 280);
  
  // Add security border
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Add "ORIGINAL DOCUMENT" text at bottom
  pdf.setFontSize(8);
  pdf.setTextColor(180, 180, 180);
  pdf.text('ORIGINAL DOCUMENT - UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES', 
           pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  // Restore original settings
  pdf.setTextColor(originalTextColor);
  pdf.setFontSize(originalFontSize);
  pdf.setFont('helvetica', 'normal');
}

/**
 * Generate admission letter PDF
 */
export async function generateAdmissionLetter(studentData: StudentData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Prepare data
  const currentDate = new Date();
  const referenceNumber = generateReferenceNumber(studentData.applicationId);
  const dateIssued = formatDate(currentDate);
  const academicYear = await getCentralizedAcademicYear();
  const academicDates = {
    ...getAcademicDates(),
    academicYear // Override with centralized academic year
  };
  // Use director-approved level for fee calculation if available
  const effectiveLevel = studentData.directorApprovedLevel || studentData.level;
  const feeStructure = getFeeStructure(effectiveLevel, studentData.studyMode);
  
  // Header Section
  let yPosition = 20;
  
  // School name and logo area
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('UNIVERSITY COLLEGE OF AGRICULTURE AND', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  pdf.text('ENVIRONMENTAL STUDIES, (UCAES), BUNSO', pageWidth / 2, yPosition, { align: 'center' });
  
  // Contact information
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Post Office Box 21, Bunso, Eastern Region, Ghana', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text('www.ucaes.edu.gh / info@ucaes.edu.gh', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text('+233 241 41 7736 / +233 241 59 6737', pageWidth / 2, yPosition, { align: 'center' });
  
  // Reference number and date
  yPosition += 15;
  pdf.setFontSize(11);
  pdf.text(referenceNumber, 20, yPosition);
  pdf.text(`Date: ${dateIssued}`, pageWidth - 60, yPosition);
  
  // Add watermark and security features
  addWatermarkAndSecurity(pdf, pageWidth, pageHeight, studentData.applicationId);
  
  // Recipient
  yPosition += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Dear ${studentData.name.split(' ')[0]},`, 20, yPosition);
  
  // Title
  yPosition += 10;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`OFFER OF ADMISSION FOR ${academicDates.academicYear} ACADEMIC YEAR`, 20, yPosition);
  
  // Main content
  yPosition += 15;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  // Point 1
  const point1 = `1    I write to offer you admission to the ${studentData.studyMode} School of the University College of Agriculture and Environmental Studies (UCAES), Bunso, E/R.`;
  const point1Lines = pdf.splitTextToSize(point1, pageWidth - 40);
  pdf.text(point1Lines, 20, yPosition);
  yPosition += (point1Lines.length * 5) + 5;
  
  // Point 2 - Program admission details
  const approvedProgram = studentData.directorApprovedProgram || studentData.program;
  const approvedLevel = studentData.directorApprovedLevel || studentData.level;
  
  let programDescription = '';
  if (studentData.applicationType === 'topup') {
    // Top-up application
    const levelText = approvedLevel === '200' ? 'Second Year (Level 200)' : 
                     approvedLevel === '300' ? 'Third Year (Level 300)' : 
                     approvedLevel === '400' ? 'Fourth Year (Level 400)' : `Level ${approvedLevel}`;
    
    programDescription = `YOU have been offered admission as a TOP-UP student to continue your studies in ${approvedProgram} at ${levelText}, based on your previous qualification in ${studentData.previousQualification || 'your previous studies'}.`;
  } else {
    // Fresh application
    programDescription = `YOU have been offered admission to the programme leading to ${approvedProgram}, awarded by the University College.`;
  }
  
  const point2 = `2    ${programDescription}`;
  const point2Lines = pdf.splitTextToSize(point2, pageWidth - 40);
  pdf.text(point2Lines, 20, yPosition);
  yPosition += (point2Lines.length * 5) + 5;
  
  // Additional point for top-up students about credit transfer
  if (studentData.applicationType === 'topup') {
    const topupNote = `     Note: As a top-up student, your previous academic achievements have been recognized, allowing you to enter at ${approvedLevel === '200' ? 'Second Year' : approvedLevel === '300' ? 'Third Year' : 'Fourth Year'} level. Please ensure all transcripts and certificates are submitted during registration.`;
    const topupNoteLines = pdf.splitTextToSize(topupNote, pageWidth - 40);
    pdf.text(topupNoteLines, 20, yPosition);
    yPosition += (topupNoteLines.length * 5) + 5;
  }
  
  // Point 3
  const point3 = `3    Your admission is subject to your health status being certified by a qualified and licensed Medical Officer declaring you medically fit to pursue academic work. Please submit such a Medical Report from a recognised hospital/clinic at the time of Registration.`;
  const point3Lines = pdf.splitTextToSize(point3, pageWidth - 40);
  pdf.text(point3Lines, 20, yPosition);
  yPosition += (point3Lines.length * 5) + 5;
  
  // Point 4
  const point4 = `4    Should you decide to accept the offer, you will be required to respond to this offer by writing an acceptance letter as soon as possible to reach the Registrar, University College of Agriculture and Environmental Studies (UCAES), P.O Box 27, Bunso-E/R, before the date of re-opening.`;
  const point4Lines = pdf.splitTextToSize(point4, pageWidth - 40);
  pdf.text(point4Lines, 20, yPosition);
  yPosition += (point4Lines.length * 5) + 5;
  
  // Point 5 - Payment details
  if (feeStructure) {
    const totalInWords = numberToWords(feeStructure.total);
    const paymentText = studentData.studyMode === 'Regular' 
      ? `at least 70% of the total fees for the academic year, with the understanding that any remainder is to be paid before the start of the Second Semester.`
      : `at least 70% of the total fees for the academic year, with the understanding that any remainder is to be paid before the start of subsequent trimesters.`;
    
    const point5 = `5    Your acceptance letter should be accompanied with receipt evidencing payment of ALL or ${paymentText}`;
    const point5Lines = pdf.splitTextToSize(point5, pageWidth - 40);
    pdf.text(point5Lines, 20, yPosition);
    yPosition += (point5Lines.length * 5) + 5;
  }
  
  // Point 6
  const point6 = `6    The admission is renewable annually by registration and complete payment of all required or remaining fees for the academic year.`;
  const point6Lines = pdf.splitTextToSize(point6, pageWidth - 40);
  pdf.text(point6Lines, 20, yPosition);
  yPosition += (point6Lines.length * 5) + 5;
  
  // Point 7 - Fee details
  if (feeStructure) {
    const totalInWords = numberToWords(feeStructure.total);
    const point7 = `7    The approved fees for the ${academicDates.academicYear} academic year is ${formatCurrency(feeStructure.total)} Ghana Cedis (${formatCurrency(feeStructure.total)}) payable at any branch of ${BANK_DETAILS.ACADEMIC_FEES.bankName}, Ghana Limited, to the University's account number ${BANK_DETAILS.ACADEMIC_FEES.accountNumber}, lodged with the ${BANK_DETAILS.ACADEMIC_FEES.branch}, in the ${BANK_DETAILS.ACADEMIC_FEES.branch}.`;
    const point7Lines = pdf.splitTextToSize(point7, pageWidth - 40);
    pdf.text(point7Lines, 20, yPosition);
    yPosition += (point7Lines.length * 5) + 5;
  }
  
  // Point 8 - Reopening date
  const point8 = `8    The Reopening date for the ${academicDates.academicYear} Academic year is ${academicDates.reopeningDate}.`;
  const point8Lines = pdf.splitTextToSize(point8, pageWidth - 40);
  pdf.text(point8Lines, 20, yPosition);
  yPosition += (point8Lines.length * 5) + 5;
  
  // Point 9 - Accommodation
  const point9 = `9    Students are required to make their own accommodation arrangement or can be offered accommodation at ${formatCurrency(HOSTEL_FEES.perSemester)} Ghana Cedis (${formatCurrency(HOSTEL_FEES.perSemester)}) only, per semester at the University College's Hostel located on campus. ${HOSTEL_FEES.description}.`;
  const point9Lines = pdf.splitTextToSize(point9, pageWidth - 40);
  pdf.text(point9Lines, 20, yPosition);
  yPosition += (point9Lines.length * 5) + 10;
  
  // Hostel payment details
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hostel fees should be paid into this bank details:', 20, yPosition);
  yPosition += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Bank Name: ${BANK_DETAILS.HOSTEL_FEES.bankName}`, 20, yPosition);
  yPosition += 4;
  pdf.text(`Account Number: ${BANK_DETAILS.HOSTEL_FEES.accountNumber}`, 20, yPosition);
  yPosition += 4;
  pdf.text(`Account Name: ${BANK_DETAILS.HOSTEL_FEES.accountName}`, 20, yPosition);
  yPosition += 4;
  pdf.text(`Branch: ${BANK_DETAILS.HOSTEL_FEES.branch}`, 20, yPosition);
  
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  } else {
    yPosition += 15;
  }
  
  // PAGE 2 - Terms and signature
  
  // Point 10
  const point10 = `10 You are expected to be in good academic and moral standing for the full duration of your study and may be withdrawn from the University at any time for unsatisfactory academic work or gross misconduct pursuant to the stipulated statutes, rules and regulations of the University that are in force or may promulgated from time to time, during the period of your stay in UCAES.`;
  const point10Lines = pdf.splitTextToSize(point10, pageWidth - 40);
  pdf.text(point10Lines, 20, yPosition);
  yPosition += (point10Lines.length * 5) + 5;
  
  // Point 11
  const point11 = `11 The University College has the right to authenticate information you have provided to support your application for admission and if any portion of the entire information, that you have provided for admission is found to be false at any time in the course of your study, you will be required to withdraw or dismissed from the University.`;
  const point11Lines = pdf.splitTextToSize(point11, pageWidth - 40);
  pdf.text(point11Lines, 20, yPosition);
  yPosition += (point11Lines.length * 5) + 5;
  
  // Point 12
  const point12 = `12 Please note that, money paid into the school's Account is not refundable.`;
  const point12Lines = pdf.splitTextToSize(point12, pageWidth - 40);
  pdf.text(point12Lines, 20, yPosition);
  yPosition += (point12Lines.length * 5) + 20;
  
  // Signature section
  pdf.text('Accept my congratulation', 20, yPosition);
  yPosition += 20;
  
  // Signature line
  pdf.line(20, yPosition, 80, yPosition);
  yPosition += 6;
  pdf.text('Prof. Patrick Ofori Danso', 20, yPosition);
  yPosition += 4;
  pdf.text('(Rector, UCAES, Bunso)', 20, yPosition);
  yPosition += 10;
  pdf.text('Cc: Head of Department', 20, yPosition);
  yPosition += 4;
  pdf.text('Finance Manager', 20, yPosition);
  
  // Add official seal placeholder
  pdf.setFontSize(8);
  pdf.text('[OFFICIAL UCAES RECTOR SEAL]', pageWidth - 70, yPosition - 20);
  
  return new Blob([pdf.output('blob')], { type: 'application/pdf' });
}

/**
 * Download admission letter as PDF
 */
export function downloadAdmissionLetter(blob: Blob, studentName: string, applicationId: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UCAES_Admission_Letter_${applicationId}_${studentName.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
