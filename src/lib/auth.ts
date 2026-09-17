import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';
import { DEMO_USERS } from '@/lib/demoUsers';
import { getOfficers, getStudentByNumber, getStudentByEmail } from '@/lib/serverDataService';
import { normalizeStudentId, COURSE_SECTION_MAP, getYearDigit } from '@/lib/studentRules';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Student Number or Campus Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your credentials.');
        }

        const loginInput = credentials.email.trim();
        const cleanLower = loginInput.toLowerCase();
        const isEmailInput = cleanLower.includes('@');

        // -------------------------------------------------------------
        // 1. EMAIL-BASED LOGIN: Allowed for STAFF (Admin & Officers) ONLY
        // -------------------------------------------------------------
        if (isEmailInput) {
          // Check if this is a student trying to log in with email
          const demoStudentByEmail = DEMO_USERS.find(
            (u) => u.role === 'STUDENT' && u.email.toLowerCase() === cleanLower
          );
          const studentAccountByEmail = await getStudentByEmail(cleanLower);

          if (demoStudentByEmail || (studentAccountByEmail && studentAccountByEmail.role === 'STUDENT')) {
            throw new Error('Students must log in using their Student Number, not email.');
          }

          // Check Staff Demo Accounts (Admin, OSDS Officer, Org Officer)
          const staffDemoMatch = DEMO_USERS.find(
            (u) => u.role !== 'STUDENT' && u.email.toLowerCase() === cleanLower
          );
          if (staffDemoMatch) {
            if (credentials.password === staffDemoMatch.password) {
              return {
                id: staffDemoMatch.id,
                name: staffDemoMatch.name,
                email: staffDemoMatch.email,
                role: staffDemoMatch.role,
                department: staffDemoMatch.department || null,
                studentNumber: null,
              };
            }
            throw new Error('Invalid credentials.');
          }

          // Check Persistent Registered Officers
          try {
            const officers = await getOfficers();
            const officer = officers.find(
              (o) => o.email.toLowerCase() === cleanLower && o.status === 'ACTIVE'
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
              throw new Error('Invalid credentials.');
            }
          } catch (localErr: any) {
            if (localErr.message === 'Invalid credentials.') throw localErr;
          }

          // Check External Database Users (Staff)
          try {
            if (prisma?.user) {
              const user = await prisma.user.findUnique({ where: { email: cleanLower } });
              if (user && user.role !== 'STUDENT') {
                const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
                if (isValidPassword) {
                  return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role as Role,
                    department: user.department || null,
                    studentNumber: user.studentNumber || null,
                  };
                }
                throw new Error('Invalid credentials.');
              }
            }
          } catch (dbErr: any) {
            if (dbErr.message === 'Invalid credentials.') throw dbErr;
          }

          throw new Error('Invalid credentials.');
        }

        // -------------------------------------------------------------
        // 2. STUDENT NUMBER LOGIN (STUDENT accounts)
        // -------------------------------------------------------------
        const cleanNumber = normalizeStudentId(loginInput);
        const compactNumber = cleanNumber.replace(/[-_\s]/g, '');

        // A. Check Demo Student Account
        const demoStudentMatch = DEMO_USERS.find(
          (u) =>
            u.role === 'STUDENT' &&
            u.studentNumber &&
            (normalizeStudentId(u.studentNumber) === cleanNumber ||
              u.studentNumber.replace(/[-_\s]/g, '') === compactNumber)
        );

        if (demoStudentMatch) {
          if (credentials.password === demoStudentMatch.password) {
            return {
              id: demoStudentMatch.id,
              name: demoStudentMatch.name,
              email: demoStudentMatch.email,
              role: 'STUDENT',
              department: demoStudentMatch.department || 'College of Computing Studies',
              studentNumber: demoStudentMatch.studentNumber || cleanNumber,
              course: 'BSIT',
              yearLevel: '3rd Year',
              section: 'D',
              yearSection: '3D',
            };
          }
          throw new Error('Invalid credentials.');
        }

        // B. Check Registered Student Accounts (Local Store & Database)
        const student = await getStudentByNumber(cleanNumber);
        if (student) {
          if (student.status === 'PENDING') {
            throw new Error('Your account is pending verification. Please verify your email first.');
          }
          if (student.status === 'DEACTIVATED') {
            throw new Error('Your account is deactivated. Please contact campus administration.');
          }

          let isPasswordValid = false;
          if (student.passwordHash) {
            isPasswordValid = await bcrypt.compare(credentials.password, student.passwordHash);
          }
          if (!isPasswordValid && student.password) {
            isPasswordValid = credentials.password === student.password;
          }

          if (isPasswordValid) {
            const stdCourse = student.course || student.department || 'BSIT';
            const stdSection = COURSE_SECTION_MAP[stdCourse] || student.section || 'D';
            const stdYearLevel = student.yearLevel || '1st Year';
            const stdYearSection = student.yearSection || `${getYearDigit(stdYearLevel)}${stdSection}`;
            return {
              id: student.id,
              name: student.name,
              email: student.email,
              role: 'STUDENT',
              department: student.department || stdCourse,
              studentNumber: student.studentNumber,
              course: stdCourse,
              yearLevel: stdYearLevel,
              section: stdSection,
              yearSection: stdYearSection,
            };
          }
          throw new Error('Invalid credentials.');
        }

        // C. Fallback: Check if a staff member logged in with their username
        const staffByUsername = DEMO_USERS.find(
          (u) => u.email.split('@')[0].toLowerCase() === cleanLower && u.role !== 'STUDENT'
        );
        if (staffByUsername && credentials.password === staffByUsername.password) {
          return {
            id: staffByUsername.id,
            name: staffByUsername.name,
            email: staffByUsername.email,
            role: staffByUsername.role,
            department: staffByUsername.department || null,
            studentNumber: null,
          };
        }

        throw new Error('Invalid credentials.');
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
        token.course = (user as any).course;
        token.yearLevel = (user as any).yearLevel;
        token.section = (user as any).section;
        token.yearSection = (user as any).yearSection;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
        (session.user as any).studentNumber = token.studentNumber;
        (session.user as any).course = token.course;
        (session.user as any).yearLevel = token.yearLevel;
        (session.user as any).section = token.section;
        (session.user as any).yearSection = token.yearSection;
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
