'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, 
  QueryConstraint, DocumentData, limit, doc,
  Firestore, DocumentSnapshot, getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FirebaseQueryOptions = {
  where?: [string, any, any][];  // [field, operator, value][]
  orderBy?: [string, 'asc' | 'desc'][];  // [field, direction][]
  limit?: number;
}

// Hook to fetch and listen to Firestore data
export function useFirebaseData<T>(
  collectionName: string,
  options: FirebaseQueryOptions = {},
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to avoid dependency changes on every render
  const optionsRef = useRef(options);
  const collectionNameRef = useRef(collectionName);
  
  // Update refs if the inputs change
  useEffect(() => {
    optionsRef.current = options;
    collectionNameRef.current = collectionName;
  }, [options, collectionName]);

  // Build query constraints function - extracted for reuse
  const buildQueryConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    const currentOptions = optionsRef.current;
    
    if (currentOptions.where) {
      currentOptions.where.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    if (currentOptions.orderBy) {
      currentOptions.orderBy.forEach(([field, direction]) => {
        constraints.push(orderBy(field, direction));
      });
    }
    
    if (currentOptions.limit) {
      constraints.push(limit(currentOptions.limit));
    }
    
    return constraints;
  }, []); // No dependencies since we're using refs

  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    // Don't set loading state to avoid UI flicker during refresh
    try {
      const constraints = buildQueryConstraints();
      const collectionRef = collection(db, collectionNameRef.current);
      const q = constraints.length ? query(collectionRef, ...constraints) : query(collectionRef);
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      
      setData(items);
      setError(null);
      return Promise.resolve();
    } catch (err: any) {
      console.error(`Error refreshing ${collectionNameRef.current}:`, err);
      setError(err);
      return Promise.reject(err);
    }
  }, [buildQueryConstraints]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Create query
    const constraints = buildQueryConstraints();
    const collectionRef = collection(db, collectionNameRef.current);
    const q = constraints.length ? query(collectionRef, ...constraints) : query(collectionRef);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionNameRef.current}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [buildQueryConstraints, ...dependencies]);

  return { data, loading, error, refreshData };
}

// Hook to fetch and listen to a single Firestore document
export function useFirebaseDocument<T>(
  collectionName: string,
  documentId: string | null | undefined,
  dependencies: any[] = []
) {
  const [document, setDocument] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setDocument(null);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setDocument({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as T);
        } else {
          setDocument(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}/${documentId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [collectionName, documentId, ...dependencies]);

  return { document, loading, error };
}

// Hook to check if a document exists
export function useDocumentExists(
  collectionName: string, 
  fieldName: string, 
  fieldValue: string | number | boolean | null | undefined
) {
  const [exists, setExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (fieldValue === undefined || fieldValue === null) {
      setExists(false);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    // Create query to check if document exists
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(fieldName, '==', fieldValue), limit(1));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        setExists(!querySnapshot.empty);
        setLoading(false);
      },
      (err) => {
        console.error(`Error checking document existence in ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [collectionName, fieldName, fieldValue]);

  return { exists, loading, error };
} 