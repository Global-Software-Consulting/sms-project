import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { z } from "zod";

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// NextAuth configuration
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAuth = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"].some(
        (path) => nextUrl.pathname.startsWith(path)
      );
      const isHomePage = nextUrl.pathname === "/";

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Redirect authenticated users from home to dashboard
      if (isLoggedIn && isHomePage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Protect dashboard and admin routes
      if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Redirect unauthenticated users from home to login
      if (!isLoggedIn && isHomePage) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // GitHub OAuth Provider
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    // Credentials Provider (Email/Password)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials
        const validatedFields = credentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // TODO: Replace with actual database lookup
        // This is a placeholder - implement your own user lookup logic
        // Example:
        // const user = await prisma.user.findUnique({ where: { email } });
        // if (!user || !user.password) return null;
        // const passwordMatch = await bcrypt.compare(password, user.password);
        // if (!passwordMatch) return null;
        // return user;

        // Placeholder for demo - REMOVE IN PRODUCTION
        if (email === "demo@example.com" && password === "Demo@123") {
          return {
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
            role: "user",
            emailVerified: new Date(),
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Type extensions for NextAuth
declare module "next-auth" {
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

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    emailVerified?: Date | null;
  }
}
