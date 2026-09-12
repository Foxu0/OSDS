import { Role } from '@/types';

export const DEMO_USERS = [
  {
    id: 'demo-admin-1',
    name: 'Admin Campus Director',
    email: 'admin@urs.edu.ph',
    password: 'password123',
    role: 'ADMIN' as Role,
    department: 'URS Cainta Campus Administration',
    studentNumber: null,
  },
  {
    id: 'demo-osds-1',
    name: 'Dr. Ana Reyes',
    email: 'osds@urs.edu.ph',
    password: 'password123',
    role: 'OSDS_OFFICER' as Role,
    department: 'Office of Student Development Services',
    studentNumber: null,
  },
  {
    id: 'demo-org-1',
    name: 'Maria Santos',
    email: 'org.officer@urs.edu.ph',
    password: 'password123',
    role: 'ORG_OFFICER' as Role,
    department: 'Supreme Student Council – Events Committee',
    studentNumber: null,
  },
  {
    id: 'demo-student-1',
    name: 'Juan dela Cruz',
    email: 'student@urs.edu.ph',
    password: 'password123',
    role: 'STUDENT' as Role,
    department: 'College of Computing Studies',
    studentNumber: 'C2024-00179',
  },
];
