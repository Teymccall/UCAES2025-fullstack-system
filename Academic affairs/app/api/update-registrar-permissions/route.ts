import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { getPermissionsByRole } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Updating registrar permissions...')
    
    // Get the updated permissions for registrar role
    const newPermissions = getPermissionsByRole('registrar')
    console.log('📋 New registrar permissions:', newPermissions)
    
    // Find the mensah user document
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', 'mensah'))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'User "mensah" not found' },
        { status: 404 }
      )
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    console.log('👤 Current user data:', {
      id: userDoc.id,
      username: userData.username,
      role: userData.role,
      currentPermissions: userData.permissions || []
    })
    
    // Update the user's permissions
    await updateDoc(doc(db, 'users', userDoc.id), {
      permissions: newPermissions,
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ Registrar permissions updated successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Registrar permissions updated successfully',
      newPermissions,
      user: {
        id: userDoc.id,
        username: userData.username,
        role: userData.role
      }
    })
    
  } catch (error) {
    console.error('❌ Error updating registrar permissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update registrar permissions',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
