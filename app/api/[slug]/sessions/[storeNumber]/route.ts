import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';

async function getOwnerIdForSlug(db: ReturnType<typeof getDb>, slug: string): Promise<string | null> {
  const slugDoc = await db.collection('slugs').doc(slug).get();
  if (!slugDoc.exists) return null;
  return (slugDoc.data() as { userId: string }).userId;
}

// GET /api/[slug]/sessions/[storeNumber] — orders for a specific session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; storeNumber: string }> },
) {
  const { slug, storeNumber } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getOwnerIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const storeNum = parseInt(storeNumber);
  const snap = await cafeRef(db, userId)
    .collection('orders')
    .where('finished', '==', true)
    .where('storeNumber', '==', storeNum)
    .get();

  const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(orders);
}
