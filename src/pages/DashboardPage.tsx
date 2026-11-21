import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Building,
  MapPin,
  HeartPulse,
  Music,
  ArrowRight,
  TrendingUp,
  Volume2,
  Trophy,
  Coffee,
  Heart,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpashtaMascot } from '../components/mascot/SpashtaMascot';
import { HouseIllustration } from '../components/houses/HouseIllustration';

export const DashboardPage: React.FC = () => {
  const {
    user,
    companionMode,
    currentHouse,
    completedHouses,
    totalBricksEarned,
    moodRecords,
    navigateTo,
    spotifyUri,
    achievements,
    resetToCleanSlate,
  } = useApp();

  const latestMood = moodRecords[moodRecords.length - 1];

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col space-y-6">
      {/* FAIRYTALE HERO BANNER - Luminous Disney Kingdom Sanctuary */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#FFF9EE] via-[#FFF0D9] to-[#F3EBFC] border-2 border-[#FFE39A] p-6 sm:p-8 shadow-[0_12px_40px_rgba(41,43,66,0.06)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFE39A]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#C9B8F2]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE39A] border border-[#F5C754] text-[#7A5B0B] text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C754]" />
            <span>Personal Clarity Sanctuary</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-display text-[#292B42] tracking-tight leading-tight">
            {greetingTime()},{' '}
            <span className="text-[#966E0C]">
              {user?.fullName || 'Traveler'}
            </span>.
          </h1>

          <p className="text-[#525672] text-sm sm:text-base mt-2 leading-relaxed font-medium">
            Step into your enchanted digital universe. You have earned{' '}
            <strong className="text-[#292B42] font-black">{totalBricksEarned} Clarity Bricks</strong>{' '}
            through honest conversation, building a home of clarity brick by brick.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
            <button
              onClick={() => navigateTo('chat')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-sm shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer border border-[#F5C754]"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Talk with Spashy</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => navigateTo('my-city')}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-[#FFFDF9] border-2 border-[#FFE39A] text-[#292B42] text-sm font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#F5C754]" />
              <span>Visit My City</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset your companion world to a fresh clean state?')) {
                  resetToCleanSlate();
                }
              }}
              className="p-3 rounded-2xl bg-white/80 hover:bg-white border-2 border-[#E8E2D5] text-[#525672] hover:text-[#292B42] transition shadow-sm cursor-pointer"
              title="Reset world to fresh clean state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mascot */}
        <div className="relative z-10 flex flex-col items-center">
          <SpashtaMascot
            mood="welcoming"
            size="lg"
            showSpeechBubble={true}
            speechText={`Ready in ${companionMode} mode!`}
          />
        </div>
      </div>

      {/* QUICK COMMAND TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: ACTIVE HOUSE PROGRESS */}
        <div
          onClick={() => navigateTo('construction')}
          className="group rounded-3xl bg-white border-2 border-[#FFE39A] hover:border-[#F5C754] p-6 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-102 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#7A5B0B] flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#F5C754]" />
                Active Sanctuary
              </span>
              <span className="text-xs font-mono font-black text-[#292B42] bg-[#FFE39A] px-2.5 py-0.5 rounded-full shadow-sm border border-[#F5C754]">
                {currentHouse ? `${currentHouse.percentage}%` : '0%'}
              </span>
            </div>

            <h3 className="font-display font-black text-lg text-[#292B42] group-hover:text-[#966E0C] transition-colors">
              {currentHouse?.name || 'Dream Sanctuary'}
            </h3>
            <p className="text-xs text-[#525672] mt-0.5 font-medium">
              Stage: <strong className="text-[#292B42] capitalize">{currentHouse?.stage || 'foundation'}</strong>
            </p>
          </div>

          <div className="py-4 flex justify-center">
            {currentHouse ? (
              <HouseIllustration type={currentHouse.houseType} stage={currentHouse.stage} size="md" />
            ) : (
              <div className="text-xs text-[#525672] italic">No house selected</div>
            )}
          </div>

          <div>
            <div className="w-full bg-[#FFF0D9] rounded-full h-3 overflow-hidden mb-2 border border-[#FFE39A]">
              <div
                className="bg-gradient-to-r from-[#FFE39A] to-[#F5C754] h-full rounded-full transition-all duration-500"
                style={{ width: `${currentHouse?.percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#525672] font-medium">
              <span>{currentHouse?.bricksUsed || 0} bricks placed</span>
              <span className="text-[#7A5B0B] font-bold group-hover:underline">View build site →</span>
            </div>
          </div>
        </div>

        {/* CARD 2: MOOD & REFLECTIONS */}
        <div
          onClick={() => navigateTo('mood-history')}
          className="group rounded-3xl bg-white border-2 border-[#FFE39A] hover:border-[#C9B8F2] p-6 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-102 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#694AA8] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#8A63D2]" />
                Mood Reflection
              </span>
              <span className="text-xs text-[#525672] font-mono font-bold bg-[#F2EBFA] px-2.5 py-0.5 rounded-full border border-[#C9B8F2]">
                {moodRecords.length} entries
              </span>
            </div>

            <h3 className="font-display font-black text-lg text-[#292B42] group-hover:text-[#694AA8] transition-colors">
              Emotional Landscape
            </h3>
            <p className="text-xs text-[#525672] mt-0.5 font-medium">
              Latest: <strong className="text-[#292B42] capitalize">{latestMood ? latestMood.mood : 'Fresh Start'}</strong>
            </p>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl p-4 border-2 border-[#FFE39A]/60 my-4 text-xs text-[#292B42] leading-relaxed min-h-[70px] flex items-center shadow-inner">
            {latestMood?.note ? (
              <p className="italic font-medium">"{latestMood.note}"</p>
            ) : (
              <p className="text-[#525672] italic font-medium">
                Check in anytime to track your emotional landscape and generate verified PDF insight reports.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#525672] pt-2 border-t border-[#FFE39A]">
            <span>Genuine reflections</span>
            <span className="text-[#694AA8] font-black group-hover:underline">Open Trends & PDF →</span>
          </div>
        </div>

        {/* CARD 3: REAL PLAYABLE SPOTIFY EMBED */}
        <div className="rounded-3xl bg-white border-2 border-[#FFE39A] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#7A5B0B] flex items-center gap-1.5">
                <Music className="w-4 h-4 text-[#F5C754]" />
                Fairytale Music
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Playable Inside
              </span>
            </div>

            <h3 className="font-display font-black text-base text-[#292B42]">
              Disney & Fairytale Soundscape
            </h3>
            <p className="text-xs text-[#525672] mt-0.5 font-medium">
              Listen to real Spotify fairytale piano & chill beats.
            </p>
          </div>

          {/* Mini Playable Spotify Iframe */}
          <div className="my-3 rounded-2xl overflow-hidden border-2 border-[#FFE39A] shadow-md">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${spotifyUri}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Mini Spotify Player"
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#525672] pt-2 border-t border-[#FFE39A]">
            <span>Disney classics & Lo-Fi</span>
            <span className="text-[#7A5B0B] font-bold">Interactive Sound</span>
          </div>
        </div>
      </div>

      {/* LOWER HORIZON SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div
          onClick={() => navigateTo('my-city')}
          className="lg:col-span-8 bg-white border-2 border-[#FFE39A] hover:border-[#F5C754] rounded-3xl p-6 shadow-sm hover:shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-black text-base text-[#292B42] group-hover:text-[#966E0C] transition-colors flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F5C754]" />
                <span>My City Preview</span>
              </h3>
              <p className="text-xs text-[#525672] font-medium">
                Your personal fairytale townscape created through clarity breakthroughs.
              </p>
            </div>
            <span className="text-xs text-[#7A5B0B] font-black group-hover:underline flex items-center gap-1">
              <span>View Full City</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </div>

          {completedHouses.length === 0 && (!currentHouse || currentHouse.bricksUsed === 0) ? (
            <div className="p-8 rounded-2xl bg-[#FFFDF9] border-2 border-dashed border-[#FFE39A] text-center">
              <p className="text-xs text-[#525672] mb-2 font-medium">
                Your city begins with your first house: <strong className="text-[#292B42]">{currentHouse?.name}</strong>.
              </p>
              <span className="text-xs font-black text-[#7A5B0B] inline-flex items-center gap-1 bg-[#FFE39A]/40 px-3 py-1 rounded-full border border-[#FFE39A]">
                Chat with Spashy to place your first Clarity Brick! →
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-center py-2">
              {completedHouses.map(h => (
                <div key={h.id} className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#FFE39A] shadow-sm">
                  <HouseIllustration type={h.houseType} stage="completed" size="sm" />
                  <span className="text-xs font-bold text-[#292B42] mt-1.5 truncate max-w-full">
                    {h.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200">Completed</span>
                </div>
              ))}

              {currentHouse && (
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#FFF0D9] border-2 border-dashed border-[#F5C754] shadow-sm">
                  <HouseIllustration type={currentHouse.houseType} stage={currentHouse.stage} size="sm" />
                  <span className="text-xs font-black text-[#292B42] mt-1.5 truncate max-w-full">
                    {currentHouse.name}
                  </span>
                  <span className="text-[10px] text-[#7A5B0B] font-bold bg-[#FFE39A] px-2 py-0.5 rounded-full mt-0.5 border border-[#F5C754]">{currentHouse.percentage}% Built</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="lg:col-span-4 bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-black text-base text-[#292B42] mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F5C754]" />
              <span>Sanctuary Milestones</span>
            </h3>
            <p className="text-xs text-[#525672] mb-4 font-medium">
              Fairytale markers unlocked on your journey.
            </p>
          </div>

          <div className="space-y-2.5">
            {achievements.map(ach => (
              <div key={ach.id} className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#FFE39A] text-xs flex items-center gap-3 shadow-sm">
                <span className="text-lg">✨</span>
                <div className="overflow-hidden">
                  <div className="font-bold text-[#292B42] truncate">{ach.title}</div>
                  <div className="text-[11px] text-[#525672] truncate">{ach.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#FFE39A] text-xs text-[#525672] text-right font-medium">
            <span>Keep conversing to unlock more</span>
          </div>
        </div>
      </div>
    </div>
  );
};
