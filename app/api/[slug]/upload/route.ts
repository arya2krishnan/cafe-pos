import { NextRequest, NextResponse } from 'next/server';
import { getDb, getStorage, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';
import { v4 as uuidv4 } from 'uuid';

async function getOwnerIdForSlug(db: ReturnType<typeof getDb>, slug: string): Promise<string | null> {
  const slugDoc = await db.collection('slugs').doc(slug).get();
  if (!slugDoc.exists) return null;
  return (slugDoc.data() as { userId: string }).userId;
}

// POST /api/[slug]/upload — base64 image upload for an item
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getOwnerIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const { itemId, base64Data, filename, mimeType } = await req.json();

  if (!base64Data || !filename || !mimeType || !itemId) {
    return NextResponse.json({ error: 'itemId, base64Data, filename, and mimeType are required' }, { status: 400 });
  }

  // Verify item exists
  const itemDoc = await cafeRef(db, userId).collection('items').doc(itemId).get();
  if (!itemDoc.exists) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  // Strip data URI prefix if present
  const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(base64String, 'base64');

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });

  const storage = getStorage();
  const bucket = storage.bucket(storageBucket);
  const uniqueFilename = `${uuidv4()}_${filename}`;
  const fileRef = bucket.file(`product-images/${uniqueFilename}`);

  await fileRef.save(buffer, { metadata: { contentType: mimeType } });
  await fileRef.makePublic();

  const imageUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${uniqueFilename}`;

  await cafeRef(db, userId).collection('items').doc(itemId).update({ imageUrl });

  return NextResponse.json({ imageUrl });
}
