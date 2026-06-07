import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';

async function getOwnerIdForSlug(db: ReturnType<typeof getDb>, slug: string): Promise<string | null> {
  const slugDoc = await db.collection('slugs').doc(slug).get();
  if (!slugDoc.exists) return null;
  return (slugDoc.data() as { userId: string }).userId;
}

// PUT /api/[slug]/items/[id] — update item fields (soldOut, category, displayOrder)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getOwnerIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const body = await req.json();
  const allowed = ['soldOut', 'category', 'displayOrder', 'name', 'description', 'imageUrl', 'options'];
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
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getOwnerIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const itemRef = cafeRef(db, userId).collection('items').doc(id);
  const itemDoc = await itemRef.get();
  if (!itemDoc.exists) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  await itemRef.delete();
  return NextResponse.json({ message: 'Item deleted', itemId: id });
}
