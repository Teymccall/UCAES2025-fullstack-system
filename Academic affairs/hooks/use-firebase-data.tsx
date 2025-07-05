'use client';

import { useState, useEffect } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, 
  QueryConstraint, DocumentData, limit, doc,
  Firestore, DocumentSnapshot
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

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Build query constraints
    const constraints: QueryConstraint[] = [];
    
    if (options.where) {
      options.where.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }
    
    if (options.orderBy) {
      options.orderBy.forEach(([field, direction]) => {
        constraints.push(orderBy(field, direction));
      });
    }
    
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Create query
    const collectionRef = collection(db, collectionName);
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
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [...dependencies]);

  return { data, loading, error };
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