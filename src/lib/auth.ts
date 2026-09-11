import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';
import { DEMO_USERS } from '@/lib/demoUsers';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Official Staff Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password.');
        }

        const loginInput = credentials.email.trim().toLowerCase();

        // 1. Check Demo Accounts for instant zero-setup authentication
        const demoMatch = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === loginInput
        );

        if (demoMatch) {
          if (credentials.password === demoMatch.password) {
            return {
              id: demoMatch.id,
              name: demoMatch.name,
              email: demoMatch.email,
              role: demoMatch.role,
              department: demoMatch.department || null,
            };
          }
        }

        // 2. Query Prisma Database if active
        try {
          if (prisma?.user) {
            const user = await prisma.user.findUnique({
              where: { email: loginInput },
            });

            if (user && (user.role === 'ADMIN' || user.role === 'OFFICER')) {
              const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
              if (isValidPassword) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role as Role,
                  department: user.department || null,
                };
              }
            }
          }
        } catch (dbErr) {
          console.error('Database auth error, falling back:', dbErr);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.department = (user as any).department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-secret-key-2026',
};
