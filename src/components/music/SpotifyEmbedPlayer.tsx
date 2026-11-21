import React, { useState } from 'react';
import { Music, Play, Check, ExternalLink, Disc3, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SPOTIFY_PRESETS = [
  {
    id: '37i9dQZF1DX8CwbKo0ScvJ',
    name: '🏰 Disney Piano Peace & Fairytale Classics',
    desc: 'Gentle piano arrangements of beloved fairytale melodies.',
    tag: 'All Modes',
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    name: '☕ Disney Lo-Fi & Café Chill',
    desc: 'Relaxing beats and cozy fairytale vibes for Friend Mode.',
    tag: 'Friend Mode',
  },
  {
    id: '37i9dQZF1DX6tTW0xDxScH',
    name: '🌙 Starlight Fairytale Twilight Melodies',
    desc: 'Ethereal strings and comforting nighttime harmonies.',
    tag: 'Soulmate Mode',
  },
  {
    id: '37i9dQZF1DX1s9knjP51Oa',
    name: '🧭 Enchanted Study & Castle Focus',
    desc: 'Atmospheric medieval lute, harp, and peaceful study orchestral.',
    tag: 'Guide Mode',
  },
];

export const SpotifyEmbedPlayer: React.FC = () => {
  const { spotifyUri, setSpotifyUri } = useApp();
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');

  // Extract ID if user pastes full Spotify link or spotify:playlist:xxx
  const handleLoadCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    if (!customInput.trim()) return;

    let id = customInput.trim();
    // match open.spotify.com/playlist/XXXX or /album/XXXX or /track/XXXX
    const match = id.match(/(?:playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      id = match[1];
    } else if (id.includes(':')) {
      const parts = id.split(':');
      id = parts[parts.length - 1];
    }

    if (id.length < 10) {
      setCustomError('Please enter a valid Spotify playlist, track, or album link.');
      return;
    }

    setSpotifyUri(id);
    setCustomInput('');
  };

  return (
    <div className="space-y-4 text-[#292B42]">
      {/* Real Embedded Playable Spotify Player */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#FFE39A] shadow-lg bg-white">
        <iframe
          src={`https://open.spotify.com/embed/playlist/${spotifyUri}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Music & Ambience Player"
          className="w-full rounded-2xl"
        />
      </div>

      {/* Preset Fairytale Playlists */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-[#7A5B0B] mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C754]" />
          <span>Fairytale Spotify Soundtracks:</span>
        </label>
        <div className="space-y-1.5">
          {SPOTIFY_PRESETS.map(preset => {
            const isPlaying = spotifyUri === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSpotifyUri(preset.id)}
                className={`w-full text-left p-3 rounded-2xl text-xs flex items-center justify-between border-2 transition cursor-pointer ${
                  isPlaying
                    ? 'bg-[#FFE39A]/40 border-[#FFE39A] text-[#292B42] font-black shadow-sm ring-1 ring-[#FFE39A]'
                    : 'bg-white hover:bg-[#FFFDF9] border-[#E8E2D5] text-[#292B42]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#292B42]">{preset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF0D9] text-[#7A5B0B] font-bold border border-[#FFE39A]">
                      {preset.tag}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#525672] mt-0.5">{preset.desc}</div>
                </div>
                {isPlaying && (
                  <span className="text-[10px] font-black text-[#966E0C] shrink-0 ml-2 flex items-center gap-1 bg-[#FFE39A] px-2 py-0.5 rounded-full">
                    <Disc3 className="w-3.5 h-3.5 animate-spin text-[#966E0C]" />
                    Playing
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Spotify Link loader */}
      <form onSubmit={handleLoadCustom} className="pt-3 border-t border-[#FFE39A]">
        <label className="block text-xs font-bold text-[#292B42] mb-1">
          Play Any Spotify Link (Playlist, Album, Track):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste Spotify link (e.g. open.spotify.com/playlist/...)"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-white border-2 border-[#FFE39A] rounded-xl text-xs text-[#292B42] placeholder-[#8C90A8] focus:outline-none focus:ring-2 focus:ring-[#FFE39A]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-[#FFE39A] to-[#F5C754] text-[#292B42] font-black text-xs rounded-xl shadow-md hover:scale-105 transition shrink-0 cursor-pointer"
          >
            Load
          </button>
        </div>
        {customError && <p className="text-xs text-rose-600 mt-1 font-semibold">{customError}</p>}
      </form>
    </div>
  );
};
