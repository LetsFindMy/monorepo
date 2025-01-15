import { auth } from '#/auth';
import ClientExample from '#/components/client-example';
import { SessionProvider } from 'next-auth/react';

export default async function ClientPage() {
  return (
    <>
      <ClientExample />
    </>
  );
}
