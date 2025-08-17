// Script to update student progression (currentAcademicYear and currentLevel) at the end of an academic year

const mongoose = require('mongoose');
console.log('Current working directory:', process.cwd());

// MongoDB connection URI - replace with your connection string if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university';

// Function to connect to the database
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB directly using Mongoose.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

// Function to calculate the next academic year in 'YYYY-YYYY' format
const getNextAcademicYear = (currentYear) => {
  if (!currentYear || !currentYear.includes('-')) {
    return '';
  }
  const [startYear, endYear] = currentYear.split('-').map(year => parseInt(year));
  return `${startYear + 1}-${endYear + 1}`;
};

// Function to determine if a student should progress to the next level
const shouldProgressLevel = (student, programDuration) => {
  // Default program duration is 4 years if not specified
  const duration = programDuration || 4;
  const currentLevel = parseInt(student.currentLevel || student.entryLevel || '1');
  // Students can only progress if their current level is less than the program duration
  return currentLevel < duration;
};

async function runProgressionUpdate() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database.');

    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');
    const programsCollection = db.collection('programs');
    const academicYearsCollection = db.collection('academic_years');

    // Get the active academic year to determine the transition
    console.log('Fetching active academic year...');
    const activeYear = await academicYearsCollection.findOne({ status: 'active' });
    const currentAcademicYear = activeYear ? activeYear.year : '2023-2024';
    const nextAcademicYear = getNextAcademicYear(currentAcademicYear);
    console.log(`Transitioning from academic year: ${currentAcademicYear} to ${nextAcademicYear}`);

    console.log('Fetching all student records...');
    const students = await studentsCollection.find({ status: { $ne: 'graduated' } }).toArray();
    console.log(`Found ${students.length} active student records.`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Skip if student is not active or has specific flags
        if (student.status === 'deferred' || student.status === 'suspended') {
          skippedCount++;
          console.log(`Skipped student ${student.surname || 'Unknown'} (${student.registrationNumber || 'No Reg Number'}): Status is ${student.status}`);
          continue;
        }

        // Get program duration to determine max level
        const program = await programsCollection.findOne({ code: student.programme });
        const programDuration = program ? program.duration : 4;

        // Determine new academic year
        const newAcademicYear = nextAcademicYear || getNextAcademicYear(student.currentAcademicYear || student.entryAcademicYear);

        // Determine if level should increase
        let newLevel = student.currentLevel;
        if (shouldProgressLevel(student, programDuration)) {
          const currentLevel = parseInt(student.currentLevel || student.entryLevel || '1');
          newLevel = (currentLevel + 1).toString();
          console.log(`Progressing student ${student.surname || 'Unknown'} (${student.registrationNumber || 'No Reg Number'}) from level ${currentLevel} to ${newLevel}`);
        } else {
          console.log(`Student ${student.surname || 'Unknown'} (${student.registrationNumber || 'No Reg Number'}) has reached max level for program (${programDuration})`);
        }

        // Update the student record
        const updateResult = await studentsCollection.updateOne(
          { _id: student._id },
          {
            $set: {
              currentAcademicYear: newAcademicYear,
              currentLevel: newLevel,
              lastUpdated: new Date()
            }
          }
        );

        if (updateResult.modifiedCount > 0) {
          updatedCount++;
          console.log(`Updated student ${student.surname || 'Unknown'} (${student.registrationNumber || 'No Reg Number'}): Set currentAcademicYear to ${newAcademicYear}, currentLevel to ${newLevel}`);
        } else {
          skippedCount++;
          console.log(`No changes for student ${student.surname || 'Unknown'} (${student.registrationNumber || 'No Reg Number'})`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error updating student ${student.surname || 'Unknown'} (${student.registrationNumber || 'No Reg Number'}):`, error.message);
      }
    }

    console.log(`Progression update completed. Updated ${updatedCount} records. Skipped ${skippedCount} records. Encountered ${errorCount} errors.`);
  } catch (error) {
    console.error('Progression update failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  }
}

runProgressionUpdate(); 