// Promote students from student-registrations to students collection
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function promoteRegistrationsToStudents() {
  const registrationsRef = db.collection('student-registrations');
  const studentsRef = db.collection('students');
  const registrationsSnapshot = await registrationsRef.get();
  let promotedCount = 0;

  for (const doc of registrationsSnapshot.docs) {
    const data = doc.data();
    const registrationNumber = data.registrationNumber || data.studentIndexNumber || data.indexNumber;
    if (!registrationNumber) continue;

    // Check if student already exists in students collection
    const existing = await studentsRef.where('registrationNumber', '==', registrationNumber).get();
    if (!existing.empty) continue;

    // Map fields
    const studentData = {
      registrationNumber,
      surname: data.surname || '',
      otherNames: data.otherNames || '',
      gender: data.gender || '',
      dateOfBirth: data.dateOfBirth || '',
      nationality: data.nationality || 'Ghanaian',
      programme: data.programme || data.program || '',
      level: data.currentLevel || data.level || '100',
      status: data.status || 'Active',
      scheduleType: data.scheduleType || 'Regular',
      email: data.email || '',
      phone: data.mobile || data.mobileNumber || '',
      address: typeof data.address === 'object' ? data.address : {
        street: data.street || '',
        city: data.city || '',
        country: data.country || 'Ghana',
      },
      emergencyContact: {
        name: data.emergencyContactName || '',
        phone: data.emergencyContactPhone || '',
        relationship: data.emergencyContactRelationship || '',
      },
      profilePictureUrl: data.profilePictureUrl || data.profileImage || null,
      religion: data.religion || '',
      maritalStatus: data.maritalStatus || '',
      nationalId: data.nationalId || data.nationalIdNumber || '',
      yearOfEntry: data.yearOfEntry || '',
      entryLevel: data.entryLevel || '100',
      entryQualification: data.entryQualification || 'WASSCE',
      guardianName: data.guardianName || '',
      guardianContact: data.guardianContact || '',
      guardianEmail: data.guardianEmail || '',
      guardianAddress: data.guardianAddress || '',
      registrationDate: data.registrationDate || data.createdAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceCollection: 'student-registrations',
      sourceId: doc.id,
    };

    await studentsRef.add(studentData);
    promotedCount++;
    console.log(`Promoted student: ${registrationNumber}`);
  }

  console.log(`Done! Promoted ${promotedCount} students.`);
}

promoteRegistrationsToStudents().catch(console.error); 