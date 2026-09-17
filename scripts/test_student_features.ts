// Automated Test Suite for Paperless Campus Student Auth & Features
import bcrypt from 'bcryptjs';
import {
  isValidStudentId,
  normalizeStudentId,
  validateStudentRegistrationInput,
  COURSE_SECTION_MAP,
  getAutoYearSection,
  getYearSectionOptionsForCourse,
} from '../src/lib/studentRules';

import {
  getStudentByNumber,
  createPendingStudentAccount,
  createVerificationCode,
  verifyCode,
  activateStudentAccount,
  resetStudentPassword,
  registerStudentForEvent,
  processQRScan,
  getRegistrationByToken,
} from '../src/lib/serverDataService';

import { DEMO_USERS } from '../src/lib/demoUsers';

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING PAPERLESS CAMPUS STUDENT AUTH & FEATURE TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, extraInfo: string = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${extraInfo ? `-> ${extraInfo}` : ''}`);
    }
  }

  // --- TEST GROUP 1: Student Rules & Validation ---
  console.log('\n--- 1. Testing Student Rules & Validation ---');
  assert(isValidStudentId('C2026-00123'), 'Valid student ID with hyphen is accepted');
  assert(isValidStudentId('C2026_00123'), 'Valid student ID with underscore is accepted');
  assert(!isValidStudentId('2026-00123'), 'Student ID without "C" prefix is rejected');
  assert(!isValidStudentId('C26-123'), 'Invalid student ID length is rejected');
  assert(normalizeStudentId('C2026_00123') === 'C2026-00123', 'normalizeStudentId standardizes to hyphen format');
  assert(COURSE_SECTION_MAP['BSIT'] === 'D', 'BSIT maps to Section D');
  assert(COURSE_SECTION_MAP['BSED'] === 'B', 'BSED maps to Section B');
  assert(COURSE_SECTION_MAP['BSE'] === 'B', 'BSE maps to Section B (legacy)');
  assert(COURSE_SECTION_MAP['BEED'] === 'C', 'BEED maps to Section C');
  assert(COURSE_SECTION_MAP['BTLED'] === 'A', 'BTLED maps to Section A');
  assert(COURSE_SECTION_MAP['BT-Auto'] === 'E', 'BT-Auto maps to Section E');

  // Test Auto Year & Section
  assert(getAutoYearSection('BSIT', '3rd Year') === '3D', 'BSIT + 3rd Year -> 3D');
  assert(getAutoYearSection('BSED', '3rd Year') === '3B', 'BSED + 3rd Year -> 3B');
  assert(getAutoYearSection('BEED', '2nd Year') === '2C', 'BEED + 2nd Year -> 2C');
  assert(getAutoYearSection('BTLED', '1st Year') === '1A', 'BTLED + 1st Year -> 1A');
  assert(getAutoYearSection('BT-Auto', '4th Year') === '4E', 'BT-Auto + 4th Year -> 4E');
  assert(getAutoYearSection('', '') === 'Automatically assigned', 'Unselected -> Automatically assigned');

  const bsitOptions = getYearSectionOptionsForCourse('BSIT');
  assert(bsitOptions.length === 4 && bsitOptions[0].code === '1-D' && bsitOptions[3].code === '4-D', 'BSIT produces 1-D to 4-D');

  const validStudentInput = validateStudentRegistrationInput({
    studentName: 'Test Student One',
    studentNumber: 'C2026-11111',
    course: 'BSIT',
    yearLevel: '2nd Year',
    section: 'D',
    email: 'test.student1@urs.edu.ph',
  });
  assert(validStudentInput.isValid === true, 'validateStudentRegistrationInput passes valid input');

  const invalidSectionInput = validateStudentRegistrationInput({
    studentName: 'Test Student One',
    studentNumber: 'C2026-11111',
    course: 'BSIT',
    yearLevel: '2nd Year',
    section: 'A', // Should be D
    email: 'test.student1@urs.edu.ph',
  });
  assert(invalidSectionInput.isValid === false, 'validateStudentRegistrationInput rejects mismatched course-section');

  // Test Exact Maximum Input Character Limits:
  // - Full Name: 50 chars
  const longNameInput = validateStudentRegistrationInput({
    studentName: 'A'.repeat(51),
    studentNumber: 'C2026-11111',
    course: 'BSIT',
    yearLevel: '2nd Year',
    email: 'test.student1@urs.edu.ph',
  });
  assert(longNameInput.isValid === false && longNameInput.message === 'Full Name cannot exceed 50 characters.', 'Full Name exceeding 50 characters is rejected with clear message');

  // - Student Number: 20 chars
  const longStudentNumInput = validateStudentRegistrationInput({
    studentName: 'Juan Dela Cruz',
    studentNumber: 'C2026-1234567890123456', // 23 chars
    course: 'BSIT',
    yearLevel: '2nd Year',
    email: 'test.student1@urs.edu.ph',
  });
  assert(longStudentNumInput.isValid === false && longStudentNumInput.message === 'Student Number cannot exceed 20 characters.', 'Student Number exceeding 20 characters is rejected with clear message');

  // - Email: 50 chars
  const longEmailInput = validateStudentRegistrationInput({
    studentName: 'Juan Dela Cruz',
    studentNumber: 'C2026-11111',
    course: 'BSIT',
    yearLevel: '2nd Year',
    email: 'a'.repeat(45) + '@urs.edu.ph', // 56 chars
  });
  assert(longEmailInput.isValid === false && longEmailInput.message === 'Email cannot exceed 50 characters.', 'Email exceeding 50 characters is rejected with clear message');


  // --- TEST GROUP 2: Existing Demo Accounts Preserved ---
  console.log('\n--- 2. Testing Existing Demo Accounts Preservation ---');
  const demoAdmin = DEMO_USERS.find((u) => u.role === 'ADMIN');
  assert(!!demoAdmin && demoAdmin.email === 'admin@urs.edu.ph', 'Demo admin is preserved');

  const demoOsds = DEMO_USERS.find((u) => u.role === 'OSDS_OFFICER');
  assert(!!demoOsds && demoOsds.email === 'osds@urs.edu.ph', 'Demo OSDS officer is preserved');

  const demoOrg = DEMO_USERS.find((u) => u.role === 'ORG_OFFICER');
  assert(!!demoOrg && demoOrg.email === 'org.officer@urs.edu.ph', 'Demo Org officer is preserved');


  // --- TEST GROUP 3: Student Sign Up & Student Number Reservation ---
  console.log('\n--- 3. Testing Student Sign Up & Student Number Reservation ---');
  const testStudentId = `C2026-88${Math.floor(100 + Math.random() * 900)}`;
  const testEmail = `test.student.${Date.now()}@gmail.com`;

  const signupRes = await createPendingStudentAccount({
    studentName: 'Juan Dela Cruz Testing',
    studentNumber: testStudentId,
    course: 'BSIT',
    yearLevel: '3rd Year',
    yearSectionCode: '3-D',
    email: testEmail,
    password: 'securePassword2026',
  });

  assert(signupRes.success === true, 'Sign up creates pending account');
  assert(signupRes.student?.status === 'PENDING', 'New student account has status PENDING');

  // Test Student Number Reservation: Another student attempting to claim the same pending Student Number must be rejected!
  const dupStudentNumberAttempt = await createPendingStudentAccount({
    studentName: 'Impostor Student',
    studentNumber: testStudentId,
    course: 'BSIT',
    yearLevel: '3rd Year',
    yearSectionCode: '3-D',
    email: 'different.email@gmail.com',
    password: 'password999',
  });
  assert(dupStudentNumberAttempt.success === false, 'Pending student number is RESERVED (rejected for other emails)');

  // Test Password > 30 chars
  const longPasswordAttempt = await createPendingStudentAccount({
    studentName: 'Password Test Student',
    studentNumber: `C2026-77${Math.floor(100 + Math.random() * 900)}`,
    course: 'BSIT',
    yearLevel: '1st Year',
    yearSectionCode: '1-D',
    email: `pwtest.${Date.now()}@gmail.com`,
    password: 'p'.repeat(31),
  });
  assert(longPasswordAttempt.success === false && longPasswordAttempt.message === 'Password cannot exceed 30 characters.', 'Password exceeding 30 characters is rejected with clear message');

  // Test Email Uniqueness
  const dupEmailAttempt = await createPendingStudentAccount({
    studentName: 'Different Name',
    studentNumber: `C2026-99${Math.floor(100 + Math.random() * 900)}`,
    course: 'BSIT',
    yearLevel: '1st Year',
    yearSectionCode: '1-D',
    email: 'admin@urs.edu.ph', // existing staff email
    password: 'password123',
  });
  assert(dupEmailAttempt.success === false, 'Duplicate email registration is rejected');


  // Test BSED Student Registration & Automatic Section Assignment
  const bsedStudentId = `C2026-77${Math.floor(100 + Math.random() * 900)}`;
  const bsedEmail = `bsed.student.${Date.now()}@gmail.com`;
  const bsedSignupRes = await createPendingStudentAccount({
    studentName: 'Clara Santos (BSED)',
    studentNumber: bsedStudentId,
    course: 'BSED',
    yearLevel: '3rd Year',
    email: bsedEmail,
    password: 'password2026',
  });
  assert(bsedSignupRes.success === true, 'BSED student sign up succeeds');
  assert(bsedSignupRes.student?.course === 'BSED', 'BSED student course is saved as BSED');
  assert(bsedSignupRes.student?.section === 'B', 'BSED student section is automatically assigned as Section B');
  assert(bsedSignupRes.student?.yearSection === '3B', 'BSED + 3rd Year is automatically saved as 3B');

  // --- TEST GROUP 4: 6-Digit Email Verification OTP Flow ---
  console.log('\n--- 4. Testing 6-Digit Email Verification OTP Flow ---');
  const code = await createVerificationCode(testStudentId, testEmail, 'SIGNUP');
  assert(code.length === 6 && /^\d{6}$/.test(code), '6-digit numeric OTP code generated');

  // Invalid code check
  const badCodeVerif = await verifyCode(testStudentId, '000000', 'SIGNUP');
  assert(badCodeVerif.valid === false, 'Invalid verification code is rejected');

  // Valid code check
  const goodCodeVerif = await verifyCode(testStudentId, code, 'SIGNUP');
  assert(goodCodeVerif.valid === true, 'Valid verification code is accepted');

  // Re-use of same code must be rejected (single-use)
  const reusedCodeVerif = await verifyCode(testStudentId, code, 'SIGNUP');
  assert(reusedCodeVerif.valid === false, 'Re-use of verification code is rejected (one-time use)');

  // Activate Account
  const activated = await activateStudentAccount(testStudentId);
  assert(activated === true, 'activateStudentAccount transitions student to ACTIVE');

  const activeStudent = await getStudentByNumber(testStudentId);
  assert(activeStudent?.status === 'ACTIVE', 'Student account is now ACTIVE in storage');

  // --- TEST GROUP 5: Forgot Password Recovery Flow ---
  console.log('\n--- 5. Testing Forgot Password Recovery Flow ---');
  // Lookup student by Student Number
  const fpStudent = await getStudentByNumber(testStudentId);
  assert(!!fpStudent, 'Forgot password locates student account by Student Number');

  // Generate reset OTP
  const resetCode = await createVerificationCode(testStudentId, fpStudent?.email || testEmail, 'PASSWORD_RESET');
  assert(resetCode.length === 6 && /^\d{6}$/.test(resetCode), '6-digit password reset OTP generated');

  // Reset password
  const resetVerif = await verifyCode(testStudentId, resetCode, 'PASSWORD_RESET');
  assert(resetVerif.valid === true, 'Password reset OTP verified');

  const resetResult = await resetStudentPassword(testStudentId, 'brandNewPassword2026');
  assert(resetResult.success === true, 'Student password successfully reset');

  // Verify new password hashes match and old password no longer works
  const updatedStudent = await getStudentByNumber(testStudentId);
  const isNewPassValid = await bcrypt.compare('brandNewPassword2026', updatedStudent?.passwordHash || '');
  const isOldPassValid = await bcrypt.compare('securePassword2026', updatedStudent?.passwordHash || '');
  assert(isNewPassValid === true, 'New password matches updated password hash');
  assert(isOldPassValid === false, 'Old password no longer works');

  // --- TEST GROUP 6: Event Registration & Personal Attendance QR Ticket ---
  console.log('\n--- 6. Testing Event Registration & Personal Attendance QR Ticket ---');
  // Event 1 has expired registration window -> must be blocked
  const expiredReg = await registerStudentForEvent({
    eventId: 'evt-1',
    studentName: 'Juan Dela Cruz Testing',
    studentNumber: testStudentId,
    email: testEmail,
    course: 'BSIT',
    department: 'BSIT',
    yearSection: '3D',
    yearLevel: '3rd Year',
    section: 'D',
  });
  assert(expiredReg.success === false, 'Expired registration window is strictly blocked on server');

  // Event 2 is open for registration -> must succeed
  const reg1 = await registerStudentForEvent({
    eventId: 'evt-2',
    studentName: 'Juan Dela Cruz Testing',
    studentNumber: testStudentId,
    email: testEmail,
    course: 'BSIT',
    department: 'BSIT',
    yearSection: '3D',
    yearLevel: '3rd Year',
    section: 'D',
  });
  assert(reg1.success === true, 'Student can register for Open Event (Event 2)');
  assert(!!reg1.registration?.qrToken, 'Personal Attendance QR token generated on registration');

  // Duplicate registration for SAME event must be blocked / return existing
  const dupReg = await registerStudentForEvent({
    eventId: 'evt-2',
    studentName: 'Juan Dela Cruz Testing',
    studentNumber: testStudentId,
    email: testEmail,
    course: 'BSIT',
    department: 'BSIT',
    yearSection: '3D',
    yearLevel: '3rd Year',
    section: 'D',
  });
  assert(dupReg.isExisting === true, 'Duplicate registration for same event prevented (returns existing)');

  // Registration for DIFFERENT open event (evt-4) must be allowed
  const reg2 = await registerStudentForEvent({
    eventId: 'evt-4',
    studentName: 'Juan Dela Cruz Testing',
    studentNumber: testStudentId,
    email: testEmail,
    course: 'BSIT',
    department: 'BSIT',
    yearSection: '3D',
    yearLevel: '3rd Year',
    section: 'D',
  });
  assert(reg2.success === true && reg2.registration?.eventId === 'evt-4', 'Registration for a different open event is allowed');

  // Test Event Registration for BSED Student (Course BSED -> Section B -> 3B)
  const bsedEventReg = await registerStudentForEvent({
    eventId: 'evt-2',
    studentName: 'Clara Santos (BSED)',
    studentNumber: bsedStudentId,
    email: bsedEmail,
    course: 'BSED',
    department: 'BSED',
    yearLevel: '3rd Year',
    section: 'B',
    yearSection: '3B',
  });
  assert(bsedEventReg.success === true, 'BSED student registers successfully with automatic section 3B');
  assert(bsedEventReg.registration?.yearSection === '3B', 'BSED event registration records yearSection as 3B');

  // Test Ticket Retrieval by Token
  if (reg1.registration) {
    const ticketData = await getRegistrationByToken(reg1.registration.qrToken);
    assert(!!ticketData && ticketData.registration.studentNumber === testStudentId, 'getRegistrationByToken resolves personal attendance ticket');

    // --- TEST GROUP 7: Officer Attendance Scan & Duplicate Prevention ---
    console.log('\n--- 7. Testing Officer Attendance Scan & Duplicate Prevention ---');
    const scanResult1 = await processQRScan(reg1.registration.qrToken, 'demo-officer-1', 'Officer John', 'evt-2');
    assert(scanResult1.success === true && scanResult1.isDuplicate === false, 'First attendance scan records check-in');

    // Duplicate scan for same event must be blocked!
    const scanResult2 = await processQRScan(reg1.registration.qrToken, 'demo-officer-1', 'Officer John', 'evt-2');
    assert(scanResult2.success === false && scanResult2.isDuplicate === true, 'Duplicate attendance check-in PREVENTED');

    // Scan with wrong event ID must be rejected
    const scanWrongEvent = await processQRScan(reg1.registration.qrToken, 'demo-officer-1', 'Officer John', 'evt-4');
    assert(scanWrongEvent.success === false, 'Scanning ticket at wrong event is rejected');
  }

  // --- TEST RESULTS SUMMARY ---
  console.log('\n========================================================');
  console.log(`🎯 TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================\n');

  if (passed === total) {
    console.log('🌟 ALL UNIT & INTEGRATION TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
