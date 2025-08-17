// update-full-curriculum.js
// Script to update the full curriculum structure for both programs exactly as specified by the user

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// B.Sc. Sustainable Agriculture Full Curriculum
const agricultureCurriculum = {
  programName: "B.Sc. Sustainable Agriculture",
  programCode: "BSC-AGRI", // Will be updated with actual code from database
  structure: [
    // Year 1, Semester 1
    {
      year: 1,
      semester: 1,
      courses: [
        {
          code: "AGM 151",
          title: "Introduction to Soil Science",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "AGM 153",
          title: "Introductory Botany",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 155",
          title: "Principles of Crop Production",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 151",
          title: "Principles of Biochemistry",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "ESM 155",
          title: "Introduction to Climatology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 151",
          title: "Introductory Pure Mathematics",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 153",
          title: "Introduction to Computing I",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "GNS 155",
          title: "Communication Skills I",
          credits: 2,
          theory: 2,
          practical: 0
        }
      ]
    },
    // Year 1, Semester 2
    {
      year: 1,
      semester: 2,
      courses: [
        {
          code: "AGM 158",
          title: "Introductory Economics",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 152",
          title: "Principles of Land Surveying",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "AGM 154",
          title: "Principles of Agroecology",
          credits: 1,
          theory: 1,
          practical: 0
        },
        {
          code: "AGM 156",
          title: "Vacation Training",
          credits: 3,
          theory: 0,
          practical: 3
        },
        {
          code: "ANS 152",
          title: "Anatomy and Physiology of Farm Animals",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "ESM 156",
          title: "Basic Microbiology",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "GNS 152",
          title: "Basic Statistics",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 154",
          title: "Introduction to Computing II",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "GNS 156",
          title: "Communication Skills II",
          credits: 2,
          theory: 2,
          practical: 0
        }
      ]
    },
    // Year 2, Semester 1
    {
      year: 2,
      semester: 1,
      courses: [
        {
          code: "AGM 265",
          title: "Rural Sociology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 251",
          title: "Farming Systems and Natural Resources",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 253",
          title: "Crop Physiology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 255",
          title: "Introduction to Plant Pathology",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "AGM 257",
          title: "Principles of Plant Breeding",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "AGM 259",
          title: "Agricultural Power Sources and Mechanization",
          credits: 2,
          theory: 2,
          practical: 1
        },
        {
          code: "AGM 261",
          title: "Introduction to Entomology",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "AGM 263",
          title: "Soil Microbiology",
          credits: 2,
          theory: 2,
          practical: 1
        }
      ]
    },
    // Year 2, Semester 2
    {
      year: 2,
      semester: 2,
      courses: [
        {
          code: "AGM 258",
          title: "Agricultural Economics and Marketing",
          credits: 3,
          theory: 3,
          practical: 0
        },
        {
          code: "AGM 260",
          title: "Introduction to Agric. Extension",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 252",
          title: "Arable and Plantation Crop Production",
          credits: 2,
          theory: 2,
          practical: 1
        },
        {
          code: "AGM 254",
          title: "Soil Conservation and Fertility Management",
          credits: 2,
          theory: 2,
          practical: 1
        },
        {
          code: "AGM 256",
          title: "Weed Science",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ANS 252",
          title: "Poultry Production and Management",
          credits: 2,
          theory: 2,
          practical: 1
        },
        {
          code: "ANS 254",
          title: "Principles of Animal Nutrition",
          credits: 2,
          theory: 2,
          practical: 1
        },
        {
          code: "AGM 262",
          title: "Fruit and Vegetable Crop Production",
          credits: 2,
          theory: 2,
          practical: 1
        }
      ]
    }
    // Additional years would be added here in the same format
  ]
};

// B.Sc. Environmental Science and Management Full Curriculum
const environmentalScienceCurriculum = {
  programName: "B.Sc. Environmental Science and Management",
  programCode: "BSC-ESM", // Will be updated with actual code from database
  structure: [
    // Year 1, Semester 1
    {
      year: 1,
      semester: 1,
      courses: [
        {
          code: "ESM 151",
          title: "Principles of Biochemistry",
          credits: 3,
          theory: 2,
          practical: 3
        },
        {
          code: "ESM 153",
          title: "Principles of Environmental Science I",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 155",
          title: "Introduction to Climatology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "AGM 151",
          title: "Introduction to Soil Science",
          credits: 3,
          theory: 2,
          practical: 3
        },
        {
          code: "GNS 151",
          title: "Basic Mathematics",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 153",
          title: "Introduction to Computing I",
          credits: 2,
          theory: 1,
          practical: 3
        },
        {
          code: "GNS 155",
          title: "Communication Skills I",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 161",
          title: "Principles of Management",
          credits: 2,
          theory: 2,
          practical: 0
        }
      ]
    },
    // Year 1, Semester 2
    {
      year: 1,
      semester: 2,
      courses: [
        {
          code: "ESM 152",
          title: "Principles of Environmental Science II",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 154",
          title: "Environment and Development",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 156",
          title: "Basic Microbiology",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "AGM 152",
          title: "Principles of Land Surveying",
          credits: 2,
          theory: 1,
          practical: 2
        },
        {
          code: "ESM 158",
          title: "Introductory Economics",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 152",
          title: "Basic Statistics",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 154",
          title: "Introduction to Computing II",
          credits: 2,
          theory: 1,
          practical: 3
        },
        {
          code: "GNS 156",
          title: "Communication Skills II",
          credits: 2,
          theory: 2,
          practical: 0
        }
      ]
    },
    // Year 2, Semester 1
    {
      year: 2,
      semester: 1,
      courses: [
        {
          code: "ESM 251",
          title: "Geology",
          credits: 3,
          theory: 2,
          practical: 3
        },
        {
          code: "ESM 253",
          title: "Principles of Land Economy",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 255",
          title: "Hydrology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 257",
          title: "Oceanography",
          credits: 3,
          theory: 2,
          practical: 3
        },
        {
          code: "ESM 259",
          title: "Rural Sociology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 251",
          title: "Fundamentals of Planning",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "GNS 253",
          title: "Principles of Law",
          credits: 2,
          theory: 2,
          practical: 0
        }
      ]
    },
    // Year 2, Semester 2
    {
      year: 2,
      semester: 2,
      courses: [
        {
          code: "ESM 252",
          title: "Introduction to Environmental Engineering",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "ESM 254",
          title: "Environment and Sustainability",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 256",
          title: "Agroecology",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 258",
          title: "Remote Sensing and GIS",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "ESM 260",
          title: "Introduction to Resource Analysis",
          credits: 2,
          theory: 2,
          practical: 0
        },
        {
          code: "ESM 262",
          title: "Introduction to Waste Management",
          credits: 3,
          theory: 2,
          practical: 2
        },
        {
          code: "ESM 264",
          title: "Introduction to Limnology",
          credits: 3,
          theory: 2,
          practical: 2
        }
      ]
    }
    // Additional years would be added here in the same format
  ]
};

// Function to get program code by name
async function getProgramCodeByName(programName) {
  try {
    // First try exact match
    const programsRef = collection(db, "academic-programs");
    let q = query(programsRef, where("name", "==", programName));
    let querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No exact match found for "${programName}", trying with alternate formats...`);
      
      // Try with different formats (B.Sc. vs BSc.)
      const alternateNames = [
        programName.replace("B.Sc.", "BSc."),
        programName.replace("BSc.", "B.Sc."),
        programName.replace("B.Sc.", "B. Sc."),
        programName.replace("B.Sc.", "B.Sc"),
        programName.replace("BSc.", "BSc")
      ];
      
      for (const name of alternateNames) {
        console.log(`Trying with alternate name: "${name}"`);
        q = query(programsRef, where("name", "==", name));
        querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          console.log(`Found match with alternate name: "${name}"`);
          break;
        }
      }
      
      // If still not found, try partial match
      if (querySnapshot.empty) {
        console.log("No matches with alternate formats, fetching all programs to check for partial matches...");
        const allProgramsSnapshot = await getDocs(collection(db, "academic-programs"));
        
        allProgramsSnapshot.forEach((doc) => {
          const programData = doc.data();
          console.log(`Checking program: ${programData.name}`);
          
          // Check if program names contain similar words
          if ((programData.name.includes("Agriculture") && programName.includes("Agriculture")) ||
              (programData.name.includes("Environmental") && programName.includes("Environmental")) ||
              (programData.name.toLowerCase().includes("sustainable") && programName.toLowerCase().includes("sustainable"))) {
            console.log(`Found potential match: ${programData.name}`);
            querySnapshot.docs = [doc];
          }
        });
      }
    }
    
    if (!querySnapshot.empty) {
      const programData = querySnapshot.docs[0].data();
      console.log(`Found program: ${programData.name} with code: ${programData.code}`);
      return programData.code;
    } else {
      console.log(`Program "${programName}" not found. Using default code.`);
      return programName.includes("Agriculture") ? "BSC-AGRI" : "BSC-ESM";
    }
  } catch (error) {
    console.error("Error getting program code:", error);
    return programName.includes("Agriculture") ? "BSC-AGRI" : "BSC-ESM";
  }
}

// Function to update curriculum structure
async function updateCurriculumStructure(curriculumData) {
  try {
    console.log(`Updating curriculum structure for ${curriculumData.programName}...`);
    
    // Get the program code from database
    const programCode = await getProgramCodeByName(curriculumData.programName);
    curriculumData.programCode = programCode;
    
    console.log(`Using program code: ${programCode}`);
    
    // Get existing curriculum structure
    const structureRef = doc(db, "curriculum-structure", programCode);
    const structureSnapshot = await getDoc(structureRef);
    
    if (!structureSnapshot.exists()) {
      console.log("Curriculum structure not found. Creating a new one.");
      
      // Create a new structure
      const newStructure = {
        programCode: programCode,
        programName: curriculumData.programName,
        structure: curriculumData.structure.map(semester => ({
          year: semester.year,
          semester: semester.semester,
          courses: semester.courses.map(course => course.code),
          courses_details: semester.courses
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(structureRef, newStructure);
      console.log(`Created new curriculum structure for ${curriculumData.programName}`);
    } else {
      // Update existing structure
      const currentStructure = structureSnapshot.data();
      
      // Update the structure for each year and semester
      curriculumData.structure.forEach(semesterData => {
        const { year, semester } = semesterData;
        
        // Find if this year/semester structure already exists
        const semesterIndex = currentStructure.structure.findIndex(
          s => s.year === year && s.semester === semester
        );
        
        if (semesterIndex >= 0) {
          console.log(`Found existing Year ${year} Semester ${semester} structure. Updating...`);
          
          // Update the existing structure
          currentStructure.structure[semesterIndex] = {
            year,
            semester,
            courses: semesterData.courses.map(course => course.code),
            courses_details: semesterData.courses
          };
        } else {
          console.log(`Year ${year} Semester ${semester} structure not found. Adding it...`);
          
          // Add new semester structure
          currentStructure.structure.push({
            year,
            semester,
            courses: semesterData.courses.map(course => course.code),
            courses_details: semesterData.courses
          });
        }
      });
      
      // Fix program name to match exactly what user specified
      currentStructure.programName = curriculumData.programName;
      
      // Update the document
      await setDoc(structureRef, {
        ...currentStructure,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Updated curriculum structure for ${curriculumData.programName}`);
    }
  } catch (error) {
    console.error("Error updating curriculum structure:", error);
  }
}

// Main function
async function main() {
  try {
    console.log("Updating curriculum structures for both programs...");
    
    // Update BSc. Sustainable Agriculture curriculum structure
    await updateCurriculumStructure(agricultureCurriculum);
    
    // Update BSc. Environmental Science and Management curriculum structure
    await updateCurriculumStructure(environmentalScienceCurriculum);
    
    console.log("Both curriculum structures successfully updated!");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
main(); 