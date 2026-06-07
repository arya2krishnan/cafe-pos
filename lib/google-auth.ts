'use client';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase-client';

export interface GoogleSignInResult {
  token: string;
  isNewCafe: boolean;
  slug?: string;
}

// Sign in with Google, then check if this user already has a cafe.
// Returns the token + whether they need to go through cafe setup.
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const token = await cred.user.getIdToken();

  const res = await fetch('/api/cafe/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    return { token, isNewCafe: false, slug: data.slug };
  }

  return { token, isNewCafe: true };
}
