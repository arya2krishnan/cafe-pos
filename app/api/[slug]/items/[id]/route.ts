import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';
import { deleteStorageFile } from '@/lib/imageUpload';


// PUT /api/[slug]/items/[id] — update item fields (soldOut, category, displayOrder)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const body = await req.json();
  const allowed = ['soldOut', 'archived', 'category', 'displayOrder', 'name', 'description', 'imageUrl', 'options', 'allowSpecialRequests'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const itemRef = cafeRef(db, userId).collection('items').doc(id);
  const itemDoc = await itemRef.get();
  if (!itemDoc.exists) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  await itemRef.update(updates);
  return NextResponse.json({ ok: true, itemId: id, ...updates });
}

// DELETE /api/[slug]/items/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const itemRef = cafeRef(db, userId).collection('items').doc(id);
  const itemDoc = await itemRef.get();
  if (!itemDoc.exists) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  const imageUrl: string = itemDoc.data()?.imageUrl ?? '';
  await itemRef.delete();
  if (imageUrl) await deleteStorageFile(imageUrl).catch(() => {});
  return NextResponse.json({ message: 'Item deleted', itemId: id });
}
