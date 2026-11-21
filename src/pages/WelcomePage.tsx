import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mail,
  User,
  Calendar,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpashtaMascot } from '../components/mascot/SpashtaMascot';

export const WelcomePage: React.FC = () => {
  const { registerUser, signInWithEmailOtp, signInWithGoogle, user, navigateTo } = useApp();

  // Tab: 'signup' or 'login'
  const [authTab, setAuthTab] = useState<'signup' | 'login'>('signup');

  // Step: 'details' | 'otp' | 'guardian_otp' | 'google_onboarding'
  const [step, setStep] = useState<'details' | 'otp' | 'guardian_otp' | 'google_onboarding'>('details');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(21);
  const [email, setEmail] = useState('');
  const [isGoogleAuthBusy, setIsGoogleAuthBusy] = useState(false);

  // Minor Safety flow
  const isMinor = typeof age === 'number' && age < 18;
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianConsentGiven, setGuardianConsentGiven] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function safeParseResponse(res: Response) {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { error: `Server returned status ${res.status}. Please try again.` };
    }
  }

  const handleSendOtp = async (targetEmail: string, isGuardian = false) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          mode: authTab === 'login' && !isGuardian ? 'login' : 'register',
          fullName: authTab === 'signup' ? fullName.trim() : undefined,
          age: typeof age === 'number' ? age : undefined,
          guardianEmail: isMinor ? guardianEmail.trim() : undefined,
          guardianConsentGiven: isMinor ? guardianConsentGiven : false,
        }),
      });

      const data = await safeParseResponse(res);
      setIsLoading(false);
      setDeliveryMethod(data.deliveryMethod || null);

      if (!res.ok || !data.emailDelivered) {
        setErrorMessage(
          data.error || 'Could not send verification email. Please check your email delivery configuration.'
        );
        if (data.waitSeconds) setCooldown(data.waitSeconds);
        return false;
      }

      if (data.devCode) {
        setSuccessMessage(`Verification code: ${data.devCode} (Development auto-fill).`);
        setOtpCode(data.devCode);
      } else {
        setSuccessMessage(data.message || `A 6-digit verification code has been dispatched to ${targetEmail}. Please check your inbox.`);
      }
      setCooldown(data.cooldownSeconds || 60);
      return true;
    } catch {
      setIsLoading(false);
      setErrorMessage('Could not reach the verification server. Please refresh and try again.');
      return false;
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setDeliveryMethod(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (authTab === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!age || age < 10 || age > 115) {
        setErrorMessage('Please enter a valid age (10 or above).');
        return;
      }

      if (isMinor) {
        if (!guardianEmail || !guardianEmail.includes('@')) {
          setErrorMessage('Please provide a parent or guardian email address.');
          return;
        }
        if (guardianEmail.trim().toLowerCase() === cleanEmail) {
          setErrorMessage('Guardian email must be different from your own email.');
          return;
        }
        if (!guardianConsentGiven) {
          setErrorMessage('Please acknowledge the guardian consent agreement.');
          return;
        }
      }
    }

    const sent = await handleSendOtp(cleanEmail);
    if (sent) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.trim();
    setErrorMessage('');
    setSuccessMessage('');

    if (!/^\d{6}$/.test(code)) {
      setErrorMessage('Please enter the exact 6-digit verification code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
          mode: authTab,
        }),
      });

      const data = await safeParseResponse(res);
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Verification failed. Please check the code.');
        return;
      }

      // If minor registering for the first time and guardian not verified yet
      if (authTab === 'signup' && isMinor && guardianEmail && step !== 'guardian_otp') {
        setOtpCode('');
        const guardianSent = await handleSendOtp(guardianEmail, true);
        if (guardianSent) {
          setSuccessMessage('Your email is verified! A verification code has now been sent to your parent/guardian.');
          setStep('guardian_otp');
        }
        return;
      }

      // Complete sign-in / registration
      await signInWithEmailOtp(data.customToken, {
        fullName: data.fullName || fullName.trim(),
        email: email.trim().toLowerCase(),
        age: typeof age === 'number' ? age : 21,
        isMinor: typeof age === 'number' && age < 18,
        guardianEmail: guardianEmail ? guardianEmail.trim() : undefined,
        guardianConsentGiven,
        isEmailVerified: true,
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(`Verification error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleVerifyGuardianOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const code = otpCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setErrorMessage('Please enter the 6-digit code sent to your parent or guardian email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guardianEmail.trim().toLowerCase(), code }),
      });

      const data = await safeParseResponse(res);
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Guardian verification failed. Please check the code.');
        return;
      }

      await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        age: Number(age),
        isMinor: true,
        guardianEmail: guardianEmail.trim(),
        guardianConsentGiven: true,
        isEmailVerified: true,
      });
    } catch {
      setIsLoading(false);
      setErrorMessage('Could not complete guardian verification. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setDeliveryMethod(null);
    setIsGoogleAuthBusy(true);
    try {
      const outcome = await signInWithGoogle();
      setIsGoogleAuthBusy(false);
      if (outcome.isNewUser) {
        if (!fullName.trim() && outcome.displayName) {
          setFullName(outcome.displayName);
        }
        setEmail(outcome.email);
        setSuccessMessage(`Google verified ${outcome.email}! Confirm your age below to finish setting up your sanctuary.`);
        setStep('google_onboarding');
      }
    } catch (err: unknown) {
      setIsGoogleAuthBusy(false);
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or blocked.';
      if (msg.includes('popup-closed-by-user') || msg.includes('cancelled')) {
        setErrorMessage('Google sign-in popup was closed. Please try again.');
      } else if (msg.includes('popup-blocked')) {
        setErrorMessage('Your browser blocked the Google popup. Please allow popups for this site and try again.');
      } else {
        setErrorMessage(msg);
      }
    }
  };

  const handleCompleteGoogleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!age || age < 10 || age > 115) {
      setErrorMessage('Please enter a valid age (10 or above).');
      return;
    }

    if (isMinor) {
      if (!guardianEmail || !guardianEmail.includes('@')) {
        setErrorMessage('Please provide a parent or guardian email address.');
        return;
      }
      if (guardianEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
        setErrorMessage('Guardian email must be different from your own email.');
        return;
      }
      if (!guardianConsentGiven) {
        setErrorMessage('Please acknowledge the guardian consent agreement.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        age: Number(age),
        isMinor,
        guardianEmail: isMinor ? guardianEmail.trim() : undefined,
        guardianConsentGiven: isMinor ? guardianConsentGiven : false,
        isEmailVerified: true,
      });
    } catch {
      setErrorMessage('Could not save your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FFF0D9]/50 to-[#EDF4FF] text-[#292B42] flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 relative overflow-hidden selection:bg-[#FFE39A] selection:text-[#292B42]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-10 left-12 w-64 h-64 bg-[#FFE39A]/35 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-28 right-16 w-80 h-80 bg-[#C9B8F2]/25 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-16 left-1/3 w-96 h-96 bg-[#A9D8F5]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 left-1/4 text-2xl animate-float-slow opacity-60">✨</div>
        <div className="absolute top-36 right-1/4 text-xl animate-drift opacity-60">⭐</div>
        <div className="absolute bottom-24 right-1/3 text-2xl animate-pulse-glow opacity-50">✨</div>
      </div>

      {/* Main Storybook Card */}
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-2xl border-2 border-[#FFE39A] rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(41,43,66,0.08)] relative z-10">
        {/* Brand Crest & Mascot */}
        <div className="text-center mb-6">
          <SpashtaMascot
            mood="welcoming"
            size="lg"
            showSpeechBubble={true}
            speechText={
              authTab === 'login'
                ? "Welcome back, friend! Let's sign in to your sanctuary."
                : "Welcome! I'm Spashy. Let's find a little clarity together."
            }
          />
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE39A] border border-[#F5C754] text-[#7A5B0B] text-xs font-black uppercase tracking-wider mt-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C754]" />
            <span>Personal Clarity Sanctuary</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-[#292B42] mt-2 tracking-tight">
            Welcome to <span className="text-[#966E0C]">SPASHTA</span>
          </h1>
          <p className="text-[#525672] text-sm sm:text-base mt-1.5 font-medium max-w-md mx-auto leading-relaxed">
            "A little clarity. A world of possibilities."
          </p>
        </div>

        {/* Existing user quick return banner */}
        {user && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF0D9] border-2 border-[#FFE39A] flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-[#7A5B0B] font-semibold">Welcome back, traveler</div>
              <div className="text-sm font-black text-[#292B42]">{user.fullName}</div>
            </div>
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] rounded-xl text-xs font-black hover:scale-105 transition shadow-md cursor-pointer border border-[#F5C754]"
            >
              Resume Journey →
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm space-y-2 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
            {deliveryMethod === 'not_configured' && (
              <div className="ml-7 p-3 rounded-xl bg-white/90 border border-rose-200 text-[11px] text-[#525672] space-y-1">
                <div className="font-bold text-[#292B42]">Setting up real email delivery:</div>
                <p>Add <code className="bg-[#FFF0D9] px-1 rounded">RESEND_API_KEY</code> from <strong>resend.com</strong> (or Gmail <code className="bg-[#FFF0D9] px-1 rounded">SMTP_USER</code> &amp; App Password <code className="bg-[#FFF0D9] px-1 rounded">SMTP_PASS</code>) to your environment variables.</p>
              </div>
            )}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: AUTHENTICATION TABS & FORM */}
        {step === 'details' && (
          <div className="space-y-5">
            {/* Login / Sign Up Tabs */}
            <div className="grid grid-cols-2 bg-[#FFF0D9] p-1.5 rounded-2xl border-2 border-[#FFE39A] gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-white text-[#292B42] shadow-sm border border-[#FFE39A]'
                    : 'text-[#525672] hover:text-[#292B42]'
                }`}
              >
                <UserPlus className="w-4 h-4 text-[#7A5B0B]" />
                <span>Sign Up</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-white text-[#292B42] shadow-sm border border-[#FFE39A]'
                    : 'text-[#525672] hover:text-[#292B42]'
                }`}
              >
                <LogIn className="w-4 h-4 text-[#7A5B0B]" />
                <span>Log In</span>
              </button>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleAuthBusy || isLoading}
              className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FFF9EE] border-2 border-[#FFE39A] text-[#292B42] font-black text-sm shadow-sm hover:shadow-md transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              {isGoogleAuthBusy ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#7A5B0B]" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#FFE39A]" />
              <span className="shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-[#8C90A8]">
                or {authTab === 'signup' ? 'register with' : 'sign in with'} Email OTP
              </span>
              <div className="flex-grow border-t border-[#FFE39A]" />
            </div>

            <form onSubmit={handleSubmitDetails} className="space-y-4">
              {authTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#292B42] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#7A5B0B] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jyothika"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] placeholder-[#8C90A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE39A] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#292B42] mb-1.5">
                      Age
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#7A5B0B] absolute left-3.5 top-3.5" />
                      <input
                        type="number"
                        min="10"
                        max="115"
                        required
                        placeholder="e.g. 21"
                        value={age}
                        onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] placeholder-[#8C90A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE39A] font-medium"
                      />
                    </div>
                  </div>

                  {/* MINOR SAFETY PROTOCOL */}
                  {isMinor && (
                    <div className="p-4 rounded-2xl bg-[#FFF0D9] border-2 border-[#FFE39A] space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-2 text-[#7A5B0B] font-black text-xs uppercase tracking-wider">
                        <Shield className="w-4 h-4 text-[#F5C754]" />
                        Minor Safety &amp; Guardian Consent
                      </div>
                      <p className="text-xs text-[#525672] leading-relaxed font-medium">
                        Because you are under 18, SPASHTA guarantees a safe, wholesome mindful reflection experience.
                        Romantic roleplay is strictly disabled.
                      </p>
                      <div>
                        <label className="block text-[11px] font-bold text-[#292B42] mb-1">
                          Parent or Legal Guardian Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="parent@domain.com"
                          value={guardianEmail}
                          onChange={(e) => setGuardianEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-[#FFE39A] rounded-xl text-[#292B42] text-xs focus:ring-2 focus:ring-[#FFE39A]"
                        />
                      </div>
                      <label className="flex items-start gap-2.5 text-xs text-[#525672] cursor-pointer pt-1 font-medium">
                        <input
                          type="checkbox"
                          checked={guardianConsentGiven}
                          onChange={(e) => setGuardianConsentGiven(e.target.checked)}
                          className="mt-0.5 rounded accent-[#F5C754] w-4 h-4"
                        />
                        <span>
                          I confirm that my parent or legal guardian knows I am using SPASHTA and agrees to the platform terms.
                        </span>
                      </label>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#292B42] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7A5B0B] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] placeholder-[#8C90A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE39A] font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleAuthBusy}
                className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer border border-[#F5C754]"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authTab === 'signup' ? 'Send Verification Code' : 'Send Login Code'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 1B: NEW GOOGLE USER ONBOARDING */}
        {step === 'google_onboarding' && (
          <form onSubmit={handleCompleteGoogleOnboarding} className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-black">Verified Google Account</div>
                <div className="text-emerald-800">{email}</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#292B42] mb-1.5">
                Preferred Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A5B0B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFE39A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#292B42] mb-1.5">
                Your Age
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#7A5B0B] absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="10"
                  max="115"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFE39A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-sm tracking-wide shadow-md hover:scale-102 transition flex items-center justify-center gap-2 cursor-pointer border border-[#F5C754]"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Finish Setup & Choose Your House →'}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#FFF0D9] border-2 border-[#FFE39A] rounded-3xl mx-auto flex items-center justify-center text-[#7A5B0B] mb-3 shadow-inner">
                <Shield className="w-7 h-7 text-[#F5C754]" />
              </div>
              <h2 className="text-2xl font-black font-display text-[#292B42]">
                {authTab === 'signup' ? 'Verify Your Registration' : 'Verify Your Login'}
              </h2>
              <p className="text-xs text-[#525672] mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                Sent to: <strong className="text-[#292B42]">{email}</strong>
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-center text-xs font-black uppercase tracking-wider text-[#292B42] mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-4 text-center tracking-[0.5em] font-mono text-2xl font-black bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] focus:outline-none focus:border-[#F5C754] shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-sm tracking-wide shadow-md hover:scale-102 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer border border-[#F5C754]"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Code & Enter Sanctuary'}
              </button>

              <div className="flex items-center justify-between text-xs text-[#525672] pt-3 border-t border-[#FFE39A] font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setStep('details');
                  }}
                  className="hover:text-[#292B42] underline cursor-pointer font-bold"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0 || isLoading}
                  onClick={() => handleSendOtp(email)}
                  className="hover:text-[#7A5B0B] disabled:opacity-40 cursor-pointer font-black text-[#292B42]"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: GUARDIAN VERIFICATION */}
        {step === 'guardian_otp' && (
          <form onSubmit={handleVerifyGuardianOtp} className="space-y-5 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#FFF0D9] border-2 border-[#FFE39A] rounded-3xl mx-auto flex items-center justify-center text-[#7A5B0B] mb-3">
                <Shield className="w-7 h-7 text-[#F5C754]" />
              </div>
              <h2 className="text-2xl font-black font-display text-[#292B42]">Guardian Verification</h2>
              <p className="text-xs text-[#525672] mt-1 font-medium">
                Enter the 6-digit code sent to <strong className="text-[#292B42]">{guardianEmail}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-center text-xs font-black uppercase tracking-wider text-[#292B42] mb-2">
                Enter Guardian Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="• • • • • •"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full py-4 text-center tracking-[0.5em] font-mono text-2xl font-black bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-2xl text-[#292B42] focus:outline-none focus:border-[#F5C754]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] font-black text-sm tracking-wide shadow-md hover:scale-102 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer border border-[#F5C754]"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Guardian Consent & Enter'}
            </button>

            <div className="flex items-center justify-between text-xs text-[#525672] pt-3 border-t border-[#FFE39A] font-medium">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="hover:text-[#292B42] underline cursor-pointer font-bold"
              >
                Edit Details
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || isLoading}
                onClick={() => handleSendOtp(guardianEmail, true)}
                className="hover:text-[#7A5B0B] disabled:opacity-40 cursor-pointer font-black text-[#292B42]"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Guardian Code'}
              </button>
            </div>
          </form>
        )}

        {/* Disclaimer Notice */}
        <div className="mt-8 pt-6 border-t border-[#FFE39A] text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#525672] font-medium">
            <Info className="w-3.5 h-3.5 text-[#F5C754]" />
            <span>Notice: SPASHTA is a mindful clarity companion, not a replacement for clinical therapy.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
