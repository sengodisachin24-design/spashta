import React, { useState } from 'react';
import {
  User,
  Shield,
  Heart,
  Settings,
  Download,
  Trash2,
  LogOut,
  Volume2,
  Eye,
  RotateCcw,
  Brain,
  Languages,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const {
    user,
    updateUserPreferences,
    logout,
    resetToCleanSlate,
    totalBricksEarned,
    completedHouses,
    moodRecords,
    navigateTo,
    rememberedContext,
    addRememberedFact,
    removeRememberedFact,
    clearRememberedContext,
  } = useApp();

  const [newFactInput, setNewFactInput] = useState('');

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#292B42]">
        <User className="w-16 h-16 text-[#F5C754] mb-4" />
        <h2 className="text-xl font-black font-display text-[#292B42] mb-2">Not Signed In</h2>
        <p className="text-xs text-[#525672] mb-4 font-medium">Please log in or register to access your profile.</p>
        <button
          onClick={() => navigateTo('welcome')}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] font-black text-xs shadow-md border border-[#F5C754] cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const handleExportDataJson = () => {
    const data = {
      profile: user,
      totalBricksEarned,
      completedHouses,
      moodRecords,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPASHTA_Fairytale_Data_${user.fullName.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to reset your SPASHTA world? All progress, bricks, and mood entries will be cleared to a fresh clean state.')) {
      resetToCleanSlate();
      navigateTo('dashboard');
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-6 text-[#292B42]">
      {/* Fairytale Profile Card */}
      <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FFE39A] via-[#C9B8F2] to-[#A9D8F5] flex items-center justify-center text-[#292B42] text-3xl font-black font-display shadow-md shrink-0 border-2 border-[#FFE39A]">
          {user.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-black font-display text-[#292B42]">
              {user.fullName}
            </h1>
            {user.isMinor ? (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FFF0D9] text-[#7A5B0B] border border-[#FFE39A]">
                Protected Minor Account
              </span>
            ) : (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Member
              </span>
            )}
          </div>

          <p className="text-xs text-[#525672] font-mono font-bold">{user.email}</p>
          <p className="text-xs text-[#525672] mt-1 font-medium">
            Age: {user.age} • Joined {new Date(user.joinedAt).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* MINOR SAFETY PROTOCOL (If minor) */}
      {user.isMinor && (
        <div className="bg-[#FFF0D9] border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#7A5B0B] font-black text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4 text-[#F5C754]" />
            Guardian Oversight & Child Privacy
          </div>
          <p className="text-xs text-[#525672] leading-relaxed font-medium">
            Your account is safeguarded with elevated youth privacy protections: romantic/adult roleplay is strictly disabled, and your verified guardian receives safety notices only under explicit wellbeing triggers.
          </p>
          <div className="bg-white p-3 rounded-2xl border-2 border-[#FFE39A] text-xs text-[#292B42] flex items-center justify-between">
            <span className="font-bold">Verified Guardian Email:</span>
            <span className="font-mono text-[#7A5B0B] font-black">{user.guardianEmail || 'guardian@verified.org'}</span>
          </div>
        </div>
      )}

      {/* PREFERENCES & PRIVACY CONTROLS */}
      <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 space-y-5 shadow-sm">
        <h3 className="font-display font-black text-base text-[#292B42] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#F5C754]" />
          <span>Experience & Privacy Settings</span>
        </h3>

        {/* 1. Silence Safety & Wellbeing Check-in Protocol */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[#FFE39A]">
          <div>
            <div className="text-xs font-black text-[#292B42] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#F5A69A]" />
              <span>Wellbeing Silence Check-in</span>
            </div>
            <p className="text-[11px] text-[#525672] mt-0.5 leading-relaxed max-w-lg font-medium">
              When enabled, Spashta will offer a gentle, non-alarming follow-up check-in if you haven't visited after discussing a heavy emotional moment. We never send frightening emergency emails based only on inactivity.
            </p>
          </div>
          <input
            type="checkbox"
            checked={user.preferences.guardianWellbeingCheckin}
            onChange={e =>
              updateUserPreferences({ guardianWellbeingCheckin: e.target.checked })
            }
            className="mt-1 rounded accent-[#F5C754] w-5 h-5 cursor-pointer"
          />
        </div>

        {/* 2. Reduced Motion Toggle */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[#FFE39A]">
          <div>
            <div className="text-xs font-black text-[#292B42] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#A9D8F5]" />
              <span>Reduced Motion & Gentle Transitions</span>
            </div>
            <p className="text-[11px] text-[#525672] mt-0.5 leading-relaxed max-w-lg font-medium">
              Subdue floating cloud and particle animations for maximum visual accessibility.
            </p>
          </div>
          <input
            type="checkbox"
            checked={user.preferences.reducedMotion}
            onChange={e =>
              updateUserPreferences({ reducedMotion: e.target.checked })
            }
            className="mt-1 rounded accent-[#F5C754] w-5 h-5 cursor-pointer"
          />
        </div>

        {/* 3. Automatic AI Mood Tracking */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[#FFE39A]">
          <div>
            <div className="text-xs font-black text-[#292B42] flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#F5C754]" />
              <span>Automatic AI Emotion Reflection</span>
            </div>
            <p className="text-[11px] text-[#525672] mt-0.5 leading-relaxed max-w-lg font-medium">
              Allow Spashta to gently note your expressed feelings during chat to help you view your emotional rhythms over time. Can be turned off anytime.
            </p>
          </div>
          <input
            type="checkbox"
            checked={user.preferences.autoMoodTrackingEnabled !== false}
            onChange={(e) =>
              updateUserPreferences({ autoMoodTrackingEnabled: e.target.checked })
            }
            className="mt-1 rounded accent-[#F5C754] w-5 h-5 cursor-pointer"
          />
        </div>

        {/* 4. Preferred Language */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[#FFE39A]">
          <div>
            <div className="text-xs font-black text-[#292B42] flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Preferred Companion Language</span>
            </div>
            <p className="text-[11px] text-[#525672] mt-0.5 leading-relaxed max-w-lg font-medium">
              Choose your natural conversation style. Spashta fluently supports English, Tamil, and Tanglish.
            </p>
          </div>
          <select
            value={user.preferences.preferredLanguage || 'auto'}
            onChange={(e) =>
              updateUserPreferences({
                preferredLanguage: e.target.value as 'en' | 'ta' | 'tanglish' | 'auto',
              })
            }
            className="px-3 py-1.5 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-xl text-xs font-bold text-[#292B42] focus:outline-none focus:border-[#F5C754] cursor-pointer"
          >
            <option value="auto">Auto-Detect</option>
            <option value="en">English</option>
            <option value="tanglish">Tanglish (Tamil in English)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </div>

        {/* 5. Ambient Audio Auto-mute */}
        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <div className="text-xs font-black text-[#292B42] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#B9E5C8]" />
              <span>Zero Unexpected Autoplay</span>
            </div>
            <p className="text-[11px] text-[#525672] mt-0.5 leading-relaxed max-w-lg font-medium">
              All music and ambient soundscapes require explicit one-tap activation and never play automatically without your consent.
            </p>
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Active By Default
          </span>
        </div>
      </div>

      {/* COMPANION MEMORY & STORED CONTEXT */}
      <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#F5C754]" />
            <h3 className="font-display font-black text-sm text-[#292B42]">
              Companion Long-Term Memory
            </h3>
          </div>
          <span className="text-[10px] text-[#7A5B0B] font-bold bg-[#FFF0D9] px-2.5 py-0.5 rounded-full border border-[#FFE39A]">
            Fully Inspectable & Deletable
          </span>
        </div>

        <p className="text-xs text-[#525672] leading-relaxed font-medium">
          Spashta only retains consented context you choose to share (e.g. goals, hobbies, study topics). Stored facts are included in your AI prompt so you never have to repeat yourself.
        </p>

        {/* Add Fact Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newFactInput.trim()) return;
            addRememberedFact(newFactInput.trim());
            setNewFactInput('');
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={newFactInput}
            onChange={(e) => setNewFactInput(e.target.value)}
            placeholder="Add context (e.g., 'Preparing for UPSC', 'Prefer short bullet points')"
            className="flex-1 px-3.5 py-2 rounded-xl border-2 border-[#FFE39A] text-xs font-medium focus:outline-none focus:border-[#F5C754] bg-[#FFFDF9]"
          />
          <button
            type="submit"
            disabled={!newFactInput.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] font-black text-xs rounded-xl shadow-sm hover:scale-105 disabled:opacity-40 transition cursor-pointer border border-[#F5C754] shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] inline mr-1" />
            <span>Remember</span>
          </button>
        </form>

        {/* Memory List */}
        <div className="space-y-2 pt-2">
          {rememberedContext.length === 0 ? (
            <div className="text-center py-4 text-xs text-[#525672] italic bg-[#FFF9EE] rounded-2xl p-3 border border-dashed border-[#FFE39A]">
              No long-term memories stored yet. Add facts above or share details in conversation!
            </div>
          ) : (
            rememberedContext.map((fact, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FFFDF9] border border-[#FFE39A] text-xs text-[#292B42]"
              >
                <span className="flex-1 leading-snug">{fact}</span>
                <button
                  onClick={() => removeRememberedFact(idx)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
                  title="Forget this memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {rememberedContext.length > 0 && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm('Clear all stored long-term memories?')) {
                  clearRememberedContext();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
            >
              Clear All Stored Memories
            </button>
          </div>
        )}
      </div>

      {/* DATA EXPORT & ACCOUNT CONTROL */}
      <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-display font-black text-sm text-[#292B42]">
          Data Ownership & Portability
        </h3>
        <p className="text-xs text-[#525672] leading-relaxed font-medium">
          Your personal reflections belong to you. We do not use your conversations for third-party advertising. You can export your data in JSON or reset your records at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportDataJson}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFFDF9] border-2 border-[#FFE39A] text-[#292B42] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#F5C754]" />
            <span>Download All Data (JSON)</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-700 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Journey & Purge Cache</span>
          </button>
        </div>
      </div>

      {/* Official Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#FFF0D9] border-2 border-[#FFE39A] text-center shadow-sm">
        <p className="text-xs text-[#525672] leading-normal font-medium">
          <strong className="text-[#292B42]">Official Fairytale Notice:</strong> "SPASHTA is an AI companion designed to support reflection and everyday conversations. It does not replace human connection, professional mental health care or emergency services."
        </p>
      </div>
    </div>
  );
};
