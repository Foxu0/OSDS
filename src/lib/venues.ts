// Official Predefined Campus Event Venues for University of Rizal System – Cainta Campus
// Strict dropdown options for Event Creation and Event Editing

export const ALLOWED_VENUES = [
  'Laboratory Room',
  'Speech Laboratory (College of Education)',
  'Karangalan Court',
  '4th Floor, Admin Building',
  'Room 301',
  'Computer Laboratory 404',
  'Computer Laboratory 405',
] as const;

export type AllowedVenue = (typeof ALLOWED_VENUES)[number];

export function isValidVenue(venue: string): boolean {
  return (ALLOWED_VENUES as readonly string[]).includes(venue);
}
