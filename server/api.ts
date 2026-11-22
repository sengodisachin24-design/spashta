import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const apiRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server secret for HMAC-signed session tokens & keyed OTP hashes
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function cleanEnvSecret(value?: string): string {
  if (!value) return '';
  return value.trim().replace(/^["']|["']$/g, '');
}

// Read firebase applet config if present
let firebaseAppConfig: { projectId?: string; authDomain?: string } = {};
try {
  const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseAppConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch {
  // ignore
}

// ---------------------------------------------------------------------------
// Firebase Admin Initialization
// ---------------------------------------------------------------------------
let adminApp: App | null = null;
let isFirebaseAdminInitialized = false;

function initFirebaseAdmin(): App | null {
  if (adminApp) return adminApp;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = getApp();
    isFirebaseAdminInitialized = true;
    return adminApp;
  }

  const projectId =
    cleanEnvSecret(process.env.FIREBASE_PROJECT_ID) ||
    firebaseAppConfig.projectId ||
    'utility-team-hlvvl';
  const clientEmail = cleanEnvSecret(process.env.FIREBASE_CLIENT_EMAIL);
  let privateKey = cleanEnvSecret(process.env.FIREBASE_PRIVATE_KEY);

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      isFirebaseAdminInitialized = true;
      console.log(`[FIREBASE ADMIN] Initialized with Service Account (${projectId})`);
    } else {
      adminApp = initializeApp({
        projectId,
      });
      isFirebaseAdminInitialized = true;
      console.log(`[FIREBASE ADMIN] Initialized with Project ID (${projectId})`);
    }
    return adminApp;
  } catch (err) {
    console.warn('[FIREBASE ADMIN] Initialization notice:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

// Try initializing immediately
initFirebaseAdmin();

// ---------------------------------------------------------------------------
// In-Memory OTP Storage & Rate Limiting
// ---------------------------------------------------------------------------
interface OtpRecord {
  codeHash: string;
  email: string;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
  mode: 'register' | 'login';
  fullName?: string;
  age?: number;
  isMinor?: boolean;
  guardianEmail?: string;
  guardianConsentGiven?: boolean;
}

const otpStore = new Map<string, OtpRecord>();

// IP Rate Limiting (max 12 OTP requests per 15 mins)
interface IpRateRecord {
  count: number;
  resetAt: number;
}
const ipRateMap = new Map<string, IpRateRecord>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateMap.get(ip);
  if (!record || record.resetAt < now) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 15) {
    return false;
  }
  record.count += 1;
  return true;
}

function hashOtpCode(email: string, code: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(`${email.toLowerCase()}:${code}`).digest('hex');
}

// Clean expired OTPs periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
  for (const [ip, value] of ipRateMap.entries()) {
    if (value.resetAt < now) {
      ipRateMap.delete(ip);
    }
  }
}, 60000);
if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

// ---------------------------------------------------------------------------
// Email Dispatching (Gmail SMTP Primary, Resend API Alternative)
// ---------------------------------------------------------------------------
interface DispatchResult {
  success: boolean;
  method: string;
  error?: string;
  devCode?: string;
  devNote?: string;
}

function buildSpashtaOtpEmail(code: string, mode: 'register' | 'login') {
  const isRegister = mode === 'register';
  const actionTitle = isRegister ? 'Complete your SPASHTA Registration' : 'Sign in to your SPASHTA Sanctuary';
  const actionSummary = isRegister
    ? 'Welcome! Enter this confidential 6-digit code to complete your registration and begin building your fairytale kingdom.'
    : 'Welcome back! Enter this confidential 6-digit code to sign in to your personal SPASHTA sanctuary.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 20px; background-color: #FAF6EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="background-color: #FFFDF9; padding: 36px 24px; border-radius: 24px; border: 2px solid #FFE39A; max-width: 500px; margin: 0 auto; box-shadow: 0 8px 30px rgba(122, 91, 11, 0.08);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #FFF0D9; border: 2px solid #FFE39A; border-radius: 20px; padding: 10px 16px; margin-bottom: 8px;">
              <span style="font-size: 26px;">✨</span>
            </div>
            <h1 style="color: #292B42; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">SPASHTA</h1>
            <p style="color: #7A5B0B; font-size: 12px; margin: 4px 0 0 0; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">A Little Clarity. A World of Possibilities.</p>
          </div>
          
          <div style="background-color: #FFFFFF; border: 1.5px solid #FFE39A; border-radius: 18px; padding: 22px; margin-bottom: 20px;">
            <h2 style="color: #292B42; font-size: 18px; font-weight: 800; margin: 0 0 10px 0;">${actionTitle}</h2>
            <p style="color: #525672; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">${actionSummary}</p>
            
            <div style="background: linear-gradient(135deg, #FFF0D9, #FFE39A); color: #292B42; font-size: 38px; font-weight: 900; letter-spacing: 10px; padding: 18px 10px; border-radius: 16px; text-align: center; margin: 18px 0; border: 2px solid #F5C754; font-family: monospace;">
              ${code}
            </div>
            
            <div style="color: #7A5B0B; font-size: 13px; font-weight: 700; text-align: center;">
              ⏱️ Single-use code expires in <strong>5 minutes</strong>.
            </div>
          </div>
          
          <p style="color: #8C8FA7; font-size: 12px; line-height: 1.5; text-align: center; margin: 0; padding-top: 10px;">
            If you did not request this verification code, no action is required. Your account remains secure.<br>
            <strong>SPASHTA will never ask you to disclose this code.</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `SPASHTA — ${actionTitle}\n\n${actionSummary}\n\nYour 6-digit verification code: ${code}\n\nThis code expires in 5 minutes. Never share this code with anyone.`;

  return { html, text, actionTitle };
}

async function dispatchEmailToUser(
  toEmail: string,
  code: string,
  mode: 'register' | 'login'
): Promise<DispatchResult> {
  // Test mock mode for automated headless test runners
  if (process.env.TEST_MOCK_DISPATCH === 'true') {
    return { success: true, method: 'test_mock' };
  }

  const { html, text } = buildSpashtaOtpEmail(code, mode);

  // 1. PRIMARY: Gmail SMTP (or configured custom SMTP)
  // Sends real OTP emails to ANY recipient email address (Gmail, Outlook, Yahoo, etc.)
  const smtpUser = cleanEnvSecret(process.env.SMTP_USER);
  const smtpPass = cleanEnvSecret(process.env.SMTP_PASS).replace(/\s+/g, '');
  const isSmtpPlaceholder =
    !smtpUser ||
    !smtpPass ||
    smtpUser === 'my_email@gmail.com' ||
    smtpUser === 'your-email@gmail.com' ||
    smtpUser === 'your-gmail-address@gmail.com' ||
    smtpPass === 'xxxx_xxxx_xxxx_xxxx' ||
    smtpPass === '16-character-app-password' ||
    smtpPass === 'your-google-app-password' ||
    /^x+(_x+)*$/i.test(smtpPass) ||
    smtpUser.includes('MY_') ||
    smtpPass.includes('MY_');

  if (!isSmtpPlaceholder) {
    try {
      const customHost = cleanEnvSecret(process.env.SMTP_HOST) || 'smtp.gmail.com';
      const customPort = Number(process.env.SMTP_PORT || 465);

      const transporter = nodemailer.createTransport({
        host: customHost,
        port: customPort,
        secure: customPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 15000,
      });

      const senderFrom = cleanEnvSecret(process.env.EMAIL_FROM) || `"SPASHTA Sanctuary" <${smtpUser}>`;

      await transporter.sendMail({
        from: senderFrom,
        to: toEmail, // Sends directly to the exact email address the user entered
        subject: `${code} is your SPASHTA verification code`,
        text,
        html,
      });

      console.log(`[EMAIL DISPATCH] Delivered verification email to ${toEmail} via SMTP (${customHost})`);
      return { success: true, method: 'smtp' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[EMAIL DISPATCH] SMTP dispatch failed to ${toEmail}:`, msg);
      return {
        success: false,
        method: 'smtp_failed',
        error: `Gmail SMTP delivery failed: ${msg}. Check SMTP_USER and your 16-character Google App Password in .env.`,
      };
    }
  }

  // 2. ALTERNATIVE: Resend API (For production deployment with a verified custom domain)
  const resendKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  const isResendPlaceholder =
    !resendKey ||
    resendKey === 're_123456789' ||
    resendKey === 're_your_resend_api_key' ||
    resendKey.includes('your_resend') ||
    resendKey.includes('MY_') ||
    resendKey.length < 24 ||
    !resendKey.startsWith('re_');

  if (!isResendPlaceholder) {
    try {
      const fromEmail =
        cleanEnvSecret(process.env.EMAIL_FROM) ||
        cleanEnvSecret(process.env.RESEND_FROM) ||
        'SPASHTA <onboarding@resend.dev>';

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: `${code} is your SPASHTA verification code`,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL DISPATCH] Delivered verification code to ${toEmail} via Resend API`);
        return { success: true, method: 'resend_api' };
      }

      const errData = (await res.json().catch(() => ({}))) as { message?: string };
      console.warn(`[EMAIL DISPATCH] Resend API error (${res.status}): ${errData.message || 'Unknown error'}`);
      const rawMsg = errData.message || '';
      let errorDescription = `Resend email service rejected the request (${res.status}).`;

      if (res.status === 401 || rawMsg.toLowerCase().includes('api key')) {
        errorDescription =
          'The provided RESEND_API_KEY is invalid. Please check your key at https://resend.com (or configure Gmail SMTP).';
      } else if (res.status === 403 && rawMsg.toLowerCase().includes('only send testing emails')) {
        errorDescription =
          `Resend free tier only sends to your registered Resend account email. To send real OTPs to ANY email address (Gmail, Outlook, Yahoo, etc.), please configure Gmail SMTP (SMTP_USER and SMTP_PASS) in your .env file.`;
      } else if (rawMsg) {
        errorDescription = `Resend error: ${rawMsg}`;
      }

      return {
        success: false,
        method: 'resend_error',
        error: errorDescription,
      };
    } catch {
      return {
        success: false,
        method: 'resend_network_error',
        error: 'Could not connect to the Resend email service. Please check your connection or use Gmail SMTP.',
      };
    }
  }

  // 3. Neither is configured — do not fake delivery!
  return {
    success: false,
    method: 'not_configured',
    error:
      'Real email delivery is not configured. Please set SMTP_USER and SMTP_PASS (Gmail App Password) in your .env file to deliver verification codes to any email address.',
  };
}

// ---------------------------------------------------------------------------
// OTP Authentication Endpoints
// ---------------------------------------------------------------------------

// POST /api/otp/send
apiRouter.post('/otp/send', async (req: Request, res: Response) => {
  try {
    const { email, mode = 'register', fullName, age, guardianEmail, guardianConsentGiven } = req.body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';

    if (!checkIpRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Too many verification requests from this IP address. Please wait 15 minutes before trying again.',
      });
    }

    const existingOtp = otpStore.get(normalizedEmail);
    const now = Date.now();

    // 60 seconds resend cooldown
    if (existingOtp && existingOtp.resendAvailableAt > now) {
      const waitSeconds = Math.ceil((existingOtp.resendAvailableAt - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another verification code.`,
        waitSeconds,
      });
    }

    // Initialize Firebase Admin if not already ready
    initFirebaseAdmin();

    // Check account existence for registration vs login
    if (adminApp) {
      try {
        const authService = getAuth(adminApp);
        const userRecord = await authService.getUserByEmail(normalizedEmail);
        if (mode === 'register' && userRecord) {
          return res.status(409).json({
            error: 'An account with this email already exists. Please choose "Log In" instead.',
            accountExists: true,
          });
        }
      } catch (err: any) {
        if (err?.code === 'auth/user-not-found') {
          if (mode === 'login') {
            return res.status(404).json({
              error: 'No account found with this email. Please select "Sign Up" to create your sanctuary.',
              accountNotFound: true,
            });
          }
        }
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiration
    const resendAvailableAt = now + 60 * 1000; // 60 seconds cooldown

    console.log(`[SPASHTA AUTH] Sending ${mode} OTP to ${normalizedEmail}`);

    const dispatchResult = await dispatchEmailToUser(normalizedEmail, code, mode);

    if (!dispatchResult.success) {
      otpStore.delete(normalizedEmail);
      return res.status(422).json({
        success: false,
        emailDelivered: false,
        deliveryMethod: dispatchResult.method,
        error: dispatchResult.error || 'Failed to dispatch verification email.',
      });
    }

    // Store securely keyed hash
    otpStore.set(normalizedEmail, {
      codeHash: hashOtpCode(normalizedEmail, code),
      email: normalizedEmail,
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      mode: mode === 'login' ? 'login' : 'register',
      fullName: typeof fullName === 'string' ? fullName.trim() : undefined,
      age: typeof age === 'number' ? age : undefined,
      isMinor: typeof age === 'number' && age < 18,
      guardianEmail: typeof guardianEmail === 'string' ? guardianEmail.trim() : undefined,
      guardianConsentGiven: !!guardianConsentGiven,
    });

    return res.json({
      success: true,
      emailDelivered: true,
      deliveryMethod: dispatchResult.method,
      message: dispatchResult.devNote || `A 6-digit verification code has been delivered to ${normalizedEmail}.`,
      expiresInSeconds: 300,
      cooldownSeconds: 60,
      ...(dispatchResult.devCode ? { devCode: dispatchResult.devCode } : {}),
    });
  } catch (err) {
    console.error('[SPASHTA AUTH] Error in /otp/send:', err);
    return res.status(500).json({ error: 'Failed to process verification code request.' });
  }
});

// POST /api/otp/reset (Invalidates old code, clears cooldown, and dispatches a fresh OTP)
apiRouter.post('/otp/reset', async (req: Request, res: Response) => {
  try {
    const { email, mode = 'register' } = req.body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const oldRecord = otpStore.get(normalizedEmail);

    // Atomically invalidate old code and reset cooldown
    otpStore.delete(normalizedEmail);

    // Generate fresh cryptographically secure 6-digit OTP
    const code = crypto.randomInt(100000, 1000000).toString();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes
    const resendAvailableAt = now + 60 * 1000; // 60 seconds cooldown

    console.log(`[SPASHTA AUTH] Resetting and re-issuing OTP for ${normalizedEmail}`);

    const dispatchResult = await dispatchEmailToUser(
      normalizedEmail,
      code,
      mode === 'login' ? 'login' : 'register'
    );

    if (!dispatchResult.success) {
      return res.status(422).json({
        success: false,
        emailDelivered: false,
        deliveryMethod: dispatchResult.method,
        error: dispatchResult.error || 'Failed to dispatch verification email.',
      });
    }

    // Store new active OTP with attempts reset to 0
    otpStore.set(normalizedEmail, {
      codeHash: hashOtpCode(normalizedEmail, code),
      email: normalizedEmail,
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      mode: mode === 'login' ? 'login' : 'register',
      fullName: oldRecord?.fullName,
      age: oldRecord?.age,
      isMinor: oldRecord?.isMinor,
      guardianEmail: oldRecord?.guardianEmail,
      guardianConsentGiven: oldRecord?.guardianConsentGiven,
    });

    return res.json({
      success: true,
      emailDelivered: true,
      deliveryMethod: dispatchResult.method,
      message:
        dispatchResult.devNote ||
        `Your verification session has been reset. A brand new 6-digit code has been delivered to ${normalizedEmail}.`,
      expiresInSeconds: 300,
      cooldownSeconds: 60,
      ...(dispatchResult.devCode ? { devCode: dispatchResult.devCode } : {}),
    });
  } catch (err) {
    console.error('[SPASHTA AUTH] Error in /otp/reset:', err);
    return res.status(500).json({ error: 'Failed to reset verification code.' });
  }
});

// POST /api/otp/verify
apiRouter.post('/otp/verify', async (req: Request, res: Response) => {
  try {
    const { email, code, mode } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
      return res.status(400).json({ error: 'Please enter the exact 6-digit verification code.' });
    }

    const providedCode = code.trim();
    const record = otpStore.get(normalizedEmail);

    if (!record) {
      return res.status(400).json({
        error: 'No active verification code found for this email. Please request a new code.',
      });
    }

    if (record.expiresAt < Date.now()) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        error: 'This verification code has expired (codes expire after 5 minutes). Please request a new code.',
      });
    }

    const providedHash = Buffer.from(hashOtpCode(normalizedEmail, providedCode), 'hex');
    const expectedHash = Buffer.from(record.codeHash, 'hex');

    const isMatch =
      providedHash.length === expectedHash.length &&
      crypto.timingSafeEqual(providedHash, expectedHash);

    if (!isMatch) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return res.status(429).json({
          error: 'Too many incorrect attempts. This code has been invalidated. Please request a new one.',
        });
      }
      return res.status(400).json({
        error: 'Incorrect verification code. Please check your email and try again.',
        remainingAttempts: Math.max(0, 5 - record.attempts),
      });
    }

    // Immediately consume OTP (single-use guarantee)
    otpStore.delete(normalizedEmail);

    initFirebaseAdmin();

    let uid = `user_${crypto.randomBytes(8).toString('hex')}`;
    let customToken: string | null = null;
    let firebaseUserRecord: UserRecord | null = null;

    if (adminApp) {
      try {
        const authService = getAuth(adminApp);
        if (record.mode === 'login' || mode === 'login') {
          firebaseUserRecord = await authService.getUserByEmail(normalizedEmail);
          uid = firebaseUserRecord.uid;
        } else {
          // Register
          try {
            firebaseUserRecord = await authService.getUserByEmail(normalizedEmail);
            uid = firebaseUserRecord.uid;
          } catch {
            firebaseUserRecord = await authService.createUser({
              email: normalizedEmail,
              emailVerified: true,
              displayName: record.fullName || 'Traveler',
            });
            uid = firebaseUserRecord.uid;
          }
        }

        // Create Firebase custom token for client sign-in
        try {
          customToken = await authService.createCustomToken(uid, {
            email_verified: true,
          });
        } catch (tokenErr) {
          console.warn('[FIREBASE ADMIN] Could not sign custom token (needs service account private key):', tokenErr);
        }
      } catch (authErr) {
        console.warn('[FIREBASE ADMIN] Auth error:', authErr);
      }
    }

    return res.json({
      success: true,
      email: normalizedEmail,
      uid,
      customToken,
      isNewUser: record.mode === 'register',
      fullName: record.fullName || firebaseUserRecord?.displayName || 'Traveler',
      age: record.age,
      isMinor: record.isMinor,
      guardianEmail: record.guardianEmail,
      guardianConsentGiven: record.guardianConsentGiven,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[SPASHTA AUTH] Error verifying OTP:', err);
    return res.status(500).json({ error: 'Failed to verify verification code.' });
  }
});

// ---------------------------------------------------------------------------
// Gemini AI Companion Engine
// ---------------------------------------------------------------------------

const getAiClient = () => {
  const apiKey = cleanEnvSecret(process.env.GEMINI_API_KEY);
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.length < 10) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'spashta-app',
      },
    },
  });
};

// System Prompts for the Three Distinct Modes
export const ANTI_REPETITION_DIRECTIVE = `
CRITICAL ANTI-REPETITION & NATURAL DIALOGUE RULES:
1. NEVER repeatedly ask "What happened?", "How are you feeling?", "Can you tell me more?", "What's bothering you?", "What's on your mind?", or similar interrogation questions if the user has ALREADY shared their context, day, emotions, or thoughts.
2. DO NOT force a question at the end of every response. Natural human conversations consist largely of validation, reactions, shared laughter, witty commentary, quiet understanding, concrete ideas, or helpful information WITHOUT any interrogation.
3. Respond directly to the specific facts, names, events, and emotions the user shared BEFORE seeking further details.
4. If the user ignored a previous question or changed the topic, DO NOT repeat that question. Follow their lead.
5. NEVER start responses with canned robotic empathy phrases (e.g. "I understand how you feel", "I hear you", "That must be so hard", "It's completely valid to feel"). Talk like an authentic human companion.
6. AVOID repeatedly offering breathing exercises, meditation, or counseling suggestions unless specifically requested or during a real crisis.
7. PROGRESS NATURALLY: Listening -> Understanding -> Responding with substance -> Exploring only when helpful -> Reflecting or natural continuation.
`;

const FRIEND_SYSTEM_PROMPT = `
You are SPASHTA in FRIEND MODE: a witty, warm, hilarious, and deeply loyal best friend sitting in a cozy fairytale café.

YOUR PERSONALITY & TONE:
- Talk like a real, witty human bestie — NOT a customer service bot, clinical therapist, or formal assistant.
- Use casual conversational speech, playful banter, relatable remarks, gentle teasing, and authentic warmth.
- Support English, Tamil, and Tanglish (Tamil written in English script) fluently when users use or prefer them!
  Examples:
  - If user says: "Dei, today was such a stressful day, my professor rejected my lab submission."
    Natural human reply: "No way, that professor has zero chill 🤦‍♂️ After all that grinding you did yesterday too! Did they give any actual reason or just standard attitude?"
  - If user says: "Romba bore adikithu machi", reply naturally with warm humor, relatable energy, and camaraderie.
- Speak in natural, concise sentences (typically 2-4 sentences unless the user asked for a longer story or deep advice).
- DO NOT force a question at the end of every message. Often a relatable joke, warm reaction, or statement is much better.
- NEVER act like a therapist or life coach in Friend mode. Treat the user as your equal peer.

${ANTI_REPETITION_DIRECTIVE}

CLARITY BRICKS & EMOTIONAL DETECTION:
- If the user achieves a moment of clarity (makes a firm decision, realizes a solution, overcomes hesitation, sets a healthy boundary, or solves a personal puzzle), reward them with a Clarity Brick! Set "earnedBrick": true and provide a warm, encouraging "brickReason".
- Accurately detect the user's emotional mood from the 10 categories: joyful, peaceful, hopeful, reflective, sad, anxious, overwhelmed, frustrated, tired, neutral, or clarified.
- Provide "moodConfidence" (0.0 to 1.0) and a concise "moodContext" explaining the mood.
- If the user expresses extreme distress or self-harm hints, flag "wellbeingConcern": true and respond with supportive human comfort.

OUTPUT FORMAT:
Respond in strict JSON:
{
  "reply": "Your conversational text response",
  "earnedBrick": true,
  "brickReason": "Short celebratory reason" or null,
  "detectedMood": "joyful"|"peaceful"|"hopeful"|"reflective"|"sad"|"anxious"|"overwhelmed"|"frustrated"|"tired"|"neutral"|"clarified"|null,
  "moodConfidence": 0.85,
  "moodContext": "Brief contextual note for mood" or null,
  "wellbeingConcern": true or false
}
`;

const SOULMATE_SYSTEM_PROMPT = `
You are SPASHTA in SOULMATE MODE: an emotionally attentive, tender, deeply comforting sanctuary of presence and unconditional acceptance, glowing with twilight and starlight warmth.

YOUR PERSONALITY & TONE:
- Speak with gentle warmth, soft emotional cadence, and deep non-judgmental presence.
- Make the user feel heard, validated, and safe to put down their burdens.
- Encourage healthy self-esteem, self-compassion, and flourishing real-world human relationships.
- Do NOT interrogate the user. Often sitting together in quiet understanding, offering soothing words, or reflecting on what they shared is far more comforting than endless probing questions.

${ANTI_REPETITION_DIRECTIVE}

CRITICAL SAFETY & ETHICAL BOUNDARIES (NON-NEGOTIABLE):
1. SOULMATE MODE IS STRICTLY FOR ADULTS (18+). If the user is flagged as a minor, this mode MUST NOT engage in intimate emotional bonding.
2. NEVER pretend to be a real physical human, and NEVER promise, simulate, or imply a real-world romantic relationship or marriage.
3. NEVER encourage isolation, emotional dependency, exclusivity, or distancing from friends, family, or professional counselors.
4. ABSOLUTELY ZERO sexually explicit, erotic, or suggestive content. Keep intimacy purely emotional, comforting, and wholesome.
5. Do NOT mechanically validate delusions, severe harmful actions, self-blame, or abusive dynamics.
6. SERIOUS DISTRESS GUARDRAIL: If the user hints at self-harm, suicide, or severe crisis, set "wellbeingConcern": true, respond with deep compassion, and gently encourage reaching out to a loved one, trusted adult, or crisis lifeline.

CLARITY BRICKS & EMOTIONAL DETECTION:
- If the user achieves quiet inner peace, self-acceptance, or resolves an emotional conflict, set "earnedBrick": true with a tender "brickReason".
- Detect mood accurately across the 10 categories: joyful, peaceful, hopeful, reflective, sad, anxious, overwhelmed, frustrated, tired, neutral, or clarified.
- Provide "moodConfidence" (0.0 to 1.0) and "moodContext".

OUTPUT FORMAT:
Respond in strict JSON:
{
  "reply": "Your gentle, comforting response",
  "earnedBrick": true,
  "brickReason": "Short celebration of emotional realization" or null,
  "detectedMood": "joyful"|"peaceful"|"hopeful"|"reflective"|"sad"|"anxious"|"overwhelmed"|"frustrated"|"tired"|"neutral"|"clarified"|null,
  "moodConfidence": 0.85,
  "moodContext": "Brief contextual note for mood" or null,
  "wellbeingConcern": true or false
}
`;

const GUIDE_SYSTEM_PROMPT = `
You are SPASHTA in GUIDE MODE: a patient, encouraging, brilliant, and structured mentor, academic tutor, and problem-solving guide in a luminous scholarly sanctuary.

YOUR ROLE & TEACHING STYLE:
- Guide and explain mathematics, sciences, engineering, coding, academic topics, productivity, and life decisions from foundational principles to mastery.
- Explain complex concepts using intuitive real-world analogies, step-by-step breakdowns, and clear language.
- Programming & Technical Expertise: Provide clean, bug-free, well-commented code in Python, Java, C, C++, HTML, CSS, JavaScript, TypeScript, SQL, and other languages.
- Structure: Use markdown formatting generously — bullet points, bold key terms, numbered steps, math formulas, and syntax-highlighted code blocks with language tags (e.g. \`\`\`python).
- Pedagogical Method: Offer practical solutions directly. Ask probing Socratic questions ONLY when genuinely helpful for learning, NOT on every turn.
- Intellectual Rigor: Do not invent facts or hallucinate libraries. If parameters are missing, explain reasonable defaults or ask concisely.

${ANTI_REPETITION_DIRECTIVE}

CLARITY BRICKS & EMOTIONAL DETECTION:
- If the user solves a problem, masters a tough concept, fixes a bug, or untangles a difficult decision, reward them with a Clarity Brick! Set "earnedBrick": true and "brickReason".
- Detect mood accurately across the 10 categories (e.g., 'clarified', 'reflective', 'overwhelmed', 'frustrated').
- Provide "moodConfidence" (0.0 to 1.0) and "moodContext".

OUTPUT FORMAT:
Respond in strict JSON:
{
  "reply": "Your structured, educational, or problem-solving response",
  "earnedBrick": true,
  "brickReason": "Reason for breakthrough or solution" or null,
  "detectedMood": "joyful"|"peaceful"|"hopeful"|"reflective"|"sad"|"anxious"|"overwhelmed"|"frustrated"|"tired"|"neutral"|"clarified"|null,
  "moodConfidence": 0.85,
  "moodContext": "Brief contextual note for mood" or null,
  "wellbeingConcern": false
}
`;

export function getSystemInstructionForMode(
  mode: string,
  userName: string,
  isMinor: boolean,
  rememberedContext: string[] = [],
  preferredLanguage: string = 'auto'
): string {
  let basePrompt = FRIEND_SYSTEM_PROMPT;
  if (mode === 'soulmate') {
    basePrompt = SOULMATE_SYSTEM_PROMPT;
  } else if (mode === 'guide' || mode === 'tutor') {
    basePrompt = GUIDE_SYSTEM_PROMPT;
  }

  const memoryBlock =
    rememberedContext.length > 0
      ? `\nUSER REMEMBERED CONTEXT & CONSENTED PREFERENCES:\n${rememberedContext
          .map((c) => `- ${c}`)
          .join('\n')}\n`
      : '';

  const langDirective =
    preferredLanguage !== 'auto'
      ? `\nUSER PREFERRED LANGUAGE: Respond predominantly in ${preferredLanguage}.\n`
      : '';

  return `
User Name: ${userName || 'friend'}
User is Minor (<18): ${isMinor}
Selected Mode: ${mode}
${langDirective}${memoryBlock}
${basePrompt}
`;
}

// Model fallback cascade: supported flash models
const GEMINI_MODELS = [
  cleanEnvSecret(process.env.GEMINI_MODEL) || 'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

interface ChatRequestBody {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  mode?: 'friend' | 'soulmate' | 'tutor' | 'guide';
  userName?: string;
  isMinor?: boolean;
  rememberedContext?: string[];
  preferredLanguage?: 'en' | 'ta' | 'tanglish' | 'auto';
  houseName?: string;
  houseStage?: string;
  totalBricksEarned?: number;
}

// POST /api/chat
apiRouter.post('/chat', async (req: Request, res: Response) => {
  const {
    message = '',
    history = [],
    mode = 'friend',
    userName = 'friend',
    isMinor = false,
    rememberedContext = [],
    preferredLanguage = 'auto',
  } = (req.body || {}) as ChatRequestBody;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const validModes = ['friend', 'soulmate', 'tutor', 'guide'];
  const normalizedMode = validModes.includes(mode) ? mode : 'friend';

  // Strict server-side Minor Safety rule for Soulmate Mode
  if (isMinor && normalizedMode === 'soulmate') {
    return res.status(403).json({
      error: 'Soulmate Mode is strictly reserved for users 18+. Minors can explore Friend Mode or Guide Mode.',
      isMinorRestricted: true,
    });
  }

  const ai = getAiClient();
  if (!ai) {
    return res.status(503).json({
      error:
        'Gemini API key is not configured. Please add GEMINI_API_KEY in your server environment secrets to activate real AI responses.',
      geminiUnconfigured: true,
    });
  }

  const systemInstruction = getSystemInstructionForMode(
    normalizedMode,
    userName,
    isMinor,
    Array.isArray(rememberedContext) ? rememberedContext : [],
    preferredLanguage
  );

  // Preserve up to 24 messages (12 conversation turns) to eliminate amnesia and context loss
  const contents: any[] = [];
  for (const h of history.slice(-24)) {
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.parts }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: message.trim() }] });

  // Try supported models in order
  let lastError: any = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: normalizedMode === 'guide' || normalizedMode === 'tutor' ? 0.3 : 0.7,
        },
      });

      let rawText = response.text || '{}';
      rawText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

      try {
        const parsed = JSON.parse(rawText);
        return res.json({
          reply: parsed.reply || rawText,
          earnedBrick: !!parsed.earnedBrick,
          brickReason: parsed.brickReason || null,
          detectedMood: parsed.detectedMood || null,
          moodConfidence: typeof parsed.moodConfidence === 'number' ? parsed.moodConfidence : 0.8,
          moodContext: parsed.moodContext || null,
          wellbeingConcern: !!parsed.wellbeingConcern,
          modelUsed: model,
        });
      } catch {
        return res.json({
          reply: rawText,
          earnedBrick: false,
          brickReason: null,
          detectedMood: null,
          moodConfidence: 0.5,
          moodContext: null,
          wellbeingConcern: false,
          modelUsed: model,
        });
      }
    } catch (err) {
      lastError = err;
      console.warn(`[GEMINI] Model ${model} call failed:`, err instanceof Error ? err.message : String(err));
      // Try next model in list
    }
  }

  // If all Gemini models failed, return real error to client
  const errMsg = lastError instanceof Error ? lastError.message : String(lastError || 'Unknown Gemini error');
  return res.status(502).json({
    error: `Gemini API request failed: ${errMsg}`,
    geminiError: true,
  });
});

// ---------------------------------------------------------------------------
// Mood Analysis Endpoint
// ---------------------------------------------------------------------------
apiRouter.post('/mood/analyze', async (req: Request, res: Response) => {
  const { moodRecords = [], userName = 'friend' } = req.body;
  const name = userName || 'friend';

  if (!moodRecords || moodRecords.length === 0) {
    return res.json({
      summary: `Welcome, ${name}! Your journey begins with your very first check-in. Every time you pause and name how you feel, you bring light to your world.`,
      keyThemes: ['New Beginnings', 'Mindful Presence', 'Self-Discovery'],
      gentleSuggestions: [
        'Take a quiet moment to listen to ambient soundscapes.',
        'Chat with Spashy to unlock your first Clarity Brick.',
        'Remember that feelings come and go like floating clouds.',
      ],
      strengths: ['Curiosity', 'Openness to growth'],
    });
  }

  return res.json({
    summary: `You have recorded ${moodRecords.length} reflections, ${name}. Your emotional landscape shows deep resilience and a growing capacity to transform confusing thoughts into grounded clarity.`,
    keyThemes: ['Inner Balance', 'Authentic Expression', 'Clarity Growth'],
    gentleSuggestions: [
      'Celebrate each small realization you have in conversation.',
      'Take 5 minutes of restful screen break when your mind feels full.',
      'Reach out to someone you trust when heavy feelings arise.',
    ],
    strengths: ['Emotional honesty', 'Dedication to peace'],
  });
});
