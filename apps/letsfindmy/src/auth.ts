import NextAuth from 'next-auth';
import 'next-auth/jwt';
import GitHub from 'next-auth/providers/github';
import Passkey from 'next-auth/providers/passkey';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
// import Apple from "next-auth/providers/apple"
// import Discord from "next-auth/providers/discord"
// import Facebook from "next-auth/providers/facebook"
// import Google from "next-auth/providers/google"

/**
 * Storage configuration for authentication data
 * Uses Vercel KV storage in production and in-memory storage in development
 * @type {import('unstorage').Storage}
 */
const storage: import('unstorage').Storage = createStorage({
  driver: process.env.VERCEL
    ? vercelKVDriver({
        url: process.env.AUTH_KV_REST_API_URL,
        token: process.env.AUTH_KV_REST_API_TOKEN,
        env: false,
      })
    : memoryDriver(),
});

/**
 * Array of authentication providers for NextAuth
 * Currently enabled:
 * - GitHub OAuth provider
 * - Passkey (WebAuthn) provider with custom email field configuration
 * @type {Array<import("next-auth/providers").Provider>}
 */
const providers: Array<import('next-auth/providers').Provider> = [
  // Apple,
  // Discord,
  // Facebook,
  GitHub,
  // Google,
  Passkey({
    formFields: {
      email: {
        label: 'Username',
        required: true,
        autocomplete: 'username webauthn',
      },
    },
  }),
];

/**
 * NextAuth configuration and exported authentication utilities
 * @exports {Object} Authentication handlers and utilities
 * @property {Function} handlers - NextAuth API route handlers
 * @property {Function} auth - NextAuth authentication function
 * @property {Function} signIn - Sign in function
 * @property {Function} signOut - Sign out function
 */
export const { handlers, auth, signIn, signOut }: any = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
  adapter: UnstorageAdapter(storage),
  providers,
  basePath: '/auth',
  session: { strategy: 'jwt' },
  callbacks: {
    authorized: ({ request, auth }) => {
      const { pathname } = request.nextUrl;
      return pathname === '/middleware-example' ? !!auth : true;
    },
    jwt: ({ token, trigger, session, account }) => {
      if (trigger === 'update') token.name = session.user.name;
      if (account?.provider === 'keycloak') {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.accessToken) session.accessToken = token.accessToken;
      return session;
    },
  },
  experimental: { enableWebAuthn: true },
});

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
