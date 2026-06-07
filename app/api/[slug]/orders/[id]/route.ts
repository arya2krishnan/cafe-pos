import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';


// DELETE /api/[slug]/orders/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getUserIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  await cafeRef(db, userId).collection('orders').doc(id).delete();
  return NextResponse.json({ message: 'Order deleted' });
}
