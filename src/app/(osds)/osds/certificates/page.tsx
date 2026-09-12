import { redirect } from 'next/navigation';

export default function OSDSCertificatesPage() {
  // Certificates are compiled within each event. Redirect to All Events.
  redirect('/osds?tab=all');
}
