// Audit script: Summarize results submissions and transcript readiness from Firebase
// Usage: node "Academic affairs/scripts/audit-results-and-transcripts.js"

const { initializeApp, getApps } = require('firebase/app')
const {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  limit,
} = require('firebase/firestore')

const firebaseConfig = {
  apiKey: 'AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE',
  authDomain: 'ucaes2025.firebaseapp.com',
  databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
  projectId: 'ucaes2025',
  storageBucket: 'ucaes2025.firebasestorage.app',
  messagingSenderId: '543217800581',
  appId: '1:543217800581:web:4f97ba0087f694deeea0ec',
  measurementId: 'G-8E3518ML0D',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

const normalizeSemester = (s) => {
  if (!s) return 'Unknown'
  const str = String(s).toLowerCase()
  if (str.includes('first') || str === '1') return 'First'
  if (str.includes('second') || str === '2') return 'Second'
  if (str.includes('third') || str === '3' || str.includes('trimester')) return 'Third'
  return s
}

const groupKey = (obj, keys) => keys.map((k) => obj[k] ?? '').join(' | ')

async function buildCourseIndex() {
  const idx = new Map()
  const snap = await getDocs(collection(db, 'academic-courses'))
  snap.forEach((d) => {
    idx.set(d.id, d.data())
  })
  return idx
}

async function buildProgramIndex() {
  const idx = new Map()
  const snap = await getDocs(collection(db, 'academic-programs'))
  snap.forEach((d) => idx.set(d.id, d.data()))
  return idx
}

async function auditGradeSubmissions() {
  const courses = await buildCourseIndex()
  const programs = await buildProgramIndex()

  const statusBuckets = {
    pending_approval: {},
    approved: {},
    published: {},
  }

  const snap = await getDocs(collection(db, 'grade-submissions'))
  snap.forEach((docSnap) => {
    const s = docSnap.data()
    const course = courses.get(s.courseId) || {}
    const programId = s.programId || course.programId || 'Unknown'
    const program = programs.get(programId) || {}
    const programName = program.name || programId
    const studyMode = s.studyMode || course.studyMode || 'Regular'
    const key = `${s.academicYear || 'Unknown'} | ${normalizeSemester(s.semester)} | ${studyMode} | ${programName}`
    const bucket = statusBuckets[s.status] || (statusBuckets[s.status] = {})
    bucket[key] = (bucket[key] || 0) + 1
  })

  return statusBuckets
}

async function auditLegacyGrades() {
  const res = { submitted: {}, approved: {}, published: {} }
  const snap = await getDocs(collection(db, 'grades'))
  snap.forEach((d) => {
    const g = d.data()
    const key = `${g.academicYear || 'Unknown'} | ${normalizeSemester(g.semester)}`
    const b = res[g.status] || (res[g.status] = {})
    b[key] = (b[key] || 0) + 1
  })
  return res
}

async function sampleTranscriptStudents(limitCount = 10) {
  const out = []
  const snap = await getDocs(
    query(collection(db, 'student-grades'), where('status', '==', 'published'), limit(limitCount))
  )
  for (const docSnap of snap.docs) {
    const g = docSnap.data()
    const sid = g.studentId
    let reg = 'N/A'
    let name = 'N/A'
    try {
      const sr = await getDoc(doc(db, 'student-registrations', sid))
      if (sr.exists()) {
        const s = sr.data()
        reg = s.registrationNumber || s.studentIndexNumber || sid
        name = s.name || `${s.surname || ''} ${s.otherNames || ''}`.trim()
      } else {
        const st = await getDoc(doc(db, 'students', sid))
        if (st.exists()) {
          const s = st.data()
          reg = s.registrationNumber || s.studentIndexNumber || sid
          name = s.name || `${s.surname || ''} ${s.otherNames || ''}`.trim()
        }
      }
    } catch {}
    out.push({ studentId: sid, registrationNumber: reg, name })
  }
  return out
}

async function main() {
  console.log('--- Firebase audit: Results & Transcripts ---')
  const submissions = await auditGradeSubmissions()
  const legacy = await auditLegacyGrades()
  const samples = await sampleTranscriptStudents(8)

  console.log('\n[Grade Submissions] pending_approval')
  console.log(submissions.pending_approval)
  console.log('\n[Grade Submissions] approved')
  console.log(submissions.approved)
  console.log('\n[Grade Submissions] published')
  console.log(submissions.published)

  console.log('\n[Legacy grades] submitted/approved/published (by AY|Semester)')
  console.log(legacy)

  console.log('\n[Transcript-ready] Sample students with published grades:')
  if (samples.length === 0) {
    console.log('None found in student-grades (published).')
  } else {
    samples.forEach((s, i) => console.log(`${i + 1}. ${s.registrationNumber} - ${s.name} (${s.studentId})`))
  }
}

main().catch((e) => {
  console.error('Audit failed:', e)
  process.exit(1)
})





