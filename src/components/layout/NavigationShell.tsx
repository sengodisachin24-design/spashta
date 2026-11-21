import React, { useState } from 'react';
import {
  Home,
  MessageSquare,
  Building2,
  MapPin,
  HeartPulse,
  User,
  Volume2,
  ChevronLeft,
  Sparkles,
  Music,
  Smile,
  X,
  Disc3,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppRoute, CompanionMode } from '../../types';
import { SpashtaMascot } from '../mascot/SpashtaMascot';
import { SpotifyEmbedPlayer } from '../music/SpotifyEmbedPlayer';

interface NavigationShellProps {
  children: React.ReactNode;
}

export const NavigationShell: React.FC<NavigationShellProps> = ({ children }) => {
  const {
    currentRoute,
    navigateTo,
    goBack,
    user,
    companionMode,
    setCompanionMode,
    totalBricksEarned,
    currentHouse,
    activeBrickCelebration,
    clearBrickCelebration,
    ambientType,
    setAmbientType,
    wellbeingPrompt,
    handleWellbeingResponse,
    dismissWellbeingPrompt,
  } = useApp();

  const [showAudioModal, setShowAudioModal] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const navItems: { route: AppRoute; label: string; icon: React.ReactNode; badge?: string }[] = [
    { route: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { route: 'chat', label: 'Companion Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { route: 'choose-house', label: 'Choose House', icon: <Building2 className="w-5 h-5" /> },
    {
      route: 'construction',
      label: 'Build Sanctuary',
      icon: <Sparkles className="w-5 h-5" />,
      badge: currentHouse ? `${currentHouse.percentage}%` : undefined,
    },
    { route: 'my-city', label: 'My City', icon: <MapPin className="w-5 h-5" /> },
    { route: 'mood-history', label: 'Mood History', icon: <HeartPulse className="w-5 h-5" /> },
    { route: 'profile-settings', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    const swipeableRoutes: AppRoute[] = [
      'dashboard',
      'chat',
      'construction',
      'my-city',
      'mood-history',
    ];

    const currentIndex = swipeableRoutes.indexOf(currentRoute);
    if (currentIndex !== -1) {
      if (diff > 80 && currentIndex < swipeableRoutes.length - 1) {
        navigateTo(swipeableRoutes[currentIndex + 1]);
      } else if (diff < -80 && currentIndex > 0) {
        navigateTo(swipeableRoutes[currentIndex - 1]);
      }
    }
    setTouchStartX(null);
  };

  const isWelcomePage = currentRoute === 'welcome';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FFF0D9]/40 to-[#F2F6FE] text-[#292B42] flex flex-col font-sans overflow-x-hidden relative selection:bg-[#FFE39A] selection:text-[#292B42]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Radiant Fairytale Background Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute top-10 left-12 w-64 h-64 bg-[#FFE39A]/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-36 right-20 w-72 h-72 bg-[#C9B8F2]/25 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-24 left-1/4 w-80 h-80 bg-[#A9D8F5]/25 rounded-full blur-3xl" />
      </div>

      {/* CLARITY BRICK CELEBRATION TOAST */}
      {activeBrickCelebration && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-md w-11/12">
          <div className="bg-white text-[#292B42] px-6 py-4 rounded-3xl shadow-2xl border-3 border-[#FFE39A] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE39A] flex items-center justify-center text-2xl shadow-inner shrink-0">
              🧱
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#966E0C]">
                <Sparkles className="w-3.5 h-3.5 text-[#F5C754]" />
                Fairytale Clarity Brick Earned!
              </div>
              <p className="text-sm font-semibold mt-0.5 leading-snug">
                {activeBrickCelebration.reason}
              </p>
              <p className="text-xs text-[#525672] mt-1">
                Your sanctuary is growing in My City.
              </p>
            </div>
            <button
              onClick={clearBrickCelebration}
              className="p-1.5 rounded-full hover:bg-[#FFF0D9] text-[#292B42] transition"
              aria-label="Dismiss celebration"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* WELLBEING CHECK-IN GENTLE DIALOG */}
      {wellbeingPrompt && wellbeingPrompt.status === 'pending' && (
        <div className="fixed inset-0 z-50 bg-[#292B42]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-3 border-[#FFE39A] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative text-[#292B42]">
            <button
              onClick={dismissWellbeingPrompt}
              className="absolute top-4 right-4 text-[#525672] hover:text-[#292B42] p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#FFF0D9] border-2 border-[#FFE39A] rounded-3xl mx-auto flex items-center justify-center mb-4">
              <Smile className="w-9 h-9 text-[#F5C754]" />
            </div>
            <h3 className="text-xl font-black font-display text-[#292B42] mb-2">
              Gentle Wellbeing Check-in
            </h3>
            <p className="text-[#525672] text-sm leading-relaxed mb-6">
              "Hey, just checking in gently. Things might have felt a bit quiet or heavy. How are you holding up right now?"
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleWellbeingResponse('im_okay')}
                className="py-3 px-4 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF0D9] text-[#292B42] text-sm font-bold border-2 border-[#FFE39A] transition"
              >
                I'm okay ✨
              </button>
              <button
                onClick={() => handleWellbeingResponse('need_talk')}
                className="py-3 px-4 rounded-2xl bg-[#FFE39A] hover:bg-[#FFD770] text-[#292B42] text-sm font-black shadow-md transition"
              >
                I'd like to talk 💬
              </button>
              <button
                onClick={() => handleWellbeingResponse('take_break')}
                className="py-3 px-4 rounded-2xl bg-[#C9B8F2]/30 hover:bg-[#C9B8F2]/50 text-[#292B42] text-sm font-bold border border-[#C9B8F2] transition"
              >
                Take a calm break 🌙
              </button>
              <button
                onClick={() => handleWellbeingResponse('remind_later')}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#525672] text-sm transition font-medium"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP FAIRYTALE HEADER */}
      {!isWelcomePage && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b-2 border-[#FFE39A] px-4 py-3 transition-colors shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Back & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className="p-2 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF0D9] text-[#292B42] transition flex items-center gap-1 text-xs font-black border-2 border-[#FFE39A]"
                title="Previous screen"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <button
                onClick={() => navigateTo('dashboard')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FFE39A] via-[#FFD770] to-[#F5C754] flex items-center justify-center shadow-md border border-[#F5C754]">
                  <span className="text-[#292B42] font-black text-base">S</span>
                </div>
                <div>
                  <h1 className="font-display font-black text-lg tracking-tight text-[#292B42] group-hover:text-[#966E0C] transition-colors leading-none">
                    SPASHTA
                  </h1>
                  <p className="text-[10px] text-[#525672] hidden sm:block tracking-wide font-medium mt-0.5">
                    A little clarity. A world of possibilities.
                  </p>
                </div>
              </button>
            </div>

            {/* Center: Mode pills */}
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-[#FFFDF9] p-1 rounded-2xl border-2 border-[#FFE39A] flex items-center gap-1 text-xs shadow-inner">
                {(['friend', 'soulmate', 'guide'] as CompanionMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCompanionMode(mode)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                      companionMode === mode
                        ? mode === 'friend'
                          ? 'bg-[#FFE39A] text-[#292B42] shadow-md font-black border border-[#F5C754]'
                          : mode === 'soulmate'
                          ? 'bg-[#C9B8F2] text-[#292B42] shadow-md font-black border border-[#B399EE]'
                          : 'bg-[#B9E5C8] text-[#292B42] shadow-md font-black border border-[#91DAA8]'
                        : 'text-[#525672] hover:text-[#292B42]'
                    }`}
                  >
                    {mode === 'friend' && '☕ Friend'}
                    {mode === 'soulmate' && '🌙 Soulmate'}
                    {mode === 'guide' && '🧭 Guide'}
                  </button>
                ))}
              </div>

              {/* Active House status pill */}
              {currentHouse && (
                <button
                  onClick={() => navigateTo('construction')}
                  className="bg-[#FFFDF9] hover:bg-[#FFF0D9] border-2 border-[#FFE39A] px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs transition shadow-sm"
                  title="View house construction site"
                >
                  <span className="text-base">🏰</span>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-[#292B42] truncate max-w-[120px]">
                      {currentHouse.name}
                    </div>
                    <div className="w-20 bg-slate-200 rounded-full h-1.5 mt-0.5 overflow-hidden">
                      <div
                        className="bg-[#F5C754] h-full transition-all duration-500 rounded-full"
                        style={{ width: `${currentHouse.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#966E0C] ml-1">
                    {currentHouse.percentage}%
                  </span>
                </button>
              )}
            </div>

            {/* Right: Bricks counter & Spotify button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('construction')}
                className="bg-gradient-to-r from-[#FFE39A] to-[#FFD770] border-2 border-[#F5C754] px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs text-[#292B42] font-black shadow-sm hover:scale-105 active:scale-95 transition"
                title="Clarity Bricks Earned"
              >
                <span>🧱</span>
                <span>{totalBricksEarned} Bricks</span>
              </button>

              {/* Spotify Player Button */}
              <button
                onClick={() => setShowAudioModal(true)}
                className="p-2 px-3 rounded-2xl border-2 border-[#1DB954] bg-[#E8F8EE] hover:bg-[#d8f4e2] text-[#0E7A35] transition flex items-center gap-1.5 text-xs font-black shadow-sm"
                title="Open Spotify & Ambient Soundscapes"
              >
                <Music className="w-4 h-4 animate-pulse text-[#1DB954]" />
                <span className="hidden lg:inline">Spotify & Audio</span>
              </button>

              {/* Profile Avatar */}
              <button
                onClick={() => navigateTo('profile-settings')}
                className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FFE39A] via-[#C9B8F2] to-[#A9D8F5] text-[#292B42] font-black text-sm flex items-center justify-center hover:ring-3 hover:ring-[#F5C754] transition shadow-sm border border-white"
                title="Profile & Safety Settings"
              >
                {user ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* DESKTOP SIDEBAR + MAIN WORKSPACE */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        {!isWelcomePage && (
          <aside className="hidden md:flex flex-col w-56 lg:w-64 p-4 border-r-2 border-[#FFE39A]/60 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] bg-white/40 backdrop-blur-sm">
            <div className="space-y-1.5 flex-1">
              {navItems.map(item => {
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => navigateTo(item.route)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#FFE39A] text-[#292B42] shadow-md border-l-4 border-[#F5C754] font-black'
                        : 'text-[#525672] hover:text-[#292B42] hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-[#292B42]' : 'text-[#7A5B0B]'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/90 text-[#292B42] font-black shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Rail Mascot Widget */}
            <div className="mt-auto pt-4 border-t border-[#FFE39A]">
              <div
                onClick={() => navigateTo('chat')}
                className="bg-white/95 hover:bg-white border-2 border-[#FFE39A] p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition group shadow-md"
              >
                <SpashtaMascot size="sm" mood="welcoming" />
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-[#292B42] group-hover:text-[#966E0C] transition-colors truncate">
                    Spashy
                  </div>
                  <div className="text-[11px] text-[#525672] truncate font-medium">
                    Your digital companion
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* MAIN PAGE VIEW CONTAINER */}
        <main className="flex-1 w-full min-w-0 pb-20 md:pb-8 flex flex-col">
          {children}
        </main>
      </div>

      {/* MOBILE FLOATING DOCK */}
      {!isWelcomePage && (
        <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-2xl border-2 border-[#FFE39A] rounded-3xl p-1.5 shadow-2xl flex items-center justify-around">
          {navItems.map(item => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? 'text-[#292B42] bg-[#FFE39A] scale-105 shadow-md font-black'
                    : 'text-[#525672] hover:text-[#292B42]'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-[9px] font-black leading-none">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* SPOTIFY MUSIC & AMBIENT MODAL */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 bg-[#292B42]/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFDF9] border-3 border-[#FFE39A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-[#292B42] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAudioModal(false)}
              className="absolute top-4 right-4 text-[#525672] hover:text-[#292B42] p-1.5 rounded-full hover:bg-[#FFF0D9] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#1DB954] text-white flex items-center justify-center font-bold text-xl shadow-md">
                <Disc3 className="w-6 h-6 animate-spin text-white" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-[#292B42]">Fairytale Spotify Soundscape</h3>
                <p className="text-xs text-[#525672]">
                  Play real Disney music & lo-fi directly inside SPASHTA.
                </p>
              </div>
            </div>

            {/* REAL EMBEDDED SPOTIFY PLAYER */}
            <SpotifyEmbedPlayer />

            {/* Optional Web Audio Ambience Layer */}
            <div className="mt-6 pt-5 border-t border-[#FFE39A]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#292B42] mb-2.5">
                Optional Ambient Soundscapes (Zero Autoplay):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'none', label: 'Silence', icon: '🤫' },
                  { id: 'cafe', label: 'Fairytale Café', icon: '☕' },
                  { id: 'rain', label: 'Castle Rain', icon: '🌧️' },
                  { id: 'forest', label: 'Pine Forest', icon: '🌲' },
                  { id: 'chimes', label: 'Starlight Chimes', icon: '✨' },
                ].map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => setAmbientType(sound.id as any)}
                    className={`py-2 px-3 rounded-2xl border-2 text-xs font-bold flex items-center gap-2 transition ${
                      ambientType === sound.id
                        ? 'bg-[#FFE39A] text-[#292B42] border-[#F5C754] font-black shadow-sm'
                        : 'bg-white text-[#525672] border-[#FFE39A]/60 hover:bg-[#FFF0D9]'
                    }`}
                  >
                    <span>{sound.icon}</span>
                    <span>{sound.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowAudioModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] text-xs font-black shadow-lg hover:scale-105 transition border border-[#F5C754]"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
