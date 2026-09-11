import { Role } from '@/types';

export const DEMO_USERS = [
  {
    id: 'demo-admin-1',
    name: 'Admin Campus Director',
    email: 'admin@urs.edu.ph',
    password: 'password123',
    role: 'ADMIN' as Role,
    department: 'URS Cainta Campus Administration',
  },
  {
    id: 'demo-officer-1',
    name: 'Maria Santos',
    email: 'officer@urs.edu.ph',
    password: 'password123',
    role: 'OFFICER' as Role,
    department: 'Supreme Student Council - Chief Facilitator',
  },
];
