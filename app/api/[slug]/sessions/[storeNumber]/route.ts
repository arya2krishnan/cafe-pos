import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';


// GET /api/[slug]/sessions/[storeNumber] — orders for a specific session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; storeNumber: string }> },
) {
  const { slug, storeNumber } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const storeNum = parseInt(storeNumber);
  const snap = await cafeRef(db, userId)
    .collection('orders')
    .where('finished', '==', true)
    .where('storeNumber', '==', storeNum)
    .get();

  const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(orders);
}
