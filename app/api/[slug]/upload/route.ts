import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';
import { uploadBase64ToStorage, deleteStorageFile } from '@/lib/imageUpload';


// POST /api/[slug]/upload — base64 image upload for an item
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const { itemId, base64Data, filename, mimeType } = await req.json();

  if (!base64Data || !filename || !mimeType || !itemId) {
    return NextResponse.json({ error: 'itemId, base64Data, filename, and mimeType are required' }, { status: 400 });
  }

  const itemDoc = await cafeRef(db, userId).collection('items').doc(itemId).get();
  if (!itemDoc.exists) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  try {
    const oldImageUrl: string = itemDoc.data()?.imageUrl ?? '';
    const imageUrl = await uploadBase64ToStorage(base64Data, filename, mimeType, 'product-images');
    if (oldImageUrl) await deleteStorageFile(oldImageUrl).catch(() => {});
    await cafeRef(db, userId).collection('items').doc(itemId).update({ imageUrl });
    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }
}
