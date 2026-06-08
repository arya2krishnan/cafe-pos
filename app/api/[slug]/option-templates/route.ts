import { NextRequest, NextResponse } from 'next/server';
import { cafeRef } from '@/lib/firebase-admin';
import { verifySlugOwnership } from '@/lib/withAuth';

// GET /api/[slug]/option-templates — list saved option group templates
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const snap = await cafeRef(db, userId).collection('optionTemplates').orderBy('createdAt', 'asc').get();
  const templates = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(templates);
}

// POST /api/[slug]/option-templates — save a new option group template
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await verifySlugOwnership(req, slug);
  if (auth instanceof Response) return auth;
  const { userId, db } = auth;

  const { name, values, isMultiple } = await req.json();
  if (!name || !Array.isArray(values)) {
    return NextResponse.json({ error: 'name and values are required' }, { status: 400 });
  }

  const ref = cafeRef(db, userId).collection('optionTemplates').doc();
  const template = { name, values, isMultiple: !!isMultiple, createdAt: new Date().toISOString() };
  await ref.set(template);
  return NextResponse.json({ id: ref.id, ...template }, { status: 201 });
}
