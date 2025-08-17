import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, collections } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export function useLecturerAuthGuard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        router.replace("/login?error=not-logged-in");
        return;
      }
      // Fetch user doc from Firestore
      const userDoc = await getDoc(doc(db, collections.users, user.uid));
      if (!userDoc.exists()) {
        setError("User record not found.");
        await signOut(auth);
        router.replace("/login?error=user-not-found");
        setLoading(false);
        return;
      }
      const userData = userDoc.data();
      if (
        userData.role !== "Lecturer" ||
        (userData.status && userData.status !== "active")
      ) {
        setError("Access denied. Only active lecturers can use this platform.");
        await signOut(auth);
        router.replace("/login?error=not-lecturer-or-inactive");
        setLoading(false);
        return;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  return { loading, error };
} 