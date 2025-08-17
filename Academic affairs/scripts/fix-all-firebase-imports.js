const fs = require('fs');
const path = require('path');

// All files that need to be fixed
const filesToFix = [
  'lib/student-transfer-service.ts',
  'lib/initialize-db.ts',
  'app/api/admissions/fix-course-registrations/route.ts',
  'app/api/dev/test-firebase-admin/route.ts',
  'app/api/admissions/settings/route.ts',
  'app/api/admissions/applications/[applicationId]/route.ts',
  'app/api/admissions/applications/route.ts',
  'app/api/admissions/fix-registration-numbers/route.ts',
  'app/api/dev/seed/route.ts',
  'app/api/debug-firebase/route.ts',
  'app/api/debug-academic-years/route.ts',
  'app/api/student-progression/status/route.ts',
  'app/api/student-progression/scheduler/route.ts',
  'app/api/student-progression/execute/route.ts',
  'app/api/finance/verify-payment/route.ts',
  'app/api/student-progression/automatic/route.ts',
  'app/api/director/dashboard/activities/route.ts',
  'app/api/director/dashboard/stats/route.ts',
  'app/api/director/dashboard/approvals/route.ts',
  'app/api/finance/fee-settings/route.ts',
  'app/api/students/confirm-photo/route.ts'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix import statement - change adminDb to getDb
  if (content.includes("import { adminDb } from '@/lib/firebase-admin'")) {
    content = content.replace(
      "import { adminDb } from '@/lib/firebase-admin'",
      "import { getDb } from '@/lib/firebase-admin'"
    );
    modified = true;
  }

  if (content.includes("import { adminDb } from '@/lib/firebase-admin';")) {
    content = content.replace(
      "import { adminDb } from '@/lib/firebase-admin';",
      "import { getDb } from '@/lib/firebase-admin';"
    );
    modified = true;
  }

  // Fix import statements with multiple imports
  if (content.includes("import { adminDb, adminAuth } from '@/lib/firebase-admin'")) {
    content = content.replace(
      "import { adminDb, adminAuth } from '@/lib/firebase-admin'",
      "import { getDb, getAuthInstance } from '@/lib/firebase-admin'"
    );
    modified = true;
  }

  if (content.includes("import { adminDb, adminAuth } from '@/lib/firebase-admin';")) {
    content = content.replace(
      "import { adminDb, adminAuth } from '@/lib/firebase-admin';",
      "import { getDb, getAuthInstance } from '@/lib/firebase-admin';"
    );
    modified = true;
  }

  // Add adminDb initialization at the start of each function that uses adminDb
  const functionRegex = /export async function (GET|POST|PUT|DELETE|PATCH)\([^)]*\)\s*\{/g;
  let match;
  let offset = 0;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const functionStart = match.index + match[0].length;
    const beforeFunction = content.substring(0, functionStart);
    const afterFunction = content.substring(functionStart);
    
    // Check if adminDb is used in this function
    const functionEnd = findFunctionEnd(afterFunction);
    const functionBody = afterFunction.substring(0, functionEnd);
    
    if (functionBody.includes('adminDb.collection') && !functionBody.includes('const adminDb = getDb()')) {
      // Insert adminDb initialization
      const newContent = beforeFunction + '\n    const adminDb = getDb();' + afterFunction;
      content = newContent;
      modified = true;
      
      // Update regex position
      offset += 20; // Length of the added line
      functionRegex.lastIndex += offset;
    }
  }

  // Also fix regular functions (not just async)
  const regularFunctionRegex = /export function (GET|POST|PUT|DELETE|PATCH)\([^)]*\)\s*\{/g;
  offset = 0;
  
  while ((match = regularFunctionRegex.exec(content)) !== null) {
    const functionStart = match.index + match[0].length;
    const beforeFunction = content.substring(0, functionStart);
    const afterFunction = content.substring(functionStart);
    
    // Check if adminDb is used in this function
    const functionEnd = findFunctionEnd(afterFunction);
    const functionBody = afterFunction.substring(0, functionEnd);
    
    if (functionBody.includes('adminDb.collection') && !functionBody.includes('const adminDb = getDb()')) {
      // Insert adminDb initialization
      const newContent = beforeFunction + '\n    const adminDb = getDb();' + afterFunction;
      content = newContent;
      modified = true;
      
      // Update regex position
      offset += 20; // Length of the added line
      regularFunctionRegex.lastIndex += offset;
    }
  }

  // Fix any remaining adminAuth references to getAuthInstance()
  if (content.includes('adminAuth.') && content.includes('getAuthInstance')) {
    content = content.replace(/adminAuth\./g, 'getAuthInstance().');
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

function findFunctionEnd(content) {
  let braceCount = 1;
  let i = 0;
  
  while (i < content.length && braceCount > 0) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    i++;
  }
  
  return i;
}

// Fix all files
console.log('Fixing all Firebase admin imports...');
filesToFix.forEach(fixFile);
console.log('Done!');


