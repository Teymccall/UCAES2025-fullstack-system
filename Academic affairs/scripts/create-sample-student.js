// Script to create a sample student in the students collection

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } = require('firebase/firestore');

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

// Function to check if student already exists
async function checkStudentExists(registrationNumber) {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('registrationNumber', '==', registrationNumber));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if student exists:', error);
    return false;
  }
}

// Function to create a sample student
async function createSampleStudent() {
  try {
    const registrationNumber = 'UCAES20250001';
    
    // Check if student already exists
    const exists = await checkStudentExists(registrationNumber);
    
    if (exists) {
      console.log(`Student with registration number ${registrationNumber} already exists.`);
      return;
    }
    
    // Create student data
    const studentData = {
      name: 'John Doe',
      registrationNumber: registrationNumber,
      email: 'john.doe@example.com',
      phone: '0241234567',
      gender: 'Male',
      dateOfBirth: '2000-01-01',
      program: 'BSc. Sustainable Agriculture',
      level: '100',
      studyMode: 'Regular',
      status: 'active',
      address: {
        street: '123 Main St',
        city: 'Accra',
        region: 'Greater Accra',
        country: 'Ghana'
      },
      guardian: {
        name: 'Jane Doe',
        relationship: 'Parent',
        contact: '0209876543'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to students collection
    const docRef = await addDoc(collection(db, 'students'), studentData);
    
    console.log(`Created sample student with ID: ${docRef.id}`);
    
  } catch (error) {
    console.error('Error creating sample student:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('Creating sample student...');
    await createSampleStudent();
    console.log('Done!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main(); 