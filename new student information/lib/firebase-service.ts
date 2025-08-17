import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInAnonymously } from "firebase/auth"
import { db, auth } from "./firebase"
import { uploadToCloudinary } from "./cloudinary-service"
import { getNetworkErrorMessage } from "./network-utils"
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

// Ensure user is authenticated for Firebase operations
async function ensureAuthentication(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already authenticated, resolve immediately
    if (auth.currentUser) {
      console.log("Already authenticated:", auth.currentUser.uid)
      resolve()
      return
    }

    // Sign in anonymously for registration operations
    signInAnonymously(auth)
      .then((userCredential) => {
        console.log("Anonymous auth successful for registration:", userCredential.user.uid)
        resolve()
      })
      .catch((error) => {
        console.error("Authentication failed:", error)
        reject(new Error("Authentication failed: " + error.message))
      })
  })
}

// Generate sequential registration number with database counter
async function generateRegistrationNumber(academicYear: string): Promise<string> {
  try {
    // Extract the first year from academic year format (e.g., "2023/2024" -> "2023")
    const year = academicYear.split('/')[0]
    const yearKey = `UCAES${year}`
    
    console.log("🔢 Generating sequential registration number for academic year:", academicYear)
    console.log("🔢 Using year key:", yearKey)
    
    // Get the counter document for this year
    const counterRef = doc(db, "registration-counters", yearKey)
    
    try {
      // Try to get the existing counter
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        // Counter exists, increment it
        const currentCount = counterDoc.data().lastNumber || 0
        const nextNumber = currentCount + 1
        const paddedNumber = nextNumber.toString().padStart(4, "0")
        
        // Update the counter
        await updateDoc(counterRef, {
          lastNumber: nextNumber,
          lastUpdated: serverTimestamp()
        })
        
        const registrationNumber = `${yearKey}${paddedNumber}`
        console.log("✅ Generated sequential registration number:", registrationNumber, `(incremented from ${currentCount})`)
        return registrationNumber
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1
        const paddedNumber = firstNumber.toString().padStart(4, "0")
        
        // Create the counter document
        await setDoc(counterRef, {
          lastNumber: firstNumber,
          year: parseInt(year),
          academicYear: academicYear,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
        
        const registrationNumber = `${yearKey}${paddedNumber}`
        console.log("✅ Generated first registration number for year:", registrationNumber)
        return registrationNumber
      }
      
    } catch (error) {
      console.error("❌ Error accessing registration counter:", error)
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0")
      const registrationNumber = `${yearKey}${fallbackNumber}`
      console.log("⚠️ Using fallback registration number for academic year", academicYear, ":", registrationNumber)
      return registrationNumber
    }
    
  } catch (error) {
    console.error("❌ Error in generateRegistrationNumber:", error)
    
    // Ultimate fallback: random number
    const fallbackYear = academicYear ? academicYear.split('/')[0] : new Date().getFullYear().toString()
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    const registrationNumber = `UCAES${fallbackYear}${randomNum}`
    console.log("🔄 Using random fallback registration number for academic year", academicYear, ":", registrationNumber)
    return registrationNumber
  }
}

// Create a Firebase Auth user
async function createAuthUser(email: string, password: string, displayName: string) {
  try {
    console.log('🔐 Attempting to create auth user with email:', email);
    console.log('📋 Password length:', password?.length || 0);
    console.log('👤 Display name:', displayName);
    
    // Validate inputs before attempting creation
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address provided');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Check if Firebase Auth is properly initialized
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    console.log('✅ Input validation passed, creating user...');
    console.log('🔧 Firebase Auth config check:', {
      authInitialized: !!auth,
      authType: auth?.constructor?.name || 'unknown',
      projectId: auth?.app?.options?.projectId || 'unknown'
    });
    
    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Auth user created, UID:', userCredential.user.uid);
    
    // Skip updating profile for now to avoid errors
    // We'll implement this properly in a future update
    console.log('⏭️ Skipping profile update for now');
    
    // Send verification email
    console.log('📧 Sending verification email...');
    try {
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/verify-email',
        handleCodeInApp: true
      });
      console.log('✅ Verification email sent successfully');
    } catch (emailError: any) {
      console.warn('⚠️ Failed to send verification email (non-critical):', {
        code: emailError?.code || 'unknown',
        message: emailError?.message || 'Unknown error'
      });
      // Don't fail the entire process if email sending fails
    }
    
    return userCredential.user.uid;
  } catch (error: any) {
    // Enhanced error logging
    console.error("❌ Error in createAuthUser:");
    console.error("   Error object:", error);
    console.error("   Error type:", typeof error);
    console.error("   Error constructor:", error?.constructor?.name);
    
    // Try to extract meaningful error information
    const errorCode = error?.code || 'unknown-error';
    const errorMessage = error?.message || error?.toString() || 'Unknown authentication error';
    
    console.error("   Extracted details:", {
      code: errorCode,
      message: errorMessage,
      email: email,
      originalError: error
    });
    
    // Provide user-friendly error messages based on Firebase error codes
    let userFriendlyMessage = errorMessage;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        userFriendlyMessage = 'An account with this email address already exists. Please use a different email or try logging in.';
        break;
      case 'auth/invalid-email':
        userFriendlyMessage = 'The email address is not valid. Please check and try again.';
        break;
      case 'auth/operation-not-allowed':
        userFriendlyMessage = 'Email/password accounts are not enabled. Please contact the administrator.';
        break;
      case 'auth/weak-password':
        userFriendlyMessage = 'The password is too weak. Please choose a stronger password.';
        break;
      case 'auth/network-request-failed':
        userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
        break;
      case 'auth/too-many-requests':
        userFriendlyMessage = 'Too many failed attempts. Please wait a moment before trying again.';
        break;
      default:
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          userFriendlyMessage = 'Network connection error. Please check your internet and try again.';
        }
        break;
    }
    
    throw new Error(userFriendlyMessage);
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
export async function submitStudentRegistration(formData: FormData, fileObjectInMemory?: File | null): Promise<string> {
  try {
    console.log("🔥 FIREBASE SERVICE: submitStudentRegistration called")
    console.log("📋 Form data received:", formData)
    console.log("👤 Student being registered:", formData.surname, formData.otherNames)
    console.log("📧 Email:", formData.email)
    console.log("📄 File object in memory:", fileObjectInMemory ? fileObjectInMemory.name : 'None')
    
    // Ensure we have Firebase authentication for database writes
    await ensureAuthentication()
    
    // Generate registration number first using the academic year from form
    const registrationNumber = await generateRegistrationNumber(formData.entryAcademicYear)
    console.log("📋 Generated registration number:", registrationNumber, "for academic year:", formData.entryAcademicYear)
    
    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword(formData)
    console.log("🔑 Generated temporary password")

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
      console.log("Attempting to write to student-registrations collection...");
      const docRef = await addDoc(collection(db, "student-registrations"), registrationData)
      console.log("✅ Registration document created successfully with ID:", docRef.id)
      console.log("📋 Document data:", registrationData)
      console.log("👤 Registered student:", registrationData.surname, registrationData.otherNames)
      console.log("📧 Email:", registrationData.email)
      console.log("🔢 Registration number:", registrationData.registrationNumber)
        
      // Create a duplicate in the main students collection for easier access
      try {
        console.log("Creating duplicate record in students collection...");
        await setDoc(doc(db, "students", registrationData.email.toLowerCase()), {
          ...registrationData,
          source: "registration_form",
          registrationId: docRef.id,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Student record also created in students collection");
      } catch (dupError) {
        console.error("❌ Error creating duplicate in students collection:", dupError);
        // Continue anyway as the main registration is successful
      }
    
      try {
        // Create Firebase Auth user
        console.log("Creating Firebase Auth user with email:", formData.email.toLowerCase());
        console.log("Auth state check:", {
          authExists: !!auth,
          currentUser: auth?.currentUser?.uid || 'none',
          authConfigProjectId: auth?.app?.options?.projectId || 'unknown'
        });
        
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
        console.log("🎯 FIREBASE SERVICE: Returning registration ID (success):", docRef.id)
        return docRef.id;
        
      } catch (authError: any) {
        console.error("❌ Error during user creation:");
        
        // Better error logging with fallbacks
        console.error("   Raw error:", authError);
        console.error("   Error type:", typeof authError);
        console.error("   Error string:", String(authError));
        
        // Try to extract error details with more robust checks
        let errorCode = 'unknown';
        let errorMessage = 'Unknown authentication error';
        
        if (authError) {
          if (typeof authError === 'string') {
            errorMessage = authError;
          } else if (authError.code) {
            errorCode = authError.code;
            errorMessage = authError.message || `Authentication error: ${errorCode}`;
          } else if (authError.message) {
            errorMessage = authError.message;
          } else if (authError.toString && typeof authError.toString === 'function') {
            errorMessage = authError.toString();
          }
        }
        
        console.error("   Processed error details:", {
          code: errorCode,
          message: errorMessage,
          hasCode: !!authError?.code,
          hasMessage: !!authError?.message,
          isString: typeof authError === 'string',
          isObject: typeof authError === 'object',
          keys: authError && typeof authError === 'object' ? Object.keys(authError) : 'N/A'
        });
        
        // Check if this is a critical error that should stop registration
        const criticalErrors = [
          'auth/email-already-in-use',
          'auth/invalid-email', 
          'auth/operation-not-allowed'
        ];

        
        if (criticalErrors.includes(errorCode)) {
          console.error("🚫 Critical authentication error - stopping registration");
          throw new Error(`Registration failed: ${errorMessage}`);
        }
        
        // For non-critical errors (network issues, etc.), continue with registration
        // User account can be created later by admin
        console.log("⚠️ Non-critical auth error - continuing with registration process");
        console.log("📝 Note: User account will need to be created manually by admin");
        console.log("🔍 Debugging info: Check Firebase Console > Authentication > Settings to ensure Email/Password is enabled");
        
        // If auth fails but Firestore succeeded, mark the registration appropriately
        if (docRef) {
          await updateDoc(docRef, { 
            status: "auth_creation_failed",
            authError: {
              code: errorCode,
              message: errorMessage,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        // Continue with registration even if auth fails - don't throw error
        console.log("Auth failed but continuing with registration process");
        
        // Don't return here - continue with image upload and other processes
        // User can be created later by admin
        console.log("🔄 Continuing with registration process despite auth failure");
      }

      // Upload profile picture to Cloudinary if provided (MANDATORY)
      // Note: Image should already be uploaded directly during selection.
      // If Cloudinary info is present, skip upload and just persist URLs/IDs.
      console.log("🔍 CHECKING PROFILE PICTURE CONDITIONS:")
      console.log("   formData.profilePicture:", formData.profilePicture)
      console.log("   typeof formData.profilePicture:", typeof formData.profilePicture)
      console.log("   formData.profilePictureUrl:", formData.profilePictureUrl)
      console.log("   formData.profilePicturePublicId:", formData.profilePicturePublicId)
      console.log("   fileObjectInMemory:", fileObjectInMemory)
      console.log("   Condition (formData.profilePicture || fileObjectInMemory):", !!(formData.profilePicture || fileObjectInMemory))
      
      if (formData.profilePicture || fileObjectInMemory || formData.profilePictureUrl) {
        // Validate that we have proper image data and not a placeholder
        // Only reject if the MAIN url is invalid (not the previewUrl)
        if (typeof formData.profilePicture === 'object' && 
            formData.profilePicture !== null &&
            'url' in formData.profilePicture &&
            (formData.profilePicture as any).url &&
            ((formData.profilePicture as any).url?.includes('placeholder') || 
             (formData.profilePicture as any).url?.startsWith('/') ||
             (formData.profilePicture as any).url?.startsWith('blob:'))) {
          console.log("⚠️ Invalid photo URL detected:", (formData.profilePicture as any).url);
          throw new Error('Profile picture upload failed. Please upload your passport photo again before submitting.');
        }
        
        // Additional validation: Check if we have a valid Cloudinary URL
        if (typeof formData.profilePicture === 'object' && 
            formData.profilePicture !== null &&
            'url' in formData.profilePicture &&
            (formData.profilePicture as any).url &&
            (formData.profilePicture as any).url.startsWith('https://res.cloudinary.com')) {
          console.log("✅ Valid Cloudinary URL detected, proceeding with direct save");
        }
        try {
          console.log("📸 STARTING PROFILE PICTURE UPLOAD PROCESS")
          console.log("📋 Profile picture data:", {
            type: typeof formData.profilePicture,
            isFile: formData.profilePicture instanceof File,
            hasUrl: typeof formData.profilePicture === 'object' && 'url' in formData.profilePicture,
            hasFile: typeof formData.profilePicture === 'object' && 'file' in formData.profilePicture,
            hasCloudinaryId: typeof formData.profilePicture === 'object' && 'cloudinaryId' in formData.profilePicture,
            fileObjectInMemory: !!fileObjectInMemory
          })
          
          // Create a structured folder path for better organization
          // Format: student-profiles/YEAR/PROGRAM/REGISTRATION_NUMBER
          const year = new Date().getFullYear().toString()
          const programCode = formData.programme.split(' ')[0] || 'GENERAL'
          const folderPath = `student-profiles/${year}/${programCode}/${registrationNumber}`
          
          console.log("📁 Upload folder path:", folderPath)
          
          // Add student metadata as tags for better searchability
          const tags = [
            `student_id:${registrationNumber}`,
            `name:${formData.surname}_${formData.otherNames.split(' ')[0]}`,
            `program:${programCode}`,
            `year:${year}`,
            `entry_level:${formData.entryLevel}`
          ]
          
          console.log("🏷️ Upload tags:", tags)

          // Default to no file; will only upload if we need to
          let fileToUpload: File | null = null;

          // SYSTEMATIC FIX: Check ALL possible sources for photo URLs
          let finalUrl = null;
          let finalPublicId = null;
          
          console.log("🔍 SYSTEMATIC PHOTO URL DETECTION:")
          
          // Method 1: Check profilePicture.url (MOST COMMON) - PRIORITIZE CLOUDINARY
          if (typeof formData.profilePicture === 'object' && 
              formData.profilePicture !== null && 
              'url' in formData.profilePicture && 
              (formData.profilePicture as any).url && 
              typeof (formData.profilePicture as any).url === 'string' && 
              (formData.profilePicture as any).url.startsWith('https://res.cloudinary.com')) {
            finalUrl = (formData.profilePicture as any).url;
            finalPublicId = (formData.profilePicture as any).cloudinaryId || (formData.profilePicture as any).publicId;
            console.log("✅ Method 1: Found VALID Cloudinary URL in profilePicture.url")
            console.log("   URL:", finalUrl)
            console.log("   Cloudinary ID:", finalPublicId)
          }
          // Method 1b: Check profilePicture.url (other HTTP URLs)
          else if (typeof formData.profilePicture === 'object' && 
              formData.profilePicture !== null && 
              'url' in formData.profilePicture && 
              (formData.profilePicture as any).url && 
              typeof (formData.profilePicture as any).url === 'string' && 
              (formData.profilePicture as any).url.startsWith('http') &&
              !(formData.profilePicture as any).url.startsWith('blob:')) {
            finalUrl = (formData.profilePicture as any).url;
            finalPublicId = (formData.profilePicture as any).cloudinaryId || (formData.profilePicture as any).publicId;
            console.log("✅ Method 1b: Found other HTTP URL in profilePicture.url")
            console.log("   URL:", finalUrl)
            console.log("   Cloudinary ID:", finalPublicId)
          }
          // Method 2: Check top-level profilePictureUrl
          else if (formData.profilePictureUrl && 
                   typeof formData.profilePictureUrl === 'string' && 
                   formData.profilePictureUrl.startsWith('http')) {
            finalUrl = formData.profilePictureUrl;
            finalPublicId = formData.profilePicturePublicId;
            console.log("✅ Method 2: Found URL in top-level profilePictureUrl")
            console.log("   URL:", finalUrl)
            console.log("   Cloudinary ID:", finalPublicId)
          }
          // Method 3: Check profilePicture.secure_url (Cloudinary direct response)
          else if (typeof formData.profilePicture === 'object' && 
                   formData.profilePicture !== null && 
                   'secure_url' in formData.profilePicture && 
                   (formData.profilePicture as any).secure_url) {
            finalUrl = (formData.profilePicture as any).secure_url;
            finalPublicId = (formData.profilePicture as any).public_id;
            console.log("✅ Method 3: Found URL in profilePicture.secure_url")
            console.log("   URL:", finalUrl)
            console.log("   Cloudinary ID:", finalPublicId)
          }
          else {
            console.log("❌ No valid photo URLs found in any location")
          }
          
          // If we have final URLs, save them directly
          if (finalUrl) {
            console.log("💾 Saving photo URLs to Firebase...")
            
            await updateDoc(doc(db, "student-registrations", docRef.id), {
              profilePictureUrl: finalUrl,
              profilePicturePublicId: finalPublicId,
              imageUploadDate: serverTimestamp(),
              studentIdentifier: registrationNumber,
            })

            try {
              await updateDoc(doc(db, "students", registrationData.email.toLowerCase()), {
                profilePictureUrl: finalUrl,
                profilePicturePublicId: finalPublicId,
                updatedAt: serverTimestamp(),
              })
              console.log("✅ Photo URLs saved to both collections successfully")
            } catch (e) {
              console.warn("⚠️ Could not update students doc with photo URLs", e)
            }
          } else {
            // Fallback to file upload if no direct URLs found
            console.log("🔄 No direct URLs found, checking for files to upload...")
            
            if (formData.profilePicture instanceof File) {
              console.log("📄 Found File object for upload")
              fileToUpload = formData.profilePicture;
              console.log("   File details:", {
                name: fileToUpload.name,
                size: fileToUpload.size,
                type: fileToUpload.type
              })
            } else if (typeof formData.profilePicture === 'object' && formData.profilePicture !== null) {
              console.log("📦 Found custom photo object")
              const photoObj = formData.profilePicture as any

              if ('file' in formData.profilePicture && formData.profilePicture.file instanceof File) {
                console.log("📄 Found File object in custom photo object")
                fileToUpload = formData.profilePicture.file;
                console.log("   File details:", {
                  name: fileToUpload.name,
                  size: fileToUpload.size,
                  type: fileToUpload.type
                })
              } else if (photoObj?.isFileObject && fileObjectInMemory) {
                console.log("📄 This was originally a File object, using memory object for upload")
                fileToUpload = fileObjectInMemory;
              }
            }

            // If we have a file to upload, proceed with the upload
            if (fileToUpload) {
              console.log("🚀 Proceeding with Cloudinary upload...")
              console.log("   File to upload:", fileToUpload.name)

              const cloudinaryResult = await uploadToCloudinary(
                fileToUpload,
                folderPath,
                tags.join(',')
              )

              console.log("✅ Cloudinary upload successful!")
              console.log("   Secure URL:", cloudinaryResult.secure_url)
              console.log("   Public ID:", cloudinaryResult.public_id)

              try {
                await updateDoc(doc(db, "student-registrations", docRef.id), {
                  profilePictureUrl: cloudinaryResult.secure_url,
                  profilePicturePublicId: cloudinaryResult.public_id,
                  imageUploadDate: serverTimestamp(),
                  studentIdentifier: registrationNumber,
                })

                try {
                  await updateDoc(doc(db, "students", registrationData.email.toLowerCase()), {
                    profilePictureUrl: cloudinaryResult.secure_url,
                    profilePicturePublicId: cloudinaryResult.public_id,
                    updatedAt: serverTimestamp(),
                  })
                } catch (studentsUpdateByEmailError) {
                  console.warn("⚠️ Could not update students doc by email id. Will try by registrationNumber", studentsUpdateByEmailError)
                  try {
                    const { collection, query, where, getDocs } = await import("firebase/firestore")
                    const studentsRef = collection(db, "students")
                    const q = query(studentsRef, where("registrationNumber", "==", registrationNumber))
                    const snap = await getDocs(q)
                    if (!snap.empty) {
                      await updateDoc(snap.docs[0].ref, {
                        profilePictureUrl: cloudinaryResult.secure_url,
                        profilePicturePublicId: cloudinaryResult.public_id,
                        updatedAt: serverTimestamp(),
                      })
                    }
                  } catch (studentsUpdateByRegError) {
                    console.error("❌ Failed to update students collection with profile picture:", studentsUpdateByRegError)
                  }
                }
              } catch (updateError) {
                console.error("❌ Error updating document with image data:", updateError)
              }
            } else {
              // No valid file found in fallback
              console.warn("⚠️ No valid profile picture file found for upload");
              console.warn("⚠️ formData.profilePicture:", formData.profilePicture);
              console.warn("⚠️ typeof formData.profilePicture:", typeof formData.profilePicture);
              
              // Check if we have any photo URLs in the top-level form data as fallback
              let fallbackUrl = null;
              let fallbackPublicId = null;
              
              if (formData.profilePictureUrl && !formData.profilePictureUrl.includes('placeholder')) {
                fallbackUrl = formData.profilePictureUrl;
                fallbackPublicId = formData.profilePicturePublicId;
                console.log("📸 Found fallback URL in top-level form data:", fallbackUrl);
              }
              // Also check nested in profilePicture object as additional fallback
              else if (typeof formData.profilePicture === 'object' && formData.profilePicture !== null) {
                const photoObj = formData.profilePicture as any;
                if (photoObj.url && !photoObj.url.includes('placeholder')) {
                  fallbackUrl = photoObj.url;
                  fallbackPublicId = photoObj.cloudinaryId || photoObj.publicId;
                  console.log("📸 Found fallback URL in profilePicture object:", fallbackUrl);
                }
              }
              
              try {
                await updateDoc(doc(db, "student-registrations", docRef.id), {
                  profilePictureUrl: fallbackUrl,
                  profilePicturePublicId: fallbackPublicId,
                  noProfilePicture: !fallbackUrl,
                  studentIdentifier: registrationNumber,
                  photoUploadIssue: !fallbackUrl ? "No photo data found during registration" : null,
                });
                try {
                  await updateDoc(doc(db, "students", registrationData.email.toLowerCase()), {
                    profilePictureUrl: fallbackUrl,
                    profilePicturePublicId: fallbackPublicId,
                    updatedAt: serverTimestamp(),
                  })
                } catch {}
              } catch (updateError) {
                console.error("❌ Error updating document with no-image flag:", updateError)
              }
            }
          }
        } catch (uploadError: any) {
          console.error("❌ Error uploading profile picture to Cloudinary:", uploadError)
          console.error("   Error details:", {
            name: uploadError.name,
            message: uploadError.message,
            stack: uploadError.stack
          })
          
          // Log this error for monitoring
          console.error("🚨 PHOTO UPLOAD FAILURE ALERT:", {
            studentEmail: formData.email,
            studentName: `${formData.surname} ${formData.otherNames}`,
            registrationNumber: registrationNumber,
            errorMessage: uploadError.message,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
          });
          
          // Update document with detailed failure information for admin monitoring
          try {
            await updateDoc(doc(db, "student-registrations", docRef.id), {
              status: "image_upload_failed",
              uploadError: uploadError instanceof Error ? uploadError.message : "Unknown upload error",
              uploadErrorDetails: {
                timestamp: new Date(),
                errorType: uploadError.name || 'Unknown',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                fileSize: formData.profilePicture instanceof File ? formData.profilePicture.size : 'Unknown',
                fileName: formData.profilePicture instanceof File ? formData.profilePicture.name : 'Unknown'
              },
              profilePictureUrl: null,
              profilePicturePublicId: null,
              noProfilePicture: true,
              needsPhotoReupload: true,
              studentIdentifier: registrationNumber,
            })
            console.log("✅ Document updated with detailed upload error status")
            console.log("💡 Note: Student registration completed, but image upload failed")
            console.log("💡 Admin can now track and contact student for photo re-upload")
          } catch (updateError) {
            console.error("❌ Error updating document with upload error status:", updateError)
            // Continue anyway since the registration is already created
          }
        }
        // Close IF (formData.profilePicture || fileObjectInMemory)
      }
      else {
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

      console.log("✅ Registration submission completed successfully")
      return docRef.id
    } catch (firestoreError) {
      console.error("❌ Firebase error during registration:", firestoreError)
      
      // Log specific error details for debugging
      if (firestoreError instanceof Error) {
        console.error("Error name:", firestoreError.name);
        console.error("Error message:", firestoreError.message);
        console.error("Error stack:", firestoreError.stack);
      }
      
      // Check for specific Firebase errors and provide user-friendly messages
      if (firestoreError instanceof Error) {
        const errorMessage = firestoreError.message.toLowerCase();
        
        // Network connectivity issues
        if (errorMessage.includes("could not reach cloud firestore backend") || 
            errorMessage.includes("backend didn't respond") ||
            errorMessage.includes("network") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("offline")) {
          const networkMessage = getNetworkErrorMessage(firestoreError);
          throw new Error(`NETWORK_ERROR: ${networkMessage} If the problem persists, contact your IT administrator.`);
        }
        
        // Permission issues
        if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
          throw new Error("PERMISSION_ERROR: Access denied. Please check Firebase security rules or authentication status.");
        }
        
        // Quota exceeded
        if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
          throw new Error("QUOTA_ERROR: Database quota exceeded. Please contact your system administrator.");
        }
        
        // General Firebase errors
        throw new Error("DATABASE_ERROR: " + firestoreError.message);
      } else {
        throw new Error("DATABASE_ERROR: Unknown database error occurred. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error submitting registration:", error)
    throw new Error("Failed to submit registration. Please try again. " + (error instanceof Error ? error.message : ""))
  }
}

// Get student registration by ID
export async function getStudentRegistration(registrationId: string): Promise<StudentRegistration | null> {
  try {
    console.log("🔍 FIREBASE SERVICE: getStudentRegistration called with ID:", registrationId)
    
    const docRef = doc(db, "student-registrations", registrationId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log("✅ Registration document found:")
      console.log("   👤 Name:", data.surname, data.otherNames)
      console.log("   📧 Email:", data.email)
      console.log("   📋 Registration Number:", data.registrationNumber)
      console.log("   📊 Status:", data.status)
      
      const result = {
        id: docSnap.id,
        ...data,
      } as StudentRegistration
      
      console.log("🎯 FIREBASE SERVICE: Returning registration data:", result)
      return result
    } else {
      console.log("❌ Registration document not found for ID:", registrationId)
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
