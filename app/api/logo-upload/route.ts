import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, unauthorized } from '@/lib/withAuth';
import { uploadBase64ToStorage } from '@/lib/imageUpload';

// POST /api/logo-upload — upload cafe logo during signup
export async function POST(req: NextRequest) {
  const userId = await verifyIdToken(req);
  if (!userId) return unauthorized();

  const { base64Data, filename, mimeType } = await req.json();

  if (!base64Data || !filename || !mimeType) {
    return NextResponse.json({ error: 'base64Data, filename, and mimeType are required' }, { status: 400 });
  }

  try {
    const logoUrl = await uploadBase64ToStorage(base64Data, filename, mimeType, 'cafe-logos');
    return NextResponse.json({ logoUrl });
  } catch {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }
}
