
import { NextRequest, NextResponse } from 'next/server';
import { initializeAdmin } from '@/lib/firebase-admin';

const { admin, db } = initializeAdmin();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!admin || !db) {
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    // Delete user data from Firestore
    await db.collection('users').doc(userId).delete();

    // Optionally, delete user's registrations from all tournaments (more complex)
    const registrationsSnapshot = await db.collectionGroup('registrations').where('userId', '==', userId).get();
    const batch = db.batch();
    registrationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({ success: true, message: `User ${userId} deleted successfully.` });
  } catch (error: any) {
    console.error(`Failed to delete user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to delete user', details: error.message }, { status: 500 });
  }
}
