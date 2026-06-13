import { NextRequest, NextResponse } from 'next/server';
import { getDb, cafeRef } from '@/lib/firebase-admin';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';
import { deleteStorageFile } from '@/lib/imageUpload';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// POST /api/cafe — create a new cafe (called after Firebase Auth signup)
export async function POST(req: NextRequest) {
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const { name, logoUrl, venmoUsername } = await req.json();

  if (!name || !venmoUsername) {
    return NextResponse.json({ error: 'name and venmoUsername are required' }, { status: 400 });
  }

  const db = getDb();
  const slug = toSlug(name);

  // Check slug uniqueness
  const existingSlug = await db.collection('slugs').doc(slug).get();
  if (existingSlug.exists) {
    // Append numeric suffix to make unique
    const suffix = Date.now().toString().slice(-4);
    const uniqueSlug = `${slug}-${suffix}`;
    return createCafe(db, userId, name, uniqueSlug, logoUrl || '', venmoUsername);
  }

  return createCafe(db, userId, name, slug, logoUrl || '', venmoUsername);
}

async function createCafe(
  db: ReturnType<typeof getDb>,
  userId: string,
  name: string,
  slug: string,
  logoUrl: string,
  venmoUsername: string,
) {
  const config = { name, slug, logoUrl, venmoUsername, userId };

  await Promise.all([
    cafeRef(db, userId).collection('config').doc('main').set(config),
    db.collection('slugs').doc(slug).set({ userId }),
    // Initialize shop as closed
    cafeRef(db, userId).collection('shop').doc('status').set({ isOpen: false }),
    // Initialize store sessions tracker
    cafeRef(db, userId).collection('store-sessions').doc('current').set({
      currentStoreNumber: 0,
      currentTempSessionId: null,
      lastUpdated: new Date().toISOString(),
    }),
  ]);

  return NextResponse.json({ slug, name }, { status: 201 });
}

// PATCH /api/cafe — update cafe config
export async function PATCH(req: NextRequest) {
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const updates = await req.json();
  const allowed = ['name', 'logoUrl', 'venmoUsername', 'customSmsMessage', 'accentColor', 'tipsEnabled', 'tipButtonEnabled', 'twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber'];
  const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

  const db = getDb();
  const configRef = cafeRef(db, userId).collection('config').doc('main');

  if (filtered.logoUrl !== undefined) {
    const currentDoc = await configRef.get();
    const oldLogoUrl: string = currentDoc.data()?.logoUrl ?? '';
    if (oldLogoUrl && oldLogoUrl !== filtered.logoUrl) {
      await deleteStorageFile(oldLogoUrl).catch(() => {});
    }
  }

  await configRef.update(filtered);
  return NextResponse.json({ ok: true });
}
