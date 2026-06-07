import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserIdForSlug } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();

  const userId = await getUserIdForSlug(db, slug);
  if (!userId) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

  const configDoc = await db
    .collection('cafes')
    .doc(userId)
    .collection('config')
    .doc('main')
    .get();

  if (!configDoc.exists) {
    return NextResponse.json({ error: 'Cafe config not found' }, { status: 404 });
  }

  const response = NextResponse.json(configDoc.data());
  // Cache for 5 minutes at the CDN — cafe config rarely changes
  response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  return response;
}
