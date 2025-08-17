// UCAES Fee Structure for 2025/2026 Academic Year

export interface FeeStructure {
  level: string;
  total: number;
  firstPayment: number;
  secondPayment: number;
  thirdPayment?: number; // For weekend school only
}

export interface StudyModeType {
  REGULAR: 'Regular';
  WEEKEND: 'Weekend';
}

// 2025/2026 Fee Structure as per official notice
export const FEE_STRUCTURE_2025_2026 = {
  REGULAR: {
    '100': {
      level: '100',
      total: 6950,
      firstPayment: 3475, // 1st Semester (50%)
      secondPayment: 3475  // 2nd Semester (50%)
    },
    '200': {
      level: '200', 
      total: 6100,
      firstPayment: 3050, // 1st Semester (50%)
      secondPayment: 3050  // 2nd Semester (50%)
    },
    '300': {
      level: '300',
      total: 6400,
      firstPayment: 3200, // 1st Semester (50%)
      secondPayment: 3200  // 2nd Semester (50%)
    },
    '400': {
      level: '400',
      total: 6100,
      firstPayment: 3050, // 1st Semester (50%)
      secondPayment: 3050  // 2nd Semester (50%)
    }
  },
  WEEKEND: {
    '100': {
      level: '100',
      total: 8250,
      firstPayment: 3300,  // 1st Trimester (40%)
      secondPayment: 2475, // 2nd Trimester (30%)
      thirdPayment: 2475   // 3rd Trimester (30%)
    },
    '200': {
      level: '200',
      total: 7400,
      firstPayment: 2960,  // 1st Trimester (40%)
      secondPayment: 2220, // 2nd Trimester (30%)
      thirdPayment: 2220   // 3rd Trimester (30%)
    },
    '300': {
      level: '300', 
      total: 7700,
      firstPayment: 3080,  // 1st Trimester (40%)
      secondPayment: 2310, // 2nd Trimester (30%)
      thirdPayment: 2310   // 3rd Trimester (30%)
    },
    '400': {
      level: '400',
      total: 7400,
      firstPayment: 2960,  // 1st Trimester (40%)
      secondPayment: 2220, // 2nd Trimester (30%)
      thirdPayment: 2220   // 3rd Trimester (30%)
    }
  }
} as const;

// Bank details for fee payments
export const BANK_DETAILS = {
  ACADEMIC_FEES: {
    bankName: 'Agricultural Development Bank (ADB)',
    branch: 'Asiakwa ADB Bank Branch, Eastern Region',
    accountNumber: '20910100987799903',
    accountName: 'University College of Agriculture and Environmental Studies'
  },
  HOSTEL_FEES: {
    bankName: 'Adonteng Rural Bank',
    branch: 'Bunso',
    accountNumber: '25015200003570ll',
    accountName: 'University College of Agriculture and Environmental Studies'
  }
} as const;

// Hostel fees
export const HOSTEL_FEES = {
  perSemester: 700, // GH¢ 700.00 per semester
  description: 'Hostel fees per semester cost seven hundred Ghana Cedis only (GH¢ 700.00)'
} as const;

/**
 * Get fee structure for a specific level and study mode
 */
export function getFeeStructure(level: string, studyMode: 'Regular' | 'Weekend'): FeeStructure | null {
  // Normalize level - handle various formats
  let normalizedLevel = level.replace(/^Level\s*/i, '').replace(/^L/i, '');
  
  // Map common level terms to numeric values
  if (normalizedLevel.toLowerCase() === 'undergraduate' || normalizedLevel.toLowerCase() === 'hnd1' || normalizedLevel.toLowerCase() === 'year1') {
    normalizedLevel = '100';
  } else if (normalizedLevel.toLowerCase() === 'hnd2' || normalizedLevel.toLowerCase() === 'year2') {
    normalizedLevel = '200';
  } else if (normalizedLevel.toLowerCase() === 'hnd3' || normalizedLevel.toLowerCase() === 'year3') {
    normalizedLevel = '300';
  } else if (normalizedLevel.toLowerCase() === 'hnd4' || normalizedLevel.toLowerCase() === 'year4') {
    normalizedLevel = '400';
  }
  
  const modeKey = studyMode.toUpperCase() as keyof typeof FEE_STRUCTURE_2025_2026;
  const feeData = FEE_STRUCTURE_2025_2026[modeKey]?.[normalizedLevel as keyof typeof FEE_STRUCTURE_2025_2026[typeof modeKey]];
  
  return feeData || null;
}

/**
 * Format currency in Ghana Cedis
 */
export function formatCurrency(amount: number): string {
  return `GH¢${amount.toLocaleString()}.00`;
}

/**
 * Convert number to words for official documents
 */
export function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  if (amount === 0) return 'Zero';

  function convertHundreds(num: number): string {
    let result = '';
    
    if (num > 99) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num > 19) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num > 9) {
      result += teens[num - 10] + ' ';
      return result;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  }

  let result = '';
  let thousandIndex = 0;
  
  while (amount > 0) {
    if (amount % 1000 !== 0) {
      result = convertHundreds(amount % 1000) + thousands[thousandIndex] + ' ' + result;
    }
    amount = Math.floor(amount / 1000);
    thousandIndex++;
  }
  
  return result.trim();
}

/**
 * Get academic year string
 */
export function getCurrentAcademicYear(): string {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Academic year runs from September to August
  // If current month is before September, we're in the previous academic year
  if (currentDate.getMonth() < 8) { // Month 8 = September (0-indexed)
    return `${currentYear - 1}/${currentYear}`;
  } else {
    return `${currentYear}/${currentYear + 1}`;
  }
}

/**
 * Get important academic dates
 */
export function getAcademicDates() {
  const currentYear = new Date().getFullYear();
  
  return {
    reopeningDate: '12th February, 2025',
    academicYear: '2024/2025',
    effectiveDate: 'September 2025'
  };
}
