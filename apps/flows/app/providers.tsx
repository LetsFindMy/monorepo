'use client';

// import { SessionProvider } from 'next-auth/react'; // TODO: Uncomment this line
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { PathProvider } from '#/lib/pathContext';
import { Notifications } from '@mantine/notifications';
import { ReactFlowProvider } from '@xyflow/react';
import { ReactNode } from 'react';
import { theme } from '#/styles/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <PathProvider>
            <ReactFlowProvider>{children}</ReactFlowProvider>
          </PathProvider>

          <Notifications />
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}
