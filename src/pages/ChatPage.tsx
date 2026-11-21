import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Coffee,
  Heart,
  Compass,
  GraduationCap,
  Trash2,
  Building,
  CheckCheck,
  Copy,
  Check,
  RotateCcw,
  Plus,
  MessageSquare,
  Lock,
  ChevronDown,
  X,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompanionMode } from '../types';
import { SpashtaMascot } from '../components/mascot/SpashtaMascot';

// Custom Markdown Formatter with Code Copy
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split text by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockCounter = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{renderInlineMarkdown(text.substring(lastIndex, match.index))}</span>
      );
    }

    const lang = match[1] || 'code';
    const codeContent = match[2];
    const currentIndex = blockCounter++;

    parts.push(
      <div
        key={`code-${currentIndex}`}
        className="my-3 rounded-2xl overflow-hidden border-2 border-[#292B42]/10 bg-[#1E1E2E] text-amber-50 shadow-md font-mono text-xs"
      >
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181825] border-b border-white/10 text-[11px] text-[#A6ADC8]">
          <span className="font-semibold uppercase tracking-wider">{lang}</span>
          <button
            type="button"
            onClick={() => copyCode(codeContent, currentIndex)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-[10px]"
          >
            {copiedIndex === currentIndex ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3.5 overflow-x-auto whitespace-pre leading-relaxed text-[#CDD6F4]">
          <code>{codeContent}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>{renderInlineMarkdown(text.substring(lastIndex))}</span>
    );
  }

  return <div className="leading-relaxed whitespace-pre-wrap">{parts}</div>;
};

// Render bold, italics, inline code, and lists
function renderInlineMarkdown(str: string): React.ReactNode {
  // Split lines
  const lines = str.split('\n');
  return lines.map((line, lineIdx) => {
    let formattedLine: React.ReactNode = line;

    // Headings
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="font-bold text-sm sm:text-base text-[#292B42] mt-2 mb-1">
          {line.slice(4)}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className="font-black text-base sm:text-lg text-[#292B42] mt-3 mb-1">
          {line.slice(3)}
        </h3>
      );
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().slice(2);
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-[#F5C754] font-bold">•</span>
          <span>{parseSpans(bulletText)}</span>
        </div>
      );
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="font-mono font-bold text-[#7A5B0B] text-xs">{numMatch[1]}.</span>
          <span>{parseSpans(numMatch[2])}</span>
        </div>
      );
    }

    return (
      <span key={lineIdx}>
        {parseSpans(line)}
        {lineIdx < lines.length - 1 && '\n'}
      </span>
    );
  });
}

function parseSpans(text: string): React.ReactNode {
  // Replace bold **text** and inline `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${idx++}`} className="font-bold text-[#292B42]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${idx++}`}
          className="px-1.5 py-0.5 bg-[#FFF0D9] border border-[#FFE39A] rounded-md font-mono text-xs text-[#7A5B0B]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${idx++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const ChatPage: React.FC = () => {
  const {
    companionMode,
    setCompanionMode,
    messages,
    sendMessage,
    retryLastMessage,
    clearChat,
    isAiTyping,
    chatError,
    clearChatError,
    currentHouse,
    user,
    conversations,
    activeConversationId,
    createConversation,
    switchConversation,
    deleteConversation,
    navigateTo,
    rememberedContext,
    addRememberedFact,
    removeRememberedFact,
    clearRememberedContext,
  } = useApp();

  const [input, setInput] = useState('');
  const [showConvDrawer, setShowConvDrawer] = useState(false);
  const [showMemoryDrawer, setShowMemoryDrawer] = useState(false);
  const [newMemoryFact, setNewMemoryFact] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMinor = !!user?.isMinor;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isAiTyping) return;
    const textToSend = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryFact.trim()) return;
    await addRememberedFact(newMemoryFact.trim());
    setNewMemoryFact('');
  };

  // Modes metadata
  const envStyles: Record<
    CompanionMode,
    {
      bgGradient: string;
      accentColor: string;
      title: string;
      vibe: string;
      icon: React.ReactNode;
      ambientDoodles: string[];
      cardBorder: string;
      pillBg: string;
      mascotMood: 'welcoming' | 'peaceful' | 'thinking';
    }
  > = {
    friend: {
      bgGradient: 'from-[#FFFDF9] via-[#FFF8EB] to-[#FFF0D9]',
      accentColor: '#F5C754',
      title: 'Friend Mode',
      vibe: 'Warm Café • Banter, Humor & Tamil/English/Tanglish Talk',
      icon: <Coffee className="w-4 h-4 text-[#7A5B0B]" />,
      ambientDoodles: ['☕', '🥐', '✨', '🏰', '🍪'],
      cardBorder: 'border-[#FFE39A]',
      pillBg: 'bg-[#FFE39A]/60',
      mascotMood: 'welcoming',
    },
    soulmate: {
      bgGradient: 'from-[#FAF7FD] via-[#F3EDFB] to-[#E9DCF8]',
      accentColor: '#A882ED',
      title: 'Soulmate Mode',
      vibe: 'Starlight Sanctuary • Gentle Emotional Presence & Tender Comfort (18+)',
      icon: <Heart className="w-4 h-4 text-[#8A63D2]" />,
      ambientDoodles: ['🌙', '⭐', '🕯️', '💜', '🌌'],
      cardBorder: 'border-[#C9B8F2]',
      pillBg: 'bg-[#C9B8F2]/40',
      mascotMood: 'peaceful',
    },
    guide: {
      bgGradient: 'from-[#F0F7FF] via-[#E6F0FA] to-[#D9EAF8]',
      accentColor: '#3B82F6',
      title: 'Guide Mode',
      vibe: 'Mentorship & Problem Solving • Code, Math, Sciences, Academics & Decisions',
      icon: <Compass className="w-4 h-4 text-[#2563EB]" />,
      ambientDoodles: ['🧭', '💡', '📐', '💻', '📚'],
      cardBorder: 'border-[#A9D8F5]',
      pillBg: 'bg-[#A9D8F5]/40',
      mascotMood: 'thinking',
    },
    tutor: {
      bgGradient: 'from-[#F0F7FF] via-[#E6F0FA] to-[#D9EAF8]',
      accentColor: '#3B82F6',
      title: 'Guide Mode',
      vibe: 'Mentorship & Problem Solving • Code, Math, Sciences, Academics & Decisions',
      icon: <Compass className="w-4 h-4 text-[#2563EB]" />,
      ambientDoodles: ['🧭', '💡', '📐', '💻', '📚'],
      cardBorder: 'border-[#A9D8F5]',
      pillBg: 'bg-[#A9D8F5]/40',
      mascotMood: 'thinking',
    },
  };

  const activeModeKey = companionMode === 'tutor' ? 'guide' : companionMode;
  const currentEnv = envStyles[activeModeKey] || envStyles.friend;
  const currentConvs = conversations[companionMode] || [];
  const currentActiveConvId = activeConversationId[companionMode];

  return (
    <div
      className={`flex-1 flex flex-col h-[calc(100vh-65px)] bg-gradient-to-b ${currentEnv.bgGradient} transition-colors duration-700 relative overflow-hidden text-[#292B42]`}
    >
      {/* Background Floating Doodles */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden opacity-25">
        <div className="absolute top-12 left-16 text-3xl animate-float-slow">{currentEnv.ambientDoodles[0]}</div>
        <div className="absolute top-1/3 right-14 text-3xl animate-drift">{currentEnv.ambientDoodles[1]}</div>
        <div className="absolute bottom-24 left-1/4 text-2xl animate-pulse-glow">{currentEnv.ambientDoodles[2]}</div>
        <div className="absolute top-2/3 right-1/3 text-3xl animate-float-slow">{currentEnv.ambientDoodles[3]}</div>
      </div>

      {/* CHAT HEADER */}
      <div className="bg-white/95 backdrop-blur-md border-b-2 border-[#FFE39A] p-3 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SpashtaMascot size="sm" mood={isAiTyping ? 'thinking' : currentEnv.mascotMood} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-sm sm:text-base text-[#292B42]">SPASHTA</h2>
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm border ${currentEnv.cardBorder} ${currentEnv.pillBg} text-[#292B42]`}
              >
                {currentEnv.icon}
                <span>{currentEnv.title}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#525672] hidden sm:block font-medium">{currentEnv.vibe}</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Three-Mode Selection Tabs */}
          <div className="flex items-center bg-[#FFF0D9] p-1 rounded-2xl border-2 border-[#FFE39A] shadow-inner gap-1">
            <button
              onClick={() => setCompanionMode('friend')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                activeModeKey === 'friend'
                  ? 'bg-white text-[#292B42] shadow-sm border border-[#FFE39A]'
                  : 'text-[#525672] hover:text-[#292B42]'
              }`}
              title="Friend Mode: Casual café banter, humor, English/Tamil/Tanglish"
            >
              <span>☕</span>
              <span className="hidden sm:inline">Friend</span>
            </button>

            <button
              onClick={() => {
                if (isMinor) {
                  alert('Soulmate Mode is strictly reserved for adults 18+. As a minor, your safety comes first.');
                  return;
                }
                setCompanionMode('soulmate');
              }}
              disabled={isMinor}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                activeModeKey === 'soulmate'
                  ? 'bg-white text-[#292B42] shadow-sm border border-[#C9B8F2]'
                  : isMinor
                  ? 'opacity-40 cursor-not-allowed text-gray-400'
                  : 'text-[#525672] hover:text-[#292B42]'
              }`}
              title={isMinor ? 'Soulmate Mode (18+ Only)' : 'Soulmate Mode: Deep empathy and comfort'}
            >
              {isMinor ? <Lock className="w-3 h-3 text-gray-400" /> : <span>💜</span>}
              <span className="hidden sm:inline">Soulmate</span>
              {isMinor && <span className="text-[9px] text-gray-400 uppercase font-mono">18+</span>}
            </button>

            <button
              onClick={() => setCompanionMode('guide')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                activeModeKey === 'guide'
                  ? 'bg-white text-[#292B42] shadow-sm border border-[#A9D8F5]'
                  : 'text-[#525672] hover:text-[#292B42]'
              }`}
              title="Guide Mode: Mentorship, code, math, sciences, and structured problem-solving"
            >
              <span>🧭</span>
              <span className="hidden sm:inline">Guide</span>
            </button>
          </div>

          {/* Quick New Topic Button */}
          <button
            onClick={async () => {
              await createConversation(companionMode);
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white hover:bg-[#FFFDF9] text-xs font-black text-[#292B42] border-2 border-[#FFE39A] shadow-sm transition hover:scale-102 cursor-pointer"
            title="Start a fresh topic in this mode"
          >
            <Plus className="w-3.5 h-3.5 text-[#F5C754] stroke-[3]" />
            <span>New Topic</span>
          </button>

          {/* Companion Memory Button */}
          <button
            onClick={() => setShowMemoryDrawer((prev) => !prev)}
            className={`p-2 rounded-2xl border-2 transition shadow-sm cursor-pointer flex items-center gap-1 ${
              showMemoryDrawer
                ? 'bg-[#FFE39A] border-[#F5C754] text-[#292B42]'
                : 'bg-white hover:bg-[#FFF9EE] text-[#525672] hover:text-[#292B42] border-[#FFE39A]'
            }`}
            title="Companion Memory & Consented Preferences"
          >
            <Brain className="w-4 h-4 text-[#7A5B0B]" />
            {rememberedContext.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F5C754]" />
            )}
          </button>

          {/* Conversation Switcher Drawer Button */}
          <button
            onClick={() => setShowConvDrawer((prev) => !prev)}
            className="p-2 rounded-2xl bg-white hover:bg-[#FFF9EE] text-[#525672] hover:text-[#292B42] transition border-2 border-[#FFE39A] shadow-sm cursor-pointer flex items-center gap-1"
            title="Conversation History"
          >
            <MessageSquare className="w-4 h-4 text-[#7A5B0B]" />
            <ChevronDown className="w-3 h-3 text-[#7A5B0B]" />
          </button>

          {/* Active House Progress */}
          {currentHouse && (
            <button
              onClick={() => navigateTo('construction')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border-2 border-[#FFE39A] text-xs font-black text-[#292B42] shadow-sm hover:scale-105 transition cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-[#F5C754]" />
              <span>{currentHouse.percentage}% Built</span>
            </button>
          )}

          {/* Clear Current Chat */}
          <button
            onClick={() => {
              if (window.confirm('Clear messages in this conversation?')) {
                clearChat();
              }
            }}
            className="p-2 rounded-2xl bg-white hover:bg-rose-50 text-[#525672] hover:text-rose-600 transition border-2 border-[#E8E2D5] cursor-pointer shadow-sm"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMPANION MEMORY DRAWER MODAL */}
      {showMemoryDrawer && (
        <div className="absolute top-16 right-4 sm:right-16 w-88 max-w-[92vw] bg-white border-2 border-[#FFE39A] rounded-3xl p-5 shadow-2xl z-30 animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FFE39A]">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#7A5B0B]">
              <Brain className="w-4 h-4 text-[#F5C754]" />
              <span>Companion Memory</span>
            </div>
            <button
              onClick={() => setShowMemoryDrawer(false)}
              className="p-1 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[#525672] leading-relaxed">
            Spashta remembers only consented context you choose to share (e.g. goals, preferences, studies). You can view, add, or delete memories anytime.
          </p>

          {/* Add Memory Input */}
          <form onSubmit={handleAddMemory} className="flex items-center gap-2">
            <input
              type="text"
              value={newMemoryFact}
              onChange={(e) => setNewMemoryFact(e.target.value)}
              placeholder="e.g. Preparing for GATE, likes Python"
              className="flex-1 px-3 py-1.5 rounded-xl border-2 border-[#FFE39A] text-xs font-medium focus:outline-none focus:border-[#F5C754] bg-[#FFFDF9]"
            />
            <button
              type="submit"
              disabled={!newMemoryFact.trim()}
              className="px-3 py-1.5 bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] font-black text-xs rounded-xl shadow-sm hover:scale-105 disabled:opacity-40 transition cursor-pointer shrink-0 border border-[#F5C754]"
            >
              Add
            </button>
          </form>

          {/* Memory List */}
          <div className="max-h-52 overflow-y-auto space-y-2">
            {rememberedContext.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#525672] italic bg-[#FFF9EE] rounded-2xl p-3 border border-dashed border-[#FFE39A]">
                No remembered context stored yet. Add helpful notes so Spashta knows your goals and preferences!
              </div>
            ) : (
              rememberedContext.map((fact, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-[#FFFDF9] border border-[#FFE39A] text-xs text-[#292B42]"
                >
                  <span className="flex-1 leading-snug">{fact}</span>
                  <button
                    onClick={() => removeRememberedFact(idx)}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer shrink-0"
                    title="Remove this memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {rememberedContext.length > 0 && (
            <div className="pt-2 border-t border-[#FFE39A] flex justify-end">
              <button
                onClick={() => {
                  if (window.confirm('Clear all stored companion memories?')) {
                    clearRememberedContext();
                  }
                }}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
              >
                Clear all memories
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONVERSATION HISTORY DRAWER MODAL */}
      {showConvDrawer && (
        <div className="absolute top-16 right-4 w-80 max-w-[90vw] bg-white border-2 border-[#FFE39A] rounded-3xl p-4 shadow-2xl z-30 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#FFE39A]">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-[#7A5B0B]">
              <MessageSquare className="w-4 h-4 text-[#F5C754]" />
              <span>{currentEnv.title} History</span>
            </div>
            <button
              onClick={() => setShowConvDrawer(false)}
              className="p-1 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={async () => {
              await createConversation(companionMode);
              setShowConvDrawer(false);
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:scale-102 transition cursor-pointer border border-[#F5C754]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Conversation</span>
          </button>

          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {currentConvs.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#525672] italic">No saved conversations yet.</div>
            ) : (
              currentConvs.map((conv) => {
                const isActive = conv.id === currentActiveConvId;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-[#FFF0D9] border-2 border-[#F5C754] font-black text-[#292B42]'
                        : 'hover:bg-[#FFFDF9] border border-[#FFE39A] text-[#525672]'
                    }`}
                  >
                    <div
                      onClick={() => {
                        switchConversation(conv.id);
                        setShowConvDrawer(false);
                      }}
                      className="flex-1 truncate mr-2"
                    >
                      <div className="truncate">{conv.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${conv.title}"?`)) {
                          deleteConversation(conv.id);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {chatError && (
        <div className="bg-rose-50 border-b-2 border-rose-300 px-4 py-2 text-xs text-rose-900 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{chatError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={retryLastMessage}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button onClick={clearChatError} className="p-1 text-rose-700 hover:text-rose-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-4xl mx-auto w-full z-10">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group animate-fadeIn`}
            >
              <div
                className={`flex items-end gap-2.5 max-w-[90%] sm:max-w-[82%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {!isUser && (
                  <div className="shrink-0 mb-1">
                    <SpashtaMascot size="sm" mood={isAiTyping ? 'thinking' : currentEnv.mascotMood} />
                  </div>
                )}

                <div
                  className={`rounded-3xl p-4 sm:p-5 relative transition-all duration-200 ${
                    msg.error
                      ? 'bg-rose-50 text-rose-950 border-2 border-rose-300 rounded-bl-xs shadow-sm'
                      : isUser
                      ? 'bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] rounded-br-xs shadow-md border-2 border-[#F5C754]'
                      : 'bg-white text-[#292B42] rounded-bl-xs border-2 border-[#FFE39A] shadow-sm'
                  }`}
                >
                  {/* Sender header & Copy button */}
                  <div className="flex items-center justify-between gap-3 text-[11px] mb-2 opacity-80 font-bold">
                    <span>{isUser ? 'You' : 'Spashy'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-75 font-mono">{time}</span>
                      <button
                        type="button"
                        onClick={() => copyMessage(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-black/5 rounded-md cursor-pointer"
                        title="Copy message"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Message Content with Markdown & Code formatting */}
                  <div className="text-sm sm:text-base leading-relaxed">
                    <FormattedMessage text={msg.text} />
                  </div>

                  {/* Clarity Brick Awarded Badge */}
                  {msg.brickAwarded && (
                    <div className="mt-3 pt-2.5 border-t border-[#FFE39A] flex items-center justify-between text-xs font-black text-[#7A5B0B] bg-[#FFF0D9]/90 p-2.5 rounded-2xl shadow-inner">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#F5C754]" />
                        <span>+1 Clarity Brick Earned!</span>
                      </span>
                      <button
                        onClick={() => navigateTo('construction')}
                        className="underline text-[11px] hover:text-[#292B42] cursor-pointer"
                      >
                        View sanctuary →
                      </button>
                    </div>
                  )}

                  {/* Retry button for error message */}
                  {msg.error && (
                    <button
                      onClick={retryLastMessage}
                      className="mt-3 px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry sending</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery Receipt */}
              {isUser && (
                <div className="flex items-center gap-1 mt-1 px-2 text-[10px] text-emerald-700 font-bold">
                  <CheckCheck className="w-3 h-3" />
                  <span>Sent</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Mascot Reflecting / Typing Indicator */}
        {isAiTyping && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="shrink-0">
              <SpashtaMascot size="sm" mood="thinking" />
            </div>
            <div className="bg-white border-2 border-[#FFE39A] rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F5C754] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#F5C754] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#F5C754] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-[#7A5B0B] font-bold ml-1.5">
                {activeModeKey === 'guide'
                  ? 'Spashy is analyzing and formulating step-by-step guidance...'
                  : activeModeKey === 'soulmate'
                  ? 'Spashy is holding space and listening...'
                  : 'Spashy is brewing a reply...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CHAT COMPOSER DOCK */}
      <div className="p-3 sm:p-5 bg-white/95 backdrop-blur-xl border-t-2 border-[#FFE39A] shrink-0 z-20 shadow-lg">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-2 relative">
          <div className="flex-1 relative flex items-center bg-[#FFFDF9] border-2 border-[#FFE39A] focus-within:border-[#F5C754] focus-within:ring-2 focus-within:ring-[#FFE39A] rounded-2xl shadow-inner transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                activeModeKey === 'guide'
                  ? 'Ask any coding, math, science, academic, or decision question... (Enter to send)'
                  : activeModeKey === 'soulmate'
                  ? "Share whatever is weighing on your heart... (Enter to send)"
                  : "Say anything on your mind! (Tamil / English / Tanglish welcome)..."
              }
              className="w-full py-3 pl-4 pr-10 bg-transparent text-[#292B42] placeholder-[#8C90A8] text-sm font-medium focus:outline-none resize-none max-h-36 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isAiTyping}
            className="p-3.5 bg-gradient-to-r from-[#FFE39A] via-[#FFD770] to-[#F5C754] text-[#292B42] rounded-2xl font-black shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 transition flex items-center justify-center cursor-pointer border border-[#F5C754] shrink-0"
            title="Send Message"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-[#8C90A8]">
            Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for a new line • Mode: <strong>{currentEnv.title}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
