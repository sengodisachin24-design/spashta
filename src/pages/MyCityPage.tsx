import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Trophy,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HouseProject } from '../types';
import { HouseIllustration } from '../components/houses/HouseIllustration';

export const MyCityPage: React.FC = () => {
  const {
    completedHouses,
    currentHouse,
    totalBricksEarned,
    navigateTo,
    achievements,
  } = useApp();

  const [selectedHouseDetail, setSelectedHouseDetail] = useState<HouseProject | null>(null);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col space-y-6 text-[#292B42]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE39A] border border-[#F5C754] text-[#7A5B0B] text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#F5C754]" />
            <span>Fairytale Kingdom Realm</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-[#292B42] tracking-tight">
            Your City, Your Journey.
          </h1>
          <p className="text-[#525672] text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Every sanctuary here was earned through a real realization or decision. Click any home to view its construction milestones and history.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white border-2 border-[#FFE39A] px-4 py-2.5 rounded-2xl text-center shadow-sm">
            <div className="text-[10px] font-black text-[#7A5B0B] uppercase">Houses Built</div>
            <div className="text-lg font-black text-[#292B42] font-mono">{completedHouses.length}</div>
          </div>
          <div className="bg-white border-2 border-[#FFE39A] px-4 py-2.5 rounded-2xl text-center shadow-sm">
            <div className="text-[10px] font-black text-[#7A5B0B] uppercase">Total Bricks</div>
            <div className="text-lg font-black text-[#966E0C] font-mono">{totalBricksEarned}</div>
          </div>
          <div className="bg-white border-2 border-[#FFE39A] px-4 py-2.5 rounded-2xl text-center shadow-sm">
            <div className="text-[10px] font-black text-[#7A5B0B] uppercase">Milestones</div>
            <div className="text-lg font-black text-[#8A63D2] font-mono">{achievements.length}</div>
          </div>
        </div>
      </div>

      {/* FAIRYTALE INTERACTIVE CITY CANVAS - Luminous Disney Fairytale Kingdom */}
      <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#EDF6FF] via-[#FFF9EE] to-[#EBF6EE] border-2 border-[#FFE39A] p-6 md:p-10 overflow-hidden shadow-[0_12px_40px_rgba(41,43,66,0.06)] min-h-[460px] flex flex-col justify-between">
        {/* Animated Fairytale Sky & Hill Elements */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <div className="absolute top-6 left-12 w-3 h-3 bg-[#FFE39A] rounded-full animate-pulse-glow" />
          <div className="absolute top-16 right-24 w-3.5 h-3.5 bg-[#A9D8F5] rounded-full animate-pulse-glow" />
          <div className="absolute top-28 left-1/3 w-2 h-2 bg-[#F5A69A] rounded-full" />
          <div className="absolute top-10 right-1/4 w-3 h-3 bg-[#C9B8F2] rounded-full animate-pulse-glow" />

          {/* Distant Castle & Mountain Silhouettes in Soft Gold */}
          <svg className="absolute bottom-36 left-0 right-0 w-full h-36 opacity-30" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <polygon points="0,200 150,80 320,200 500,60 700,200 850,90 1000,200" fill="#FFE39A" />
          </svg>

          {/* Curved Fairytale Cobblestone Street */}
          <svg className="absolute bottom-0 left-0 right-0 w-full h-36" preserveAspectRatio="none" viewBox="0 0 1200 200">
            <path d="M0,160 Q300,100 600,150 T1200,140 L1200,200 L0,200 Z" fill="#B9E5C8" opacity="0.4" />
            <path d="M0,160 Q300,100 600,150 T1200,140" stroke="#FFE39A" strokeWidth="4" strokeDasharray="16 12" opacity="0.8" />
          </svg>
        </div>

        {/* CITY DISTRICTS & HOUSES */}
        <div className="relative z-10 w-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#7A5B0B] bg-white/90 px-3.5 py-1.5 rounded-full border border-[#FFE39A] shadow-sm">
              Fairytale Kingdom • Sanctuaries of Peace
            </span>
            <span className="text-xs text-[#525672] font-bold">
              {completedHouses.length + (currentHouse ? 1 : 0)} Plot(s) Inhabited
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-end pt-4">
            {/* Finished Houses */}
            {completedHouses.map(house => (
              <div
                key={house.id}
                onClick={() => setSelectedHouseDetail(house)}
                className="group bg-white hover:bg-[#FFFDF9] border-2 border-[#FFE39A] hover:border-[#F5C754] rounded-3xl p-5 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 hover:scale-103 shadow-sm hover:shadow-xl"
              >
                <div className="w-full flex justify-between items-center text-[10px] text-emerald-700 font-bold mb-1">
                  <span className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Built & Inhabited
                  </span>
                  <span className="text-[#525672] font-medium">
                    {house.completedAt ? new Date(house.completedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <div className="py-2">
                  <HouseIllustration type={house.houseType} stage="completed" size="md" />
                </div>

                <div className="w-full text-center mt-1 pt-2 border-t border-[#FFE39A]">
                  <h4 className="font-display font-black text-sm text-[#292B42] group-hover:text-[#966E0C] transition-colors">
                    {house.name}
                  </h4>
                  <p className="text-[11px] text-[#525672] font-medium">
                    {house.bricksUsed} Clarity Bricks placed
                  </p>
                </div>
              </div>
            ))}

            {/* Active House Under Construction */}
            {currentHouse && currentHouse.stage !== 'completed' && (
              <div
                onClick={() => navigateTo('construction')}
                className="group bg-[#FFF9EE] hover:bg-[#FFF0D9] border-2 border-dashed border-[#F5C754] rounded-3xl p-5 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 hover:scale-103 shadow-sm hover:shadow-xl relative"
              >
                <div className="w-full flex justify-between items-center text-[10px] text-[#7A5B0B] font-bold mb-1">
                  <span className="flex items-center gap-1 bg-[#FFE39A] px-2 py-0.5 rounded-full border border-[#F5C754]">
                    <span className="w-2 h-2 rounded-full bg-[#F5C754] animate-pulse" />
                    Under Construction
                  </span>
                  <span className="font-mono font-black">{currentHouse.percentage}%</span>
                </div>

                <div className="py-2 opacity-95">
                  <HouseIllustration
                    type={currentHouse.houseType}
                    stage={currentHouse.stage}
                    size="md"
                  />
                </div>

                <div className="w-full text-center mt-1 pt-2 border-t border-[#FFE39A]">
                  <h4 className="font-display font-black text-sm text-[#292B42] group-hover:text-[#966E0C] transition-colors">
                    {currentHouse.name}
                  </h4>
                  <p className="text-[11px] text-[#7A5B0B] font-bold">
                    Click to enter build site →
                  </p>
                </div>
              </div>
            )}

            {/* Plot for next house */}
            <div
              onClick={() => navigateTo('choose-house')}
              className="border-2 border-dashed border-[#FFE39A] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#F5C754] bg-white/70 hover:bg-white transition min-h-[220px] shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0D9] flex items-center justify-center text-[#7A5B0B] mb-2 border border-[#FFE39A]">
                <Building2 className="w-6 h-6 text-[#F5C754]" />
              </div>
              <div className="text-xs font-black text-[#292B42]">Next Plot Available</div>
              <div className="text-[11px] text-[#525672] mt-1 font-medium">
                Choose another dwelling to expand your fairytale city
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#FFE39A] text-xs text-[#525672] font-medium">
          <div className="flex items-center gap-2">
            <span>🌿 Enchanted Royal Gardens</span>
            <span>•</span>
            <span>💡 Starlight Lamps Active</span>
          </div>
          <button
            onClick={() => navigateTo('chat')}
            className="text-[#7A5B0B] hover:text-[#292B42] font-black flex items-center gap-1 cursor-pointer"
          >
            <span>Return to Chat to Gain Clarity</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* HOUSE INSPECTOR MODAL */}
      {selectedHouseDetail && (
        <div className="fixed inset-0 z-50 bg-[#292B42]/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-3 border-[#FFE39A] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-[#292B42]">
            <button
              onClick={() => setSelectedHouseDetail(null)}
              className="absolute top-4 right-4 text-[#525672] hover:text-[#292B42] p-1.5 rounded-full hover:bg-[#FFF0D9] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-16 rounded-2xl bg-[#FFFDF9] flex items-center justify-center border-2 border-[#FFE39A] shadow-inner">
                <HouseIllustration type={selectedHouseDetail.houseType} stage="completed" size="sm" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Completed Sanctuary
                </span>
                <h3 className="font-display font-black text-lg text-[#292B42] mt-0.5">
                  {selectedHouseDetail.name}
                </h3>
                <div className="text-xs text-[#525672] font-medium">
                  Finished on {selectedHouseDetail.completedAt ? new Date(selectedHouseDetail.completedAt).toLocaleDateString() : 'Earlier'}
                </div>
              </div>
            </div>

            <div className="bg-[#FFFDF9] p-4 rounded-2xl border-2 border-[#FFE39A] mb-4 space-y-2">
              <div className="flex justify-between text-xs text-[#292B42]">
                <span className="font-medium text-[#525672]">Bricks Invested:</span>
                <span className="font-black text-[#966E0C]">{selectedHouseDetail.bricksUsed} Clarity Bricks</span>
              </div>
              <div className="flex justify-between text-xs text-[#292B42]">
                <span className="font-medium text-[#525672]">Architectural Style:</span>
                <span className="capitalize font-bold">{selectedHouseDetail.houseType.replace('-', ' ')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#7A5B0B] mb-2">
                Milestones & Meaningful Reflections:
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedHouseDetail.reflectionLog.map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FFF9EE] text-xs text-[#292B42] flex items-start gap-2 border border-[#FFE39A] font-medium">
                    <span className="text-[#F5C754]">✨</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedHouseDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] text-xs font-black hover:scale-105 transition shadow-md cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
