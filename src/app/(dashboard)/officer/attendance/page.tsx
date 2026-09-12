import { redirect } from 'next/navigation';

export default function OfficerAttendancePage() {
  // Attendance is compiled within each event. Redirect to Org Officer dashboard.
  redirect('/org-officer');
}
