import { redirect } from 'next/navigation';

export default function OSDSAttendancePage() {
  // Attendance is compiled within each event. Redirect to All Events.
  redirect('/osds?tab=all');
}
