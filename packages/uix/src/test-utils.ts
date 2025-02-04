// src/test-utils.ts
import { createMantineTest } from '@repo/testing';
import { theme } from '@repo/uix/src/theme';

export const createAppTest = () => {
  const test = createMantineTest();
  const originalRender = test.render;

  return {
    ...test,
    render: (ui: React.ReactElement, options = {}) => {
      return originalRender(ui, {
        ...options,
        mantineProps: {
          ...options.mantineProps,
          theme,
        },
      });
    },
  };
};
