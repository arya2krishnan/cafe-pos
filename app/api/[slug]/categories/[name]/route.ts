import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';

// PATCH /api/[slug]/categories/[name] — update category fields (currently: archived)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  const { slug, name } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const body = await req.json();
  const allowed = ['archived'];
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
