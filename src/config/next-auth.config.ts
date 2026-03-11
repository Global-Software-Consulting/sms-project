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
        // Validate credentials
        const validatedFields = credentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // TODO: Replace with actual database lookup
        // Placeholder for demo - REMOVE IN PRODUCTION
        if (email === 'demo@example.com' && password === 'Demo@123') {
          return {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            role: 'user',
            emailVerified: new Date(),
          };
        }

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
