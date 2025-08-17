const fs = require('fs');
const path = require('path');

// Files that need to be fixed
const filesToFix = [
  'app/api/debug-academic-years/route.ts',
  'app/api/student-progression/status/route.ts',
  'app/api/student-progression/scheduler/route.ts',
  'app/api/student-progression/execute/route.ts',
  'app/api/admissions/applications/[applicationId]/route.ts',
  'app/api/admissions/applications/route.ts',
  'app/api/student-progression/automatic/route.ts',
  'app/api/admissions/settings/route.ts',
  'app/api/finance/verify-payment/route.ts',
  'app/api/debug-firebase/route.ts'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix import statement
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

  // Add adminDb initialization at the start of each function
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
console.log('Fixing Firebase admin imports...');
filesToFix.forEach(fixFile);
console.log('Done!');


