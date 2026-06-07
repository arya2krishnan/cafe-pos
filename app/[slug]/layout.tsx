import { CafeProvider } from '@/components/CafeProvider';
import { CafeThemeApplier } from '@/components/CafeThemeApplier';
import { ReactNode } from 'react';

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
