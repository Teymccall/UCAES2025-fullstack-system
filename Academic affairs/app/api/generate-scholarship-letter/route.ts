// Server-side API endpoint for generating scholarship letters
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentData, scholarshipData, signatoryName = 'HANAMEL Finance Officer' } = body
    
    if (!studentData || !scholarshipData) {
      return NextResponse.json(
        { success: false, error: 'Student data and scholarship data are required' },
        { status: 400 }
      )
    }

    console.log('📄 Generating scholarship letter for:', studentData.fullName)
    
    // Generate the letter HTML
    const letterHtml = generateScholarshipLetterHtml({
      // University Information
      universityName: 'University College of Agriculture and Environmental Studies',
      universityAddress: 'P.O. Box 10, Bunso, Eastern Region, Ghana',
      universityPhone: '+233 (0) 342 093 245',
      universityEmail: 'info@ucaes.edu.gh',
      universityWebsite: 'www.ucaes.edu.gh',
      logoUrl: '/images/ucaes-logo.png',
      
      // Student Information
      student: studentData,
      
      // Scholarship Information
      scholarship: scholarshipData,
      
      // Letter Details
      letterDate: new Date().toISOString(),
      letterReference: generateLetterReference(scholarshipData),
      signatoryName: signatoryName,
      signatoryTitle: signatoryName === 'HANAMEL Finance Officer' ? 'Finance Officer' : 'University Official',
      signatorySignature: undefined
    })
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        letterHtml,
        letterReference: generateLetterReference(scholarshipData)
      } 
    })
    
  } catch (error: any) {
    console.error('❌ Error generating scholarship letter:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate letter' },
      { status: 500 }
    )
  }
}

/**
 * Generate scholarship letter reference number
 */
function generateLetterReference(scholarship: any): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const scholarshipCode = scholarship.scholarshipType.toUpperCase().substring(0, 3)
  const studentCode = scholarship.studentId.substring(-4)
  
  return `UCAES/${scholarshipCode}/${year}/${month}/${studentCode}`
}

/**
 * Generate professional scholarship award letter HTML
 */
function generateScholarshipLetterHtml(letterData: any): string {
  const {
    universityName,
    universityAddress,
    universityPhone,
    universityEmail,
    universityWebsite,
    logoUrl,
    student,
    scholarship,
    letterDate,
    letterReference,
    signatoryName,
    signatoryTitle,
    signatorySignature
  } = letterData

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scholarship Award Letter - ${student.fullName}</title>
    <style>
        @page {
            size: A4;
            margin: 1in;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .letterhead {
            text-align: center;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            max-height: 100px;
            margin-bottom: 15px;
        }
        
        .university-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
            margin: 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .university-details {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
        }
        
        .letter-header {
            margin: 30px 0;
        }
        
        .reference {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .date {
            margin-bottom: 20px;
        }
        
        .student-photo {
            float: right;
            width: 120px;
            height: 150px;
            border: 2px solid #2c5aa0;
            margin: 0 0 20px 20px;
            object-fit: cover;
        }
        
        .recipient-details {
            margin: 20px 0;
            font-weight: bold;
        }
        
        .letter-content {
            text-align: justify;
            margin: 30px 0;
            clear: both;
        }
        
        .scholarship-details {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .scholarship-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            border-bottom: 1px dotted #ccc;
            padding-bottom: 5px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 40%;
        }
        
        .detail-value {
            width: 58%;
            text-align: right;
        }
        
        .amount-highlight {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #856404;
        }
        
        .conditions {
            background: #e7f3ff;
            border-left: 4px solid #2c5aa0;
            padding: 15px;
            margin: 20px 0;
        }
        
        .conditions-title {
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
        }
        
        .signature-section {
            margin-top: 50px;
            page-break-inside: avoid;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            width: 250px;
            margin: 30px 0 10px 0;
        }
        
        .signature-image {
            max-height: 50px;
            margin: 10px 0;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .congratulations {
            background: linear-gradient(135deg, #2c5aa0, #4CAF50);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .congratulations h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .letterhead {
                page-break-inside: avoid;
            }
            
            .signature-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- University Letterhead -->
    <div class="letterhead">
        <div class="university-name">${universityName}</div>
        <div class="university-details">${universityAddress}</div>
        <div class="university-details">Phone: ${universityPhone} | Email: ${universityEmail}</div>
        <div class="university-details">Website: ${universityWebsite}</div>
    </div>
    
    <!-- Letter Header -->
    <div class="letter-header">
        <div class="reference">Ref: ${letterReference}</div>
        <div class="date">Date: ${new Date(letterDate).toLocaleDateString('en-GB', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
    </div>
    
    <!-- Student Photo -->
    ${student.passportPhoto ? `<img src="${student.passportPhoto}" alt="Student Photo" class="student-photo">` : ''}
    
    <!-- Recipient Details -->
    <div class="recipient-details">
        ${student.fullName}<br>
        Student ID: ${student.studentId}<br>
        ${student.program} - ${student.currentLevel}<br>
        ${student.scheduleType} Programme<br>
        ${student.residentialAddress || 'University Address'}
    </div>
    
    <!-- Congratulations Section -->
    <div class="congratulations">
        <h2>🎉 CONGRATULATIONS! 🎉</h2>
        <p>You have been awarded a scholarship in recognition of your outstanding achievements</p>
    </div>
    
    <!-- Letter Content -->
    <div class="letter-content">
        <p><strong>Dear ${student.firstName || 'Student'},</strong></p>
        
        <p>I am delighted to inform you that you have been selected to receive the <strong>${scholarship.scholarshipName}</strong> 
        for the ${scholarship.academicYear} academic year. This scholarship has been awarded in recognition of your 
        ${getScholarshipReason(scholarship.scholarshipType)} and commitment to academic excellence.</p>
        
        <p>After careful review of your academic record, achievements, and contributions to the university community, 
        the scholarship committee has determined that you meet all the criteria for this prestigious award.</p>
    </div>
    
    <!-- Scholarship Details -->
    <div class="scholarship-details">
        <div class="scholarship-title">${scholarship.scholarshipName}</div>
        
        <div class="detail-row">
            <span class="detail-label">Student Name:</span>
            <span class="detail-value">${student.fullName}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Student ID:</span>
            <span class="detail-value">${student.studentId}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Programme:</span>
            <span class="detail-value">${student.programName}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Current Level:</span>
            <span class="detail-value">${student.currentLevel}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Study Mode:</span>
            <span class="detail-value">${student.scheduleType}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Academic Year:</span>
            <span class="detail-value">${scholarship.academicYear}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Scholarship Type:</span>
            <span class="detail-value">${getScholarshipTypeName(scholarship.scholarshipType)}</span>
        </div>
        
        <div class="detail-row">
            <span class="detail-label">Award Date:</span>
            <span class="detail-value">${new Date().toLocaleDateString('en-GB')}</span>
        </div>
        
        ${student.gpa ? `
        <div class="detail-row">
            <span class="detail-label">Current CGPA:</span>
            <span class="detail-value">${student.gpa.toFixed(2)}</span>
        </div>
        ` : ''}
    </div>
    
    <!-- Amount Highlight -->
    <div class="amount-highlight">
        <div>SCHOLARSHIP AMOUNT</div>
        <div style="font-size: 24px; margin-top: 10px;">
            GH₵ ${scholarship.amount.toLocaleString()}.00
        </div>
        <div style="font-size: 14px; margin-top: 5px;">
            (Ghana Cedis ${numberToWords(scholarship.amount)} Only)
        </div>
    </div>
    
    <!-- Terms and Conditions -->
    <div class="conditions">
        <div class="conditions-title">Terms and Conditions:</div>
        <ul>
            <li>This scholarship will be applied directly to your university fee account</li>
            <li>The award is valid for the ${scholarship.academicYear} academic year only</li>
            <li>You must maintain good academic standing (minimum CGPA of 2.0)</li>
            <li>You must remain enrolled as a full-time student</li>
            <li>Any change in academic status must be reported to the Finance Office immediately</li>
            ${scholarship.renewable ? '<li>This scholarship may be renewable based on continued academic performance</li>' : ''}
        </ul>
    </div>
    
    <div class="letter-content">
        <p>This scholarship demonstrates our confidence in your potential and our commitment to supporting 
        outstanding students like yourself. We believe that this financial assistance will enable you to 
        focus more fully on your academic pursuits and continue to excel in your chosen field of study.</p>
        
        <p>Please report to the Finance Office within two weeks of receiving this letter to complete 
        the necessary documentation. You may contact the Finance Office at the above address or phone 
        number if you have any questions regarding this scholarship.</p>
        
        <p>Once again, congratulations on this achievement. We look forward to your continued success 
        and contributions to the ${universityName} community.</p>
        
        <p><strong>Yours sincerely,</strong></p>
    </div>
    
    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-line"></div>
        <div><strong>${signatoryName}</strong></div>
        <div>${signatoryTitle}</div>
        <div>${universityName}</div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <p>This is an official document from ${universityName}. Please keep this letter for your records.</p>
        <p>Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
    </div>
</body>
</html>
  `
}

/**
 * Get scholarship reason based on type
 */
function getScholarshipReason(type: string): string {
  const reasons = {
    merit: 'exceptional academic performance',
    need: 'demonstrated financial need and academic merit',
    sports: 'outstanding athletic achievements and sportsmanship',
    academic: 'exceptional academic excellence and research contributions',
    leadership: 'exemplary leadership qualities and community service',
    community: 'significant contributions to community development'
  }
  
  return reasons[type as keyof typeof reasons] || 'outstanding achievements'
}

/**
 * Get full scholarship type name
 */
function getScholarshipTypeName(type: string): string {
  const types = {
    merit: 'Merit-Based Scholarship',
    need: 'Need-Based Scholarship',
    sports: 'Athletic/Sports Scholarship',
    academic: 'Academic Excellence Scholarship',
    leadership: 'Leadership Scholarship',
    community: 'Community Service Scholarship'
  }
  
  return types[type as keyof typeof types] || 'General Scholarship'
}

/**
 * Convert number to words for amount display
 */
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const thousands = ['', 'Thousand', 'Million', 'Billion']

  if (num === 0) return 'Zero'

  function convertHundreds(n: number): string {
    let result = ''
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' '
      n %= 10
    } else if (n >= 10) {
      result += teens[n - 10] + ' '
      return result.trim()
    }
    
    if (n > 0) {
      result += ones[n] + ' '
    }
    
    return result.trim()
  }

  let result = ''
  let thousandCounter = 0
  
  while (num > 0) {
    if (num % 1000 !== 0) {
      result = convertHundreds(num % 1000) + ' ' + thousands[thousandCounter] + ' ' + result
    }
    num = Math.floor(num / 1000)
    thousandCounter++
  }
  
  return result.trim()
}



