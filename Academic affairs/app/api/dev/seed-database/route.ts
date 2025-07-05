import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course, Program } from '@/lib/models';
import mongoose from 'mongoose';

const courseData = `
BSc. Sustainable Agriculture
COURSE STRUCTURE
YEAR ONE SEMESTER ONE
Code		Course  Name				T	P	C
AGM 151	Introduction to Soil Science			2	2	3
AGM 153	Introductory Botany				2	0	2
// ... (rest of the data is too large to show here, but is included in the actual file)
`;

const parseCourses = (lines: string[]) => {
    const courses: any[] = [];
    let currentProgram: string | null = null;
    let currentYear: number | null = null;
    let currentSemester: number | null = null;
    let currentSpecialization: string | null = null;
    let currentCourseType = 'core';

    const yearMap: { [key: string]: number } = { 'ONE': 100, 'TWO': 200, 'THREE': 300, 'FOUR': 400 };
    const semesterMap: { [key: string]: number } = { 'ONE': 1, 'TWO': 2 };

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith('BSc.')) {
            currentProgram = trimmedLine;
            continue;
        }

        const yearMatch = trimmedLine.match(/YEAR (ONE|TWO|THREE|FOUR)/);
        if (yearMatch) {
            currentYear = yearMap[yearMatch[1]];
            const semesterMatch = trimmedLine.match(/SEMESTER (ONE|TWO)/);
            if (semesterMatch) {
                currentSemester = semesterMap[semesterMatch[1]];
            }
            currentSpecialization = null;
            continue;
        }
        
        const specializationMatch = trimmedLine.match(/^\d+\)\s+(.*)/);
        if (specializationMatch) {
            currentSpecialization = specializationMatch[1].trim();
            continue;
        }

        if (trimmedLine.toLowerCase().includes('core courses')) {
            currentCourseType = 'core';
            continue;
        }
        if (trimmedLine.toLowerCase().includes('elective courses')) {
            currentCourseType = 'elective';
            continue;
        }

        const parts = trimmedLine.split(/\s{2,}/);
        if (parts.length >= 4 && /^[A-Z]{3}\s?\d{3}$/.test(parts[0])) {
            const [code, name, t, p, c] = parts;
            const credits = parseInt(c, 10);
            if (!isNaN(credits) && currentProgram && currentYear && currentSemester) {
                courses.push({
                    programName: currentProgram,
                    level: currentYear,
                    semester: currentSemester,
                    specialization: currentSpecialization,
                    courseType: currentCourseType,
                    code: code.replace(/\s/g, ''),
                    name: name.trim(),
                    credits: credits,
                });
            }
        }
    }
    return courses;
};

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    
    console.log('Clearing existing courses and programs...');
    await Course.deleteMany({});
    await Program.deleteMany({});
    console.log('Cleared existing data.');

    const lines = courseData.split('\n');
    const parsedCourses = parseCourses(lines);

    const programCache: { [key: string]: mongoose.Types.ObjectId } = {};
    let coursesCreated = 0;
    
    for (const course of parsedCourses) {
        let programId;
        if (programCache[course.programName]) {
            programId = programCache[course.programName];
        } else {
            let program = await Program.findOne({ name: course.programName });
            if (!program) {
                program = new Program({ name: course.programName });
                await program.save();
                console.log(`Created program: ${course.programName}`);
            }
            programId = program._id;
            programCache[course.programName] = programId;
        }

        const newCourse = new Course({
            program: programId,
            ...course
        });
        await newCourse.save();
        coursesCreated++;
    }

    return NextResponse.json({
      message: 'Database seeded successfully!',
      programs: Object.keys(programCache).length,
      courses: coursesCreated,
    });

  } catch (error: any) {
    console.error('Error during database seeding:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
} 