
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;
  const folder = data.get('folder') as string || 'Tournament_photos'; // Default to 'Tournament_photos'

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Use a timestamp and the original file name to create a unique file name
  const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  
  // Define the path to the public directory based on the folder
  const uploadDir = join(process.cwd(), 'public', folder);
  const path = join(uploadDir, filename);

  try {
    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });
    // Write the file to the public directory
    await writeFile(path, buffer);
    
    console.log(`File uploaded to ${path}`);

    // Return the public URL of the file
    const url = `/${folder}/${filename}`;
    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file.' }, { status: 500 });
  }
}
