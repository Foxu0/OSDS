// Timezone utilities for Philippine Standard Time (Asia/Manila)
// Ensures timestamps are rendered and tracked consistently

export function formatManilaDateTime(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'N/A';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function formatManilaDate(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'N/A';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function formatManilaTime(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'N/A';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function getOfficialServerTimestamp(): string {
  return new Date().toISOString();
}
