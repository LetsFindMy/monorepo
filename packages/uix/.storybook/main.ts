// .storybook/main.ts

export const logLevel = 'debug';

export const stories = [
  '../src/**/*.mdx',
  '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
];

export const staticDirs = ['../public'];

export const framework = {
  name: '@storybook/nextjs',
  options: {},
} as const;

export const docs = {
  autodocs: true,
  defaultName: 'Documentation',
} as const;

export const addons = [
  '@storybook/addon-docs',
  '@storybook/addon-essentials',
  'storybook-dark-mode',
] as const;

export const typescript = {
  reactDocgen: 'react-docgen',
  check: false,
} as const;

export const webpackFinal = async (config: any) => {
  // Find the sass-loader rule
  const sassRule = config.module.rules.find(
    (rule: any) => rule.test && rule.test.test('.scss'),
  );

  // Update or add the sass-loader configuration
  if (sassRule) {
    sassRule.use = sassRule.use.map((loader: any) => {
      if (loader.loader && loader.loader.includes('sass-loader')) {
        return {
          loader: loader.loader,
          options: {
            implementation: require('sass-embedded'),
            sassOptions: {
              includePaths: ['./src/styles'],
            },
            additionalData: `@import "./src/styles/_mantine.scss";`,
          },
        };
      }
      return loader;
    });
  }

  return config;
};

export const core = {
  disableTelemetry: true,
} as const;
