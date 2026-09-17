import {
  COURSE_SECTION_MAP,
  ALLOWED_COURSES,
  ALLOWED_YEAR_LEVELS,
  getSectionForCourse,
  getYearSectionOptionsForCourse,
  isValidCourseSectionCombination,
  formatClassDisplay,
  validateStudentRegistrationInput,
  normalizeStudentId,
  AllowedCourse,
} from '../src/lib/studentRules';

console.log('=== URS CAINTA COURSE-SECTION MAPPING AUTOMATED TEST SUITE ===\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Official URS Cainta Campus Course -> Section Mapping
console.log('--- TEST 1: Course to Section Mapping Constants ---');
assert(COURSE_SECTION_MAP['BSIT'] === 'D', 'BSIT maps to Section D');
assert(COURSE_SECTION_MAP['BT-Auto'] === 'E', 'BT-Auto maps to Section E');
assert(COURSE_SECTION_MAP['BTLED'] === 'A', 'BTLED maps to Section A');
assert(COURSE_SECTION_MAP['BEED'] === 'C', 'BEED maps to Section C');
assert(COURSE_SECTION_MAP['BSE'] === 'B', 'BSE maps to Section B');

// 2. Test All 5 Courses x 4 Year Levels Options Generation
console.log('\n--- TEST 2: Year + Section Options Generation ---');
const expectedCombos: Record<AllowedCourse, string[]> = {
  'BSIT': ['1-D', '2-D', '3-D', '4-D'],
  'BT-Auto': ['1-E', '2-E', '3-E', '4-E'],
  'BTLED': ['1-A', '2-A', '3-A', '4-A'],
  'BEED': ['1-C', '2-C', '3-C', '4-C'],
  'BSED': ['1-B', '2-B', '3-B', '4-B'],
};

for (const course of ALLOWED_COURSES) {
  const options = getYearSectionOptionsForCourse(course);
  const expected = expectedCombos[course];
  assert(options.length === 4, `${course} generates exactly 4 Year+Section options`);
  const codes = options.map((o) => o.code);
  assert(
    JSON.stringify(codes) === JSON.stringify(expected),
    `${course} options are [${expected.join(', ')}] (got [${codes.join(', ')}])`
  );
}

// 3. Test All 20 Valid Combinations via validateStudentRegistrationInput
console.log('\n--- TEST 3: Validation of all 20 Valid Combinations ---');
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;
for (const course of ALLOWED_COURSES) {
  const section = COURSE_SECTION_MAP[course];
  for (let y = 1; y <= 4; y++) {
    const yearLevel = yearLevels[y - 1];
    const code = `${y}-${section}`;
    
    // Test with explicit section
    const res = validateStudentRegistrationInput({
      studentName: 'Test Student',
      studentNumber: 'C2024_00179',
      course,
      yearLevel,
      section,
    });
    assert(
      res.isValid && res.normalized?.yearSection === `${y}${section}`,
      `Valid: ${course} ${yearLevel} Section ${section} -> class code: ${y}${section}`
    );

    // Test with yearSectionCode
    const resByCode = validateStudentRegistrationInput({
      studentName: 'Test Student',
      studentNumber: 'C2024_00179',
      course,
      yearSectionCode: code,
    });
    assert(
      resByCode.isValid && resByCode.normalized?.section === section && resByCode.normalized?.yearLevel === yearLevel,
      `Valid by Code: ${course} with option "${code}" resolves to ${yearLevel} Section ${section}`
    );

    // Test formatClassDisplay
    const display = formatClassDisplay(course, yearLevel, section);
    assert(
      display === `${course} — ${y}${section}`,
      `Class Display: ${display} matches "${course} — ${y}${section}"`
    );
  }
}

// 4. Test Server-Side Rejection of Invalid Combinations
console.log('\n--- TEST 4: Strict Server-Side Rejection of Invalid Combinations ---');
const invalidTestCases = [
  { course: 'BSIT', section: 'A' },
  { course: 'BSIT', section: 'B' },
  { course: 'BSIT', section: 'C' },
  { course: 'BSIT', section: 'E' },
  { course: 'BSE', section: 'D' },
  { course: 'BEED', section: 'A' },
  { course: 'BT-Auto', section: 'A' },
  { course: 'BT-Auto', section: 'B' },
  { course: 'BT-Auto', section: 'C' },
  { course: 'BT-Auto', section: 'D' },
  { course: 'BTLED', section: 'B' },
  { course: 'BTLED', section: 'C' },
  { course: 'BTLED', section: 'D' },
  { course: 'BTLED', section: 'E' },
];

for (const invalid of invalidTestCases) {
  const res = validateStudentRegistrationInput({
    studentName: 'Test Student',
    studentNumber: 'C2024_00179',
    course: invalid.course,
    yearLevel: '3rd Year',
    section: invalid.section,
  });
  assert(
    Boolean(!res.isValid && res.message?.includes('Invalid section')),
    `REJECTED invalid combination: ${invalid.course} — Section ${invalid.section} (${res.message})`
  );
}

// 5. Verify Student ID Unchanged Based On Year Level Rule
console.log('\n--- TEST 5: Student ID Independence from Year Level ---');
for (const year of ['1st Year', '2nd Year', '3rd Year', '4th Year']) {
  const res = validateStudentRegistrationInput({
    studentName: 'Juan Dela Cruz',
    studentNumber: 'C2024_00179',
    course: 'BSIT',
    yearLevel: year,
    section: 'D',
  });
  assert(
    res.isValid && res.normalized?.studentNumber === normalizeStudentId('C2024_00179'),
    `Student ID C2024_00179 remains invariant at ${year}`
  );
}

console.log(`\n==============================================`);
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${totalTests - passedTests}`);
console.log(`==============================================\n`);
