/**
 * Enhanced Course Management Functions
 * Works alongside existing system without disruption
 */

import { collection, getDocs, addDoc, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Enhanced course loading with better discovery
export class EnhancedCourseManagement {

  /**
   * Smart course discovery for student registration
   * Enhances existing loadAvailableCourses function
   */
  static async getSmartCourseRecommendations(
    programId: string,
    level: number,
    semester: number,
    studentId?: string
  ) {
    try {
      console.log(`🎯 Smart course discovery for Program: ${programId}, Level: ${level}, Semester: ${semester}`);

      // Get base courses (existing logic)
      const baseCourses = await this.getBaseCourses(programId, level, semester);
      
      // Get prerequisite recommendations
      const prerequisiteRecs = await this.getPrerequisiteRecommendations(studentId, level);
      
      // Get elective options
      const electiveOptions = await this.getElectiveOptions(programId, level, semester);
      
      // Get cross-program options (for interdisciplinary courses)
      const crossProgramOptions = await this.getCrossProgramOptions(level, semester);

      return {
        coreCourses: baseCourses.filter(c => c.courseType === 'core'),
        electiveCourses: baseCourses.filter(c => c.courseType === 'elective'),
        prerequisiteRecommendations: prerequisiteRecs,
        electiveOptions: electiveOptions,
        crossProgramOptions: crossProgramOptions,
        totalAvailable: baseCourses.length
      };

    } catch (error) {
      console.error("Error in smart course discovery:", error);
      // Fallback to existing method
      return this.getFallbackCourses(programId, level, semester);
    }
  }

  /**
   * Get base courses using existing logic
   */
  private static async getBaseCourses(programId: string, level: number, semester: number) {
    const coursesRef = collection(db, "academic-courses");
    const q = query(
      coursesRef,
      where("programId", "==", programId),
      where("level", "==", level),
      where("semester", "==", semester),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Get prerequisite recommendations based on student's completed courses
   */
  private static async getPrerequisiteRecommendations(studentId?: string, currentLevel?: number) {
    if (!studentId || !currentLevel) return [];

    try {
      // Check student's completed courses from previous registrations
      const registrationsRef = collection(db, "course-registrations");
      const q = query(
        registrationsRef,
        where("studentId", "==", studentId)
      );

      const snapshot = await getDocs(q);
      const completedCourses = new Set();
      
      snapshot.docs.forEach(doc => {
        const registration = doc.data();
        if (registration.courses) {
          registration.courses.forEach(course => {
            completedCourses.add(course.courseCode);
          });
        }
      });

      // Return recommendations based on completed courses
      return Array.from(completedCourses);

    } catch (error) {
      console.error("Error getting prerequisite recommendations:", error);
      return [];
    }
  }

  /**
   * Get elective options from same or related programs
   */
  private static async getElectiveOptions(programId: string, level: number, semester: number) {
    try {
      const coursesRef = collection(db, "academic-courses");
      const q = query(
        coursesRef,
        where("level", "==", level),
        where("semester", "==", semester),
        where("courseType", "==", "elective"),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(course => course.programId === programId || course.crossProgram === true);

    } catch (error) {
      console.error("Error getting elective options:", error);
      return [];
    }
  }

  /**
   * Get cross-program course options
   */
  private static async getCrossProgramOptions(level: number, semester: number) {
    try {
      const coursesRef = collection(db, "academic-courses");
      const q = query(
        coursesRef,
        where("level", "==", level),
        where("semester", "==", semester),
        where("crossProgram", "==", true),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
      console.error("Error getting cross-program options:", error);
      return [];
    }
  }

  /**
   * Fallback to existing course loading method
   */
  private static async getFallbackCourses(programId: string, level: number, semester: number) {
    const baseCourses = await this.getBaseCourses(programId, level, semester);
    return {
      coreCourses: baseCourses,
      electiveCourses: [],
      prerequisiteRecommendations: [],
      electiveOptions: [],
      crossProgramOptions: [],
      totalAvailable: baseCourses.length
    };
  }

  /**
   * Bulk course assignment to program
   * Enhances existing manual assignment process
   */
  static async bulkAssignCoursesToProgram(
    programId: string,
    courses: Array<{
      code: string;
      title: string;
      credits: number;
      level: number;
      semester: number;
      courseType: 'core' | 'elective';
      description?: string;
    }>,
    academicYear: string
  ) {
    try {
      console.log(`📚 Bulk assigning ${courses.length} courses to program ${programId}`);

      const results = {
        success: 0,
        skipped: 0,
        errors: []
      };

      for (const courseData of courses) {
        try {
          // Check if course already exists
          const coursesRef = collection(db, "academic-courses");
          const existingQuery = query(
            coursesRef,
            where("code", "==", courseData.code),
            where("programId", "==", programId),
            where("academicYear", "==", academicYear)
          );

          const existingSnapshot = await getDocs(existingQuery);
          
          if (!existingSnapshot.empty) {
            console.log(`Course ${courseData.code} already exists for program, skipping`);
            results.skipped++;
            continue;
          }

          // Get program details for department/faculty
          const programRef = doc(db, "programs", programId);
          const programSnapshot = await getDoc(programRef);
          const programData = programSnapshot.data();

          // Create new course record
          const newCourse = {
            code: courseData.code,
            title: courseData.title,
            name: courseData.title, // For compatibility
            credits: courseData.credits,
            level: courseData.level,
            semester: courseData.semester,
            courseType: courseData.courseType,
            description: courseData.description || '',
            programId: programId,
            academicYear: academicYear,
            department: programData?.department || 'General',
            faculty: programData?.faculty || 'General',
            status: 'active',
            prerequisites: [],
            crossProgram: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await addDoc(coursesRef, newCourse);
          console.log(`✅ Created course: ${courseData.code} - ${courseData.title}`);
          results.success++;

        } catch (error) {
          console.error(`Error creating course ${courseData.code}:`, error);
          results.errors.push({ course: courseData.code, error: error.message });
        }
      }

      console.log(`📊 Bulk assignment results:`, results);
      return results;

    } catch (error) {
      console.error("Error in bulk course assignment:", error);
      throw error;
    }
  }

  /**
   * Generate program course template
   * Creates standard course structure for new programs
   */
  static generateProgramCourseTemplate(programType: 'agriculture' | 'environmental' | 'general') {
    const templates = {
      agriculture: [
        // Level 100 Courses
        { code: 'AGR 101', title: 'Introduction to Agriculture', credits: 3, level: 100, semester: 1, courseType: 'core' },
        { code: 'AGR 102', title: 'Agricultural Biology', credits: 3, level: 100, semester: 1, courseType: 'core' },
        { code: 'AGR 103', title: 'Soil Science Fundamentals', credits: 3, level: 100, semester: 2, courseType: 'core' },
        { code: 'AGR 104', title: 'Agricultural Chemistry', credits: 3, level: 100, semester: 2, courseType: 'core' },
        
        // Level 200 Courses
        { code: 'AGR 201', title: 'Crop Production', credits: 3, level: 200, semester: 1, courseType: 'core' },
        { code: 'AGR 202', title: 'Animal Husbandry', credits: 3, level: 200, semester: 1, courseType: 'core' },
        { code: 'AGR 203', title: 'Agricultural Economics', credits: 3, level: 200, semester: 2, courseType: 'core' },
        { code: 'AGR 204', title: 'Plant Pathology', credits: 3, level: 200, semester: 2, courseType: 'elective' },

        // Level 300 Courses  
        { code: 'AGR 301', title: 'Advanced Crop Management', credits: 3, level: 300, semester: 1, courseType: 'core' },
        { code: 'AGR 302', title: 'Agricultural Technology', credits: 3, level: 300, semester: 1, courseType: 'elective' },
        { code: 'AGR 303', title: 'Sustainable Agriculture', credits: 3, level: 300, semester: 2, courseType: 'core' },
        { code: 'AGR 304', title: 'Agricultural Research Methods', credits: 3, level: 300, semester: 2, courseType: 'core' },

        // Level 400 Courses
        { code: 'AGR 401', title: 'Agricultural Project', credits: 6, level: 400, semester: 1, courseType: 'core' },
        { code: 'AGR 402', title: 'Agricultural Extension', credits: 3, level: 400, semester: 1, courseType: 'elective' },
        { code: 'AGR 403', title: 'Thesis/Capstone Project', credits: 6, level: 400, semester: 2, courseType: 'core' }
      ],

      environmental: [
        // Level 100 Courses
        { code: 'ESM 101', title: 'Introduction to Environmental Science', credits: 3, level: 100, semester: 1, courseType: 'core' },
        { code: 'ESM 102', title: 'Environmental Biology', credits: 3, level: 100, semester: 1, courseType: 'core' },
        { code: 'ESM 103', title: 'Environmental Chemistry', credits: 3, level: 100, semester: 2, courseType: 'core' },
        { code: 'ESM 104', title: 'Mathematics for Environmental Science', credits: 3, level: 100, semester: 2, courseType: 'core' },

        // Level 200 Courses
        { code: 'ESM 201', title: 'Ecology and Ecosystems', credits: 3, level: 200, semester: 1, courseType: 'core' },
        { code: 'ESM 202', title: 'Environmental Pollution', credits: 3, level: 200, semester: 1, courseType: 'core' },
        { code: 'ESM 203', title: 'Environmental Monitoring', credits: 3, level: 200, semester: 2, courseType: 'core' },
        { code: 'ESM 204', title: 'Climate Change Science', credits: 3, level: 200, semester: 2, courseType: 'elective' },

        // Level 300 Courses
        { code: 'ESM 301', title: 'Environmental Impact Assessment', credits: 3, level: 300, semester: 1, courseType: 'core' },
        { code: 'ESM 302', title: 'Environmental Policy', credits: 3, level: 300, semester: 1, courseType: 'core' },
        { code: 'ESM 303', title: 'Environmental Management', credits: 3, level: 300, semester: 2, courseType: 'core' },
        { code: 'ESM 304', title: 'Research Methods', credits: 3, level: 300, semester: 2, courseType: 'core' },

        // Level 400 Courses
        { code: 'ESM 401', title: 'Environmental Project', credits: 6, level: 400, semester: 1, courseType: 'core' },
        { code: 'ESM 402', title: 'Environmental Consultancy', credits: 3, level: 400, semester: 1, courseType: 'elective' },
        { code: 'ESM 403', title: 'Thesis Project', credits: 6, level: 400, semester: 2, courseType: 'core' }
      ],

      general: [
        // Basic template for any program
        { code: 'GEN 101', title: 'Introduction to Program', credits: 3, level: 100, semester: 1, courseType: 'core' },
        { code: 'GEN 102', title: 'Program Fundamentals', credits: 3, level: 100, semester: 2, courseType: 'core' },
        { code: 'GEN 201', title: 'Intermediate Studies', credits: 3, level: 200, semester: 1, courseType: 'core' },
        { code: 'GEN 202', title: 'Applied Methods', credits: 3, level: 200, semester: 2, courseType: 'core' },
        { code: 'GEN 301', title: 'Advanced Studies', credits: 3, level: 300, semester: 1, courseType: 'core' },
        { code: 'GEN 302', title: 'Research Methods', credits: 3, level: 300, semester: 2, courseType: 'core' },
        { code: 'GEN 401', title: 'Final Project', credits: 6, level: 400, semester: 1, courseType: 'core' },
        { code: 'GEN 402', title: 'Thesis', credits: 6, level: 400, semester: 2, courseType: 'core' }
      ]
    };

    return templates[programType] || templates.general;
  }

  /**
   * Smart lecturer assignment suggestions
   * Enhances existing lecturer assignment process
   */
  static async getLecturerAssignmentSuggestions(
    courseId: string,
    academicYear: string,
    semester: string
  ) {
    try {
      console.log(`🎯 Getting lecturer suggestions for course: ${courseId}`);

      // Get course details
      const courseRef = doc(db, "academic-courses", courseId);
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();

      if (!courseData) {
        return { suggestions: [], previousAssignments: [] };
      }

      // Get previous assignments for this course
      const assignmentsRef = collection(db, "lecturer-assignments");
      const previousQuery = query(
        assignmentsRef,
        where("courseId", "==", courseId),
        where("status", "==", "active")
      );

      const previousSnapshot = await getDocs(previousQuery);
      const previousAssignments = previousSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get lecturers from same department
      const usersRef = collection(db, "users");
      const lecturersQuery = query(
        usersRef,
        where("role", "==", "lecturer"),
        where("status", "==", "active")
      );

      const lecturersSnapshot = await getDocs(lecturersQuery);
      const departmentLecturers = lecturersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(lecturer => 
          lecturer.department === courseData.department ||
          lecturer.specialization?.includes(courseData.department)
        );

      return {
        suggestions: departmentLecturers,
        previousAssignments: previousAssignments,
        courseInfo: courseData
      };

    } catch (error) {
      console.error("Error getting lecturer suggestions:", error);
      return { suggestions: [], previousAssignments: [] };
    }
  }
}

export default EnhancedCourseManagement;




