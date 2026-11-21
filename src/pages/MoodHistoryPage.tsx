import React, { useState } from 'react';
import {
  HeartPulse,
  Download,
  Plus,
  Sparkles,
  TrendingUp,
  PieChart,
  Calendar,
  Smile,
  Info,
  CheckCircle2,
  RefreshCw,
  X,
  Trash2,
  Brain,
  Shield,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MoodType, MoodRecord } from '../types';
import { generateMoodHistoryPdf } from '../utils/pdfExport';

export const MoodHistoryPage: React.FC = () => {
  const {
    moodRecords,
    addMoodRecord,
    deleteMoodRecord,
    toggleAutoMoodTracking,
    user,
    totalBricksEarned,
    completedHouses,
  } = useApp();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType>('peaceful');
  const [intensity, setIntensity] = useState<number>(3);
  const [checkInNote, setCheckInNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'all'>('7days');

  const autoMoodEnabled = user?.preferences?.autoMoodTrackingEnabled !== false;

  const moodColors: Record<MoodType, { bg: string; text: string; emoji: string }> = {
    joyful: { bg: '#FFE39A', text: '#292B42', emoji: '☀️' },
    peaceful: { bg: '#B9E5C8', text: '#292B42', emoji: '🌿' },
    hopeful: { bg: '#C9B8F2', text: '#292B42', emoji: '🌱' },
    reflective: { bg: '#A9D8F5', text: '#292B42', emoji: '🪞' },
    sad: { bg: '#BFDBFE', text: '#292B42', emoji: '🌧️' },
    anxious: { bg: '#F5A69A', text: '#292B42', emoji: '🌪️' },
    overwhelmed: { bg: '#FECDD3', text: '#292B42', emoji: '🌊' },
    frustrated: { bg: '#FED7AA', text: '#292B42', emoji: '⚡' },
    tired: { bg: '#E2E8F0', text: '#292B42', emoji: '🥱' },
    neutral: { bg: '#E2E8F0', text: '#292B42', emoji: '🍃' },
    clarified: { bg: '#FFE39A', text: '#292B42', emoji: '✨' },
  };

  const filteredRecords = moodRecords.filter((record) => {
    if (timeFilter === 'all') return true;
    const daysAgo = (Date.now() - new Date(record.timestamp).getTime()) / (1000 * 3600 * 24);
    if (timeFilter === '7days') return daysAgo <= 7;
    if (timeFilter === '30days') return daysAgo <= 30;
    return true;
  });

  const distribution: Record<MoodType, number> = {
    joyful: 0,
    peaceful: 0,
    hopeful: 0,
    reflective: 0,
    sad: 0,
    anxious: 0,
    overwhelmed: 0,
    frustrated: 0,
    tired: 0,
    neutral: 0,
    clarified: 0,
  };

  filteredRecords.forEach((r) => {
    if (distribution[r.mood] !== undefined) {
      distribution[r.mood] += 1;
    }
  });

  const totalFiltered = filteredRecords.length;

  // Grounded Behavioral Reflection Patterns (without psychological diagnoses)
  const positiveCount =
    distribution.joyful + distribution.peaceful + distribution.hopeful + distribution.clarified;
  const reflectiveCount = distribution.reflective + distribution.neutral;
  const challengingCount =
    distribution.sad + distribution.anxious + distribution.overwhelmed + distribution.frustrated + distribution.tired;

  const topMood = (Object.keys(distribution) as MoodType[])
    .filter((m) => distribution[m] > 0)
    .sort((a, b) => distribution[b] - distribution[a])[0];

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    addMoodRecord(
      selectedMood,
      intensity,
      checkInNote.trim() || undefined,
      ['manual_checkin'],
      'manual'
    );
    setCheckInNote('');
    setShowCheckInModal(false);
  };

  const handlePdfExport = () => {
    setIsExporting(true);
    const summary = `Emotional Journey Overview: Over the evaluated period, ${totalFiltered} emotional reflection entries were recorded. Your predominant feeling was ${
      topMood || 'mindful clarity'
    }.`;
    const suggestions = [
      'Celebrate each small realization you untangle in your conversations.',
      'Take 5 minutes each evening to sit by your completed fairytale sanctuary.',
      'Remember that fluctuations in energy and mood are completely natural parts of growth.',
    ];

    const exportUser = user || {
      id: 'traveler_1',
      fullName: 'Valued Traveler',
      email: 'traveler@spashta.world',
      age: 24,
      isMinor: false,
      isEmailVerified: true,
      joinedAt: new Date().toISOString(),
      preferences: {
        ambientSoundEnabled: false,
        ambientSoundType: 'none' as const,
        ambientVolume: 0.5,
        reducedMotion: false,
        guardianWellbeingCheckin: false,
      },
    };

    setTimeout(() => {
      generateMoodHistoryPdf({
        user: exportUser,
        moods: filteredRecords,
        timeframe:
          timeFilter === '7days'
            ? 'Last 7 Days'
            : timeFilter === '30days'
            ? 'Last 30 Days'
            : 'Full Journey History',
        summaryText: summary,
        gentleSuggestions: suggestions,
        totalBricksEarned,
        completedHousesCount: completedHouses.length,
      });
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col space-y-6 text-[#292B42]">
      {/* Fairytale Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE39A] border border-[#F5C754] text-[#7A5B0B] text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            <HeartPulse className="w-3.5 h-3.5 text-[#F5C754]" />
            <span>Fairytale Emotional Reflections</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-[#292B42]">
            Mood History & Insights
          </h1>
          <p className="text-[#525672] text-xs sm:text-sm mt-1 font-medium">
            Grounded in your real check-ins and consented chat reflections across 10 distinct emotional states.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-xs shadow-md hover:scale-105 transition flex items-center gap-1.5 cursor-pointer border border-[#F5C754]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Check In Now</span>
          </button>

          <button
            onClick={handlePdfExport}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFFDF9] border-2 border-[#FFE39A] text-[#292B42] font-black text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Export official summary PDF report"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#F5C754]" />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* AUTO-MOOD TRACKING CONSENT BAR */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF8EB] to-[#FFF0D9] border-2 border-[#FFE39A] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#FFE39A]/60 text-[#7A5B0B] shrink-0 mt-0.5">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-[#292B42] flex items-center gap-1.5">
              <span>Automatic AI Emotional Reflection</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#FFE39A] text-[#7A5B0B] font-bold">
                {autoMoodEnabled ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-[11px] text-[#525672] mt-0.5 leading-relaxed font-medium">
              When active, Spashta gently notes your emotional state during chat to help you reflect over time. Never shared with third parties.
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleAutoMoodTracking(!autoMoodEnabled)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
            autoMoodEnabled
              ? 'bg-white text-[#7A5B0B] border-[#FFE39A] hover:bg-rose-50 hover:text-rose-700'
              : 'bg-[#FFE39A] text-[#292B42] border-[#F5C754]'
          }`}
        >
          {autoMoodEnabled ? 'Disable Auto-Logging' : 'Enable Auto-Logging'}
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border-2 border-[#FFE39A] shadow-sm">
        <div className="flex items-center gap-1 text-xs">
          {(['7days', '30days', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer ${
                timeFilter === tab
                  ? 'bg-[#FFE39A] text-[#292B42] shadow-sm border border-[#F5C754]'
                  : 'text-[#525672] hover:text-[#292B42]'
              }`}
            >
              {tab === '7days' && 'Last 7 Days'}
              {tab === '30days' && 'Last 30 Days'}
              {tab === 'all' && 'All Journey Time'}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-[#525672] pr-2 font-medium">
          {totalFiltered} recorded reflection(s)
        </span>
      </div>

      {/* EMPTY STATE IF NO CHECK-INS YET */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#FFE39A] rounded-3xl p-10 text-center max-w-lg mx-auto w-full my-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#FFF0D9] mx-auto flex items-center justify-center text-3xl mb-4 shadow-inner border border-[#FFE39A]">
            🌸
          </div>
          <h3 className="font-display font-black text-xl text-[#292B42] mb-2">
            Your Emotional Storybook is Fresh
          </h3>
          <p className="text-xs text-[#525672] leading-relaxed mb-6 font-medium">
            You don't have any check-ins recorded for this timeframe yet. Check in with how you are feeling right now to start your emotional trend charts!
          </p>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-xs shadow-md hover:scale-105 transition border border-[#F5C754] cursor-pointer"
          >
            Record First Check-in ✨
          </button>
        </div>
      ) : (
        <>
          {/* GROUNDED BEHAVIORAL PATTERNS INSIGHT CARD */}
          <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F5C754]" />
                <h3 className="font-display font-black text-base text-[#292B42]">
                  Behavioral Reflections & Emotional Rhythm
                </h3>
              </div>
              <span className="text-[10px] text-[#7A5B0B] font-bold bg-[#FFF0D9] px-2.5 py-0.5 rounded-full border border-[#FFE39A]">
                Non-Clinical Observation
              </span>
            </div>

            {totalFiltered < 2 ? (
              <p className="text-xs text-[#525672] leading-relaxed bg-[#FFFDF9] p-3 rounded-xl border border-dashed border-[#FFE39A]">
                ℹ️ Log at least 2 or 3 emotional check-ins to view personalized reflection patterns.
              </p>
            ) : (
              <div className="space-y-2 text-xs text-[#525672] leading-relaxed font-medium">
                <p>
                  Over the selected timeframe, you recorded{' '}
                  <strong className="text-[#292B42] font-black">{totalFiltered} reflections</strong>.
                  Your most frequent feeling was{' '}
                  <strong className="text-[#292B42] font-black capitalize">
                    {topMood} {moodColors[topMood]?.emoji}
                  </strong>{' '}
                  ({distribution[topMood]} times).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#FFE39A]">
                    <div className="text-[10px] uppercase font-bold text-[#7A5B0B]">Grounding States</div>
                    <div className="text-lg font-black text-[#292B42] mt-0.5">{positiveCount}</div>
                    <div className="text-[10px] text-[#8C90A8]">Joyful, Peaceful, Hopeful, Clarified</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#FFE39A]">
                    <div className="text-[10px] uppercase font-bold text-[#7A5B0B]">Contemplative States</div>
                    <div className="text-lg font-black text-[#292B42] mt-0.5">{reflectiveCount}</div>
                    <div className="text-[10px] text-[#8C90A8]">Reflective, Neutral</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#FFE39A]">
                    <div className="text-[10px] uppercase font-bold text-[#7A5B0B]">Heavy Waves</div>
                    <div className="text-lg font-black text-[#292B42] mt-0.5">{challengingCount}</div>
                    <div className="text-[10px] text-[#8C90A8]">Anxious, Overwhelmed, Sad, Tired</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#8C90A8] pt-1 italic">
                  Note: SPASHTA is an emotional companion, not a clinical diagnostic tool. These observations reflect only your self-reported inputs and conversation reflections.
                </p>
              </div>
            )}
          </div>

          {/* VISUALIZATIONS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Timeline Bar Chart */}
            <div className="lg:col-span-7 bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-black text-base text-[#292B42] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#F5C754]" />
                    <span>Emotional Check-In Trend</span>
                  </h3>
                  <p className="text-[11px] text-[#525672] font-medium">
                    Shows recorded emotional intensity scores across your check-ins.
                  </p>
                </div>
                <span className="text-[10px] text-[#7A5B0B] uppercase font-mono font-bold bg-[#FFF0D9] px-2 py-0.5 rounded-full border border-[#FFE39A]">
                  Intensity: 1 to 5
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="h-44 flex items-end gap-2 pt-4 px-2 border-b-2 border-[#FFE39A]">
                  {filteredRecords.slice(-10).map((rec, rIdx) => {
                    const heightPercent = Math.min(100, (rec.intensity / 5) * 100);
                    const color = moodColors[rec.mood]?.bg || '#FFE39A';
                    return (
                      <div
                        key={rec.id || rIdx}
                        className="flex-1 flex flex-col items-center gap-1 group relative"
                      >
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-2 border-[#FFE39A] text-[10px] px-2.5 py-1 rounded-xl text-[#292B42] font-bold pointer-events-none whitespace-nowrap z-20 shadow-lg">
                          {rec.mood.toUpperCase()} ({rec.intensity}/5)
                        </div>
                        <div
                          className="w-full rounded-t-xl transition-all duration-500 group-hover:brightness-95 shadow-sm border border-black/5"
                          style={{ height: `${heightPercent}%`, backgroundColor: color }}
                        />
                        <span className="text-[10px] text-[#525672] font-mono mt-1 font-bold">
                          {new Date(rec.timestamp).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#525672] px-2 font-mono font-bold">
                  <span>Earliest Check-In</span>
                  <span>Latest Check-In</span>
                </div>
              </div>
            </div>

            {/* Distribution Breakdown Chart */}
            <div className="lg:col-span-5 bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-black text-base text-[#292B42] flex items-center gap-2 mb-1">
                  <PieChart className="w-4 h-4 text-[#F5C754]" />
                  <span>Recorded Mood Proportions</span>
                </h3>
                <p className="text-[11px] text-[#525672] mb-4 font-medium">
                  Breakdown across 10 emotional states.
                </p>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(Object.keys(distribution) as MoodType[])
                  .filter((m) => distribution[m] > 0)
                  .map((m) => {
                    const count = distribution[m];
                    const pct = totalFiltered > 0 ? Math.round((count / totalFiltered) * 100) : 0;
                    const mInfo = moodColors[m];
                    return (
                      <div key={m} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-[#292B42] capitalize font-bold">
                            <span>{mInfo.emoji}</span>
                            <span>{m}</span>
                          </span>
                          <span className="text-[#525672] font-mono text-[11px] font-bold">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#FFF0D9] h-2.5 rounded-full overflow-hidden border border-[#FFE39A]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: mInfo.bg }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#FFE39A] text-[11px] text-[#525672] flex items-center justify-between font-medium">
                <span>Real self-reported reflections</span>
                <span className="text-[#7A5B0B] font-black">Spashta Insights</span>
              </div>
            </div>
          </div>

          {/* CHECK-IN TABLE */}
          <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm">
            <h3 className="font-display font-black text-base text-[#292B42] mb-4">
              Recorded Reflection Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#292B42]">
                <thead className="bg-[#FFFDF9] text-[11px] uppercase tracking-wider text-[#7A5B0B] border-b-2 border-[#FFE39A] font-black">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Date & Time</th>
                    <th className="py-3 px-4">Mood</th>
                    <th className="py-3 px-4">Intensity</th>
                    <th className="py-3 px-4">Origin & Type</th>
                    <th className="py-3 px-4">Reflections & Notes</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFE39A]/60 font-medium">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FFFDF9] transition">
                      <td className="py-3 px-4 font-mono text-[#525672] whitespace-nowrap font-bold">
                        {new Date(rec.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold capitalize flex items-center gap-1.5">
                        <span>{moodColors[rec.mood]?.emoji}</span>
                        <span className="text-[#292B42]">{rec.mood}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-[#966E0C]">
                        {rec.intensity} / 5
                      </td>
                      <td className="py-3 px-4">
                        {rec.source === 'ai_inferred' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C9B8F2]/30 text-[#8A63D2] border border-[#C9B8F2]">
                            <span>🤖 AI Inferred</span>
                            {rec.confidence && (
                              <span className="font-mono">({Math.round(rec.confidence * 100)}%)</span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#B9E5C8]/40 text-emerald-800 border border-[#B9E5C8]">
                            <span>🌿 Self-Reported</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#525672] max-w-xs truncate">
                        {rec.context || rec.note || 'Mindful reflection.'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this reflection record?')) {
                              deleteMoodRecord(rec.id);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-[#292B42]/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-3 border-[#FFE39A] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-[#292B42]">
            <button
              onClick={() => setShowCheckInModal(false)}
              className="absolute top-4 right-4 text-[#525672] hover:text-[#292B42] p-1.5 rounded-full hover:bg-[#FFF0D9] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-xl text-[#292B42] mb-1">
              How are you feeling right now?
            </h3>
            <p className="text-xs text-[#525672] mb-4 font-medium">
              Select what best captures your present emotional landscape.
            </p>

            <form onSubmit={handleSaveCheckIn} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {(Object.keys(moodColors) as MoodType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`py-2.5 px-3 rounded-2xl border-2 text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                      selectedMood === m
                        ? 'bg-[#FFE39A] text-[#292B42] border-[#F5C754] shadow-md font-black ring-1 ring-[#FFE39A]'
                        : 'bg-[#FFFDF9] text-[#292B42] border-[#FFE39A] hover:bg-[#FFF0D9]'
                    }`}
                  >
                    <span>{moodColors[m].emoji}</span>
                    <span className="capitalize">{m}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#7A5B0B] mb-1.5">
                  Intensity: {intensity} / 5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F5C754] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#7A5B0B] mb-1.5">
                  Reflection Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What's contributing to this feeling?"
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  className="w-full p-3 bg-[#FFFDF9] border-2 border-[#FFE39A] rounded-xl text-xs text-[#292B42] placeholder-[#8C90A8] focus:outline-none focus:ring-2 focus:ring-[#FFE39A] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#525672] hover:text-[#292B42] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] text-xs font-black shadow-md hover:scale-105 transition cursor-pointer border border-[#F5C754]"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
