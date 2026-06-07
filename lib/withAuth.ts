import { NextRequest, NextResponse } from 'next/server';
import { getAuth, getDb, getUserIdForSlug } from './firebase-admin';

export interface AuthedRequest extends NextRequest {
  userId: string;
}

export async function verifyIdToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function verifySlugOwnership(
  req: NextRequest,
  slug: string,
): Promise<{ userId: string; db: ReturnType<typeof getDb> } | NextResponse> {
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();
  const db = getDb();
  const ownerId = await getUserIdForSlug(db, slug);
  if (ownerId !== userId) return unauthorized();
  return { userId, db };
}

export function stripTwilioCreds(data: Record<string, unknown>): {
  safe: Record<string, unknown>;
  hasTwilioCreds: boolean;
} {
  const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber, ...safe } = data;
  const hasTwilioCreds = !!(twilioAccountSid && twilioAuthToken && twilioPhoneNumber);
  return { safe, hasTwilioCreds };
}
