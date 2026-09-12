import { redirect } from 'next/navigation';

export default function LegacyOfficerPage() {
  // Officer dashboard migrated to /org-officer with event-compiled options.
  redirect('/org-officer');
}
