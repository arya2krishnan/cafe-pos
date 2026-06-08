import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';


// GET /api/[slug]/items — public
// Add ?all=true to include archived items (admin only — no auth required but hidden by default)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const includeArchived = req.nextUrl.searchParams.get('all') === 'true';

  const db = getDb();
  const userId = await getUserIdForSlug(db, slug);
  if (!userId) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

  const cafe = cafeRef(db, userId);
  const itemsSnap = await cafe.collection('items').get();
  let itemsData: any[] = itemsSnap.docs.map((doc) => ({
    ...doc.data(),
    soldOut: doc.data().soldOut ?? false,
    displayOrder: doc.data().displayOrder ?? 999,
    archived: doc.data().archived ?? false,
  }));

  if (!includeArchived) {
    // Filter out individually archived items
    itemsData = itemsData.filter((item) => !item.archived);

    // Also filter out items whose category is archived
    const archivedCatsSnap = await cafe.collection('categories').where('archived', '==', true).get();
    if (!archivedCatsSnap.empty) {
      const archivedNames = new Set(archivedCatsSnap.docs.map((d) => d.id));
      itemsData = itemsData.filter((item) => !archivedNames.has(item.category));
    }
  }

  itemsData.sort((a: any, b: any) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return (a.name || '').localeCompare(b.name || '');
  });

  return NextResponse.json(itemsData);
}

// POST /api/[slug]/items — protected (owner only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const { name, description, options, category, allowSpecialRequests } = await req.json();

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
  if (allowSpecialRequests !== undefined) itemData.allowSpecialRequests = !!allowSpecialRequests;

  await itemRef.set(itemData);

  return NextResponse.json({ itemId, item: itemData }, { status: 201 });
}
