import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { z } from 'zod';

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
    verifyRequest: '/auth/verify-email',
    newUser: '/auth/signup',
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role as
          | string
          | undefined;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as Record<string, unknown>).id = token.id as string;
        (session.user as Record<string, unknown>).role = token.role as string;
        (session.user as Record<string, unknown>).emailVerified =
          token.emailVerified as Date | null;
      }
      return session;
    },
  },
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),

    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Shape validation only — this provider is intentionally a no-op.
        //
        // Real authentication for this project flows through `apiClient` +
        // `tokenStorage` against the sms-api backend, not NextAuth. This
        // entire file is dormant scaffolding kept in case the project ever
        // migrates to a NextAuth-backed login. Until then this authorize
        // callback MUST NEVER return a User — doing so would create a
        // backdoor that bypasses the real auth server.
        //
        // A previous version of this file accepted the literal credentials
        // `demo@example.com` / `Demo@123` and returned a fake user. That
        // backdoor is removed here. If you wire NextAuth in the future,
        // replace this body with a real database lookup AND a real password
        // hash check (bcrypt/argon2). Do not re-introduce literal-string
        // matching.
        credentialsSchema.safeParse(credentials);
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      emailVerified?: Date | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    emailVerified?: Date | null;
  }
}
