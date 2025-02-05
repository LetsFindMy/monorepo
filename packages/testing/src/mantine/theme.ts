import { createTheme, MantineColorScheme } from '@mantine/core';

export const testTheme = createTheme({
  primaryColor: 'blue',
  // Add your default theme settings here
});

export const getColorSchemeValue = (colorScheme?: MantineColorScheme) =>
  colorScheme ?? 'light';
