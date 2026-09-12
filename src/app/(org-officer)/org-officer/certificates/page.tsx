import { redirect } from 'next/navigation';

export default function OrgOfficerCertificatesPage() {
  // Certificates are compiled within each event. Redirect to My Events.
  redirect('/org-officer');
}
