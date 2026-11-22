process.env.TEST_MOCK_DISPATCH = 'true';

import express from 'express';
import { apiRouter, getSystemInstructionForMode, ANTI_REPETITION_DIRECTIVE } from '../server/api.js';

async function runTests() {
  console.log('--- STARTING SPASHTA EMOTIONALLY INTELLIGENT COMPANION TESTS ---');
  let passed = 0;
  let failed = 0;

  // TEST 0: Anti-Repetition Directive Content Verification
  console.log('\n[TEST 0] Testing Anti-Repetition Prompt Directives...');
  if (
    ANTI_REPETITION_DIRECTIVE.includes('NEVER repeatedly ask "What happened?"') &&
    ANTI_REPETITION_DIRECTIVE.includes('DO NOT force a question at the end of every response') &&
    ANTI_REPETITION_DIRECTIVE.includes('NEVER start responses with canned robotic empathy phrases')
  ) {
    console.log('✅ PASS: Anti-Repetition Core explicitly forbids repetitive questions and canned empathy.');
    passed++;
  } else {
    console.error('❌ FAIL: ANTI_REPETITION_DIRECTIVE missing required anti-repetition rules.');
    failed++;
  }

  // TEST 0B: Contextual Prompt Generation with Memory & Language
  console.log('\n[TEST 0B] Testing Dynamic System Prompt Injection...');
  const prompt = getSystemInstructionForMode('friend', 'Priya', false, ['Studying CSE', 'Loves filter coffee'], 'tanglish');
  if (
    prompt.includes('User Name: Priya') &&
    prompt.includes('USER REMEMBERED CONTEXT') &&
    prompt.includes('Studying CSE') &&
    prompt.includes('USER PREFERRED LANGUAGE: Respond predominantly in tanglish') &&
    prompt.includes('FRIEND MODE')
  ) {
    console.log('✅ PASS: System prompt accurately injects user name, long-term memory facts, and preferred language.');
    passed++;
  } else {
    console.error('❌ FAIL: Dynamic prompt injection incomplete:', prompt);
    failed++;
  }

  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  // Helper for mock requests
  async function makeRequest(path: string, method = 'POST', body: any = {}) {
    return new Promise<{ status: number; body: any }>((resolve) => {
      const server = app.listen(0, async () => {
        const port = (server.address() as any).port;
        try {
          const res = await fetch(`http://127.0.0.1:${port}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method !== 'GET' ? JSON.stringify(body) : undefined,
          });
          const data = await res.json().catch(() => ({}));
          server.close(() => resolve({ status: res.status, body: data }));
        } catch (err) {
          server.close(() => resolve({ status: 500, body: { error: String(err) } }));
        }
      });
    });
  }

  // TEST 1: Minor Safety Guardrail in Soulmate Mode
  console.log('\n[TEST 1] Testing Minor Safety Guardrail in Soulmate Mode...');
  const resMinorSoulmate = await makeRequest('/api/chat', 'POST', {
    message: 'Hello, can you be my soulmate?',
    mode: 'soulmate',
    isMinor: true,
  });
  if (resMinorSoulmate.status === 403 && resMinorSoulmate.body.isMinorRestricted === true) {
    console.log('✅ PASS: Under-18 users are strictly blocked from Soulmate Mode with 403 Forbidden.');
    passed++;
  } else {
    console.error('❌ FAIL: Expected 403 with isMinorRestricted: true, got:', resMinorSoulmate);
    failed++;
  }

  // TEST 2: Minor Allowed in Friend Mode
  console.log('\n[TEST 2] Testing Minor Allowed in Friend Mode...');
  const resMinorFriend = await makeRequest('/api/chat', 'POST', {
    message: 'Dei, how was your day?',
    mode: 'friend',
    isMinor: true,
  });
  // Since GEMINI_API_KEY may not be set in test environment, it should either return 503 (geminiUnconfigured) or 200 (if key present), NOT 403!
  if (resMinorFriend.status === 200 || resMinorFriend.status === 503) {
    console.log(`✅ PASS: Minor can access Friend Mode (Status: ${resMinorFriend.status}).`);
    passed++;
  } else {
    console.error('❌ FAIL: Unexpected status for Minor in Friend Mode:', resMinorFriend);
    failed++;
  }

  // TEST 3: Minor Allowed in Guide Mode
  console.log('\n[TEST 3] Testing Minor Allowed in Guide Mode...');
  const resMinorGuide = await makeRequest('/api/chat', 'POST', {
    message: 'Can you explain binary search in Python?',
    mode: 'guide',
    isMinor: true,
  });
  if (resMinorGuide.status === 200 || resMinorGuide.status === 503) {
    console.log(`✅ PASS: Minor can access Guide Mode (Status: ${resMinorGuide.status}).`);
    passed++;
  } else {
    console.error('❌ FAIL: Unexpected status for Minor in Guide Mode:', resMinorGuide);
    failed++;
  }

  // TEST 4: Missing message validation
  console.log('\n[TEST 4] Testing Missing Message Text Validation...');
  const resMissingMsg = await makeRequest('/api/chat', 'POST', {
    message: '   ',
    mode: 'friend',
  });
  if (resMissingMsg.status === 400 && resMissingMsg.body.error) {
    console.log('✅ PASS: Empty or whitespace message returns 400 Bad Request.');
    passed++;
  } else {
    console.error('❌ FAIL: Expected 400 for empty message, got:', resMissingMsg);
    failed++;
  }

  // TEST 5: Mood Analysis Endpoint with empty records
  console.log('\n[TEST 5] Testing Mood Analysis with Empty Records...');
  const resMoodEmpty = await makeRequest('/api/mood/analyze', 'POST', {
    moodRecords: [],
    userName: 'Karthik',
  });
  if (resMoodEmpty.status === 200 && resMoodEmpty.body.summary.includes('Karthik')) {
    console.log('✅ PASS: Mood analysis returns gentle introductory reflection.');
    passed++;
  } else {
    console.error('❌ FAIL: Unexpected mood analysis response:', resMoodEmpty);
    failed++;
  }

  // TEST 6: Mood Analysis Endpoint with multiple records
  console.log('\n[TEST 6] Testing Mood Analysis with Sample Records...');
  const resMoodSamples = await makeRequest('/api/mood/analyze', 'POST', {
    moodRecords: [
      { mood: 'reflective', intensity: 4, timestamp: new Date().toISOString() },
      { mood: 'joyful', intensity: 5, timestamp: new Date().toISOString() },
    ],
    userName: 'Karthik',
  });
  if (resMoodSamples.status === 200 && resMoodSamples.body.summary.includes('2 reflections')) {
    console.log('✅ PASS: Mood analysis reflects recorded check-in count accurately.');
    passed++;
  } else {
    console.error('❌ FAIL: Unexpected mood analysis sample response:', resMoodSamples);
    failed++;
  }

  // TEST 7: OTP Request validation
  console.log('\n[TEST 7] Testing Email OTP Request Validation...');
  const resOtpInvalid = await makeRequest('/api/otp/send', 'POST', {
    email: 'not-an-email',
    mode: 'login',
  });
  if (resOtpInvalid.status === 400) {
    console.log('✅ PASS: Invalid email address rejected with 400 Bad Request.');
    passed++;
  } else {
    console.error('❌ FAIL: Expected 400 for invalid email, got:', resOtpInvalid);
    failed++;
  }

  // TEST 8: OTP Reset Endpoint
  console.log('\n[TEST 8] Testing Email OTP Reset Endpoint...');
  const resOtpReset = await makeRequest('/api/otp/reset', 'POST', {
    email: 'traveler.reset.test@example.com',
    mode: 'register',
  });
  if (resOtpReset.status === 200 && resOtpReset.body.success === true) {
    console.log('✅ PASS: OTP Reset cleanly issues fresh code and clears cooldown.');
    passed++;
  } else {
    console.error('❌ FAIL: Expected 200 for OTP reset, got:', resOtpReset);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
