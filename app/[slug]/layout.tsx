import { CafeProvider } from '@/components/CafeProvider';
import { CafeThemeApplier } from '@/components/CafeThemeApplier';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getDb } from '@/lib/firebase-admin';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const db = getDb();
    const slugDoc = await db.collection('slugs').doc(slug).get();
    if (!slugDoc.exists) return defaultMeta(slug);

    const { userId } = slugDoc.data() as { userId: string };
    const configDoc = await db.collection('cafes').doc(userId).collection('config').doc('main').get();
    if (!configDoc.exists) return defaultMeta(slug);

    const config = configDoc.data()!;
    return {
      title: config.name,
      icons: {
        icon: config.logoUrl || '/favicon-default.svg',
      },
    };
  } catch {
    return defaultMeta(slug);
  }
}

function defaultMeta(slug: string): Metadata {
  return {
    title: slug,
    icons: { icon: '/favicon-default.svg' },
  };
}

export default function SlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return (
    <SlugLayoutInner params={params}>
      {children}
    </SlugLayoutInner>
  );
}

async function SlugLayoutInner({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <CafeProvider slug={slug}>
      <CafeThemeApplier>{children}</CafeThemeApplier>
    </CafeProvider>
  );
}
