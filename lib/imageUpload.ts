import { getStorage } from './firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function deleteStorageFile(url: string): Promise<void> {
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucket || !url) return;
  const prefix = `https://storage.googleapis.com/${storageBucket}/`;
  if (!url.startsWith(prefix)) return;
  const objectPath = decodeURIComponent(url.slice(prefix.length));
  const bucket = getStorage().bucket(storageBucket);
  try {
    await bucket.file(objectPath).delete();
  } catch {
    // already deleted or never existed — ignore
  }
}

export async function uploadBase64ToStorage(
  base64Data: string,
  filename: string,
  mimeType: string,
  storagePath: string,
): Promise<string> {
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) throw new Error('Storage not configured');

  const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(base64String, 'base64');

  const storage = getStorage();
  const bucket = storage.bucket(storageBucket);
  const uniqueFilename = `${uuidv4()}_${filename}`;
  const fileRef = bucket.file(`${storagePath}/${uniqueFilename}`);

  await fileRef.save(buffer, { metadata: { contentType: mimeType } });
  await fileRef.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${storagePath}/${uniqueFilename}`;
}
