import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole, PERMISSIONS } from './permissions';

interface AuthenticatedUser {
  uid: string;
  role: UserRole;
  permissions: string[];
}

// Function to get user from request headers
async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  const userId = request.headers.get('x-user-id');
  if (!userId) return null;

  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;

  const userData = userDoc.data();
  return {
    uid: userId,
    role: userData.role as UserRole,
    permissions: userData.permissions || [],
  };
}

// Higher-order function to protect API routes
export function withAuthorization(requiredPermission: keyof typeof PERMISSIONS) {
  return function (handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
    return async function (request: NextRequest) {
      const user = await getUserFromRequest(request);

      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      if (user.role !== 'director' && !user.permissions.includes(requiredPermission)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      return handler(request, user);
    };
  };
}