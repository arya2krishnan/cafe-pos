import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';


// GET /api/[slug]/items — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const userId = await getUserIdForSlug(db, slug);
  if (!userId) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

  const items = await cafeRef(db, userId).collection('items').get();
  const itemsData = items.docs.map((doc) => ({
    ...doc.data(),
    soldOut: doc.data().soldOut ?? false,
    displayOrder: doc.data().displayOrder ?? 999,
  }));

  itemsData.sort((a: any, b: any) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return (a.name || '').localeCompare(b.name || '');
  });

  return NextResponse.json(itemsData);
}

// POST /api/[slug]/items — protected (owner only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  // Verify the token belongs to this cafe's owner
  const db = getDb();
  const ownerId = await getUserIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const { name, description, options, category } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  let parsedOptions = options;
  if (typeof options === 'string') {
    try { parsedOptions = JSON.parse(options); } catch { parsedOptions = []; }
  }

  const itemRef = cafeRef(db, userId).collection('items').doc();
  const itemId = itemRef.id;
  const itemData: Record<string, any> = {
    id: itemId,
    name,
    imageUrl: '',
    category: category || 'misc',
    displayOrder: 999,
    createdAt: new Date().toISOString(),
    soldOut: false,
  };
  if (description !== undefined) itemData.description = description || '';
  if (parsedOptions !== undefined) itemData.options = parsedOptions || [];

  await itemRef.set(itemData);

  return NextResponse.json({ itemId, item: itemData }, { status: 201 });
}
