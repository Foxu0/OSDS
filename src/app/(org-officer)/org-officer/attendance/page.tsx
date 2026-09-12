import { redirect } from 'next/navigation';

export default function OrgOfficerAttendancePage() {
  // Attendance is compiled within each event. Redirect to My Events.
  redirect('/org-officer');
}
