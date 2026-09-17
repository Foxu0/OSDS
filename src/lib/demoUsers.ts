import { Role } from '@/types';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  studentNumber: string | null;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-admin-1',
    name: 'Admin Campus Director',
    email: 'admin@urs.edu.ph',
    password: 'password123',
    role: 'ADMIN',
    department: 'URS Cainta Campus Administration',
    studentNumber: null,
  },
  {
    id: 'demo-osds-1',
    name: 'Dr. Ana Reyes',
    email: 'osds@urs.edu.ph',
    password: 'password123',
    role: 'OSDS_OFFICER',
    department: 'Office of Student Development Services',
    studentNumber: null,
  },
  {
    id: 'demo-org-1',
    name: 'Maria Santos',
    email: 'org.officer@urs.edu.ph',
    password: 'password123',
    role: 'ORG_OFFICER',
    department: 'Supreme Student Council – Events Committee',
    studentNumber: null,
  },
];


