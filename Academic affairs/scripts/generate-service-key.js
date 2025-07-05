const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const EXAMPLE_SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour Private Key Content\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Function to validate JSON
function isValidJSON(str) {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}

// Output file path
const outputPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// Check if file already exists
if (fs.existsSync(outputPath)) {
  rl.question('Service account key file already exists. Overwrite? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      askForServiceAccount();
    } else {
      console.log('Operation cancelled.');
      rl.close();
    }
  });
} else {
  askForServiceAccount();
}

function askForServiceAccount() {
  console.log('\nPlease paste your Firebase service account key JSON below:');
  console.log('(Find it in Firebase Console > Project Settings > Service Accounts > Generate New Private Key)');
  console.log('\nExample format:');
  console.log(JSON.stringify(EXAMPLE_SERVICE_ACCOUNT, null, 2));
  console.log('\n');
  
  let input = '';
  
  // Setup for collecting multi-line input
  rl.prompt();
  
  rl.on('line', (line) => {
    // Check if this is the end of input (empty line or specific end marker)
    if (line.trim() === 'END' || line.trim() === '') {
      if (input.trim() === '') {
        console.log('No input provided. Please enter your service account key JSON:');
        return;
      }
      
      if (!isValidJSON(input)) {
        console.log('Invalid JSON format. Please try again:');
        input = '';
        return;
      }
      
      // Write the service account key to file
      try {
        fs.writeFileSync(outputPath, input.trim(), 'utf8');
        console.log(`\nService account key saved to ${outputPath}`);
        console.log('You can now run scripts that require Firebase Admin SDK authentication.');
        rl.close();
      } catch (error) {
        console.error('Error saving file:', error);
        rl.close();
      }
    } else {
      // Add line to input
      input += line + '\n';
    }
  });
  
  rl.on('close', () => {
    console.log('Service account key generation process completed.');
    process.exit(0);
  });
} 