
import { NextResponse } from 'next/server';
import { initializeAdmin } from '@/lib/firebase-admin';

const { admin, db } = initializeAdmin();

export async function GET() {
  if (!db || !admin) {
    console.error("Firestore or Admin SDK is not initialized.");
    return NextResponse.json({ error: 'Internal Server Error: Firebase Admin is not initialized.' }, { status: 500 });
  }

  try {
    const authUsersResult = await admin.auth().listUsers();
    const authUsers = authUsersResult.users;

    if (authUsers.length === 0) {
      return NextResponse.json([]);
    }
    
    const uids = authUsers.map(u => u.uid);
    const { FieldPath } = await import('firebase-admin/firestore');

    const firestoreUsers = new Map<string, admin.firestore.DocumentData>();
    if (uids.length > 0) {
        // Firestore 'in' queries are limited to 30 UIDs at a time.
        const MAX_IN_QUERIES = 30;
        const userDocPromises = [];

        for (let i = 0; i < uids.length; i += MAX_IN_QUERIES) {
            const batchUids = uids.slice(i, i + MAX_IN_QUERIES);
            userDocPromises.push(
                db.collection('users').where(FieldPath.documentId(), 'in', batchUids).get()
            );
        }

        const userDocsSnapshots = await Promise.all(userDocPromises);
        
        userDocsSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
              firestoreUsers.set(doc.id, doc.data());
            });
        });
    }
    
    const mergedUsers = authUsers.map(authRecord => {
      const firestoreUser = firestoreUsers.get(authRecord.uid);
      
      const username = firestoreUser?.username || authRecord.displayName || authRecord.email || 'N/A';
      const photoURL = firestoreUser?.photoURL || authRecord.photoURL;

      return {
        id: authRecord.uid,
        email: authRecord.email || '',
        username: username,
        photoURL: photoURL,
        createdAt: authRecord.metadata.creationTime 
          ? { 
              _seconds: new Date(authRecord.metadata.creationTime).getTime() / 1000,
              _nanoseconds: 0 
            } 
          : undefined,
      };
    });
    
    // Sort users by creation time, newest first
    mergedUsers.sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));


    return NextResponse.json(mergedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
