import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();

  const slugDoc = await db.collection('slugs').doc(slug).get();
  if (!slugDoc.exists) {
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }

  const { userId } = slugDoc.data() as { userId: string };
  const configDoc = await db
    .collection('cafes')
    .doc(userId)
    .collection('config')
    .doc('main')
    .get();

  if (!configDoc.exists) {
    return NextResponse.json({ error: 'Cafe config not found' }, { status: 404 });
  }

  return NextResponse.json(configDoc.data());
}
