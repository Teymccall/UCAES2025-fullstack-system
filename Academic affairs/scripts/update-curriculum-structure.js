// update-curriculum-structure.js
// Script to update curriculum structure with course codes from the curriculum data

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sustainable Agriculture curriculum structure
const sustainableAgricultureStructure = {
  programCode: "BSC-AGRI",
  programName: "BSc. Sustainable Agriculture",
  structure: [
    // Year 1, Semester 1
    {
      year: 1,
      semester: 1,
      courses: [
        "AGM 151", "AGM 153", "AGM 155", "ESM 151", "ESM 155", 
        "GNS 151", "GNS 153", "GNS 155"
      ]
    },
    // Year 1, Semester 2
    {
      year: 1,
      semester: 2,
      courses: [
        "AGM 158", "AGM 152", "AGM 154", "AGM 156", "ANS 152",
        "ESM 156", "GNS 152", "GNS 154", "GNS 156"
      ]
    },
    // Year 2, Semester 1
    {
      year: 2,
      semester: 1,
      courses: [
        "AGM 265", "AGM 251", "AGM 253", "AGM 255", "AGM 257", 
        "AGM 259", "AGM 261", "AGM 263"
      ]
    },
    // Year 2, Semester 2
    {
      year: 2,
      semester: 2,
      courses: [
        "AGM 258", "AGM 260", "AGM 252", "AGM 254", "AGM 256", 
        "ANS 252", "ANS 254", "AGM 262"
      ]
    },
    // Year 3, Semester 1
    {
      year: 3,
      semester: 1,
      courses: [
        "AGM 355", "AGM 351", "AGM 353", "ANS 351", "ANS 353", 
        "ANS 355", "GNS 351"
      ]
    },
    // Year 3, Semester 2
    {
      year: 3,
      semester: 2,
      courses: [
        "AGM 352", "ANS 352", "AGM 354", "ESM 258", "GNS 352", 
        "GNS 356", "AGM 356", "AGM 358"
      ]
    },
    // Year 4, Semester 1 - Agronomy
    {
      year: 4,
      semester: 1,
      specialization: "Agronomy",
      courses: [
        "AGM 453", "AGM 455", "AGM 457", "ESM 451", "AGM 459", 
        "AGM 461", "AGM 463", "AGM 465"
      ]
    },
    // Year 4, Semester 2 - Agronomy
    {
      year: 4,
      semester: 2,
      specialization: "Agronomy",
      courses: [
        "AGM 452", "AGM 454", "AGM 456", "AGM 458", "AGM 462", 
        "WEH 452", "AGM 464", "WEH 458"
      ]
    },
    // Year 4, Semester 1 - Animal Science
    {
      year: 4,
      semester: 1,
      specialization: "Animal Science",
      courses: [
        "AGM 453", "AGM 455", "ANS 451", "ANS 453", "ESM 451", 
        "ANS 455", "ANS 457", "ANS 459", "ANS 461"
      ]
    },
    // Year 4, Semester 2 - Animal Science
    {
      year: 4,
      semester: 2,
      specialization: "Animal Science",
      courses: [
        "AGM 452", "AGM 454", "AGM 456", "ANS 452", "ANS 454", 
        "ANS 456", "ANS 458", "ANS 462"
      ]
    },
    // Year 4, Semester 1 - Agricultural Economics and Extension
    {
      year: 4,
      semester: 1,
      specialization: "Agricultural Economics and Extension",
      courses: [
        "AEE 451", "AGM 453", "AGM 455", "ESM 451", "AEE 453", 
        "AEE 455", "AEE 457", "AEE 459"
      ]
    },
    // Year 4, Semester 2 - Agricultural Economics and Extension
    {
      year: 4,
      semester: 2,
      specialization: "Agricultural Economics and Extension",
      courses: [
        "AEE 452", "AGM 454", "AGM 456", "AEE 456", "AEE 454", 
        "AEE 456", "AEE 458"
      ]
    },
    // Year 4, Semester 1 - Horticulture Science and Systems
    {
      year: 4,
      semester: 1,
      specialization: "Horticulture Science and Systems",
      courses: [
        "AGM 453", "AGM 455", "ESM 411", "HOR 451", "HOR 453", 
        "HOR 455", "AGM 459", "HOR 457"
      ]
    },
    // Year 4, Semester 2 - Horticulture Science and Systems
    {
      year: 4,
      semester: 2,
      specialization: "Horticulture Science and Systems",
      courses: [
        "AGM 454", "AGM 456", "AEE 456", "HOR 452", "HOR 454", 
        "WEH 462", "HOR 456", "HOR 458"
      ]
    }
  ]
};

// Environmental Science and Management curriculum structure
const environmentalScienceStructure = {
  programCode: "BSC-ESM",
  programName: "BSc. Environmental Science and Management",
  structure: [
    // Year 1, Semester 1
    {
      year: 1,
      semester: 1,
      courses: [
        "ESM 151", "ESM 153", "ESM 155", "AGM 151", "GNS 151", 
        "GNS 153", "GNS 155", "ESM 161"
      ]
    },
    // Year 1, Semester 2
    {
      year: 1,
      semester: 2,
      courses: [
        "ESM 152", "ESM 154", "ESM 156", "AGM 152", "ESM 158", 
        "GNS 152", "GNS 154", "GNS 156"
      ]
    },
    // Year 2, Semester 1
    {
      year: 2,
      semester: 1,
      courses: [
        "ESM 251", "ESM 253", "ESM 255", "ESM 257", "ESM 259", 
        "GNS 251", "GNS 253"
      ]
    },
    // Year 2, Semester 2
    {
      year: 2,
      semester: 2,
      courses: [
        "ESM 252", "ESM 254", "ESM 256", "ESM 258", "ESM 260", 
        "ESM 262", "ESM 264"
      ]
    },
    // Year 3, Semester 1
    {
      year: 3,
      semester: 1,
      courses: [
        "ESM 351", "ESM 353", "ESM 355", "ESM 357", "ESM 359", "GNS 351"
      ]
    },
    // Year 3, Semester 2
    {
      year: 3,
      semester: 2,
      courses: [
        "ESM 352", "ESM 354", "ESM 356", "ESM 358", "GNS 352", 
        "ESM 360", "ESM 362"
      ]
    },
    // Year 4, Semester 1 - Limnology and Oceanography
    {
      year: 4,
      semester: 1,
      specialization: "Limnology and Oceanography",
      courses: [
        "ESM 451", "ESM 453", "ESM 455", "AQS 451", "AQS 453", 
        "AQS 455", "AQS 457", "AQS 459", "AQS 461"
      ]
    },
    // Year 4, Semester 2 - Limnology and Oceanography
    {
      year: 4,
      semester: 2,
      specialization: "Limnology and Oceanography",
      courses: [
        "AQS 452", "ESM 452", "ESM 454", "AQS 454", "AQS 456", 
        "AQS 458", "AQS 462", "AQS 464", "AQS 466"
      ]
    },
    // Year 4, Semester 1 - Forests and Forest Resources Management
    {
      year: 4,
      semester: 1,
      specialization: "Forests and Forest Resources Management",
      courses: [
        "ESM 451", "ESM 457", "ESM 453", "ESM 455", "ESM 459", 
        "ESM 461", "ESM 463", "ESM 465", "ESM 467", "ESM 469"
      ]
    },
    // Year 4, Semester 2 - Forests and Forest Resources Management
    {
      year: 4,
      semester: 2,
      specialization: "Forests and Forest Resources Management",
      courses: [
        "ESM 456", "ESM 458", "ESM 452", "ESM 454", "ESM 460", 
        "ESM 462", "ESM 464", "ESM 466", "ESM 468", "ESM 470"
      ]
    },
    // Year 4, Semester 1 - Environmental Health and Safety
    {
      year: 4,
      semester: 1,
      specialization: "Environmental Health and Safety",
      courses: [
        "ESM 451", "WEH 455", "ESM 453", "ESM 455", "WEH 471", 
        "WEH 453", "WEH 459", "WEH 463", "WEH 451", "WEH 457"
      ]
    },
    // Year 4, Semester 2 - Environmental Health and Safety
    {
      year: 4,
      semester: 2,
      specialization: "Environmental Health and Safety",
      courses: [
        "WEH 454", "WEH 452", "ESM 452", "ESM 454", "WEH 458", 
        "WEH 462", "WEH 464", "WEH 460"
      ]
    },
    // Year 4, Semester 1 - Mining and Mineral Resources
    {
      year: 4,
      semester: 1,
      specialization: "Mining and Mineral Resources",
      courses: [
        "ESM 451", "ESM 473", "ESM 453", "ESM 455", "ESM 475", 
        "ESM 477", "ESM 479", "ESM 481"
      ]
    },
    // Year 4, Semester 2 - Mining and Mineral Resources
    {
      year: 4,
      semester: 2,
      specialization: "Mining and Mineral Resources",
      courses: [
        "ESM 472", "ESM 474", "ESM 452", "ESM 454", "ESM 476", 
        "ESM 478", "ESM 480", "ESM 482"
      ]
    },
    // Year 4, Semester 1 - Renewable and Non-Renewable Energy
    {
      year: 4,
      semester: 1,
      specialization: "Renewable and Non-Renewable Energy",
      courses: [
        "ESM 451", "ESM 483", "ESM 453", "ESM 455", "ESM 485", 
        "ESM 487", "ESM 489", "ESM 491"
      ]
    },
    // Year 4, Semester 2 - Renewable and Non-Renewable Energy
    {
      year: 4,
      semester: 2,
      specialization: "Renewable and Non-Renewable Energy",
      courses: [
        "ESM 484", "ESM 486", "ESM 452", "ESM 454", "ESM 488", 
        "ESM 492", "ESM 494", "ESM 496"
      ]
    }
  ]
};

// Function to update curriculum structure
async function updateCurriculumStructure(structureData) {
  const { programCode } = structureData;
  
  try {
    // Check if document exists
    const docRef = doc(db, "curriculum-structure", programCode);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Updating existing curriculum structure for ${programCode}`);
    } else {
      console.log(`Creating new curriculum structure for ${programCode}`);
    }
    
    // Add timestamps
    const dataToSave = {
      ...structureData,
      updatedAt: serverTimestamp()
    };
    
    if (!docSnap.exists()) {
      dataToSave.createdAt = serverTimestamp();
    }
    
    // Set the document
    await setDoc(docRef, dataToSave);
    console.log(`Successfully saved curriculum structure for ${programCode}`);
    
    return true;
  } catch (error) {
    console.error(`Error updating curriculum structure for ${programCode}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log("Updating curriculum structures...");
    
    // Update Sustainable Agriculture curriculum
    const agriResult = await updateCurriculumStructure(sustainableAgricultureStructure);
    
    // Update Environmental Science curriculum
    const esmResult = await updateCurriculumStructure(environmentalScienceStructure);
    
    if (agriResult && esmResult) {
      console.log("All curriculum structures updated successfully");
    } else {
      console.log("Some curriculum structures failed to update");
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
main(); 