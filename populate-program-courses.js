const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7GRz9Rl3jG8w0D7Gq6G9Z8Z7Z9Z8Z7Z9Z8",
  authDomain: "ucaes-2025.firebaseapp.com",
  projectId: "ucaes-2025",
  storageBucket: "ucaes-2025.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Course templates for different programs
const courseTemplates = {
  "BSc. Environmental Science and Management": {
    "100": {
      "First Semester": ["ESM 151", "ESM 153", "ESM 155", "ESM 157", "ESM 159", "ESM 161", "ESM 163", "ESM 165"],
      "Second Semester": ["ESM 152", "ESM 154", "ESM 156", "ESM 158", "ESM 160", "ESM 162", "ESM 164", "ESM 166"]
    },
    "200": {
      "First Semester": ["ESM 251", "ESM 253", "ESM 255", "ESM 257", "ESM 259", "ESM 261", "ESM 263"],
      "Second Semester": ["ESM 252", "ESM 254", "ESM 256", "ESM 258", "ESM 260", "ESM 262"]
    },
    "300": {
      "First Semester": ["ESM 351", "ESM 353", "ESM 355", "ESM 357", "ESM 359", "ESM 361"],
      "Second Semester": ["ESM 352", "ESM 354", "ESM 356", "ESM 358", "ESM 360", "ESM 362", "ESM 364", "ESM 366"]
    },
    "400": {
      "First Semester": ["ESM 451", "ESM 453", "ESM 455"],
      "Second Semester": ["ESM 452", "ESM 454"]
    }
  },
  "BSc. Sustainable Agriculture": {
    "100": {
      "First Semester": ["AGM 151", "AGM 153", "AGM 155", "AGM 157", "AGM 159", "AGM 161", "AGM 163", "AGM 165"],
      "Second Semester": ["AGM 152", "AGM 154", "AGM 156", "AGM 158", "AGM 160", "AGM 162", "AGM 164", "AGM 166"]
    },
    "200": {
      "First Semester": ["AGM 251", "AGM 253", "AGM 255", "AGM 257", "AGM 259", "AGM 261", "AGM 263"],
      "Second Semester": ["AGM 252", "AGM 254", "AGM 256", "AGM 258", "AGM 260", "AGM 262"]
    },
    "300": {
      "First Semester": ["AGM 351", "AGM 353", "AGM 355", "AGM 357", "AGM 359", "AGM 361"],
      "Second Semester": ["AGM 352", "AGM 354", "AGM 356", "AGM 358", "AGM 360", "AGM 362", "AGM 364", "AGM 366"]
    },
    "400": {
      "First Semester": ["AGM 451", "AGM 453", "AGM 455"],
      "Second Semester": ["AGM 452", "AGM 454"]
    }
  },
  "BSc. Aquaculture and Water Resources Management": {
    "100": {
      "First Semester": ["AQM 151", "AQM 153", "AQM 155", "AQM 157", "AQM 159", "AQM 161", "AQM 163", "AQM 165"],
      "Second Semester": ["AQM 152", "AQM 154", "AQM 156", "AQM 158", "AQM 160", "AQM 162", "AQM 164", "AQM 166"]
    },
    "200": {
      "First Semester": ["AQM 251", "AQM 253", "AQM 255", "AQM 257", "AQM 259", "AQM 261", "AQM 263"],
      "Second Semester": ["AQM 252", "AQM 254", "AQM 256", "AQM 258", "AQM 260", "AQM 262"]
    },
    "300": {
      "First Semester": ["AQM 351", "AQM 353", "AQM 355", "AQM 357", "AQM 359", "AQM 361"],
      "Second Semester": ["AQM 352", "AQM 354", "AQM 356", "AQM 358", "AQM 360", "AQM 362", "AQM 364", "AQM 366"]
    },
    "400": {
      "First Semester": ["AQM 451", "AQM 453", "AQM 455"],
      "Second Semester": ["AQM 452", "AQM 454"]
    }
  }
};

async function populateProgramCourses() {
  try {
    console.log('🔍 Starting program course population...');
    
    // Get all programs
    const programsSnapshot = await getDocs(collection(db, 'academic-programs'));
    const programs = programsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 Found ${programs.length} programs`);
    
    // Process each program
    for (const program of programs) {
      const programName = program.name;
      const programId = program.id;
      
      console.log(`\n🎯 Processing program: ${programName} (${programId})`);
      
      // Find matching course template
      let template = null;
      for (const [templateName, templateData] of Object.entries(courseTemplates)) {
        if (programName.toLowerCase().includes(templateName.toLowerCase().replace('BSc. ', '')) ||
            templateName.toLowerCase().includes(programName.toLowerCase())) {
          template = templateData;
          break;
        }
      }
      
      if (!template) {
        console.log(`⚠️  No template found for ${programName}, skipping...`);
        continue;
      }
      
      // Build coursesPerLevel structure
      const coursesPerLevel = {};
      
      for (const [level, semesters] of Object.entries(template)) {
        coursesPerLevel[level] = {};
        
        for (const [semester, courseCodes] of Object.entries(semesters)) {
          coursesPerLevel[level][semester] = {
            "all": {
              "Regular": courseCodes,
              "Weekend": courseCodes
            }
          };
        }
      }
      
      // Update program with coursesPerLevel
      try {
        await updateDoc(doc(db, 'academic-programs', programId), {
          coursesPerLevel: coursesPerLevel
        });
        
        console.log(`✅ Updated ${programName} with coursesPerLevel structure`);
        console.log(`📊 Levels: ${Object.keys(coursesPerLevel).length}`);
        console.log(`📚 Total courses: ${Object.values(coursesPerLevel).reduce((total, level) => 
          total + Object.values(level).reduce((semTotal, semester) => 
            semTotal + semester.all.Regular.length, 0), 0)}`);
            
      } catch (error) {
        console.error(`❌ Error updating ${programName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Program course population completed!');
    console.log('💡 The director course registration should now show courses when selecting programs, levels, and semesters.');
    
  } catch (error) {
    console.error('❌ Error in populateProgramCourses:', error);
  }
}

// Run the script
populateProgramCourses()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });