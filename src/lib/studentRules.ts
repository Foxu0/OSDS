// Official Student Information Rules for University of Rizal System – Cainta Campus

export const ALLOWED_COURSES = [
  'BT-Auto',
  'BSIT',
  'BSE',
  'BEED',
  'BTLED',
] as const;

export type AllowedCourse = (typeof ALLOWED_COURSES)[number];

export const ALLOWED_YEAR_LEVELS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
] as const;

export type AllowedYearLevel = (typeof ALLOWED_YEAR_LEVELS)[number];

export const ALLOWED_SECTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

export type AllowedSection = (typeof ALLOWED_SECTIONS)[number];

/**
 * OFFICIAL URS CAINTA CAMPUS COURSE → SECTION MAPPING:
 * - BSIT → D
 * - BT-Auto → E
 * - BTLED → A
 * - BEED → C
 * - BSE → B
 * 
 * Single source of truth for both frontend and backend.
 */
export const COURSE_SECTION_MAP: Record<AllowedCourse, AllowedSection> = {
  'BSIT': 'D',
  'BT-Auto': 'E',
  'BTLED': 'A',
  'BEED': 'C',
  'BSE': 'B',
};

export function getSectionForCourse(course: string): AllowedSection | null {
  if (!course) return null;
  const clean = course.trim() as AllowedCourse;
  return COURSE_SECTION_MAP[clean] || null;
}

export interface YearSectionOption {
  code: string; // e.g. "1-D", "2-D", "3-D", "4-D"
  yearDigit: string; // e.g. "1", "2", "3", "4"
  yearLevel: AllowedYearLevel; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  section: AllowedSection; // e.g. "D"
  label: string; // e.g. "1-D", "2-D", "3-D", "4-D"
}

/**
 * Generates the 4 Year + Section choices for a given course.
 * If Course = BSIT -> 1-D, 2-D, 3-D, 4-D
 * If Course = BT-Auto -> 1-E, 2-E, 3-E, 4-E
 * If Course = BTLED -> 1-A, 2-A, 3-A, 4-A
 * If Course = BEED -> 1-C, 2-C, 3-C, 4-C
 * If Course = BSE -> 1-B, 2-B, 3-B, 4-B
 */
export function getYearSectionOptionsForCourse(course: string): YearSectionOption[] {
  const section = getSectionForCourse(course);
  if (!section) return [];
  return [
    { code: `1-${section}`, yearDigit: '1', yearLevel: '1st Year', section, label: `1-${section}` },
    { code: `2-${section}`, yearDigit: '2', yearLevel: '2nd Year', section, label: `2-${section}` },
    { code: `3-${section}`, yearDigit: '3', yearLevel: '3rd Year', section, label: `3-${section}` },
    { code: `4-${section}`, yearDigit: '4', yearLevel: '4th Year', section, label: `4-${section}` },
  ];
}

/**
 * Validates URS Cainta Student ID format:
 * C + 4-digit enrollment year + "_" + 5-digit student number
 * Example: C2024_00179, C2025_00234
 * 
 * Note: The Student ID is based on enrollment year and does NOT change
 * when advancing to another year level.
 */
export function isValidStudentId(studentId: string): boolean {
  if (!studentId || typeof studentId !== 'string') return false;
  const cleanId = studentId.trim().toUpperCase();
  const studentIdRegex = /^C\d{4}_\d{5}$/;
  return studentIdRegex.test(cleanId);
}

export function normalizeStudentId(studentId: string): string {
  if (!studentId) return '';
  return studentId.trim().toUpperCase();
}

export function isValidCourse(course: string): boolean {
  return (ALLOWED_COURSES as readonly string[]).includes(course?.trim());
}

export function isValidYearLevel(yearLevel: string): boolean {
  return (ALLOWED_YEAR_LEVELS as readonly string[]).includes(yearLevel?.trim());
}

export function isValidSection(section: string): boolean {
  return (ALLOWED_SECTIONS as readonly string[]).includes(section?.trim().toUpperCase());
}

/**
 * Verifies if Course + Section combination matches the official mapping
 */
export function isValidCourseSectionCombination(course: string, section: string): boolean {
  const cleanCourse = course?.trim() as AllowedCourse;
  const cleanSection = section?.trim().toUpperCase();
  return COURSE_SECTION_MAP[cleanCourse] === cleanSection;
}

/**
 * Extracts year digit from year level label or code
 * '1st Year' / '1-D' -> '1', '2nd Year' / '2-D' -> '2', etc.
 */
export function getYearDigit(yearLevelOrCode: string): string {
  if (!yearLevelOrCode) return '1';
  const match = yearLevelOrCode.match(/\d/);
  return match ? match[0] : '1';
}

/**
 * Converts digit or code to official Year Level label
 * '1' / '1-D' -> '1st Year', '2' / '2-D' -> '2nd Year', '3' / '3-D' -> '3rd Year', '4' / '4-D' -> '4th Year'
 */
export function getYearLevelFromDigit(digitOrStr: string): AllowedYearLevel {
  if (!digitOrStr) return '1st Year';
  if (digitOrStr.includes('1')) return '1st Year';
  if (digitOrStr.includes('2')) return '2nd Year';
  if (digitOrStr.includes('3')) return '3rd Year';
  if (digitOrStr.includes('4')) return '4th Year';
  return '1st Year';
}

/**
 * Formats standardized class representation:
 * Course: BSE, Year: 3rd Year, Section: B => "BSE — 3B"
 * Course: BSIT, Year: 2nd Year, Section: D => "BSIT — 2D"
 */
export function formatClassDisplay(course: string, yearLevel: string, section?: string): string {
  const cleanCourse = (course || 'BSIT').trim() as AllowedCourse;
  const y = getYearDigit(yearLevel);
  // Course strictly determines Section letter in URS Cainta:
  // BSIT -> D, BT-Auto -> E, BTLED -> A, BEED -> C, BSE -> B
  const s = COURSE_SECTION_MAP[cleanCourse] || (section ? section.replace(/[^A-E]/gi, '').slice(-1).toUpperCase() : 'D');
  return `${cleanCourse} — ${y}${s}`;
}

/**
 * Parses a combined class code (e.g. "3-D", "3D", "BSIT 3-D", "BSE — 3B") into year level and section components
 */
export function parseYearAndSection(raw: string, course?: string): { yearLevel: AllowedYearLevel; section: AllowedSection } {
  const defaultSection = course && (course in COURSE_SECTION_MAP) ? COURSE_SECTION_MAP[course as AllowedCourse] : 'D';
  if (!raw) return { yearLevel: '1st Year', section: defaultSection };
  const clean = raw.toUpperCase().trim();
  
  // Look for section letter A-E, but if course is provided, course mapping takes precedence
  let section: AllowedSection = defaultSection;
  if (course && course in COURSE_SECTION_MAP) {
    section = COURSE_SECTION_MAP[course as AllowedCourse];
  } else {
    const secMatch = clean.match(/[A-E](?!.*[A-E])/);
    if (secMatch && (ALLOWED_SECTIONS as readonly string[]).includes(secMatch[0])) {
      section = secMatch[0] as AllowedSection;
    }
  }
  
  // Look for year digit 1-4
  let yearLevel: AllowedYearLevel = '1st Year';
  if (clean.includes('4')) yearLevel = '4th Year';
  else if (clean.includes('3')) yearLevel = '3rd Year';
  else if (clean.includes('2')) yearLevel = '2nd Year';
  else if (clean.includes('1')) yearLevel = '1st Year';

  return { yearLevel, section };
}

/**
 * Server and Client side validation for student registration payload.
 * Enforces course-to-section mapping:
 * - BSIT -> D
 * - BT-Auto -> E
 * - BTLED -> A
 * - BEED -> C
 * - BSE -> B
 */
export function validateStudentRegistrationInput(data: {
  studentName?: string;
  studentNumber?: string;
  email?: string;
  course?: string;
  department?: string;
  yearLevel?: string;
  section?: string;
  yearSection?: string;
  yearSectionCode?: string;
}): { isValid: boolean; message?: string; normalized?: {
  studentName: string;
  studentNumber: string;
  email: string;
  course: AllowedCourse;
  yearLevel: AllowedYearLevel;
  section: AllowedSection;
  yearSection: string;
} } {
  const studentName = data.studentName?.trim();
  if (!studentName || studentName.length < 2) {
    return { isValid: false, message: 'Full Name is required and must be at least 2 characters.' };
  }

  const rawId = data.studentNumber?.trim();
  if (!rawId || !isValidStudentId(rawId)) {
    return {
      isValid: false,
      message: 'Invalid Student ID format. Expected format: C + 4-digit enrollment year + "_" + 5-digit number (e.g. C2024_00179).',
    };
  }
  const studentNumber = normalizeStudentId(rawId);

  const courseVal = (data.course || data.department || '').trim();
  if (!courseVal || !isValidCourse(courseVal)) {
    return {
      isValid: false,
      message: `Invalid Course/Program. Allowed courses are: ${ALLOWED_COURSES.join(', ')}.`,
    };
  }
  const course = courseVal as AllowedCourse;

  // Expected section according to the official URS Cainta mapping
  const expectedSection = COURSE_SECTION_MAP[course];
  if (!expectedSection) {
    return {
      isValid: false,
      message: `No official section mapping found for course ${course}.`,
    };
  }

  let yearLevelVal = data.yearLevel?.trim();
  let sectionVal = data.section?.trim().toUpperCase();

  // If yearSection or yearSectionCode was supplied (e.g. "3-D" or "3D")
  const rawCode = data.yearSectionCode || data.yearSection;
  if ((!yearLevelVal || !sectionVal) && rawCode) {
    const parsed = parseYearAndSection(rawCode, course);
    yearLevelVal = yearLevelVal || parsed.yearLevel;
    sectionVal = sectionVal || parsed.section;
  }

  // If section was provided, verify it matches the required course mapping
  if (sectionVal && sectionVal !== expectedSection) {
    return {
      isValid: false,
      message: `Invalid section "${sectionVal}" for course ${course}. The official section for ${course} is Section ${expectedSection}.`,
    };
  }
  const section = expectedSection;

  if (!yearLevelVal || !isValidYearLevel(yearLevelVal)) {
    const digit = getYearDigit(yearLevelVal || rawCode || '');
    if (digit && ['1', '2', '3', '4'].includes(digit)) {
      yearLevelVal = getYearLevelFromDigit(digit);
    } else {
      return {
        isValid: false,
        message: `Invalid Year Level. Allowed year levels are: ${ALLOWED_YEAR_LEVELS.join(', ')}.`,
      };
    }
  }
  const yearLevel = yearLevelVal as AllowedYearLevel;

  const email = data.email?.trim() || `${studentNumber.toLowerCase()}@urs.edu.ph`;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'A valid email address is required.' };
  }

  const yearDigit = getYearDigit(yearLevel);
  const yearSection = `${yearDigit}${section}`;

  return {
    isValid: true,
    normalized: {
      studentName,
      studentNumber,
      email,
      course,
      yearLevel,
      section,
      yearSection,
    },
  };
}
