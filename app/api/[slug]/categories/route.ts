import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';

// GET /api/[slug]/categories — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const userId = await getUserIdForSlug(db, slug);
  if (!userId) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

  const snap = await cafeRef(db, userId).collection('categories').get();
  const categories = snap.docs.map((doc) => ({ name: doc.id, ...doc.data() }));

  categories.sort((a: any, b: any) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json(categories);
}

// POST /api/[slug]/categories — protected (owner only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const { name } = await req.json();
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const trimmed = name.trim().toLowerCase();

  const catRef = cafeRef(db, userId).collection('categories').doc(trimmed);
  const existing = await catRef.get();
  if (existing.exists) {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
  }

  // Count existing categories to set displayOrder
  const countSnap = await cafeRef(db, userId).collection('categories').get();

  await catRef.set({
    name: trimmed,
    displayOrder: countSnap.size,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ name: trimmed, displayOrder: countSnap.size }, { status: 201 });
}
