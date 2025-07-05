import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { db, auth } from "./firebase"
import { uploadToCloudinary } from "./cloudinary-service"
import type { FormData } from "@/app/register/page"

export interface StudentRegistration extends Omit<FormData, "profilePicture"> {
  id?: string
  profilePictureUrl?: string
  profilePicturePublicId?: string
  registrationDate: any
  status: "pending" | "approved" | "rejected" | "image_upload_failed"
  registrationNumber?: string
  uploadError?: string
}

// Generate registration number
function generateRegistrationNumber(): string {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `UCAES${year}${randomNum}`
}

// Create a Firebase Auth user
async function createAuthUser(email: string, password: string, displayName: string) {
  try {
    console.log('Attempting to create auth user with email:', email);
    
    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Auth user created, UID:', userCredential.user.uid);
    
    // Skip updating profile for now to avoid errors
    // We'll implement this properly in a future update
    console.log('Skipping profile update for now');
    
    // Send verification email
    console.log('Sending verification email...');
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + '/verify-email',
      handleCodeInApp: true
    });
    console.log('Verification email sent');
    
    return userCredential.user.uid;
  } catch (error: any) {
    console.error("Error in createAuthUser:", {
      code: error.code,
      message: error.message,
      email: email,
      stack: error.stack
    });
    throw new Error(`Failed to create user account: ${error.message}`)
  }
}

// Generate a temporary password from student's details
function generateTemporaryPassword(studentData: any): string {
  // Use first 4 letters of surname + YYYY of birth + last 4 of phone
  const surname = studentData.surname.slice(0, 4).toLowerCase()
  const birthYear = studentData.dateOfBirth.split('-')[2] || '2000'
  const phoneLast4 = (studentData.mobile || '0000').slice(-4)
  return `${surname}${birthYear}${phoneLast4}!`
}

// Submit student registration to Firestore with Cloudinary image upload and create auth user
export async function submitStudentRegistration(formData: FormData): Promise<string> {
  try {
    console.log("Starting student registration submission process");
    
    // Generate registration number first
    const registrationNumber = generateRegistrationNumber()
    
    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword(formData)
    console.log("Generated temporary password");

    // Create base registration data
    const registrationData: Omit<StudentRegistration, "id"> = {
      surname: formData.surname.toUpperCase(),
      otherNames: formData.otherNames.toUpperCase(),
      gender: formData.gender.toLowerCase(),
      dateOfBirth: formData.dateOfBirth,
      placeOfBirth: formData.placeOfBirth.toUpperCase(),
      nationality: formData.nationality.toUpperCase(),
      religion: formData.religion.toUpperCase(),
      maritalStatus: formData.maritalStatus.toLowerCase(),
      nationalId: formData.nationalId ? formData.nationalId.toUpperCase() : "",
      ssnitNumber: formData.ssnitNumber ? formData.ssnitNumber.toUpperCase() : "",
      physicalChallenge: formData.physicalChallenge.toLowerCase(),
      studentIndexNumber: formData.studentIndexNumber ? formData.studentIndexNumber.toUpperCase() : "",
      email: formData.email.toLowerCase(),
      mobile: formData.mobile,
      street: formData.street.toUpperCase(),
      city: formData.city.toUpperCase(),
      country: formData.country.toUpperCase(),
      guardianName: formData.guardianName.toUpperCase(),
      relationship: formData.relationship.toLowerCase(),
      guardianContact: formData.guardianContact,
      guardianEmail: formData.guardianEmail.toLowerCase(),
      guardianAddress: formData.guardianAddress.toUpperCase(),
      programme: formData.programme,
      yearOfEntry: formData.yearOfEntry,
      entryQualification: formData.entryQualification.toUpperCase(),
      entryLevel: formData.entryLevel,
      hallOfResidence: formData.hallOfResidence.toUpperCase(),
      scheduleType: formData.scheduleType || "Regular",
      currentLevel: formData.currentLevel || formData.entryLevel,
      entryAcademicYear: formData.entryAcademicYear || "",
      currentPeriod: formData.currentPeriod || "First Semester",
      registrationDate: serverTimestamp(),
      status: "pending",
      registrationNumber: registrationNumber,
    }

    console.log("Submitting registration data to Firebase:", registrationData)

          try {
        // Add registration to Firestore first
        const docRef = await addDoc(collection(db, "student-registrations"), registrationData)
        console.log("Registration document created with ID:", docRef.id)
        
        // Create a duplicate in the main students collection for easier access
        try {
          await setDoc(doc(db, "students", registrationData.email.toLowerCase()), {
            ...registrationData,
            source: "registration_form",
            registrationId: docRef.id,
            createdAt: serverTimestamp(),
          });
          console.log("Student record also created in students collection");
        } catch (dupError) {
          console.error("Error creating duplicate in students collection:", dupError);
          // Continue anyway as the main registration is successful
        }
    
      try {
        // Create Firebase Auth user
        console.log("Creating Firebase Auth user with email:", formData.email.toLowerCase());
        
        const authUid = await createAuthUser(
          formData.email.toLowerCase(),
          temporaryPassword,
          `${formData.surname} ${formData.otherNames}`.trim()
        )
        
        console.log("Auth user created, updating registration with UID:", authUid);
        
        // Update the registration with auth UID
        await updateDoc(docRef, { 
          authUid,
          status: 'pending_verification'
        });
        
        console.log("Registration updated with auth UID");
        
        // Return the registration ID
        return docRef.id;
        
      } catch (authError: any) {
        console.error("Error during user creation:", {
          error: authError,
          code: authError?.code,
          message: authError?.message,
          stack: authError?.stack
        });
        
        // If auth fails but Firestore succeeded, mark the registration appropriately
        if (docRef) {
          await updateDoc(docRef, { 
            status: "auth_creation_failed",
            authError: authError?.message || String(authError)
          });
        }
        
        // Provide more specific error messages based on the error code
        if (authError?.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please use a different email or try resetting your password.');
        } else if (authError?.code === 'auth/invalid-email') {
          throw new Error('The email address is not valid.');
        } else if (authError?.code === 'auth/weak-password') {
          throw new Error('The password is too weak. Please contact support.');
        } else {
          throw new Error(`Registration completed but there was an issue creating your login: ${authError?.message || 'Unknown error'}`);
        }
      }

      // Upload profile picture to Cloudinary if provided (MANDATORY)
      if (formData.profilePicture) {
        try {
          console.log("Uploading profile picture to Cloudinary...")
          
          // Create a structured folder path for better organization
          // Format: student-profiles/YEAR/PROGRAM/REGISTRATION_NUMBER
          const year = new Date().getFullYear().toString()
          const programCode = formData.programme.split(' ')[0] || 'GENERAL'
          const folderPath = `student-profiles/${year}/${programCode}/${registrationNumber}`
          
          // Add student metadata as tags for better searchability
          const tags = [
            `student_id:${registrationNumber}`,
            `name:${formData.surname}_${formData.otherNames.split(' ')[0]}`,
            `program:${programCode}`,
            `year:${year}`,
            `entry_level:${formData.entryLevel}`
          ]
          
          // Get the file to upload - either from the File object or from the stored object
          let fileToUpload: File | null = null;
          
          if (formData.profilePicture instanceof File) {
            fileToUpload = formData.profilePicture;
          } else if (typeof formData.profilePicture === 'object' && formData.profilePicture !== null) {
            // Check if we have a File object stored in the custom object
            if ('file' in formData.profilePicture && formData.profilePicture.file instanceof File) {
              fileToUpload = formData.profilePicture.file;
            }
            // If we already have a cloudinaryId, we don't need to upload again
            else if ('cloudinaryId' in formData.profilePicture && formData.profilePicture.cloudinaryId) {
              // We already have a Cloudinary URL, so just update the Firebase record
              await updateDoc(doc(db, "student-registrations", docRef.id), {
                profilePictureUrl: formData.profilePicture.url,
                profilePicturePublicId: formData.profilePicture.cloudinaryId,
                imageUploadDate: serverTimestamp(),
                studentIdentifier: registrationNumber,
              });
              console.log("Firebase document updated with existing Cloudinary image data");
              // Don't return here - continue with the rest of the function
            }
          }
          
          // If we have a file to upload, proceed with the upload
          if (fileToUpload) {
            const cloudinaryResult = await uploadToCloudinary(
              fileToUpload, 
              folderPath,
              tags.join(',')
            )

            console.log("Cloudinary upload successful:", cloudinaryResult.secure_url)

            // Update the document with Cloudinary image data
            try {
              await updateDoc(doc(db, "student-registrations", docRef.id), {
                profilePictureUrl: cloudinaryResult.secure_url,
                profilePicturePublicId: cloudinaryResult.public_id,
                imageUploadDate: serverTimestamp(),
                studentIdentifier: registrationNumber, // Add explicit identifier field
              })

              console.log("Firebase document updated with Cloudinary image data")
            } catch (updateError) {
              console.error("Error updating document with image data:", updateError)
              // Continue anyway since the registration is already created
            }
          } else {
            // No valid file found
            console.warn("No valid profile picture file found for upload, continuing with registration");
            try {
              await updateDoc(doc(db, "student-registrations", docRef.id), {
                profilePictureUrl: null,
                profilePicturePublicId: null,
                noProfilePicture: true,
                studentIdentifier: registrationNumber,
              });
            } catch (updateError) {
              console.error("Error updating document with no-image flag:", updateError)
              // Continue anyway since the registration is already created
            }
          }
        } catch (uploadError) {
          console.error("Error uploading profile picture to Cloudinary:", uploadError)
          // Don't throw here, just update the status and continue
          try {
            await updateDoc(doc(db, "student-registrations", docRef.id), {
              status: "image_upload_failed",
              uploadError: uploadError instanceof Error ? uploadError.message : "Unknown upload error",
            })
          } catch (updateError) {
            console.error("Error updating document with upload error status:", updateError)
            // Continue anyway since the registration is already created
          }
        }
      } else {
        // Mark as no profile picture provided
        try {
          await updateDoc(doc(db, "student-registrations", docRef.id), {
            profilePictureUrl: null,
            profilePicturePublicId: null,
            noProfilePicture: true,
            studentIdentifier: registrationNumber, // Add explicit identifier field
          })
          console.log("Registration completed without profile picture")
        } catch (updateError) {
          console.error("Error updating document with no-image flag:", updateError)
          // Continue anyway since the registration is already created
        }
      }

      console.log("Registration submission completed successfully")
      return docRef.id
    } catch (firestoreError) {
      console.error("Firebase error during registration:", firestoreError)
      throw new Error("Database error: " + (firestoreError instanceof Error ? firestoreError.message : "Unknown database error"))
    }
  } catch (error) {
    console.error("Error submitting registration:", error)
    throw new Error("Failed to submit registration. Please try again. " + (error instanceof Error ? error.message : ""))
  }
}

// Get student registration by ID
export async function getStudentRegistration(registrationId: string): Promise<StudentRegistration | null> {
  try {
    const docRef = doc(db, "student-registrations", registrationId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as StudentRegistration
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting registration:", error)
    throw new Error("Failed to retrieve registration data")
  }
}

// Update registration status
export async function updateRegistrationStatus(
  registrationId: string,
  status: "pending" | "approved" | "rejected",
): Promise<void> {
  try {
    const docRef = doc(db, "student-registrations", registrationId)
    await updateDoc(docRef, {
      status: status,
      lastUpdated: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating registration status:", error)
    throw new Error("Failed to update registration status")
  }
}
