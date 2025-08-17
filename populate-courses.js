// populate-courses.js
// A flexible script to parse course data from a text file and upload it to Firebase.

const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } = require('firebase/firestore');

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec"
};

// --- Script Configuration ---
const COURSE_DATA_FILE = 'course-data.txt'; // The file containing the course structure.

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Main Parsing and Uploading Logic ---

/**
 * Parses the entire course data file.
 * @param {string} filePath - Path to the course data file.
 * @returns {Array} - An array of program data objects.
 */
function parseCourseFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    let programs = [];
    let currentProgram = null;
    let currentLevel = null;
    let currentSemester = null;
    let currentSpecialization = null;
    let isElectiveSection = false;
    let currentElectiveGroup = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Detect Program Name
        const programMatch = trimmedLine.match(/^(?:\d+\.\s+)?(BSc\..+)/);
        if (programMatch) {
            if (currentProgram) programs.push(currentProgram);
            const programName = programMatch[1].trim();
            console.log(`Found program in file: "${programName}"`);
            currentProgram = { name: programName, levels: [] };
            currentLevel = null;
            currentSemester = null;
            currentSpecialization = null;
            continue;
        }

        if (!currentProgram) continue;

        // Detect Level and Semester in a single line or separately
        const levelAndSemesterMatch = trimmedLine.match(/(?:Level|Year)\s+(\w+)\s.*?(?:(First|Second)\s+Semester|SEMESTER\s+(ONE|TWO))/i);
        const levelOnlyMatch = trimmedLine.match(/^(?:Level|Year)\s+(\w+)/i);
        const semesterOnlyMatch = trimmedLine.match(/^(First|Second)\s+Semester|SEMESTER\s+(ONE|TWO)/i);

        if (levelAndSemesterMatch) {
            currentLevel = parseLevel(levelAndSemesterMatch[1]);
            currentSemester = parseSemester(levelAndSemesterMatch[2] || levelAndSemesterMatch[3]);
        } else if (levelOnlyMatch) {
            currentLevel = parseLevel(levelOnlyMatch[1]);
            currentSemester = null; // Reset semester if only level is found
        } else if (semesterOnlyMatch && currentLevel) {
            currentSemester = parseSemester(semesterOnlyMatch[1] || semesterOnlyMatch[2]);
        } else {
             // Continue to other parsing logic if no level/semester info
        }

        // If we have a newly identified semester, set up the structure
        if (currentLevel && currentSemester) {
            const lastLevelInProgram = currentProgram.levels[currentProgram.levels.length - 1];
            const lastSemesterInLevel = lastLevelInProgram?.semesters[lastLevelInProgram.semesters.length - 1];

            // Avoid re-adding the same semester structure
            if (!lastSemesterInLevel || lastSemesterInLevel.semester !== currentSemester || lastLevelInProgram.level !== currentLevel) {
                currentSpecialization = null;
                isElectiveSection = false;
                let levelObj = currentProgram.levels.find(l => l.level === currentLevel);
                if (!levelObj) {
                    levelObj = { level: currentLevel, semesters: [] };
                    currentProgram.levels.push(levelObj);
                }
                let semesterObj = levelObj.semesters.find(s => s.semester === currentSemester);
                if (!semesterObj) {
                    semesterObj = { semester: currentSemester, courses: [] };
                    levelObj.semesters.push(semesterObj);
                }
            }
        }

        // Detect Specializations
        const specializationMatch = trimmedLine.match(/^\d+\)\s+(.+)/) || trimmedLine.match(/SPECIALIZATIONS/i);
        if (specializationMatch && specializationMatch[1]) {
            currentSpecialization = specializationMatch[1].trim();
            isElectiveSection = false;
            continue;
        }

        // Detect Elective section
        if (trimmedLine.toLowerCase().includes('elective courses')) {
            isElectiveSection = true;
            currentElectiveGroup = null; // Reset for each new elective section
            continue;
        }

        // Detect Elective Group
        const electiveGroupMatch = trimmedLine.match(/Group ([A-C])/i);
        if (electiveGroupMatch) {
            currentElectiveGroup = electiveGroupMatch[1];
            continue;
        }


        // Detect Core Courses section
        if (trimmedLine.toLowerCase().includes('core course')) {
            isElectiveSection = false;
            continue;
        }

        // --- Robust Course Line Parsing ---
        const tpcMatch = trimmedLine.match(/(\d+)\s+(\d+)\s+(\d+)$/);
        if (tpcMatch) {
            const credits = parseInt(tpcMatch[3], 10);
            const practical = parseInt(tpcMatch[2], 10);
            const theory = parseInt(tpcMatch[1], 10);

            const frontPart = trimmedLine.substring(0, tpcMatch.index).trim();
            const codeMatch = frontPart.match(/^([A-Z]{3,4}\s\d{3})/);
            
            if (codeMatch) {
                const code = codeMatch[0];
                let title = frontPart.substring(code.length).trim();
                let electiveGroupInLine = null;

                const groupMatch = title.match(/\s*\(([A-C])\)$/);
                if (groupMatch) {
                    electiveGroupInLine = groupMatch[1];
                    title = title.substring(0, groupMatch.index).trim();
                }

                const course = {
                    code: code,
                    title: title,
                    theory: theory,
                    practical: practical,
                    credits: credits,
                    status: 'active',
                    type: isElectiveSection ? 'elective' : 'core',
                };

                if (isElectiveSection) {
                    course.electiveGroup = electiveGroupInLine || currentElectiveGroup;
                }

                // Add course to the correct structure
                let targetSemester = findTargetSemester(currentProgram, currentLevel, currentSemester);
                if (targetSemester) {
                    if (currentSpecialization) {
                        let specializationObj = targetSemester.specializations?.find(s => s.name === currentSpecialization);
                        if (!specializationObj) {
                            if (!targetSemester.specializations) targetSemester.specializations = [];
                            specializationObj = { name: currentSpecialization, courses: [] };
                            targetSemester.specializations.push(specializationObj);
                        }
                        specializationObj.courses.push(course);
                    } else {
                        targetSemester.courses.push(course);
                    }
                }
            }
        }
    }

    if (currentProgram) {
        programs.push(currentProgram);
    }
    return programs;
}

/**
 * Helper to find the correct semester object to add courses to.
 */
function findTargetSemester(program, level, semester) {
    if (!program || level === null || semester === null) return null;
    const levelObj = program.levels.find(l => l.level === level);
    if (!levelObj) return null;
    return levelObj.semesters.find(s => s.semester === semester);
}


/**
 * Converts level string/number to a numeric value.
 */
function parseLevel(levelStr) {
    const levelMap = { 'one': 100, 'two': 200, 'three': 300, 'four': 400 };
    const numericLevel = parseInt(levelStr, 10);
    if (!isNaN(numericLevel) && numericLevel >= 100) return numericLevel;
    return levelMap[levelStr.toLowerCase()] || 0;
}

/**
 * Converts semester string to a numeric value.
 */
function parseSemester(semesterStr) {
    const semesterMap = { 'one': 1, 'two': 2, 'first': 1, 'second': 2 };
    return semesterMap[semesterStr.toLowerCase()] || 0;
}

/**
 * Fetches the program ID from Firestore based on the program name.
 * @param {string} programName - The full name of the program.
 * @returns {string|null} - The program ID or null if not found.
 */
async function getProgramIdByName(programName) {
    const programsRef = collection(db, "academic-programs");
    const q = query(programsRef, where("name", "==", programName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const programId = querySnapshot.docs[0].id;
        console.log(`Found program in Firestore: "${programName}" (ID: ${programId})`);
        return programId;
    }
    console.warn(`[WARNING] Program not found in Firestore for name: "${programName}"`);
    return null;
}

/**
 * Uploads the parsed program data to Firebase.
 * @param {Array} programs - An array of program data objects from the parser.
 */
async function uploadCoursesToFirebase(programs) {
    console.log(`Starting upload for ${programs.length} programs...`);
    for (const program of programs) {
        const programId = await getProgramIdByName(program.name);
        if (!programId) {
            console.log(`Skipping program "${program.name}" as it was not found in Firestore.`);
            continue;
        };

        console.log(`\nProcessing program: ${program.name} (ID: ${programId})`);

        for (const level of program.levels) {
            for (const semester of level.semesters) {
                // Process core courses first
                for (const course of semester.courses) {
                    const courseDoc = {
                        ...course,
                        programId: programId,
                        programName: program.name,
                        level: level.level,
                        semester: semester.semester,
                    };
                    delete courseDoc.electiveGroup; // Core courses shouldn't have elective group

                    const courseRef = doc(db, 'academic-courses', course.code.replace(/\s+/g, '-'));
                    try {
                        await setDoc(courseRef, courseDoc, { merge: true });
                        console.log(`  > Uploaded CORE course: ${course.code} - ${course.title}`);
                    } catch (error) {
                        console.error(`  > Failed to upload course ${course.code}:`, error);
                    }
                }

                // Process courses within specializations
                if (semester.specializations) {
                    for (const specialization of semester.specializations) {
                        for (const course of specialization.courses) {
                            const courseDoc = {
                                ...course,
                                programId: programId,
                                programName: program.name,
                                level: level.level,
                                semester: semester.semester,
                                specialization: {
                                    name: specialization.name,
                                }
                            };
                            if (course.electiveGroup) {
                                courseDoc.specialization.group = course.electiveGroup;
                            }


                            const courseRef = doc(db, 'academic-courses', course.code.replace(/\s+/g, '-'));
                            try {
                                await setDoc(courseRef, courseDoc, { merge: true });
                                console.log(`  > Uploaded course for specialization "${specialization.name}": ${course.code}`);
                            } catch (error) {
                                console.error(`  > Failed to upload course ${course.code} for specialization "${specialization.name}":`, error);
                            }
                        }
                    }
                }
            }
        }
    }
}


/**
 * Main function to run the script.
 */
async function main() {
    console.log("Starting course population script...");
    try {
        const programs = parseCourseFile(COURSE_DATA_FILE);
        if (programs.length > 0) {
            await uploadCoursesToFirebase(programs);
            console.log("\nScript finished successfully. All courses have been processed.");
        } else {
            console.warn("[WARNING] No programs were parsed from the data file. Please check the file format.");
        }
    } catch (error) {
        console.error("\nAn error occurred during script execution:", error);
    }
}

main(); 