import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';

// DELETE /api/[slug]/option-templates/[id] — remove a saved template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const ref = cafeRef(db, userId).collection('optionTemplates').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  await ref.delete();
  return NextResponse.json({ ok: true, id });
}
