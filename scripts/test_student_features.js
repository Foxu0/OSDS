// Automated Test Suite for Paperless Campus Student Auth & Features
const bcrypt = require('bcryptjs');

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING PAPERLESS CAMPUS STUDENT AUTH & FEATURE TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, extraInfo = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${extraInfo ? `-> ${extraInfo}` : ''}`);
    }
  }

  // Load modules
  const {
    isValidStudentId,
    normalizeStudentId,
    validateStudentRegistrationInput,
    COURSE_SECTION_MAP,
    getYearSectionOptionsForCourse,
  } = require('../src/lib/studentRules');

  const {
    getStudentByNumber,
    getStudentByEmail,
    createPendingStudentAccount,
    createVerificationCode,
    verifyCode,
    activateStudentAccount,
    resetStudentPassword,
    registerStudentForEvent,
    processQRScan,
    getRegistrationByToken,
    issueCertificate,
  } = require('../src/lib/serverDataService');

  const { DEMO_USERS } = require('../src/lib/demoUsers');

  // --- TEST GROUP 1: Student Rules & Validation ---
  console.log('\n--- 1. Testing Student Rules & Validation ---');
  assert(isValidStudentId('C2026-00123'), 'Valid student ID with hyphen is accepted');
  assert(isValidStudentId('C2026_00123'), 'Valid student ID with underscore is accepted');
  assert(!isValidStudentId('2026-00123'), 'Student ID without "C" prefix is rejected');
  assert(!isValidStudentId('C26-123'), 'Invalid student ID length is rejected');
  assert(normalizeStudentId('C2026_00123') === 'C2026-00123', 'normalizeStudentId standardizes to hyphen format');
  assert(COURSE_SECTION_MAP['BSIT'] === 'D', 'BSIT maps to Section D');
  assert(COURSE_SECTION_MAP['BSE'] === 'B', 'BSE maps to Section B');
  assert(COURSE_SECTION_MAP['BEED'] === 'C', 'BEED maps to Section C');
  assert(COURSE_SECTION_MAP['BTLED'] === 'A', 'BTLED maps to Section A');
  assert(COURSE_SECTION_MAP['BT-Auto'] === 'E', 'BT-Auto maps to Section E');

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

  // --- TEST GROUP 2: Existing Demo Accounts Preserved ---
  console.log('\n--- 2. Testing Existing Demo Accounts Preservation ---');
  const demoStudent = DEMO_USERS.find((u) => u.role === 'STUDENT');
  assert(!!demoStudent, 'Demo student exists in DEMO_USERS');
  assert(demoStudent.studentNumber === 'C2024-00179', 'Demo student number is preserved as C2024-00179');
  assert(demoStudent.password === 'password123', 'Demo student password is preserved as password123');

  const demoAdmin = DEMO_USERS.find((u) => u.role === 'ADMIN');
  assert(!!demoAdmin && demoAdmin.email === 'admin@urs.edu.ph', 'Demo admin is preserved');

  const demoOsds = DEMO_USERS.find((u) => u.role === 'OSDS_OFFICER');
  assert(!!demoOsds && demoOsds.email === 'osds@urs.edu.ph', 'Demo OSDS officer is preserved');

  const demoOrg = DEMO_USERS.find((u) => u.role === 'ORG_OFFICER');
  assert(!!demoOrg && demoOrg.email === 'org.officer@urs.edu.ph', 'Demo Org officer is preserved');

  const fetchedDemoStudent = await getStudentByNumber('C2024-00179');
  assert(!!fetchedDemoStudent && fetchedDemoStudent.status === 'ACTIVE', 'getStudentByNumber resolves demo student as ACTIVE');

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
  const resetCode = await createVerificationCode(testStudentId, fpStudent.email, 'PASSWORD_RESET');
  assert(resetCode.length === 6 && /^\d{6}$/.test(resetCode), '6-digit password reset OTP generated');

  // Reset password
  const resetVerif = await verifyCode(testStudentId, resetCode, 'PASSWORD_RESET');
  assert(resetVerif.valid === true, 'Password reset OTP verified');

  const resetResult = await resetStudentPassword(testStudentId, 'brandNewPassword2026');
  assert(resetResult.success === true, 'Student password successfully reset');

  // Verify new password hashes match and old password no longer works
  const updatedStudent = await getStudentByNumber(testStudentId);
  const isNewPassValid = await bcrypt.compare('brandNewPassword2026', updatedStudent.passwordHash);
  const isOldPassValid = await bcrypt.compare('securePassword2026', updatedStudent.passwordHash);
  assert(isNewPassValid === true, 'New password matches updated password hash');
  assert(isOldPassValid === false, 'Old password no longer works');

  // --- TEST GROUP 6: Event Registration & Personal Attendance QR Ticket ---
  console.log('\n--- 6. Testing Event Registration & Personal Attendance QR Ticket ---');
  const reg1 = await registerStudentForEvent({
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
  assert(reg1.success === true, 'Student can register for Event 1');
  assert(!!reg1.registration?.qrToken, 'Personal Attendance QR token generated on registration');

  // Duplicate registration for SAME event must be blocked / return existing
  const dupReg = await registerStudentForEvent({
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
  assert(dupReg.isExisting === true, 'Duplicate registration for same event prevented (returns existing)');

  // Registration for DIFFERENT event must be allowed
  const reg2 = await registerStudentForEvent({
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
  assert(reg2.success === true && reg2.registration?.eventId === 'evt-2', 'Registration for a different event is allowed');

  // Test Ticket Retrieval by Token
  const ticketData = await getRegistrationByToken(reg1.registration.qrToken);
  assert(!!ticketData && ticketData.registration.studentNumber === testStudentId, 'getRegistrationByToken resolves personal attendance ticket');

  // --- TEST GROUP 7: Officer Attendance Scan & Duplicate Prevention ---
  console.log('\n--- 7. Testing Officer Attendance Scan & Duplicate Prevention ---');
  const scanResult1 = await processQRScan(reg1.registration.qrToken, 'demo-officer-1', 'Officer John', 'evt-1');
  assert(scanResult1.success === true && scanResult1.isDuplicate === false, 'First attendance scan records check-in');

  // Duplicate scan for same event must be blocked!
  const scanResult2 = await processQRScan(reg1.registration.qrToken, 'demo-officer-1', 'Officer John', 'evt-1');
  assert(scanResult2.success === false && scanResult2.isDuplicate === true, 'Duplicate attendance check-in PREVENTED');

  // Scan with wrong event ID must be rejected
  const scanWrongEvent = await processQRScan(reg1.registration.qrToken, 'demo-officer-1', 'Officer John', 'evt-4');
  assert(scanWrongEvent.success === false, 'Scanning ticket at wrong event is rejected');

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
