
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeAdmin } from '@/lib/firebase-admin';

const { db } = initializeAdmin();

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

export async function GET(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
  }

  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const registrationsSnapshot = await db.collectionGroup('registrations').where('userId', '==', userId).get();
    
    if (registrationsSnapshot.empty) {
      return NextResponse.json([]);
    }

    const tournamentIds = [...new Set(registrationsSnapshot.docs.map(doc => doc.data().tournamentId))];

    if (tournamentIds.length === 0) {
      return NextResponse.json([]);
    }
    
    const { FieldPath } = await import('firebase-admin/firestore');
    // Firestore 'in' queries are limited to 30 elements.
    // If a user is registered for more, we need to batch the requests.
    const MAX_IN_QUERIES = 30;
    const tournamentPromises = [];
    for (let i = 0; i < tournamentIds.length; i += MAX_IN_QUERIES) {
        const batchIds = tournamentIds.slice(i, i + MAX_IN_QUERIES);
        tournamentPromises.push(
            db.collection('tournaments').where(FieldPath.documentId(), 'in', batchIds).get()
        );
    }
    
    const tournamentSnapshots = await Promise.all(tournamentPromises);
    
    const tournaments = tournamentSnapshots.flatMap(snapshot => 
        snapshot.docs.map(doc => {
            const data = doc.data();
            // Serialize Timestamps to strings for the client
            const serializedData = {
                ...data,
                id: doc.id,
                startDate: data.startDate.toDate().toISOString(),
                endDate: data.endDate.toDate().toISOString(),
                createdAt: data.createdAt.toDate().toISOString(),
            };
            return serializedData;
        })
    );
    
    // Sort by start date, most recent first
    tournaments.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return NextResponse.json(tournaments);

  } catch (error: any) {
    console.error('Error fetching user tournaments:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments', details: error.message }, { status: 500 });
  }
}
