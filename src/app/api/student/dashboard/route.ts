import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentDashboardData, getStudentByNumber } from '@/lib/serverDataService';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const studentNumber = user.studentNumber || '';
    const email = user.email || '';

    const dashboardData = await getStudentDashboardData(studentNumber, email);
    const studentProfile = studentNumber ? await getStudentByNumber(studentNumber) : null;

    return NextResponse.json({
      success: true,
      profile: studentProfile || {
        name: user.name,
        email: user.email,
        studentNumber: user.studentNumber,
        department: user.department,
      },
      registrations: dashboardData.registrations,
      attendances: dashboardData.attendances,
      certificates: dashboardData.certificates,
    });
  } catch (error: any) {
    console.error('Student dashboard fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student dashboard data.' },
      { status: 500 }
    );
  }
}
