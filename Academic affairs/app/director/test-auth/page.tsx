'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AuthDebug } from '@/components/auth-debug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestAuthPage() {
  const { user, refreshAuth } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testFirestoreAccess = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test academic-programs
      try {
        const programsRef = collection(db, 'academic-programs');
        const programsSnapshot = await getDocs(programsRef);
        results.programs = { success: true, count: programsSnapshot.size };
      } catch (error) {
        results.programs = { success: false, error: error.message };
      }

      // Test academic-courses
      try {
        const coursesRef = collection(db, 'academic-courses');
        const coursesSnapshot = await getDocs(coursesRef);
        results.courses = { success: true, count: coursesSnapshot.size };
      } catch (error) {
        results.courses = { success: false, error: error.message };
      }

      // Test academic-staff
      try {
        const staffRef = collection(db, 'academic-staff');
        const staffSnapshot = await getDocs(staffRef);
        results.staff = { success: true, count: staffSnapshot.size };
      } catch (error) {
        results.staff = { success: false, error: error.message };
      }

      // Test academic-semesters
      try {
        const semestersRef = collection(db, 'academic-semesters');
        const semestersSnapshot = await getDocs(semestersRef);
        results.semesters = { success: true, count: semestersSnapshot.size };
      } catch (error) {
        results.semesters = { success: false, error: error.message };
      }

      // Test admission-applications
      try {
        const applicationsRef = collection(db, 'admission-applications');
        const applicationsSnapshot = await getDocs(applicationsRef);
        results.applications = { success: true, count: applicationsSnapshot.size };
      } catch (error) {
        results.applications = { success: false, error: error.message };
      }

    } catch (error) {
      console.error('Test error:', error);
    }

    setTestResults(results);
    setLoading(false);
  };

  const handleRefreshAuth = async () => {
    await refreshAuth();
    setTimeout(testFirestoreAccess, 1000); // Wait a bit for auth to settle
  };

  useEffect(() => {
    if (user) {
      testFirestoreAccess();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Authentication Test</h1>
        <div className="space-x-2">
          <Button onClick={handleRefreshAuth} disabled={loading}>
            Refresh Auth & Test
          </Button>
          <Button onClick={testFirestoreAccess} variant="outline" disabled={loading}>
            Test Firestore
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuthDebug />

        <Card>
          <CardHeader>
            <CardTitle>Firestore Access Test</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Testing...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(testResults).map(([collection, result]: [string, any]) => (
                  <div key={collection} className="flex justify-between items-center">
                    <span className="font-medium capitalize">{collection}:</span>
                    {result.success ? (
                      <Badge variant="default">✅ {result.count} docs</Badge>
                    ) : (
                      <Badge variant="destructive">❌ {result.error}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Firebase Auth State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Current User:</strong> {auth.currentUser ? auth.currentUser.uid : 'None'}
            </div>
            <div>
              <strong>Auth State:</strong> {auth.currentUser ? 'Signed In' : 'Not Signed In'}
            </div>
            <div>
              <strong>Context User:</strong> {user ? `${user.username} (${user.role})` : 'None'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


