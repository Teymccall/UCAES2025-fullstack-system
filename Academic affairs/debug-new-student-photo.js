const fs = require('fs');
const fetch = require('node-fetch');

// Simulate the exact flow used in the new student information system
async function debugPhotoUploadFlow() {
  console.log('🔍 Debugging New Student Photo Upload Flow...');
  console.log('');
  
  // Step 1: Simulate a File object (like what comes from input)
  console.log('📁 Step 1: Simulating File Selection');
  const testImageBuffer = fs.readFileSync('C:\\Users\\Admin\\Desktop\\UCAES 1ST\\UCAES2025\\Academic affairs\\public\\uceslogo.png');
  const testFile = new File([testImageBuffer], 'test-student-photo.png', { type: 'image/png' });
  console.log('   File created:', {
    name: testFile.name,
    size: testFile.size,
    type: testFile.type
  });
  
  // Step 2: Simulate saving to localStorage (converting to base64)
  console.log('');
  console.log('💾 Step 2: Simulating localStorage Storage');
  const reader = new FileReader();
  
  const base64Promise = new Promise((resolve) => {
    reader.onload = () => {
      const base64Data = reader.result;
      console.log('   Base64 data created, length:', base64Data.length);
      
      const fileDataForStorage = {
        name: testFile.name,
        type: testFile.type,
        size: testFile.size,
        data: base64Data
      };
      
      resolve(fileDataForStorage);
    };
    reader.readAsDataURL(testFile);
  });
  
  const storedFileData = await base64Promise;
  console.log('   File data ready for localStorage');
  
  // Step 3: Simulate retrieving from localStorage and reconstructing File
  console.log('');
  console.log('🔄 Step 3: Simulating File Reconstruction');
  try {
    const response = await fetch(storedFileData.data);
    const blob = await response.blob();
    const reconstructedFile = new File([blob], storedFileData.name, {
      type: storedFileData.type,
      lastModified: Date.now()
    });
    
    console.log('   Reconstructed file:', {
      name: reconstructedFile.name,
      size: reconstructedFile.size,
      type: reconstructedFile.type,
      sizeMatch: reconstructedFile.size === testFile.size
    });
    
    // Step 4: Test Cloudinary upload with reconstructed file
    console.log('');
    console.log('☁️ Step 4: Testing Cloudinary Upload');
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Convert File to Buffer for node-fetch
    const arrayBuffer = await reconstructedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    formData.append('file', buffer, {
      filename: reconstructedFile.name,
      contentType: reconstructedFile.type
    });
    formData.append('upload_preset', 'studentspassport');
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');
    formData.append('crop', 'fill');
    formData.append('gravity', 'face');
    
    const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dxkkv9nbn/image/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log('   Upload status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('   ✅ Upload successful!');
      console.log('   📸 Image URL:', result.secure_url);
      console.log('   🆔 Public ID:', result.public_id);
    } else {
      const errorText = await uploadResponse.text();
      console.log('   ❌ Upload failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error in reconstruction/upload:', error.message);
  }
  
  console.log('');
  console.log('🎯 DIAGNOSIS COMPLETE');
  console.log('   If all steps passed: The flow works correctly');
  console.log('   If upload failed: Check the specific error message');
}

// Define File class for Node.js environment
class File {
  constructor(parts, name, options = {}) {
    this.name = name;
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
    this._parts = parts;
    this.size = Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p))).length;
  }
  
  async arrayBuffer() {
    return Buffer.concat(this._parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p)));
  }
  
  stream() {
    const { Readable } = require('stream');
    return Readable.from(this._parts);
  }
}

// Define FileReader for Node.js environment
class FileReader {
  readAsDataURL(file) {
    file.arrayBuffer().then(buffer => {
      const base64 = Buffer.from(buffer).toString('base64');
      this.result = `data:${file.type};base64,${base64}`;
      if (this.onload) this.onload();
    });
  }
}

debugPhotoUploadFlow();




























