import '@mantine/core/styles.css';
import '#/styles/global.scss';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

import { Providers } from './providers';

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
          <>{children}</>
        </Providers>
      </body>
    </html>
  );
}
