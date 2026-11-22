import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function main() {
  const targetEmail = process.argv[2] || 'sengodi.sachin24@gmail.com';
  console.log(`\n======================================================`);
  console.log(`[SPASHTA] Testing Real Email Dispatch to: ${targetEmail}`);
  console.log(`======================================================\n`);

  const smtpUser = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const smtpPass = (process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  const resendKey = (process.env.RESEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  console.log(`1. Primary: SMTP_USER: ${smtpUser || 'Not set'}`);
  console.log(`   SMTP_PASS: ${smtpPass ? '****** (configured)' : 'Not set'}`);
  console.log(`2. Alternative: RESEND_API_KEY: ${resendKey ? (resendKey.startsWith('re_') && resendKey.length > 20 ? 'Configured (' + resendKey.slice(0, 7) + '...)' : 'Invalid/Placeholder') : 'Not set'}`);

  // Test Primary: Gmail SMTP
  if (smtpUser && smtpPass && !smtpPass.includes('xxxx') && !smtpPass.includes('app-password')) {
    console.log(`\n[SMTP] Dispatching via Gmail SMTP (${smtpUser}) to ${targetEmail}...`);
    try {
      const customHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
      const customPort = Number(process.env.SMTP_PORT || 465);

      const transporter = nodemailer.createTransport({
        host: customHost,
        port: customPort,
        secure: customPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 15000,
      });

      console.log(`[SMTP] Verifying connection to ${customHost}:${customPort}...`);
      await transporter.verify();
      console.log(`✅ [SMTP] TLS authentication & connectivity verified successfully!`);

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"SPASHTA Sanctuary" <${smtpUser}>`,
        to: targetEmail,
        subject: '948201 is your SPASHTA Verification Test Code',
        text: 'This is a real test verification code from SPASHTA: 948201. Single-use code expires in 5 minutes.',
        html: `
          <div style="font-family: sans-serif; background: #FFFDF9; padding: 30px; border-radius: 20px; border: 2px solid #FFE39A; max-width: 480px; margin: auto;">
            <h2 style="color: #292B42; margin-top: 0;">SPASHTA Sanctuary</h2>
            <p style="color: #525672;">Your test verification code is:</p>
            <div style="background: linear-gradient(135deg, #FFF0D9, #FFE39A); color: #292B42; font-size: 36px; font-weight: 900; letter-spacing: 8px; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px solid #F5C754;">
              948201
            </div>
            <p style="color: #7A5B0B; font-size: 12px;">Delivered directly to: <strong>${targetEmail}</strong></p>
          </div>
        `,
      });

      console.log(`✅ SUCCESS! Real email delivered via Gmail SMTP! Message ID:`, info.messageId);
      return;
    } catch (err: any) {
      console.error(`❌ SMTP Error:`, err?.message || err);
    }
  }

  // Test Alternative: Resend API
  if (resendKey && resendKey.startsWith('re_') && resendKey.length > 20 && !resendKey.includes('your_resend')) {
    console.log(`\n[Resend] Dispatching via Resend API to ${targetEmail}...`);
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
          subject: '948201 is your SPASHTA Verification Test Code',
          html: `<p>This is a real test verification code from SPASHTA: <strong>948201</strong> delivered to ${targetEmail}</p>`,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`✅ SUCCESS! Real email sent via Resend API! ID:`, (body as any).id);
        return;
      } else {
        console.error(`❌ Resend API Error (${res.status}):`, body);
        if (res.status === 403) {
          console.log(`ℹ️  Note: Resend free tier only delivers to your registered account email.`);
          console.log(`   To send to any recipient (Outlook, Yahoo, other Gmail), configure Gmail SMTP above.`);
        }
      }
    } catch (err) {
      console.error(`❌ Resend Network Error:`, err);
    }
  }

  console.log(`\n⚠️  No active email dispatch service connected.`);
  console.log(`To deliver verification codes to user inboxes:`);
  console.log(`1. Configure Gmail SMTP in .env:`);
  console.log(`   SMTP_HOST="smtp.gmail.com"`);
  console.log(`   SMTP_PORT=465`);
  console.log(`   SMTP_USER="your-email@gmail.com"`);
  console.log(`   SMTP_PASS="16-character-app-password" (from myaccount.google.com/apppasswords)`);
}

main();
