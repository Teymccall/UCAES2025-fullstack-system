// Test PDF generation directly
const { jsPDF } = require('jspdf');

console.log('🧪 Testing PDF generation...');

try {
  console.log('📄 Creating new jsPDF instance...');
  const doc = new jsPDF();
  
  console.log('✍️ Adding text to PDF...');
  doc.text('Test PDF Generation', 20, 20);
  doc.text('This is a test document for UCAES', 20, 30);
  
  console.log('💾 Generating PDF buffer...');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  
  console.log('✅ PDF generated successfully!');
  console.log(`📊 PDF size: ${pdfBuffer.length} bytes`);
  
} catch (error) {
  console.error('❌ PDF generation failed:', error);
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
}
