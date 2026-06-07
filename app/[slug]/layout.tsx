import { CafeProvider } from '@/components/CafeProvider';
import { ReactNode } from 'react';

export default function SlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  // params is a Promise in Next.js 15 — CafeProvider will receive the resolved slug
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
  return <CafeProvider slug={slug}>{children}</CafeProvider>;
}
