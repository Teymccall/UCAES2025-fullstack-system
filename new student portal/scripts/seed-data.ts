"use client"

// This is a utility script to seed initial data to Firebase
// Run this once to populate your database with sample data

import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Student, SemesterResult, Course } from "@/lib/firebase-utils"

// Sample student data
const sampleStudent: Omit<Student, "id"> = {
  indexNumber: "AG/2021/001234",
  surname: "Doe",
  otherNames: "John Michael",
  gender: "Male",
  dateOfBirth: "2000-01-15",
  placeOfBirth: "Accra, Ghana",
  nationality: "Ghanaian",
  religion: "Christianity",
  maritalStatus: "Single",
  passportNumber: "G1234567",
  nationalIdNumber: "GHA-123456789-0",
  ssnitNumber: "",
  numberOfChildren: 0,
  physicalChallenge: "None",
  programme: "BSc. Agriculture",
  yearOfAdmission: 2021,
  yearOfCompletion: 2025,
  entryQualification: "West African Senior School Certificate Examination (WASSCE)",
  entryLevel: "Level 100",
  currentLevel: "Level 300",
  email: "john.doe@student.ucaes.edu.gh",
  mobileNumber: "+233 55 987 6543",
  telephoneNumber: "",
  address: {
    street: "University Hostel Block A, Room 205",
    city: "Bunso",
    country: "Ghana",
  },
  guardian: {
    name: "Mrs. Jane Doe",
    relationship: "Mother",
    contactNumber: "+233 24 123 4567",
    email: "jane.doe@email.com",
    address: "123 Main Street, East Legon, Accra, Greater Accra Region, Ghana",
  },
  emergencyContact: {
    name: "Mr. Robert Doe",
    relationship: "Father",
    contactNumber: "+233 20 555 1234",
    alternativeNumber: "",
  },
}

// Sample grades data
const sampleGrades: Omit<SemesterResult, "id">[] = [
  {
    studentId: "student_id_placeholder", // Will be replaced with actual student ID
    academicYear: "2021/2022",
    semester: "First",
    courses: [
      {
        courseCode: "AGRI 101",
        courseTitle: "Introduction to Agriculture",
        credits: 3,
        grade: "B+",
        gradePoint: 3.5,
        totalPoints: 10.5,
        lecturer: "Dr. Emmanuel Asante",
      },
      {
        courseCode: "AGRI 102",
        courseTitle: "Basic Plant Science",
        credits: 3,
        grade: "A-",
        gradePoint: 3.7,
        totalPoints: 11.1,
        lecturer: "Prof. Mary Osei",
      },
      {
        courseCode: "AGRI 103",
        courseTitle: "Soil Fundamentals",
        credits: 3,
        grade: "B",
        gradePoint: 3.0,
        totalPoints: 9.0,
        lecturer: "Dr. Kwame Boateng",
      },
      {
        courseCode: "MATH 101",
        courseTitle: "Mathematics for Agriculture",
        credits: 3,
        grade: "B+",
        gradePoint: 3.5,
        totalPoints: 10.5,
        lecturer: "Dr. Grace Mensah",
      },
      {
        courseCode: "CHEM 101",
        courseTitle: "General Chemistry",
        credits: 3,
        grade: "A",
        gradePoint: 4.0,
        totalPoints: 12.0,
        lecturer: "Mr. Joseph Amoah",
      },
      {
        courseCode: "ENG 101",
        courseTitle: "Communication Skills",
        credits: 3,
        grade: "B+",
        gradePoint: 3.5,
        totalPoints: 10.5,
        lecturer: "Dr. Sarah Adjei",
      },
    ],
    semesterGPA: 3.4,
    totalCredits: 18,
    totalGradePoints: 63.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    studentId: "student_id_placeholder",
    academicYear: "2021/2022",
    semester: "Second",
    courses: [
      {
        courseCode: "AGRI 104",
        courseTitle: "Animal Science Basics",
        credits: 3,
        grade: "A-",
        gradePoint: 3.7,
        totalPoints: 11.1,
        lecturer: "Eng. Michael Owusu",
      },
      {
        courseCode: "AGRI 105",
        courseTitle: "Agricultural Economics",
        credits: 3,
        grade: "B+",
        gradePoint: 3.5,
        totalPoints: 10.5,
        lecturer: "Dr. Rebecca Nkrumah",
      },
      {
        courseCode: "AGRI 106",
        courseTitle: "Plant Breeding",
        credits: 3,
        grade: "A",
        gradePoint: 4.0,
        totalPoints: 12.0,
        lecturer: "Dr. Emmanuel Asante",
      },
      {
        courseCode: "STAT 101",
        courseTitle: "Statistics",
        credits: 3,
        grade: "B",
        gradePoint: 3.0,
        totalPoints: 9.0,
        lecturer: "Prof. Mary Osei",
      },
      {
        courseCode: "BIOL 101",
        courseTitle: "General Biology",
        credits: 3,
        grade: "A-",
        gradePoint: 3.7,
        totalPoints: 11.1,
        lecturer: "Dr. Kwame Boateng",
      },
      {
        courseCode: "PHYS 101",
        courseTitle: "Physics for Agriculture",
        credits: 3,
        grade: "B+",
        gradePoint: 3.5,
        totalPoints: 10.5,
        lecturer: "Dr. Grace Mensah",
      },
    ],
    semesterGPA: 3.6,
    totalCredits: 18,
    totalGradePoints: 64.2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    studentId: "student_id_placeholder",
    academicYear: "2023/2024",
    semester: "First",
    courses: [
      {
        courseCode: "AGRI 301",
        courseTitle: "Crop Production Systems",
        credits: 3,
        grade: "A",
        gradePoint: 4.0,
        totalPoints: 12.0,
        lecturer: "Dr. Emmanuel Asante",
      },
      {
        courseCode: "AGRI 302",
        courseTitle: "Soil Science and Fertility",
        credits: 3,
        grade: "A-",
        gradePoint: 3.7,
        totalPoints: 11.1,
        lecturer: "Prof. Mary Osei",
      },
      {
        courseCode: "AGRI 304",
        courseTitle: "Agricultural Economics",
        credits: 3,
        grade: "A",
        gradePoint: 4.0,
        totalPoints: 12.0,
        lecturer: "Dr. Grace Mensah",
      },
      {
        courseCode: "AGRI 308",
        courseTitle: "Agricultural Biotechnology",
        credits: 3,
        grade: "B+",
        gradePoint: 3.5,
        totalPoints: 10.5,
        lecturer: "Dr. Rebecca Nkrumah",
      },
      {
        courseCode: "AGRI 310",
        courseTitle: "Sustainable Agriculture",
        credits: 3,
        grade: "A-",
        gradePoint: 3.7,
        totalPoints: 11.1,
        lecturer: "Mr. Joseph Amoah",
      },
      {
        courseCode: "AGRI 312",
        courseTitle: "Agribusiness Management",
        credits: 3,
        grade: "A",
        gradePoint: 4.0,
        totalPoints: 12.0,
        lecturer: "Dr. Sarah Adjei",
      },
    ],
    semesterGPA: 3.8,
    totalCredits: 18,
    totalGradePoints: 68.7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Sample courses data
const sampleCourses: Omit<Course, "id">[] = [
  {
    courseCode: "AGRI 301",
    courseTitle: "Crop Production Systems",
    credits: 3,
    lecturer: "Dr. Emmanuel Asante",
    schedule: "Mon, Wed, Fri 8:00-9:00 AM",
    type: "Core",
    level: "300",
    semester: "First",
    isActive: true,
  },
  {
    courseCode: "AGRI 302",
    courseTitle: "Soil Science and Fertility",
    credits: 3,
    lecturer: "Prof. Mary Osei",
    schedule: "Tue, Thu 10:00-11:30 AM",
    type: "Core",
    level: "300",
    semester: "Second",
    isActive: true,
  },
  {
    courseCode: "AGRI 303",
    courseTitle: "Plant Pathology",
    credits: 3,
    lecturer: "Dr. Kwame Boateng",
    schedule: "Mon, Wed 2:00-3:30 PM",
    type: "Core",
    level: "300",
    semester: "Second",
    isActive: true,
  },
  {
    courseCode: "AGRI 304",
    courseTitle: "Agricultural Economics",
    credits: 3,
    lecturer: "Dr. Grace Mensah",
    schedule: "Tue, Thu 8:00-9:30 AM",
    type: "Core",
    level: "300",
    semester: "Second",
    isActive: true,
  },
  {
    courseCode: "AGRI 305",
    courseTitle: "Farm Management",
    credits: 3,
    lecturer: "Mr. Joseph Amoah",
    schedule: "Fri 10:00 AM-1:00 PM",
    type: "Core",
    level: "300",
    semester: "Second",
    isActive: true,
  },
  {
    courseCode: "AGRI 306",
    courseTitle: "Organic Agriculture",
    credits: 2,
    lecturer: "Dr. Sarah Adjei",
    schedule: "Wed 3:00-5:00 PM",
    type: "Elective",
    level: "300",
    semester: "Second",
    isActive: true,
  },
  {
    courseCode: "AGRI 307",
    courseTitle: "Greenhouse Technology",
    credits: 2,
    lecturer: "Eng. Michael Owusu",
    schedule: "Thu 2:00-4:00 PM",
    type: "Elective",
    level: "300",
    semester: "Second",
    isActive: true,
  },
  {
    courseCode: "AGRI 308",
    courseTitle: "Agricultural Biotechnology",
    credits: 3,
    lecturer: "Dr. Rebecca Nkrumah",
    schedule: "Mon, Wed 11:00 AM-12:30 PM",
    type: "Elective",
    level: "300",
    semester: "Second",
    isActive: true,
  },
]

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Add student
    console.log("Adding student...")
    const studentRef = await addDoc(collection(db, "students"), sampleStudent)
    const studentId = studentRef.id
    console.log("Student added with ID:", studentId)

    // Add grades with the actual student ID
    console.log("Adding grades...")
    for (const gradeData of sampleGrades) {
      const gradeWithStudentId = {
        ...gradeData,
        studentId: studentId,
      }
      await addDoc(collection(db, "grades"), gradeWithStudentId)
    }
    console.log("Grades added successfully")

    // Add courses
    console.log("Adding courses...")
    for (const courseData of sampleCourses) {
      await addDoc(collection(db, "courses"), courseData)
    }
    console.log("Courses added successfully")

    console.log("Database seeding completed successfully!")
    return { success: true, studentId }
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}

// To run this function, call it from a component or page
// Example: seedDatabase().then(result => console.log(result))
