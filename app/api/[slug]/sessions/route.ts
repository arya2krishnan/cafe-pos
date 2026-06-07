import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';


// GET /api/[slug]/sessions
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getUserIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const snap = await cafeRef(db, userId).collection('store-sessions').get();
  const sessions = snap.docs
    .filter((doc) => {
      const d = doc.data();
      return doc.id !== 'current' && d.storeNumber > 0 && d.isTemporary !== true;
    })
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => (b.storeNumber || 0) - (a.storeNumber || 0));

  return NextResponse.json(sessions);
}
