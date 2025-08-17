import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const adminDb = getDb();
    console.log('🔍 Finding students with mismatched registration numbers...');
    
    // 1. Get all admission applications that have been transferred
    const admissionsRef = adminDb.collection('admission-applications');
    const transferredQuery = admissionsRef.where('transferredToPortal', '==', true);
    const admissionSnapshot = await transferredQuery.get();
    
    console.log(`📋 Found ${admissionSnapshot.docs.length} transferred applications`);
    
    let fixedCount = 0;
    let matchingCount = 0;
    const results = [];
    
    for (const admissionDoc of admissionSnapshot.docs) {
      const admissionData = admissionDoc.data();
      const applicationId = admissionData.applicationId;
      const currentRegistrationNumber = admissionData.registrationNumber;
      const studentEmail = admissionData.contactInfo?.email?.toLowerCase();
      const studentName = `${admissionData.personalInfo?.firstName} ${admissionData.personalInfo?.lastName}`;
      
      console.log(`\n👤 Checking: ${studentName}`);
      console.log(`   Application ID: ${applicationId}`);
      console.log(`   Current Reg Number: ${currentRegistrationNumber}`);
      
      if (applicationId !== currentRegistrationNumber) {
        console.log(`   ⚠️  MISMATCH DETECTED! Need to fix.`);
        
        const studentResult = {
          name: studentName,
          applicationId,
          oldRegistrationNumber: currentRegistrationNumber,
          newRegistrationNumber: applicationId,
          status: 'fixing...'
        };
        
        try {
          // 2. Find the student in student-registrations collection
          if (studentEmail) {
            const studentRegsRef = adminDb.collection('student-registrations');
            const studentQuery = studentRegsRef.where('email', '==', studentEmail);
            const studentSnapshot = await studentQuery.get();
            
            if (!studentSnapshot.empty) {
              const studentDoc = studentSnapshot.docs[0];
              const studentData = studentDoc.data();
              
              console.log(`   📚 Found student in student-registrations: ${studentData.registrationNumber}`);
              
              // Update student-registrations with correct registration number
              const updateData: any = {
                registrationNumber: applicationId,
                updatedAt: FieldValue.serverTimestamp(),
                fixedRegistrationNumber: true
              };
              
              // Only add originalRegistrationNumber if it exists and is different
              if (studentData.registrationNumber && studentData.registrationNumber !== applicationId) {
                updateData.originalRegistrationNumber = studentData.registrationNumber;
              }
              
              await studentDoc.ref.update(updateData);
              
              console.log(`   ✅ Updated student-registrations: ${studentData.registrationNumber} → ${applicationId}`);
            }
            
            // 3. Find and update in students collection
            const studentsRef = adminDb.collection('students');
            const studentsQuery = studentsRef.where('email', '==', studentEmail);
            const studentsSnapshot = await studentsQuery.get();
            
            if (!studentsSnapshot.empty) {
              const studentsDoc = studentsSnapshot.docs[0];
              const studentsData = studentsDoc.data();
              
              console.log(`   📚 Found student in students collection: ${studentsData.registrationNumber}`);
              
              // Update students with correct registration number
              const studentsUpdateData: any = {
                registrationNumber: applicationId,
                updatedAt: FieldValue.serverTimestamp(),
                fixedRegistrationNumber: true
              };
              
              // Only add originalRegistrationNumber if it exists and is different
              if (studentsData.registrationNumber && studentsData.registrationNumber !== applicationId) {
                studentsUpdateData.originalRegistrationNumber = studentsData.registrationNumber;
              }
              
              await studentsDoc.ref.update(studentsUpdateData);
              
              console.log(`   ✅ Updated students collection: ${studentsData.registrationNumber} → ${applicationId}`);
            }
            
            // 4. Update admission application record
            const admissionUpdateData: any = {
              registrationNumber: applicationId,
              fixedRegistrationNumber: true,
              updatedAt: FieldValue.serverTimestamp()
            };
            
            // Only add originalRegistrationNumber if it exists and is different
            if (currentRegistrationNumber && currentRegistrationNumber !== applicationId) {
              admissionUpdateData.originalRegistrationNumber = currentRegistrationNumber;
            }
            
            await admissionDoc.ref.update(admissionUpdateData);
            
            console.log(`   ✅ Updated admission application record`);
            
            studentResult.status = 'fixed';
            fixedCount++;
          }
        } catch (error) {
          console.error(`   ❌ Error fixing ${studentName}:`, error);
          studentResult.status = `error: ${error.message}`;
        }
        
        results.push(studentResult);
      } else {
        console.log(`   ✅ Registration number matches Application ID - no fix needed`);
        matchingCount++;
        results.push({
          name: studentName,
          applicationId,
          registrationNumber: currentRegistrationNumber,
          status: 'already_correct'
        });
      }
    }
    
    console.log('\n🎉 Registration number fix completed!');
    
    const summary = {
      totalProcessed: admissionSnapshot.docs.length,
      fixedCount,
      matchingCount,
      results
    };
    
    return NextResponse.json({
      success: true,
      message: 'Registration number fix completed',
      summary
    });
    
  } catch (error) {
    console.error('❌ Error fixing registration numbers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
