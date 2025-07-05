// Migration script to update course records with academic year field

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

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database.');

    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');
    const academicYearsCollection = db.collection('academic_years');

    // Get the active academic year as a default value
    console.log('Fetching active academic year...');
    const activeYear = await academicYearsCollection.findOne({ status: 'active' });
    const defaultAcademicYear = activeYear ? activeYear.year : '2023-2024';
    console.log(`Using default academic year: ${defaultAcademicYear}`);

    console.log('Fetching all course records...');
    const courses = await coursesCollection.find({}).toArray();
    console.log(`Found ${courses.length} course records.`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      // Check if academicYear is missing or empty
      if (!course.academicYear) {
        try {
          // Update the course record with the default academic year
          const updateResult = await coursesCollection.updateOne(
            { _id: course._id },
            {
              $set: {
                academicYear: defaultAcademicYear,
                updatedAt: new Date()
              }
            }
          );

          if (updateResult.modifiedCount > 0) {
            updatedCount++;
            console.log(`Updated course ${course.name || 'Unknown'} (${course.code || 'No Code'}): Set academicYear to ${defaultAcademicYear}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error updating course ${course.name || 'Unknown'} (${course.code || 'No Code'}):`, error.message);
        }
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} records. Encountered ${errorCount} errors.`);
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  }
}

runMigration(); 