import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function main() {
  const targetEmail = process.argv[2] || 'sengodi.sachin24@gmail.com';
  console.log(`\n======================================================`);
  console.log(`[SPASHTA] Testing Real Email Dispatch to: ${targetEmail}`);
  console.log(`======================================================\n`);

  const resendKey = (process.env.RESEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const smtpUser = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const smtpPass = (process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  console.log(`1. Checking RESEND_API_KEY: ${resendKey ? (resendKey.startsWith('re_') && resendKey.length > 20 ? 'Configured (' + resendKey.slice(0, 7) + '...)' : 'Invalid/Placeholder') : 'Not set'}`);
  console.log(`2. Checking SMTP_USER: ${smtpUser ? smtpUser : 'Not set'}`);
  console.log(`3. Checking SMTP_PASS: ${smtpPass ? '****** (configured)' : 'Not set'}`);

  if (resendKey && resendKey.startsWith('re_') && resendKey.length > 20 && !resendKey.includes('your_resend')) {
    console.log(`\nAttempting dispatch via Resend API...`);
    try {
      const fromEmail = process.env.EMAIL_FROM || process.env.RESEND_FROM || 'SPASHTA <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          subject: '849201 is your SPASHTA Verification Test Code',
          html: '<p>This is a real test verification code from SPASHTA: <strong>849201</strong></p>',
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`✅ SUCCESS! Real email sent via Resend API! ID:`, (body as any).id);
        return;
      } else {
        console.error(`❌ Resend API Error (${res.status}):`, body);
      }
    } catch (err) {
      console.error(`❌ Resend Network Error:`, err);
    }
  }

  if (smtpUser && smtpPass && !smtpPass.includes('xxxx')) {
    console.log(`\nAttempting dispatch via SMTP (${smtpUser})...`);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"SPASHTA" <${smtpUser}>`,
        to: targetEmail,
        subject: '849201 is your SPASHTA Verification Test Code',
        text: 'This is a real test verification code from SPASHTA: 849201',
      });

      console.log(`✅ SUCCESS! Real email sent via SMTP! Message ID:`, info.messageId);
      return;
    } catch (err: any) {
      console.error(`❌ SMTP Error:`, err?.message || err);
    }
  }

  console.log(`\n⚠️  No valid email credentials configured.`);
  console.log(`To receive real emails in your inbox, set in your environment:`);
  console.log(`Option A: RESEND_API_KEY="re_..." (from https://resend.com)`);
  console.log(`Option B: SMTP_USER="your-email@gmail.com" and SMTP_PASS="16-letter-app-password"`);
}

main();
