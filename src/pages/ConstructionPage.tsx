import React from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
  Layers,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConstructionStage } from '../types';
import { HouseIllustration } from '../components/houses/HouseIllustration';

export const ConstructionPage: React.FC = () => {
  const {
    currentHouse,
    totalBricksEarned,
    navigateTo,
  } = useApp();

  const stages: { stage: ConstructionStage; label: string; desc: string; icon: string }[] = [
    { stage: 'foundation', label: '1. Stone Foundation', desc: 'Groundwork & emotional anchoring', icon: '🪨' },
    { stage: 'walls', label: '2. Rising Walls', desc: 'Solid boundaries & daily habits', icon: '🧱' },
    { stage: 'windows-doors', label: '3. Windows & Doors', desc: 'Perspective, light & openness', icon: '🪟' },
    { stage: 'roof', label: '4. Sheltering Roof', desc: 'Protection, shelter & peace of mind', icon: '🏠' },
    { stage: 'interior', label: '5. Hearth & Interior', desc: 'Warmth, reflection & safe space', icon: '🕯️' },
    { stage: 'landscaping', label: '6. Lush Landscaping', desc: 'Flourishing garden & trees', icon: '🌿' },
    { stage: 'completed', label: '7. Masterpiece Complete', desc: 'Sanctuary added to My City!', icon: '✨' },
  ];

  if (!currentHouse) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto text-[#292B42]">
        <Building className="w-16 h-16 text-[#F5C754] mb-4 animate-bounce" />
        <h2 className="text-2xl font-black font-display text-[#292B42]">No Active House Selected</h2>
        <p className="text-[#525672] text-sm mt-2 mb-6 font-medium">
          Choose a dream architectural dwelling to begin laying your Clarity Bricks.
        </p>
        <button
          onClick={() => navigateTo('choose-house')}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-sm shadow-md hover:scale-105 transition border border-[#F5C754] cursor-pointer"
        >
          Choose a House →
        </button>
      </div>
    );
  }

  const stageOrder: ConstructionStage[] = [
    'foundation',
    'walls',
    'windows-doors',
    'roof',
    'interior',
    'landscaping',
    'completed',
  ];

  const currentStageIndex = stageOrder.indexOf(currentHouse.stage);
  const remainingBricks = Math.max(0, currentHouse.totalBricksRequired - currentHouse.bricksUsed);
  const isComplete = currentHouse.stage === 'completed' || currentHouse.percentage >= 100;

  const handleCelebrateCompletion = () => {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FFE39A', '#C9B8F2', '#A9D8F5', '#F5A69A', '#B9E5C8'],
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col text-[#292B42]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE39A] border border-[#F5C754] text-[#7A5B0B] text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C754]" />
            <span>Fairytale Construction Site</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#292B42]">
            {currentHouse.name}
          </h1>
          <p className="text-[#525672] text-xs sm:text-sm mt-1 font-medium">
            Every meaningful reflection and realization in companion chat builds this home stone by stone.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#FFE39A] px-4 py-3 rounded-2xl text-center shadow-sm">
            <div className="text-[11px] font-black text-[#7A5B0B] uppercase tracking-wider">
              Bricks Placed
            </div>
            <div className="text-xl font-black text-[#292B42] font-mono">
              {currentHouse.bricksUsed} / {currentHouse.totalBricksRequired}
            </div>
          </div>
          <div className="bg-white border-2 border-[#FFE39A] px-4 py-3 rounded-2xl text-center shadow-sm">
            <div className="text-[11px] font-black text-[#7A5B0B] uppercase tracking-wider">
              Total Clarity
            </div>
            <div className="text-xl font-black text-[#966E0C] font-mono">
              {totalBricksEarned} 🧱
            </div>
          </div>
        </div>
      </div>

      {/* ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        {/* Left Column: Visual Construction Animated Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white border-2 border-[#FFE39A] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm min-h-[380px]">
          <div className="absolute top-4 left-4 bg-[#FFF0D9] border border-[#FFE39A] px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-[#7A5B0B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C754] animate-pulse" />
            <span>Building: {stages[currentStageIndex]?.label || currentHouse.stage}</span>
          </div>

          <div className="absolute top-4 right-4 bg-[#FFE39A] text-[#292B42] font-black text-xs px-3 py-1 rounded-full shadow-sm font-mono border border-[#F5C754]">
            {currentHouse.percentage}% Built
          </div>

          <div className="w-full flex items-center justify-center py-6">
            <HouseIllustration
              type={currentHouse.houseType}
              stage={currentHouse.stage}
              size="hero"
              className="drop-shadow-xl transition-all duration-700"
            />
          </div>

          {isComplete ? (
            <div className="w-full mt-4 p-5 rounded-2xl bg-[#FFF9EE] border-2 border-[#FFE39A] text-center animate-fadeIn shadow-sm">
              <h3 className="font-display font-black text-lg text-[#966E0C] mb-1">
                🎉 Sanctuary Completed!
              </h3>
              <p className="text-xs text-[#525672] mb-3 font-medium">
                This home is now an enduring monument in <strong>My City</strong>. Choose your next architectural dream!
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCelebrateCompletion}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] text-xs font-black shadow-md hover:scale-105 transition cursor-pointer"
                >
                  Celebrate Again 🎊
                </button>
                <button
                  onClick={() => navigateTo('choose-house')}
                  className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#FFE39A] text-[#292B42] text-xs font-bold hover:bg-[#FFFDF9] transition cursor-pointer"
                >
                  Start New House →
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full mt-2">
              <div className="flex items-center justify-between text-xs text-[#525672] mb-1.5 font-bold">
                <span>Next Milestone: {stages[currentStageIndex + 1]?.label || 'Roof & Interior'}</span>
                <span>{remainingBricks} bricks to completion</span>
              </div>
              <div className="w-full bg-[#FFF0D9] rounded-full h-3 overflow-hidden border border-[#FFE39A]">
                <div
                  className="bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] h-full rounded-full transition-all duration-700"
                  style={{ width: `${currentHouse.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 7 Stages Timeline Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm">
          <h3 className="font-display font-black text-base text-[#292B42] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#F5C754]" />
            <span>7 Fairytale Building Stages</span>
          </h3>

          <div className="space-y-3">
            {stages.map((st, idx) => {
              const isDone = idx < currentStageIndex || isComplete;
              const isCurrent = idx === currentStageIndex && !isComplete;
              return (
                <div
                  key={st.stage}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#FFF9EE] border-[#F5C754] shadow-md ring-1 ring-[#FFE39A]'
                      : isDone
                      ? 'bg-white border-emerald-300 text-[#292B42]'
                      : 'bg-[#FFFDF9] border-[#E8E2D5] text-[#8C90A8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{st.icon}</span>
                    <div>
                      <div className={`text-xs font-black ${isCurrent ? 'text-[#966E0C]' : isDone ? 'text-[#292B42]' : 'text-[#8C90A8]'}`}>
                        {st.label}
                      </div>
                      <div className="text-[11px] text-[#525672] leading-tight font-medium">
                        {st.desc}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FFE39A] text-[#292B42] border border-[#F5C754]">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-xs text-[#8C90A8] font-bold">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#FFE39A]">
            <button
              onClick={() => navigateTo('chat')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] text-xs font-black flex items-center justify-center gap-2 shadow-md hover:scale-102 transition cursor-pointer border border-[#F5C754]"
            >
              <span>Talk with Spashy to Earn Bricks</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* Reflections Log */}
      <div className="bg-white border-2 border-[#FFE39A] rounded-3xl p-6 shadow-sm">
        <h3 className="font-display font-black text-sm text-[#292B42] mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#F5A69A]" />
          <span>Foundational Reflections Behind This House</span>
        </h3>
        {currentHouse.reflectionLog && currentHouse.reflectionLog.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentHouse.reflectionLog.map((log, lIdx) => (
              <div
                key={lIdx}
                className="bg-[#FFFDF9] p-3.5 rounded-2xl border-2 border-[#FFE39A] text-xs text-[#292B42] flex items-start gap-2.5 font-medium shadow-inner"
              >
                <span className="text-[#F5C754] mt-0.5 font-black">🧱</span>
                <span className="leading-relaxed">{log}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#525672] italic font-medium">
            No reflections recorded for this project yet. Start chatting to gain clarity!
          </p>
        )}
      </div>
    </div>
  );
};
