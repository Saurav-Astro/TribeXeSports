
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { initializeAdmin } from '@/lib/firebase-admin';

const { db } = initializeAdmin();

export async function POST(req: NextRequest) {
  if (!db) {
    console.error("Firestore is not initialized. Check admin initialization logic.");
    return NextResponse.json({ success: false, error: 'Internal Server Error: Firestore is not initialized.' }, { status: 500 });
  }

  try {
    const data = await req.formData();
    const tournamentId = data.get('tournamentId') as string;
    const userId = data.get('userId') as string | null;
    const registrationFieldsString = data.get('registrationFields') as string;
    
    // All custom field data (excluding files) is sent as a single stringified object.
    const customDataString = data.get('customData') as string;

    if (!tournamentId || !registrationFieldsString || !customDataString || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required form data or user not authenticated.' }, { status: 400 });
    }

    const registrationFields = JSON.parse(registrationFieldsString);
    // This contains the non-file custom field values.
    const customData = JSON.parse(customDataString);
    
    const finalCustomData: Record<string, any> = { ...customData };

    // Process file uploads and add their URLs to the final data object.
    for (const field of registrationFields) {
      if (field.type === 'file' || field.type === 'screenshot') {
        const fieldName = field.name;
        const file = data.get(fieldName) as File | null;
        
        if (file) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Define a unique filename and path within the public directory.
          const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
          const uploadDir = join(process.cwd(), 'public', 'uploads');
          const path = join(uploadDir, filename);

          // Ensure the directory exists and write the file.
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path, buffer);
          
          // Store the public URL in our data object.
          finalCustomData[fieldName] = `/uploads/${filename}`;
        } else if (field.required) {
          // If a required file is missing, reject the request.
          return NextResponse.json({ success: false, error: `Required file for ${fieldName} is missing.` }, { status: 400 });
        }
      }
    }
    
    const { FieldValue } = await import('firebase-admin/firestore');

    const registrationPayload = {
        tournamentId: tournamentId,
        customData: finalCustomData,
        userId: userId,
        registeredAt: FieldValue.serverTimestamp(),
    };

    const registrationRef = await db.collection('tournaments').doc(tournamentId).collection('registrations').add(registrationPayload);

    return NextResponse.json({ success: true, registrationId: registrationRef.id });

  } catch (error: any) {
    console.error('Error processing registration:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process registration.' }, { status: 500 });
  }
}
