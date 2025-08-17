'use client';

import { useAuth } from './auth-context';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthDebug() {
  const { user, loading, error, refreshAuth } = useAuth();

  const checkFirebaseAuth = () => {
    const currentUser = auth.currentUser;
    console.log('Current Firebase Auth user:', currentUser);
    return currentUser;
  };

  const handleRefreshAuth = async () => {
    await refreshAuth();
    checkFirebaseAuth();
  };

  const firebaseUser = checkFirebaseAuth();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Context State:</h4>
          <div className="space-y-1 text-sm">
            <div>Loading: <Badge variant={loading ? "default" : "secondary"}>{loading ? "Yes" : "No"}</Badge></div>
            <div>User: <Badge variant={user ? "default" : "secondary"}>{user ? "Logged In" : "Not Logged In"}</Badge></div>
            {error && <div>Error: <Badge variant="destructive">{error}</Badge></div>}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Firebase Auth State:</h4>
          <div className="space-y-1 text-sm">
            <div>Firebase User: <Badge variant={firebaseUser ? "default" : "secondary"}>{firebaseUser ? "Signed In" : "Not Signed In"}</Badge></div>
            {firebaseUser && (
              <div>UID: <span className="font-mono text-xs">{firebaseUser.uid}</span></div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleRefreshAuth} className="w-full">
            Refresh Firebase Auth
          </Button>
          <Button onClick={checkFirebaseAuth} variant="outline" className="w-full">
            Check Firebase Auth
          </Button>
        </div>

        {user && (
          <div className="text-xs bg-gray-100 p-2 rounded">
            <div><strong>Stored User:</strong></div>
            <div>Username: {user.username}</div>
            <div>Role: {user.role}</div>
            <div>Status: {user.status}</div>
            <div>Has Custom Token: {user.customToken ? "Yes" : "No"}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


