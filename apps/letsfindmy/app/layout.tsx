import '@mantine/core/styles.css';
import '#/styles/global.scss';
import './globals.css';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

import { Providers } from './providers';
import { AppLayout } from '#/ui/app';
import Header from '#/components/header';

export const metadata = {
  title: 'Mantine Next.js template',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <Providers>
          <AppLayout>
            <Header />
            <main>{children}</main>
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
