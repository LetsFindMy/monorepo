import { AppLayout } from '#/ui/app';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LetsFindMy',
  description: "Find your fandom's merch.",
};

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <main>{children}</main>
    </AppLayout>
  );
}
