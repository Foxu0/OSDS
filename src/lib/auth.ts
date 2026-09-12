import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';
import { DEMO_USERS } from '@/lib/demoUsers';
import { getOfficers } from '@/lib/serverDataService';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Student Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your credentials.');
        }

        const loginInput = credentials.email.trim().toLowerCase();
        const normalizedInput = loginInput.replace(/[-_\s]/g, '');

        // 1. Check Demo Accounts (all 4 roles supported)
        const demoMatch = DEMO_USERS.find(
          (u) =>
            u.email.toLowerCase() === loginInput ||
            (u.studentNumber && (
              u.studentNumber.toLowerCase() === loginInput ||
              u.studentNumber.toLowerCase().replace(/[-_\s]/g, '') === normalizedInput
            ))
        );

        if (demoMatch) {
          if (credentials.password === demoMatch.password) {
            return {
              id: demoMatch.id,
              name: demoMatch.name,
              email: demoMatch.email,
              role: demoMatch.role,
              department: demoMatch.department || null,
              studentNumber: demoMatch.studentNumber || null,
            };
          }
          // Wrong password for demo user — fail fast
          return null;
        }

        // 2. Check Persistent Registered Officers (Admin -> OSDS Officer, OSDS -> Org Officer)
        try {
          const officers = await getOfficers();
          const officer = officers.find(
            (o) => o.email.toLowerCase() === loginInput && o.status === 'ACTIVE'
          );

          if (officer) {
            let isValid = false;
            if (officer.passwordHash) {
              isValid = await bcrypt.compare(credentials.password, officer.passwordHash);
            }
            if (!isValid && officer.password) {
              isValid = credentials.password === officer.password;
            }
            if (isValid) {
              return {
                id: officer.id,
                name: officer.name,
                email: officer.email,
                role: officer.role as Role,
                department: officer.department || null,
                studentNumber: null,
              };
            }
          }
        } catch (localErr) {
          console.error('Local officers auth check error:', localErr);
        }

        // 3. Query Prisma Database for external production users (if database is online)
        try {
          if (prisma?.user) {
            // Wrap with a 1-second timeout so a missing DB doesn't block
            const user = await Promise.race([
              prisma.user.findUnique({ where: { email: loginInput } }),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('DB timeout')), 1000)
              ),
            ]).catch(() => null);

            if (user) {
              const isValidPassword = await bcrypt.compare(credentials.password, (user as any).passwordHash);
              if (isValidPassword) {
                return {
                  id: (user as any).id,
                  name: (user as any).name,
                  email: (user as any).email,
                  role: (user as any).role as Role,
                  department: (user as any).department || null,
                  studentNumber: (user as any).studentNumber || null,
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
        token.studentNumber = (user as any).studentNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
        (session.user as any).studentNumber = token.studentNumber;
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
  secret: process.env.NEXTAUTH_SECRET || 'urs-cainta-paperless-campus-development-secret-key-2026',
};
