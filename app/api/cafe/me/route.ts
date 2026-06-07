import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';

// GET /api/cafe/me — return the current user's cafe config (used after login to get slug)
export async function GET(req: NextRequest) {
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const configDoc = await cafeRef(db, userId).collection('config').doc('main').get();

  if (!configDoc.exists) {
    return NextResponse.json({ error: 'No cafe found for this account' }, { status: 404 });
  }

  return NextResponse.json(configDoc.data());
}
