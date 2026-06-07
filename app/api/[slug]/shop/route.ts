import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';

async function getOwnerIdForSlug(db: ReturnType<typeof getDb>, slug: string): Promise<string | null> {
  const slugDoc = await db.collection('slugs').doc(slug).get();
  if (!slugDoc.exists) return null;
  return (slugDoc.data() as { userId: string }).userId;
}

// GET /api/[slug]/shop — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const userId = await getOwnerIdForSlug(db, slug);
  if (!userId) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

  const shopDoc = await cafeRef(db, userId).collection('shop').doc('status').get();
  const isOpen = shopDoc.exists ? (shopDoc.data()?.isOpen ?? false) : false;
  return NextResponse.json({ isOpen });
}

// POST /api/[slug]/shop — toggle shop status (protected)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getOwnerIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const { isOpen } = await req.json();
  const cafeRoot = cafeRef(db, userId);

  await cafeRoot.collection('shop').doc('status').set({ isOpen });

  if (isOpen) {
    // Start a new store session
    const sessionRef = cafeRoot.collection('store-sessions').doc('current');
    const sessionDoc = await sessionRef.get();
    const currentStoreNumber = sessionDoc.exists ? (sessionDoc.data()?.currentStoreNumber ?? 0) : 0;
    const newStoreNumber = currentStoreNumber + 1;

    const tempSessionId = `temp-${Date.now()}`;
    await cafeRoot.collection('store-sessions').doc(tempSessionId).set({
      storeNumber: newStoreNumber,
      startTime: new Date().toISOString(),
      endTime: null,
      isActive: true,
      orderCount: 0,
      totalRevenue: 0,
      isTemporary: true,
    });
    await sessionRef.set({
      currentStoreNumber: newStoreNumber,
      currentTempSessionId: tempSessionId,
      lastUpdated: new Date().toISOString(),
    });
  } else {
    // End current store session
    const sessionDoc = await cafeRoot.collection('store-sessions').doc('current').get();
    if (sessionDoc.exists) {
      const { currentStoreNumber, currentTempSessionId } = sessionDoc.data() as any;

      if (currentTempSessionId) {
        const tempDoc = await cafeRoot.collection('store-sessions').doc(currentTempSessionId).get();
        if (tempDoc.exists) {
          const { storeNumber: sessionStoreNumber } = tempDoc.data() as any;

          const ordersSnap = await cafeRoot
            .collection('orders')
            .where('storeNumber', '==', sessionStoreNumber)
            .where('finished', '==', true)
            .get();

          const orderCount = ordersSnap.size;
          const totalRevenue = 0;

          if (orderCount > 0) {
            await cafeRoot.collection('store-sessions').doc(currentTempSessionId).update({
              endTime: new Date().toISOString(),
              isActive: false,
              isTemporary: false,
              orderCount,
              totalRevenue,
            });
            await cafeRoot.collection('store-sessions').doc('current').set({
              currentStoreNumber: sessionStoreNumber,
              currentTempSessionId: null,
              lastUpdated: new Date().toISOString(),
            });
          } else {
            await cafeRoot.collection('store-sessions').doc(currentTempSessionId).delete();
            await cafeRoot.collection('store-sessions').doc('current').set({
              currentStoreNumber: currentStoreNumber - 1,
              currentTempSessionId: null,
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ message: 'Shop status updated', isOpen });
}
