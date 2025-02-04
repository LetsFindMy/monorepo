// import { analytics } from '@repo/analytics/posthog/server';
// import { auth } from '@repo/auth/server';
import { flag } from '@vercel/flags/next';

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      // const { userId } = await auth();
      const userId = 1;

      if (!userId) {
        return this.defaultValue as boolean;
      }

      // const isEnabled = await analytics.isFeatureEnabled(key, userId);
      const isEnabled = false;

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });
