import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef, getUserIdForSlug } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';
import { sendText } from '@/lib/twilio';


// POST /api/[slug]/orders/[id]/finish
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const db = getDb();
  const ownerId = await getUserIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();

  const orderRef = cafeRef(db, userId).collection('orders').doc(id);
  await orderRef.update({ finished: true });

  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const order = orderDoc.data()!;
  const { customerPhone, customerName, orderNumber, textOptIn } = order;

  if (textOptIn && customerPhone) {
    const configDoc = await cafeRef(db, userId).collection('config').doc('main').get();
    const config = configDoc.data() ?? {};
    const cafeName = config.name ?? 'Your Cafe';
    const customSmsMessage = config.customSmsMessage ?? '';

    const base = `${cafeName}:\nHello ${customerName}! Your order ${orderNumber} is ready!\nHead to the counter to pick it up!`;
    const message = customSmsMessage ? `${base}\n\n${customSmsMessage}` : base;
    const textResult = await sendText(customerPhone, message);

    if (!textResult.success) {
      return NextResponse.json({ message: 'Order finished but failed to send text', textError: true });
    }
  }

  return NextResponse.json({ message: 'Order finished', textOptIn: !!textOptIn });
}
