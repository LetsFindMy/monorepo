import { AppLayout } from '#/ui/app';
import Header from '#/components/header';
import { Container, rem } from '@mantine/core';

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Container mt={rem(50)}>{children}</Container>
    </>
  );
}
