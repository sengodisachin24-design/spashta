/**
 * Web Audio API based ambient sound generator & Spotify Connect helper.
 * 100% client-safe, zero external asset dependencies, zero unexpected autoplay.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentMode: 'cafe' | 'rain' | 'forest' | 'chimes' | 'none' = 'none';
  private isPlaying = false;
  private nodes: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, val));
      this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.1);
    }
  }

  public playAmbient(type: 'cafe' | 'rain' | 'forest' | 'chimes') {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentMode = type;
    this.isPlaying = true;

    if (type === 'rain') {
      this.startRainSound();
    } else if (type === 'chimes') {
      this.startChimesSound();
    } else if (type === 'forest') {
      this.startForestSound();
    } else if (type === 'cafe') {
      this.startCafeSound();
    }
  }

  public stopAmbient() {
    this.isPlaying = false;
    this.currentMode = 'none';

    // Stop and disconnect nodes
    this.nodes.forEach(n => {
      if (typeof n === 'number') {
        clearInterval(n);
      } else {
        try {
          (n as any).stop?.();
          n.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.nodes = [];
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentType() {
    return this.currentMode;
  }

  // --- Rain simulation ---
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    noise.start();
    this.nodes.push(noise, filter, rainGain);
  }

  // --- Chimes simulation ---
  private startChimesSound() {
    if (!this.ctx || !this.masterGain) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // Pentatonic C Major

    // Gentle drone
    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3
    droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    drone.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();
    this.nodes.push(drone, droneGain);

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    }, 1800);

    this.nodes.push(interval);
  }

  // --- Forest night sounds ---
  private startForestSound() {
    if (!this.ctx || !this.masterGain) return;

    // Wind filter
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const wind = this.ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    wind.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);
    wind.start();
    this.nodes.push(wind, filter, windGain);

    // Occasional cricket chirp
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const cricket = this.ctx.createOscillator();
      const cricketGain = this.ctx.createGain();
      cricket.type = 'triangle';
      cricket.frequency.setValueAtTime(4500, this.ctx.currentTime);
      cricketGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      cricketGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

      cricket.connect(cricketGain);
      cricketGain.connect(this.masterGain);
      cricket.start();
      cricket.stop(this.ctx.currentTime + 0.22);
    }, 2400);

    this.nodes.push(interval);
  }

  // --- Cozy cafe ambience ---
  private startCafeSound() {
    if (!this.ctx || !this.masterGain) return;

    // Low gentle warmth
    const hum = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    hum.type = 'triangle';
    hum.frequency.setValueAtTime(90, this.ctx.currentTime);
    humGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    hum.connect(humGain);
    humGain.connect(this.masterGain);
    hum.start();
    this.nodes.push(hum, humGain);

    // Warm rhodes-like soft chime chord every few seconds
    const chords = [
      [261.63, 329.63, 392.0], // C
      [220.0, 261.63, 329.63], // Am
      [174.61, 220.0, 261.63], // F
      [196.0, 246.94, 293.66], // G
    ];

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const chord = chords[Math.floor(Math.random() * chords.length)];
      chord.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        gain.gain.setValueAtTime(0, this.ctx!.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, this.ctx!.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 3.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx!.currentTime + 3.3);
      });
    }, 4000);

    this.nodes.push(interval);
  }
}

export const soundEngine = new SoundEngine();

/**
 * Play celebration chimes when a Clarity Brick is earned or House is completed
 */
export const playBrickEarnedSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.85);
    });
  } catch (err) {
    // Audio context may require user interaction
  }
};
