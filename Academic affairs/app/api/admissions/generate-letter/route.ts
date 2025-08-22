import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { getFeeStructure, formatCurrency, numberToWords, BANK_DETAILS } from '@/lib/fee-structure';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuyOY9_N1P-JiSScRZtPqLJgRjpFoP7e4",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "43080328075",
  appId: "1:43080328075:web:9c158b0bf08de7aa4b12f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to format registration numbers
const formatRegistrationNumber = (applicationId: string): string => {
  if (!applicationId) return 'N/A'
  
  // Return the actual application ID as stored in the database
  // This should be in format like UCAES20260028
  return applicationId
}

// Add watermark and security features to prevent copying
function addWatermarkAndSecurity(doc: jsPDF, applicationId: string) {
  // Save the current settings
  const originalTextColor = doc.getTextColor();
  const originalFontSize = doc.getFontSize();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add diagonal watermark in center
  doc.setTextColor(220, 220, 220); // Light gray
  doc.setFontSize(45);
  doc.setFont('helvetica', 'bold');
  
  // Center of page - main watermark
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Main watermark
  doc.text('UCAES OFFICIAL', centerX - 35, centerY, { maxWidth: 70 });
  
  // Add smaller watermark text around the page
  doc.setFontSize(14);
  doc.setTextColor(245, 245, 245); // Even lighter gray
  
  // Corner watermarks
  doc.text('UCAES', 25, 50);
  doc.text('OFFICIAL', pageWidth - 45, 50);
  doc.text('VERIFIED', 25, pageHeight - 30);
  doc.text('GENUINE', pageWidth - 45, pageHeight - 30);
  
  // Add application ID watermark in multiple locations
  doc.setFontSize(8);
  doc.setTextColor(250, 250, 250); // Very light gray
  
  // Multiple positions for application ID
  doc.text(applicationId, 50, 100);
  doc.text(applicationId, pageWidth - 70, 160);
  doc.text(applicationId, 80, 220);
  doc.text(applicationId, pageWidth - 80, 260);
  
  // Add security border
  doc.setLineWidth(0.3);
  doc.setDrawColor(220, 220, 220);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  // Add "ORIGINAL DOCUMENT" text at bottom
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text('ORIGINAL DOCUMENT - UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES', 
           pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Restore original settings
  doc.setTextColor(originalTextColor);
  doc.setFontSize(originalFontSize);
  doc.setFont('times', 'normal');
}

// Add CORS headers helper
function addCorsHeaders(response: NextResponse, request?: NextRequest) {
  // Allow requests from both the admission portal and main website domains
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ucaes.edu.gh',
    'https://admissions.ucaes.edu.gh',
    'https://admin.ucaes.edu.gh'
  ];
  
  // Get the origin from the request headers or use wildcard as fallback
  const origin = request?.headers.get('origin') || '*';
  
  // Set the CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '*';
  
  // Set CORS headers directly for OPTIONS requests
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      const errorResponse = NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    console.log('📋 Generating admission letter for application:', applicationId);

    // Fetch application data from Firebase
    const admissionsRef = collection(db, 'admission-applications');
    const q = query(admissionsRef, where('applicationId', '==', applicationId));
    const querySnapshot = await getDocs(q);

    console.log('🔍 Found', querySnapshot.size, 'applications with applicationId:', applicationId);

    let applicationData;
    
    if (querySnapshot.empty) {
      // Try alternative search methods
      console.log('⚠️ No application found with applicationId, trying alternative search...');
      
      // Try searching by document ID
      const docRef = doc(db, 'admission-applications', applicationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Found application by document ID');
        applicationData = docSnap.data();
        console.log('📋 Application data:', { 
          applicationId: applicationData.applicationId,
          firstName: applicationData.personalInfo?.firstName,
          lastName: applicationData.personalInfo?.lastName,
          status: applicationData.applicationStatus
        });
      } else {
        console.log('❌ Application not found by document ID either');
        const errorResponse = NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
        return addCorsHeaders(errorResponse, request);
      }
    } else {
      applicationData = querySnapshot.docs[0].data();
      console.log('📋 Application data:', { 
        applicationId: applicationData.applicationId,
        firstName: applicationData.personalInfo?.firstName,
        lastName: applicationData.personalInfo?.lastName,
        status: applicationData.applicationStatus
      });
    }

    // Check if application is approved
    if (applicationData.applicationStatus !== 'accepted') {
      const errorResponse = NextResponse.json(
        { error: 'Application must be approved before generating admission letter' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, request);
    }

    // Prepare student data
    const firstName = applicationData.personalInfo?.firstName || '';
    const lastName = applicationData.personalInfo?.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    const program = applicationData.programSelection?.firstChoice || applicationData.academicInfo?.intendedCourse || 'Unknown Program';
    const level = applicationData.programSelection?.studyLevel || applicationData.academicInfo?.level || 'undergraduate';
    const studyMode = applicationData.programSelection?.studyMode || applicationData.academicInfo?.studyMode || 'Regular';
    const email = applicationData.contactInfo?.email || '';
    
    // Include top-up and director approval information
    const previousQualification = applicationData.academicBackground?.qualificationType || applicationData.previousQualification;
    const applicationType = applicationData.programSelection?.applicationType || applicationData.applicationType;
    const directorApprovedProgram = applicationData.directorApprovedProgram;
    const directorApprovedLevel = applicationData.directorApprovedLevel;
    
    // Get student photo from multiple possible locations
    let studentPhoto = '';
    console.log('🔍 Checking for student photo in application data...');
    console.log('📋 Personal info passport photo:', applicationData.personalInfo?.passportPhoto);
    console.log('📋 Documents photo:', applicationData.documents?.photo);
    console.log('📋 Documents passport photo:', applicationData.documents?.passportPhoto);
    
    if (applicationData.personalInfo?.passportPhoto?.url) {
      studentPhoto = applicationData.personalInfo.passportPhoto.url;
      console.log('✅ Found photo in personalInfo.passportPhoto.url');
    } else if (applicationData.documents?.photo?.url) {
      studentPhoto = applicationData.documents.photo.url;
      console.log('✅ Found photo in documents.photo.url');
    } else if (applicationData.documents?.passportPhoto?.url) {
      studentPhoto = applicationData.documents.passportPhoto.url;
      console.log('✅ Found photo in documents.passportPhoto.url');
    } else {
      console.log('❌ No student photo found in any location');
    }
    
    console.log('📸 Final student photo URL:', studentPhoto);

    console.log('📋 Student data prepared:', { name, program, level, studyMode, applicationId });

    // Get academic year set by director from system configuration
    let academicYear = '2020/2021'; // Default fallback to director's setting
    try {
      console.log('🔍 Fetching director-set academic year from system config...');
      
      // Try multiple paths to find the academic year
      const configPaths = [
        { collection: 'systemConfig', docId: 'academicPeriod' },
        { collection: 'system-config', docId: 'academic-period' },
        { collection: 'system-config', docId: 'current' },
        { collection: 'settings', docId: 'academic-year' }
      ];
      
      let foundAcademicYear = false;
      
      for (const path of configPaths) {
        if (foundAcademicYear) break;
        
        console.log(`🔍 Checking ${path.collection}/${path.docId} for academic year...`);
        const configRef = doc(db, path.collection, path.docId);
        const configDoc = await getDoc(configRef);
        
        if (configDoc.exists()) {
          const configData = configDoc.data();
          console.log(`✅ Found document at ${path.collection}/${path.docId}:`, configData);
          
          // Check various possible field names for academic year
          const possibleFields = [
            'currentAcademicYear',
            'academicYear',
            'current_academic_year',
            'academic_year',
            'year',
            'displayName'
          ];
          
          for (const field of possibleFields) {
            if (configData[field] && typeof configData[field] === 'string') {
              academicYear = configData[field];
              console.log(`✅ Found academic year in field '${field}':`, academicYear);
              foundAcademicYear = true;
              break;
            }
          }
          
          // Check for academic year ID that needs to be resolved
          if (!foundAcademicYear) {
            const idFields = [
              'currentAcademicYearId',
              'academicYearId',
              'yearId',
              'id'
            ];
            
            for (const field of idFields) {
              if (configData[field] && typeof configData[field] === 'string') {
                console.log(`🔍 Found academic year ID in field '${field}':`, configData[field]);
                
                // Try to resolve the ID to get the full academic year
                try {
                  const yearRef = doc(db, 'academic-years', configData[field]);
                  const yearDoc = await getDoc(yearRef);
                  
                  if (yearDoc.exists()) {
                    const yearData = yearDoc.data();
                    academicYear = yearData.displayName || yearData.year || yearData.name || academicYear;
                    console.log('✅ Resolved academic year from ID:', academicYear);
                    foundAcademicYear = true;
                    break;
                  }
                } catch (yearError) {
                  console.log(`⚠️ Error resolving academic year ID:`, yearError.message);
                }
              }
            }
          }
        } else {
          console.log(`⚠️ No document found at ${path.collection}/${path.docId}`);
        }
      }
      
      if (!foundAcademicYear) {
        console.log('⚠️ No academic year found in any location, using default:', academicYear);
      }
    } catch (error) {
      console.log('⚠️ Error fetching system academic year, using default:', error.message);
    }

    // Generate admission letter PDF
    console.log('📄 Creating PDF document...');
    let doc;
    try {
      doc = new jsPDF();
      console.log('✅ jsPDF instance created successfully');
    } catch (pdfError) {
      console.error('❌ Error creating jsPDF instance:', pdfError);
      throw new Error('PDF library initialization failed: ' + pdfError.message);
    }
    
    // Add official UCAES header with logo and colors
    try {
      console.log('📝 Adding official UCAES header to PDF...');
      
      // Add colored header background FIRST
      doc.setFillColor(0, 100, 0); // Dark green
      doc.rect(0, 0, 210, 55, 'F');
      
      // Add school logo AFTER the background
      try {
        // Try multiple possible paths for the logo (using new filename logo.png)
        let logoPath = path.join(process.cwd(), '..', 'Admission ucaes', 'project', 'src', 'images', 'logo.png');
        if (!fs.existsSync(logoPath)) {
          logoPath = path.join(process.cwd(), 'Admission ucaes', 'project', 'src', 'images', 'logo.png');
        }
        if (!fs.existsSync(logoPath)) {
          logoPath = path.join(process.cwd(), '..', '..', 'Admission ucaes', 'project', 'src', 'images', 'logo.png');
        }
        
        if (fs.existsSync(logoPath)) {
          console.log('✅ School logo found at:', logoPath);
          const logoBuffer = fs.readFileSync(logoPath);
          console.log('📸 Logo buffer size:', logoBuffer.length, 'bytes');
          
          try {
            // Convert Buffer to Uint8Array for jsPDF
            const uint8Array = new Uint8Array(logoBuffer);
            console.log('📸 Logo Uint8Array length:', uint8Array.length);
            
            doc.addImage(uint8Array, 'PNG', 10, 5, 40, 40);
            console.log('✅ School logo added to PDF successfully');
          } catch (logoAddError) {
            console.log('⚠️ Error adding logo to PDF:', logoAddError.message);
            throw logoAddError;
          }
        } else {
          console.log('⚠️ Logo not found at any path, using placeholder');
          // Add a placeholder for logo
          doc.setFillColor(255, 255, 255);
          doc.rect(20, 10, 30, 30, 'F');
          doc.setTextColor(0, 100, 0);
          doc.setFontSize(8);
          doc.setFont("times", "bold");
          doc.text('UCAES', 35, 25, { align: 'center' });
          doc.text('LOGO', 35, 35, { align: 'center' });
        }
      } catch (logoError) {
        console.log('⚠️ Could not add logo:', logoError.message);
        // Add a placeholder for logo
        doc.setFillColor(255, 255, 255);
        doc.rect(20, 10, 30, 30, 'F');
        doc.setTextColor(0, 100, 0);
        doc.setFontSize(8);
        doc.setFont("times", "bold");
        doc.text('UCAES', 35, 25, { align: 'center' });
        doc.text('LOGO', 35, 35, { align: 'center' });
      }
      
      // University name in white - positioned to avoid logo overlap and fit properly
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("times", "bold");
      doc.text('UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES (UCAES), BUNSO', 125, 25, { align: 'center' });
      
      // Contact info in white - positioned to avoid logo overlap and ensure visibility
      doc.setFontSize(8);
      doc.setFont("times", "normal");
      doc.text('Post Office Box 21, Bunso, Eastern Region, Ghana', 125, 35, { align: 'center' });
      doc.text('www.ucaes.edu.gh | info@ucaes.edu.gh', 125, 42, { align: 'center' });
      doc.text('+233 241 41 7736 / +233 241 59 6737', 125, 49, { align: 'center' });
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      
      // Reference number and date
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB');
      const refNumber = `UCAES/REC/ADM/${today.getFullYear()}.${applicationId.replace('UCAES', '').replace(/\D/g, '')}`;
      
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.text(refNumber, 20, 70);
      doc.text(`Date: ${dateStr}`, 150, 70);
      
      // Dear student - display full name
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(`Dear ${name},`, 20, 100);
      
      // Main heading with color
      doc.setFillColor(0, 100, 0);
      doc.rect(15, 105, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(`OFFER OF ADMISSION FOR ${academicYear} ACADEMIC YEAR`, 105, 112, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      
      // Add watermark and security features
      addWatermarkAndSecurity(doc, applicationId);
      
      // Calculate fees based on director-approved level and study mode
      const effectiveLevel = directorApprovedLevel || level;
      const effectiveProgram = directorApprovedProgram || program;
      const feeStructure = getFeeStructure(effectiveLevel, studyMode as 'Regular' | 'Weekend');
      
      console.log('💰 Fee calculation:', { effectiveLevel, studyMode, feeStructure });
      
      // Prepare program description based on application type
      let programDescription = '';
      if (applicationType === 'topup') {
        const levelText = effectiveLevel === '200' ? 'Second Year (Level 200)' : 
                         effectiveLevel === '300' ? 'Third Year (Level 300)' : 
                         effectiveLevel === '400' ? 'Fourth Year (Level 400)' : `Level ${effectiveLevel}`;
        
        programDescription = `YOU have been offered admission as a TOP-UP student to continue your studies in ${effectiveProgram} at ${levelText}, based on your previous qualification in ${previousQualification || 'your previous studies'}.`;
      } else {
        programDescription = `YOU have been offered admission to the programme leading to ${effectiveProgram}, awarded by the University College.`;
      }

      // Prepare fee information
      let feeText = 'Four Thousand Three Hundred and Ten Ghana Cedis (GHS 4,310.00)'; // Default fallback
      let paymentScheduleText = 'at least 70% of the total fees for the academic year, with the understanding that any remainder is to be paid before the start of the Second Semester.';
      
      if (feeStructure) {
        const totalInWords = numberToWords(feeStructure.total);
        feeText = `${formatCurrency(feeStructure.total)} (${formatCurrency(feeStructure.total)})`;
        
        if (studyMode === 'Weekend') {
          paymentScheduleText = `at least 70% of the total fees for the academic year, with the understanding that any remainder is to be paid before the start of subsequent trimesters. Weekend program fees are paid in three installments: ${formatCurrency(feeStructure.firstPayment)}, ${formatCurrency(feeStructure.secondPayment)}, and ${formatCurrency(feeStructure.thirdPayment)}.`;
        } else {
          paymentScheduleText = `at least 70% of the total fees for the academic year, with the understanding that any remainder is to be paid before the start of the Second Semester. Regular program fees are paid in two installments: ${formatCurrency(feeStructure.firstPayment)} per semester.`;
        }
      }

      // Numbered content sections
      const content = [
        { number: 1, text: `I write to offer you admission to the ${studyMode} School of the University College of Agriculture and Environmental Studies (UCAES), Bunso, E/R.` },
        { number: 2, text: programDescription },
        ...(applicationType === 'topup' ? [{ 
          number: '2b', 
          text: `Note: As a top-up student, your previous academic achievements have been recognized, allowing you to enter at ${effectiveLevel === '200' ? 'Second Year' : effectiveLevel === '300' ? 'Third Year' : 'Fourth Year'} level. Please ensure all transcripts and certificates are submitted during registration.` 
        }] : []),
        { number: 3, text: 'Your admission is subject to your health status being certified by a qualified and licensed Medical Officer declaring you medically fit to pursue academic work. Please submit such a Medical Report from a recognised hospital/clinic at the time of Registration.' },
        { number: 4, text: 'Should you decide to accept the offer, you will be required to respond to this offer by writing an acceptance letter as soon as possible to reach the Registrar, University College of Agriculture and Environmental Studies (UCAES), P.O Box 27, Bunso-E/R, before the date of re-opening.' },
        { number: 5, text: `Your acceptance letter should be accompanied with receipt evidencing payment of ALL or ${paymentScheduleText}` },
        { number: 6, text: 'The admission is renewable annually by registration and complete payment of all required or remaining fees for the academic year.' },
        { number: 7, text: `The approved fees for the ${academicYear} academic year is ${feeText} payable at any branch of ${BANK_DETAILS.ACADEMIC_FEES.bankName}, Ghana Limited, to the University's account number ${BANK_DETAILS.ACADEMIC_FEES.accountNumber}, lodged with the ${BANK_DETAILS.ACADEMIC_FEES.branch}, in the ${BANK_DETAILS.ACADEMIC_FEES.branch}.` },
        { number: 8, text: `The Reopening date for the ${academicYear} Academic year is 12th February, ${academicYear.split('/')[1]}.` },
        { number: 9, text: 'Students are required to make their own accommodation arrangement or can be offered accommodation at Seven Hundred Ghana Cedis (GHS 700.00) only, per semester at the University College\'s Hostel located on campus. Hostel fees per semester cost seven hundred Ghana Cedis only (GHS 700.00).' },
        { number: 10, text: `Hostel fees should be paid into this bank details: Bank Name: ${BANK_DETAILS.HOSTEL_FEES.bankName}, Account Number: ${BANK_DETAILS.HOSTEL_FEES.accountNumber}, Account Name: ${BANK_DETAILS.HOSTEL_FEES.accountName}, Branch: ${BANK_DETAILS.HOSTEL_FEES.branch}` },
        { number: 11, text: 'You are expected to be in good academic and moral standing for the full duration of your study and may be withdrawn from the University at any time for unsatisfactory academic work or gross misconduct pursuant to the stipulated statutes, rules and regulations of the University that are in force or may be promulgated from time to time, during the period of your stay at UCAES.' },
        { number: 12, text: 'The University College has the right to authenticate information you have provided to support your application for admission and if any portion of the entire information, that you have provided for admission is found to be false at any time in the course of your study, you will be required to withdraw or be dismissed from the University.' },
        { number: 13, text: 'Please note that, money paid into the school\'s Account is not refundable.' },
        { number: 14, text: `STUDENT PORTAL ACCESS: You can access the online student portal at www.ucaes.edu.gh/student-portal using your Index Number: ${formatRegistrationNumber(applicationId)} and your Date of Birth as password in the format DD-MM-YYYY (e.g., 15-03-1995). This portal provides access to academic information, course registration, results, and other student services.` }
      ];
      
      let yPos = 125;
      content.forEach(section => {
        if (yPos > 270) { // Start new page if needed
          doc.addPage();
          yPos = 20;
        }
        
        // Number with color
        doc.setFillColor(0, 100, 0);
        doc.circle(25, yPos - 2, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("times", "bold");
        doc.text(section.number.toString(), 25, yPos, { align: 'center' });
        
        // Reset text color and add content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        
        // Special formatting for sections 7 and 9
        if (section.number === 7 || section.number === 9) {
          // Split into multiple lines with better formatting
          const maxWidth = 140;
          const lines = [];
          const words = section.text.split(' ');
          let currentLine = '';
          
          words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const textWidth = doc.getTextWidth(testLine);
            
            if (textWidth > maxWidth && currentLine !== '') {
              lines.push(currentLine.trim());
              currentLine = word + ' ';
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          
          // Add lines to PDF with proper indentation
          lines.forEach((line, index) => {
            if (yPos > 270) { // Start new page if needed
              doc.addPage();
              yPos = 20;
            }
            // First line starts at 35, subsequent lines indented
            const xPos = index === 0 ? 35 : 40;
            doc.text(line, xPos, yPos + (index * 5));
          });
          
          yPos += (lines.length * 5) + 8;
        } else {
          // Regular text wrapping for other sections
          const words = section.text.split(' ');
          let line = '';
          let lineY = yPos;
          
          words.forEach(word => {
            const testLine = line + word + ' ';
            const textWidth = doc.getTextWidth(testLine);
            
            if (textWidth > 150) { // Wrap text
              doc.text(line, 35, lineY);
              line = word + ' ';
              lineY += 5;
            } else {
              line = testLine;
            }
          });
          
          if (line) {
            doc.text(line, 35, lineY);
          }
          
          yPos = lineY + 8;
        }
      });
      
      // Closing section
      yPos += 5;
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text('Accept my congratulation', 20, yPos);
      
      yPos += 15;
      doc.text('Prof. Patrick Ofori Danson', 20, yPos);
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text('(Rector, UCAES, Bunso)', 20, yPos);
      yPos += 8;
      doc.text('Cc: Head of Department', 20, yPos);
      
      // Add student photo at the bottom right
      if (studentPhoto && studentPhoto.trim() !== '') {
        try {
          console.log('📸 Adding student photo at bottom from URL:', studentPhoto);
          console.log('📸 Image URL details:', {
            url: studentPhoto,
            isHttps: studentPhoto.startsWith('https'),
            isCloudinary: studentPhoto.includes('cloudinary'),
            urlLength: studentPhoto.length
          });
          
          // Fix URLs that might be missing https protocol
          if (!studentPhoto.startsWith('http')) {
            if (studentPhoto.startsWith('//')) {
              studentPhoto = 'https:' + studentPhoto;
            } else {
              studentPhoto = 'https://' + studentPhoto;
            }
            console.log('📸 Fixed photo URL by adding protocol:', studentPhoto);
          }
          
          // Try to fetch the image from the URL with better error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 10)
          
          const response = await fetch(studentPhoto, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache',
              'Referer': 'https://ucaes.edu.gh/'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('📸 Fetch response status:', response.status);
          console.log('📸 Fetch response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const imageBuffer = await response.arrayBuffer();
            console.log('📸 Image buffer size:', imageBuffer.byteLength, 'bytes');
            
            // Convert ArrayBuffer to Uint8Array for jsPDF
            const uint8Array = new Uint8Array(imageBuffer);
            console.log('📸 Converted to Uint8Array, length:', uint8Array.length);
            
            // Determine image type from URL or response
            let imageType = 'JPEG';
            const contentType = response.headers.get('content-type');
            console.log('📸 Content-Type:', contentType);
            
            if (contentType) {
              if (contentType.includes('png')) {
                imageType = 'PNG';
              } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
                imageType = 'JPEG';
              } else if (contentType.includes('webp')) {
                imageType = 'WEBP';
              }
            } else {
              // Fallback to URL extension
              if (studentPhoto.toLowerCase().includes('.png')) {
                imageType = 'PNG';
              } else if (studentPhoto.toLowerCase().includes('.jpg') || studentPhoto.toLowerCase().includes('.jpeg')) {
                imageType = 'JPEG';
              } else if (studentPhoto.toLowerCase().includes('.webp')) {
                imageType = 'WEBP';
              }
            }
            
            console.log('📸 Determined image type:', imageType);
            
            // Try to add the image to PDF
            try {
              doc.addImage(uint8Array, imageType, 120, yPos - 10, 35, 40);
              console.log('✅ Student photo added successfully at bottom');
            } catch (addImageError) {
              console.log('⚠️ Error adding image to PDF:', addImageError.message);
              throw addImageError;
            }
          } else {
            const errorText = await response.text();
            console.log('📸 Error response body:', errorText);
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
        } catch (photoError) {
          console.log('⚠️ Could not add student photo at bottom, using placeholder:', photoError.message);
          console.log('⚠️ Full error details:', photoError);
          // Fallback to placeholder
          doc.setFillColor(240, 240, 240);
          doc.rect(120, yPos - 10, 35, 40, 'F');
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.setFont("times", "normal");
          doc.text('Student Photo', 137, yPos + 5, { align: 'center' });
          doc.text(name, 137, yPos + 15, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      } else {
        // No photo available, add placeholder
        console.log('📸 No student photo available, using placeholder at bottom');
        doc.setFillColor(240, 240, 240);
        doc.rect(120, yPos - 10, 35, 40, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont("times", "normal");
        doc.text('No Photo', 137, yPos + 5, { align: 'center' });
        doc.text('Available', 137, yPos + 15, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      // Add verification QR code next to the photo
      try {
        console.log('🔗 Generating verification QR code...');
        
        // Create verification data for QR code
        const verificationData = {
          studentName: name,
          applicationId: applicationId,
          program: program,
          academicYear: academicYear,
          admissionDate: new Date().toISOString().split('T')[0],
          university: 'UCAES',
          verificationUrl: `https://ucaes.edu.gh/verify/${applicationId}`
        };
        
        const qrData = JSON.stringify(verificationData);
        console.log('🔗 QR Code data:', qrData);
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 120
        });
        
        console.log('🔗 QR code generated successfully');
        
        // Convert data URL to buffer for jsPDF
        const base64Data = qrCodeDataURL.split(',')[1];
        const qrBuffer = Buffer.from(base64Data, 'base64');
        const uint8Array = new Uint8Array(qrBuffer);
        
        // Add QR code to PDF (positioned next to the photo)
        doc.addImage(uint8Array, 'PNG', 165, yPos - 10, 30, 30);
        
        // Add QR code label
        doc.setFontSize(7);
        doc.setFont("times", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text('Verification QR', 180, yPos + 25, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        
        console.log('✅ Verification QR code added successfully next to photo');
        
      } catch (qrError) {
        console.log('⚠️ Could not generate QR code, using placeholder:', qrError.message);
        console.log('⚠️ Full QR error details:', qrError);
        // Fallback to placeholder
        doc.setFillColor(240, 240, 240);
        doc.rect(165, yPos - 10, 30, 30, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont("times", "normal");
        doc.text('QR Code', 180, yPos + 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      yPos += 5;
      doc.text('Finance Manager', 20, yPos);
      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('(Official Stamp and Signature)', 20, yPos);
      
      console.log('✅ Official admission letter content added successfully');
    } catch (headerError) {
      console.error('❌ Error adding content:', headerError);
      throw new Error('PDF content generation failed: ' + headerError.message);
    }
    
    console.log('💾 Generating PDF buffer...');
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Set response headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="UCAES_Admission_Letter_${firstName}_${lastName}_${applicationId}.pdf"`);
    headers.set('Content-Length', pdfBuffer.length.toString());

    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: headers,
    });
    
    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('❌ Error generating admission letter:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to generate admission letter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}