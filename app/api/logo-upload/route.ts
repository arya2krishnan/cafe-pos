import { NextRequest, NextResponse } from 'next/server';
import { getDb, getStorage, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';
import { v4 as uuidv4 } from 'uuid';

// POST /api/logo-upload — upload cafe logo during signup
export async function POST(req: NextRequest) {
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const { base64Data, filename, mimeType } = await req.json();

  if (!base64Data || !filename || !mimeType) {
    return NextResponse.json({ error: 'base64Data, filename, and mimeType are required' }, { status: 400 });
  }

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });

  const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(base64String, 'base64');

  const storage = getStorage();
  const bucket = storage.bucket(storageBucket);
  const uniqueFilename = `${uuidv4()}_${filename}`;
  const fileRef = bucket.file(`cafe-logos/${uniqueFilename}`);

  await fileRef.save(buffer, { metadata: { contentType: mimeType } });
  await fileRef.makePublic();

  const logoUrl = `https://storage.googleapis.com/${bucket.name}/cafe-logos/${uniqueFilename}`;
  return NextResponse.json({ logoUrl });
}
