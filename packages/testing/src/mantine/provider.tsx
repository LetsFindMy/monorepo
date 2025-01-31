import { MantineProvider, type MantineProviderProps } from '@mantine/core';
import { testTheme, getColorSchemeValue } from './theme';
import React from 'react';

export type TestProviderProps = Partial<MantineProviderProps>;

export const TestProvider = ({ children, ...props }: TestProviderProps) => {
  return (
    <MantineProvider
      theme={testTheme}
      colorScheme={getColorSchemeValue(props.colorScheme)}
      {...props}
    >
      {children}
    </MantineProvider>
  );
};
