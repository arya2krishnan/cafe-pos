import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';

// PUT /api/[slug]/categories/[name] — rename a category
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  const { slug, name } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const { newName } = await req.json();
  if (!newName || typeof newName !== 'string' || !newName.trim()) {
    return NextResponse.json({ error: 'newName is required' }, { status: 400 });
  }
  const trimmed = newName.trim().toLowerCase();

  const cafe = cafeRef(db, userId);
  const oldRef = cafe.collection('categories').doc(name);
  const oldDoc = await oldRef.get();
  if (!oldDoc.exists) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  const newRef = cafe.collection('categories').doc(trimmed);
  const newDoc = await newRef.get();
  if (newDoc.exists) return NextResponse.json({ error: 'A category with that name already exists' }, { status: 409 });

  const oldData = oldDoc.data()!;
  await newRef.set({ ...oldData, name: trimmed });

  // Migrate all items in the old category to the new name (500-op Firestore batch limit)
  const itemsSnap = await cafe.collection('items').where('category', '==', name).get();
  const BATCH_SIZE = 490;
  for (let i = 0; i < itemsSnap.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    itemsSnap.docs.slice(i, i + BATCH_SIZE).forEach((doc) => batch.update(doc.ref, { category: trimmed }));
    await batch.commit();
  }

  await oldRef.delete();
  return NextResponse.json({ ok: true, oldName: name, newName: trimmed });
}

// PATCH /api/[slug]/categories/[name] — update category fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  const { slug, name } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const body = await req.json();
  const allowed = ['archived', 'displayOrder'];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const catRef = cafeRef(db, userId).collection('categories').doc(name);
  const catDoc = await catRef.get();
  if (!catDoc.exists) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  await catRef.update(updates);
  return NextResponse.json({ ok: true, name, ...updates });
}

// DELETE /api/[slug]/categories/[name] — destructive: deletes all items in category then the category doc
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  const { slug, name } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const cafe = cafeRef(db, userId);
  const catRef = cafe.collection('categories').doc(name);
  const catDoc = await catRef.get();
  if (!catDoc.exists) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  // Batch-delete all items in this category
  const itemsSnap = await cafe.collection('items').where('category', '==', name).get();

  // Firestore batches max 500 ops — chunk if needed
  const BATCH_SIZE = 490;
  let deletedCount = 0;

  for (let i = 0; i < itemsSnap.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = itemsSnap.docs.slice(i, i + BATCH_SIZE);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deletedCount += chunk.length;
  }

  // Delete the category doc itself
  await catRef.delete();

  return NextResponse.json({ deleted: deletedCount, category: name });
}
