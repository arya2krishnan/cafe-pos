import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';


// GET /api/[slug]/sessions/[storeNumber] — orders for a specific session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; storeNumber: string }> },
) {
  const { slug, storeNumber } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getUserIdForSlug(db, slug);
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
