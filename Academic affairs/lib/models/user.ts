// Firebase User model
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// Interface for User
interface IUser {
  uid: string;
  username: string;
  name: string;
  email: string;
  role: 'director' | 'staff' | 'admin' | 'Lecturer' | 'finance_officer' | 'exam_officer' | 'admissions_officer' | 'registrar';
  department?: string;
  position?: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  sessionToken?: string | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Firebase collection name
const COLLECTION_NAME = 'users';

// Firebase adapter for mongoose-like API
const User = {
  // Create a new user with Firebase Auth and Firestore
  create: async (userData: Partial<IUser> & { password: string }) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email || '', 
        userData.password
      );
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });
      
      const uid = userCredential.user.uid;
      
      // Create user document in Firestore
      const newUser = {
        ...userData,
        uid,
        password: undefined, // Don't store password in Firestore
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, COLLECTION_NAME, uid), newUser);
      
      return {
        ...newUser,
        id: uid
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Find one document
  findOne: async (filter: any) => {
    try {
      const usersRef = collection(db, COLLECTION_NAME);
      let q;
      
      // Handle different filter types
      if (filter.username) {
        q = query(usersRef, where('username', '==', filter.username));
      } else if (filter.email) {
        q = query(usersRef, where('email', '==', filter.email));
      } else if (filter.uid) {
        q = query(usersRef, where('uid', '==', filter.uid));
      } else if (filter._id) {
        // Get document directly by ID
        const docSnap = await getDoc(doc(db, COLLECTION_NAME, filter._id));
        if (docSnap.exists()) {
          const userData = docSnap.data() as IUser;
          return {
            ...userData,
            id: docSnap.id,
            _id: docSnap.id,
            save: async () => {
              await updateDoc(doc(db, COLLECTION_NAME, docSnap.id), {
                ...userData,
                updatedAt: new Date()
              });
              return userData;
            },
            toObject: () => ({ ...userData, _id: docSnap.id })
          };
        }
        return null;
      } else if (filter.$or) {
        // For $or queries, we need to run multiple queries
        for (const orFilter of filter.$or) {
          if (orFilter.username) {
            q = query(usersRef, where('username', '==', orFilter.username));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data() as IUser;
              const docId = snapshot.docs[0].id;
              return {
                ...userData,
                id: docId,
                _id: docId,
                save: async () => {
                  await updateDoc(doc(db, COLLECTION_NAME, docId), {
                    ...userData,
                    updatedAt: new Date()
                  });
                  return userData;
                },
                toObject: () => ({ ...userData, _id: docId })
              };
            }
          } else if (orFilter.email) {
            q = query(usersRef, where('email', '==', orFilter.email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data() as IUser;
              const docId = snapshot.docs[0].id;
              return {
                ...userData,
                id: docId,
                _id: docId,
                save: async () => {
                  await updateDoc(doc(db, COLLECTION_NAME, docId), {
                    ...userData,
                    updatedAt: new Date()
                  });
                  return userData;
                },
                toObject: () => ({ ...userData, _id: docId })
              };
            }
          }
        }
        return null;
      } else {
        return null;
      }
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const userData = snapshot.docs[0].data() as IUser;
      const docId = snapshot.docs[0].id;
      
      // Add save method to mimic mongoose document
      return {
        ...userData,
        id: docId,
        _id: docId,
        save: async () => {
          await updateDoc(doc(db, COLLECTION_NAME, docId), {
            ...userData,
            updatedAt: new Date()
          });
          return userData;
        },
        toObject: () => ({ ...userData, _id: docId })
      };
    } catch (error) {
      console.error('Error in findOne:', error);
      return null;
    }
  }
};

// Export the Firebase adapter
export default User;