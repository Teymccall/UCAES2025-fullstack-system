# Curriculum Data Structure in Firebase

This document describes the structure of the curriculum data stored in Firebase for UCAES. The data is organized in various collections that represent programs, courses, specializations, and academic calendars.

## Collections Overview

1. **academic-programs**: Stores degree program information
2. **academic-courses**: Stores individual course information
3. **program-specializations**: Stores program specialization tracks
4. **curriculum-structure**: Stores the structure of programs (year/semester organization)
5. **academic-calendar**: Stores academic calendar information

## Collection Schemas

### academic-programs

Stores information about degree programs offered by the university.

```typescript
interface AcademicProgram {
  name: string;            // Full name of the program
  code: string;            // Program code (e.g., 'BSC-AGRI')
  faculty: string;         // Faculty that offers the program
  department: string;      // Department that offers the program
  type: string;            // Type of program (e.g., 'degree', 'certificate')
  description: string;     // Description of the program
  durationYears: number;   // Duration of the program in years
  credits: number;         // Total credits required to complete the program
  entryRequirements: string; // Requirements for entry into the program
  status: string;          // Status of the program (e.g., 'active', 'inactive')
  createdAt: Timestamp;    // When the program was created
  updatedAt: Timestamp;    // When the program was last updated
}
```

### academic-courses

Stores information about individual courses offered by the university.

```typescript
interface AcademicCourse {
  code: string;            // Course code (e.g., 'AGM 151')
  title: string;           // Title of the course
  description: string;     // Description of the course
  credits: number;         // Number of credits for the course
  theoryHours?: number;    // Number of theory hours per week
  practicalHours?: number; // Number of practical hours per week
  level: number;           // Level of the course (e.g., 100, 200, etc.)
  semester: number;        // Semester in which the course is offered
  year?: number;           // Year in which the course is offered
  department: string;      // Department that offers the course
  prerequisites: string[]; // Prerequisites for the course
  programId: string;       // ID of the program to which the course belongs
  specialization?: string; // Specialization track code (if applicable)
  isCore?: boolean;        // Whether the course is core or elective
  courseGroup?: string;    // Group to which the course belongs (for electives)
  status: string;          // Status of the course (e.g., 'active', 'inactive')
  createdAt: Timestamp;    // When the course was created
  updatedAt: Timestamp;    // When the course was last updated
}
```

### program-specializations

Stores information about specialization tracks within programs.

```typescript
interface ProgramSpecialization {
  name: string;            // Name of the specialization
  code: string;            // Code for the specialization (e.g., 'AGRONOMY')
  programId: string;       // ID of the program to which the specialization belongs
  description: string;     // Description of the specialization
  year: number;            // Year in which specialization starts
  createdAt: Timestamp;    // When the specialization was created
}
```

### curriculum-structure

Stores the structure of programs, including course organization by year/semester.

```typescript
interface CurriculumStructure {
  programId: string;       // ID of the program
  structure: {             // Array of year/semester combinations
    year: number;          // Year number
    semester: number;      // Semester number
    totalCredits: number;  // Total credits for this semester
    courses: string[];     // Array of course codes
    specialization?: string; // Specialization code (if applicable)
    coreCourses?: string[]; // Array of core course codes (if specialized)
    electiveGroups?: {     // Groups of elective courses
      [groupName: string]: string[]; // Array of course codes for each group
    };
  }[];
}
```

### academic-calendar

Stores academic calendar information for regular and weekend programs.

```typescript
interface AcademicCalendar {
  year: string;            // Academic year (e.g., '2024-2025')
  regularSemesters: {      // Array of regular semesters
    name: string;          // Name of the semester (e.g., 'First Semester')
    period: string;        // Period description (e.g., 'September to December')
    registrationStart: Timestamp; // Start date for registration
    registrationEnd: Timestamp;   // End date for registration
    classesStart: Timestamp;      // Start date for classes
    classesEnd: Timestamp;        // End date for classes
    examStart: Timestamp;         // Start date for exams
    examEnd: Timestamp;           // End date for exams
  }[];
  weekendSemesters: {      // Array of weekend semesters
    name: string;          // Name of the semester (e.g., 'First Trimester')
    period: string;        // Period description
    registrationStart: Timestamp; // Start date for registration
    registrationEnd: Timestamp;   // End date for registration
    classesStart: Timestamp;      // Start date for classes
    classesEnd: Timestamp;        // End date for classes
    examStart: Timestamp;         // Start date for exams
    examEnd: Timestamp;           // End date for exams
  }[];
  createdAt: Timestamp;    // When the calendar was created
  updatedAt: Timestamp;    // When the calendar was last updated
}
```

## Common Query Examples

### Get All Courses for a Program

```javascript
const programId = "8FFH2FkxK18Rd9ONr6RJ"; // BSc. Sustainable Agriculture
const coursesSnapshot = await db.collection("academic-courses")
  .where("programId", "==", programId)
  .get();

coursesSnapshot.forEach(doc => {
  console.log(doc.data());
});
```

### Get Courses for a Specific Year and Semester

```javascript
const programId = "8FFH2FkxK18Rd9ONr6RJ"; // BSc. Sustainable Agriculture
const year = 1;
const semester = 1;

const coursesSnapshot = await db.collection("academic-courses")
  .where("programId", "==", programId)
  .where("year", "==", year)
  .where("semester", "==", semester)
  .get();

coursesSnapshot.forEach(doc => {
  console.log(doc.data());
});
```

### Get Courses for a Specialization

```javascript
const programId = "8FFH2FkxK18Rd9ONr6RJ"; // BSc. Sustainable Agriculture
const specializationCode = "AGRONOMY";

const coursesSnapshot = await db.collection("academic-courses")
  .where("programId", "==", programId)
  .where("specialization", "==", specializationCode)
  .get();

coursesSnapshot.forEach(doc => {
  console.log(doc.data());
});
```

### Get Current Academic Calendar

```javascript
const calendarDoc = await db.collection("academic-calendar")
  .doc("2024-2025")
  .get();

if (calendarDoc.exists) {
  console.log(calendarDoc.data());
}
```

## Best Practices for Using the Curriculum Data

1. **Referencing Courses**: Always use course codes as references between collections.
2. **Program Specializations**: When displaying a program to students, check if they're in a year that has specializations and show the appropriate options.
3. **Curriculum Structure**: Use the curriculum-structure collection to determine which courses should be offered in which semester.
4. **Academic Calendar**: Use the academic-calendar collection to determine registration, class, and exam dates.

## Security Rules

The curriculum data is protected by Firebase security rules. Most data can be read by any authenticated user, but write operations are restricted to administrators.

## Updating the Curriculum

To update the curriculum data, use the provided scripts:

- `seed-curriculum-data.js`: Seeds initial curriculum data
- `update-curriculum.js`: Updates existing curriculum data

Always verify changes using:

- `verify-curriculum-data.js`: Verifies the structure and content of the curriculum data

## Connecting to Student Registration

The curriculum data is designed to be used in conjunction with the student registration system. When a student registers for a program, use the curriculum structure to determine which courses should be offered to the student in each semester.

## Conclusion

The curriculum data structure provides a flexible and robust way to store and query program, course, and academic calendar information. By using the provided schemas and query examples, you can effectively integrate this data into various parts of the university's academic systems. 