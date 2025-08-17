// Script: check-duplicates.js
// Purpose: Verify duplicates in Firestore for programs and courses
// - Checks duplicates by course code
// - Checks duplicates by programId+level+semester+code
// - Checks duplicate programs by code and by name

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAll(coll) {
  const snap = await getDocs(collection(db, coll));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function reportDuplicates(items, keyFn, label) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }

  const dups = Array.from(map.entries()).filter(([, arr]) => arr.length > 1);
  if (dups.length === 0) {
    console.log(`✅ No duplicates by ${label}`);
  } else {
    console.log(`❌ Duplicates found by ${label}: ${dups.length} groups`);
    for (const [key, arr] of dups) {
      console.log(`  · Key: ${key} → ${arr.length} docs`);
      arr.forEach(x => console.log(`     - id=${x.id} code=${x.code || x.name || x.title || ''} programId=${x.programId || ''} level=${x.level || ''} semester=${x.semester || ''}`));
    }
  }
}

async function main() {
  console.log("--- Duplicate Audit: Firestore ---");

  // Programs (canonical collection used by app services)
  const programs = await fetchAll('academic-programs');
  console.log(`Programs: academic-programs → ${programs.length}`);
  reportDuplicates(programs, p => (p.code || '').trim().toUpperCase(), 'program code (academic-programs)');
  reportDuplicates(programs, p => (p.name || '').trim().toUpperCase(), 'program name (academic-programs)');

  // Legacy/other programs (if any)
  try {
    const legacyPrograms = await fetchAll('programs');
    console.log(`Programs: programs → ${legacyPrograms.length}`);
    reportDuplicates(legacyPrograms, p => (p.code || '').trim().toUpperCase(), 'program code (programs)');
    reportDuplicates(legacyPrograms, p => (p.name || '').trim().toUpperCase(), 'program name (programs)');
  } catch (e) {
    console.log('Note: legacy programs collection not accessible or empty.');
  }

  // Courses (canonical collection used by app services)
  const courses = await fetchAll('academic-courses');
  console.log(`Courses: academic-courses → ${courses.length}`);

  // By code only
  reportDuplicates(courses, c => (c.code || '').trim().toUpperCase(), 'course code (academic-courses)');

  // By program+level+semester+code
  reportDuplicates(
    courses,
    c => [
      (c.programId || '').trim(),
      String(c.level ?? '').trim(),
      String(c.semester ?? '').trim(),
      (c.code || '').trim().toUpperCase(),
    ].join('|'),
    'programId|level|semester|code (academic-courses)'
  );

  // Legacy/other courses
  try {
    const legacyCourses = await fetchAll('courses');
    console.log(`Courses: courses → ${legacyCourses.length}`);
    reportDuplicates(legacyCourses, c => (c.code || '').trim().toUpperCase(), 'course code (courses)');
  } catch (e) {
    console.log('Note: legacy courses collection not accessible or empty.');
  }

  console.log('\nAudit complete.');
}

main().catch(err => {
  console.error('Error during duplicate audit:', err);
  process.exit(1);
});





