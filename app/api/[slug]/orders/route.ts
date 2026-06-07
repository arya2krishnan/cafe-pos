import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';

async function getOwnerIdForSlug(db: ReturnType<typeof getDb>, slug: string): Promise<string | null> {
  const slugDoc = await db.collection('slugs').doc(slug).get();
  if (!slugDoc.exists) return null;
  return (slugDoc.data() as { userId: string }).userId;
}

// GET /api/[slug]/orders?type=unfinished|completed
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getOwnerIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const type = req.nextUrl.searchParams.get('type') || 'unfinished';
  const finished = type === 'completed';

  const snap = await cafeRef(db, userId).collection('orders').where('finished', '==', finished).get();
  const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(orders);
}

// POST /api/[slug]/orders — place a new order (public)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const userId = await getOwnerIdForSlug(db, slug);
  if (!userId) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

  const body = await req.json();
  const { orderNumber, customerName, customerPhone, items, totalAmount, donation, orderDate, textOptIn } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
  }
  if ((!customerName || customerName.trim() === '') && (!customerPhone || customerPhone.trim() === '')) {
    return NextResponse.json({ error: 'Either customer name or phone number is required' }, { status: 400 });
  }

  // Get current store number
  const sessionDoc = await cafeRef(db, userId).collection('store-sessions').doc('current').get();
  const storeNumber = sessionDoc.exists ? (sessionDoc.data()?.currentStoreNumber ?? 0) : 0;

  const orderRef = cafeRef(db, userId).collection('orders').doc();
  const orderId = orderRef.id;

  await orderRef.set({
    id: orderId,
    orderNumber,
    customerName: customerName || '',
    customerPhone: customerPhone || '',
    items,
    totalAmount,
    donation,
    orderDate,
    textOptIn,
    finished: false,
    storeNumber,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ message: 'Order created', orderId, orderNumber, storeNumber }, { status: 201 });
}
