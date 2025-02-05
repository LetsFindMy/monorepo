import { render as testingLibraryRender } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MantineProvider, type MantineProviderProps } from '@mantine/core';
import { theme as testTheme } from '../theme';
import type React from 'react';

type CustomRenderOptions = RenderOptions & {
  mantineProps?: Partial<MantineProviderProps>;
};

export function render(
  ui: React.ReactNode,
  { mantineProps, ...options }: CustomRenderOptions = {},
) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={testTheme} {...mantineProps}>
        {children}
      </MantineProvider>
    ),
    ...options,
  });
}
