// import { SessionProvider } from 'next-auth/react'; // TODO: Uncomment this line
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { PathProvider } from '#/lib/pathContext';
import { SessionProvider } from 'next-auth/react';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from 'react';
import { theme } from '#/styles/theme';
import { auth } from '#/auth';

export async function Providers({ children }: { children: ReactNode }) {
  const session = await auth();
  if (session?.user) {
    // TODO: Look into https://react.dev/reference/react/experimental_taintObjectReference
    // filter out sensitive data before passing to client.
    session.user = {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
  }

  return (
    <SessionProvider basePath={'/auth'} session={session}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <PathProvider>
            <>{children}</>
          </PathProvider>

          <Notifications />
        </ModalsProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
