/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

/**
 * Firebase Functions for UCAES Student Portal
 * These functions handle automatic account creation when new students are added
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase
admin.initializeApp();
const auth = admin.auth();
const firestore = admin.firestore();

// Helper function to generate email from student ID
const generateEmailFromStudentId = (studentId: string): string => {
  // Make sure studentId is always uppercase for consistency
  const standardizedId = studentId.toUpperCase();
  // Convert student ID to email format: AG/2021/001234 -> ag.2021.001234@student.ucaes.edu.gh
  const cleanId = standardizedId.replace(/[/\-\s]/g, ".").toLowerCase();
  return `${cleanId}@student.ucaes.edu.gh`;
};

// Helper function to generate initial password from date of birth
const generatePasswordFromDOB = (dateOfBirth: string): string => {
  // Convert date to password format: 2000-01-15 -> 20000115
  return dateOfBirth.replace(/[-/\s]/g, "");
};

// Function to create a Firebase Auth account for a newly added student
export const createStudentAccount = onDocumentCreated(
  "students/{studentId}",
  async (event) => {
    // Get the student data
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    try {
      const studentData = snapshot.data();
      const {indexNumber, dateOfBirth} = studentData;

      if (!indexNumber || !dateOfBirth) {
        console.error(
          "Student document missing required fields:",
          event.params.studentId
        );
        return null;
      }

      // Generate email and initial password
      const email = generateEmailFromStudentId(indexNumber);
      const password = generatePasswordFromDOB(dateOfBirth);

      console.log(
        `Creating account for student: ${indexNumber}, email: ${email}`
      );

      // Check if user already exists
      try {
        await auth.getUserByEmail(email);
        console.log(
          `User with email ${email} already exists. Skipping creation.`
        );
        return null;
      } catch (error) {
        // Error means user doesn't exist, which is what we want
        if ((error as {code: string}).code !== "auth/user-not-found") {
          throw error;
        }
      }

      // Create the user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${studentData.surname}, ${studentData.otherNames}`,
        disabled: false,
      });

      console.log(
        `Successfully created user: ${userRecord.uid} for student: ${indexNumber}`
      );

      // Update student record with auth UID
      await firestore.collection("students").doc(event.params.studentId)
        .update({
          authUid: userRecord.uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        message: `Created account for student ${indexNumber}`,
      };
    } catch (error) {
      console.error("Error creating student account:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
);

// Function to sync changes in student records to their Firebase Auth accounts
export const syncStudentAccount = onDocumentUpdated(
  "students/{studentId}",
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      console.log("Missing data in the event");
      return null;
    }

    // Only proceed if authUid exists (user has been created)
    if (!afterData.authUid) {
      return null;
    }

    try {
      // Update display name if name changed
      if (beforeData.surname !== afterData.surname ||
          beforeData.otherNames !== afterData.otherNames) {
        await auth.updateUser(afterData.authUid, {
          displayName: `${afterData.surname}, ${afterData.otherNames}`,
        });
        console.log(`Updated display name for user: ${afterData.authUid}`);
      }

      return {success: true};
    } catch (error) {
      console.error("Error syncing student account:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
);

// Function to send welcome email to student (if you want to add this later)
export const sendWelcomeEmail = onDocumentCreated(
  "students/{studentId}",
  async (event) => {
    // This is a placeholder for email functionality
    // You would implement email sending logic here
    // using a service like SendGrid, Mailgun, etc.

    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return null;
    }

    const studentData = snapshot.data();
    console.log(`Would send welcome email to: ${studentData.email || "No email provided"}`);

    return null;
  }
);
