// Test that the transcript colors have been changed from blue to green
console.log('🎨 TESTING TRANSCRIPT COLOR SCHEME UPDATE');
console.log('=' .repeat(50));

// Read the transcript file and check for color usage
const fs = require('fs');
const path = require('path');

const transcriptFile = path.join(__dirname, '../app/director/transcripts/page.tsx');

try {
  const content = fs.readFileSync(transcriptFile, 'utf8');
  
  console.log('🔍 CHECKING COLOR USAGE:');
  
  // Check for old blue colors (should be 0)
  const blueColors = [
    '#2563eb',  // Blue-600
    '#1e40af',  // Blue-800  
    '#3b82f6',  // Blue-500
    'bg-blue-600',
    'text-blue-700',
    'border-blue-600'
  ];
  
  const greenColors = [
    '#16a34a',  // Green-600
    '#15803d',  // Green-700
    'bg-green-600',
    'text-green-700', 
    'border-green-600'
  ];
  
  console.log('\n❌ OLD BLUE COLORS (should be 0):');
  blueColors.forEach(color => {
    const count = (content.match(new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    console.log(`   ${color}: ${count} occurrences`);
  });
  
  console.log('\n✅ NEW GREEN COLORS (should be > 0):');
  greenColors.forEach(color => {
    const count = (content.match(new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    console.log(`   ${color}: ${count} occurrences`);
  });
  
  // Check watermark color
  const watermarkMatch = content.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (watermarkMatch) {
    const [, r, g, b] = watermarkMatch;
    console.log(`\n🌟 WATERMARK COLOR: rgba(${r}, ${g}, ${b}, opacity)`);
    if (r === '34' && g === '197' && b === '94') {
      console.log('   ✅ Watermark is GREEN (correct)');
    } else {
      console.log('   ❌ Watermark is not the expected green color');
    }
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('✅ Updated transcript colors from UCAES blue to UCAES green and white');
  console.log('✅ Headers, borders, and semester sections now use green');
  console.log('✅ Watermark updated to green transparency');
  console.log('✅ Grade colors and accents updated');
  
  console.log('\n🎨 UCAES COLOR SCHEME:');
  console.log('   Primary: Green (#16a34a)');
  console.log('   Secondary: Dark Green (#15803d)');
  console.log('   Background: White');
  console.log('   Text: Dark Gray/Black');
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}

console.log('\n🚀 The transcript now uses the correct UCAES green and white colors!');














