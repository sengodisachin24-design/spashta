import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HouseType } from '../types';
import { HOUSE_DEFINITIONS, HouseIllustration } from '../components/houses/HouseIllustration';

export const ChooseHousePage: React.FC = () => {
  const { selectHouseForConstruction, currentHouse, navigateTo } = useApp();

  const [selectedType, setSelectedType] = useState<HouseType>(
    currentHouse?.houseType || 'cozy-cottage'
  );

  const activeDef = HOUSE_DEFINITIONS.find(h => h.id === selectedType) || HOUSE_DEFINITIONS[0];

  const handleConfirmChoice = () => {
    selectHouseForConstruction(activeDef.id, activeDef.name);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col justify-between text-[#292B42]">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE39A] border border-[#F5C754] text-[#7A5B0B] text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C754]" />
          <span>Fairytale Sanctuary Genesis</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#292B42] tracking-tight leading-tight">
          Every beautiful world begins with a home.
        </h1>
        <p className="text-[#525672] text-sm sm:text-base mt-2 font-medium">
          Select an architectural dwelling to anchor your journey. Meaningful reflections in chat will earn Clarity Bricks to construct this home stage by stage.
        </p>
      </div>

      {/* Interactive House Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-8">
        {HOUSE_DEFINITIONS.map(house => {
          const isSelected = selectedType === house.id;
          return (
            <div
              key={house.id}
              onClick={() => setSelectedType(house.id)}
              className={`group relative rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between border-2 ${
                isSelected
                  ? 'bg-white border-[#F5C754] shadow-[0_12px_35px_rgba(245,199,84,0.3)] scale-102 ring-2 ring-[#FFE39A]'
                  : 'bg-white/90 border-[#FFE39A] hover:bg-white hover:border-[#F5C754] shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 bg-[#FFE39A] text-[#292B42] rounded-full p-1.5 shadow-md z-10 animate-bounce border border-[#F5C754]">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div className="w-full flex items-center justify-center py-2">
                <HouseIllustration
                  type={house.id}
                  stage="completed"
                  size="md"
                  isInteractive={true}
                  isSelected={isSelected}
                />
              </div>

              <div className="w-full text-center mt-2 pt-3 border-t border-[#FFE39A]">
                <h3 className="font-display font-black text-base text-[#292B42] group-hover:text-[#966E0C] transition-colors">
                  {house.name}
                </h3>
                <p className="text-xs text-[#525672] font-medium mt-0.5 truncate">
                  {house.subtitle}
                </p>
                <div className="mt-2 text-[11px] font-black text-[#7A5B0B] bg-[#FFF0D9] py-1 px-2.5 rounded-xl inline-block border border-[#FFE39A]">
                  🧱 {house.bricksRequired} Clarity Bricks to Complete
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected House Showcase Floating Bar */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-xl border-2 border-[#FFE39A] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-14 rounded-2xl bg-[#FFFDF9] flex items-center justify-center p-1 border-2 border-[#FFE39A] shrink-0 shadow-inner">
            <HouseIllustration type={selectedType} stage="completed" size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black tracking-wider text-[#7A5B0B]">
                Selected Sanctuary:
              </span>
              <span className="text-sm font-black text-[#292B42] font-display">
                {activeDef.name}
              </span>
            </div>
            <p className="text-xs text-[#525672] max-w-lg mt-0.5 leading-relaxed font-medium">
              {activeDef.description}
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirmChoice}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] font-black text-sm shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer border border-[#F5C754] shrink-0"
        >
          <span>Confirm & Start Construction</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
