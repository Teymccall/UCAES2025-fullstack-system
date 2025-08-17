import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const adminDb = getDb();
    console.log('🔧 Fixing course registration records...');
    
    // 1. Get all students who had their registration numbers fixed
    const studentsRef = adminDb.collection('students');
    const fixedStudentsQuery = studentsRef.where('fixedRegistrationNumber', '==', true);
    const fixedStudentsSnapshot = await fixedStudentsQuery.get();
    
    console.log(`📋 Found ${fixedStudentsSnapshot.docs.length} students with fixed registration numbers`);
    
    let updatedCount = 0;
    const results = [];
    
    for (const studentDoc of fixedStudentsSnapshot.docs) {
      const studentData = studentDoc.data();
      const currentRegistrationNumber = studentData.registrationNumber;
      const originalRegistrationNumber = studentData.originalRegistrationNumber;
      const studentName = studentData.name || `${studentData.surname} ${studentData.otherNames}`;
      
      console.log(`\n👤 Processing: ${studentName}`);
      console.log(`   Current Reg Number: ${currentRegistrationNumber}`);
      console.log(`   Original Reg Number: ${originalRegistrationNumber}`);
      
      if (originalRegistrationNumber && originalRegistrationNumber !== currentRegistrationNumber) {
        try {
          // 2. Find course registrations with the old registration number
          const courseRegsRef = adminDb.collection('course-registrations');
          const courseRegsQuery = courseRegsRef.where('registrationNumber', '==', originalRegistrationNumber);
          const courseRegsSnapshot = await courseRegsQuery.get();
          
          console.log(`   📚 Found ${courseRegsSnapshot.docs.length} course registrations to update`);
          
          if (!courseRegsSnapshot.empty) {
            // 3. Update each course registration record
            for (const courseRegDoc of courseRegsSnapshot.docs) {
              const courseRegData = courseRegDoc.data();
              
              console.log(`   🔄 Updating course registration: ${courseRegDoc.id}`);
              console.log(`      Old: ${courseRegData.registrationNumber} → New: ${currentRegistrationNumber}`);
              
              await courseRegDoc.ref.update({
                registrationNumber: currentRegistrationNumber,
                originalRegistrationNumber: originalRegistrationNumber, // Keep track
                updatedAt: FieldValue.serverTimestamp(),
                fixedCourseRegistration: true
              });
              
              updatedCount++;
            }
            
            results.push({
              studentName,
              currentRegistrationNumber,
              originalRegistrationNumber,
              courseRegistrationsUpdated: courseRegsSnapshot.docs.length,
              status: 'updated'
            });
            
            console.log(`   ✅ Updated ${courseRegsSnapshot.docs.length} course registrations for ${studentName}`);
          } else {
            results.push({
              studentName,
              currentRegistrationNumber,
              originalRegistrationNumber,
              courseRegistrationsUpdated: 0,
              status: 'no_course_registrations'
            });
            
            console.log(`   ⚠️ No course registrations found for ${studentName}`);
          }
        } catch (error) {
          console.error(`   ❌ Error processing ${studentName}:`, error);
          results.push({
            studentName,
            currentRegistrationNumber,
            originalRegistrationNumber,
            status: `error: ${error.message}`
          });
        }
      } else {
        results.push({
          studentName,
          currentRegistrationNumber,
          status: 'no_original_number'
        });
        
        console.log(`   ℹ️ No original registration number found for ${studentName}`);
      }
    }
    
    console.log('\n🎉 Course registration fix completed!');
    
    const summary = {
      studentsProcessed: fixedStudentsSnapshot.docs.length,
      courseRegistrationsUpdated: updatedCount,
      results
    };
    
    return NextResponse.json({
      success: true,
      message: 'Course registration fix completed',
      summary
    });
    
  } catch (error) {
    console.error('❌ Error fixing course registrations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}




























