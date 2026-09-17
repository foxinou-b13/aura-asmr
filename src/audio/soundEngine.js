// Web Audio API engine for real-time ASMR synthesis & audio effects

class ASMRSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.soundEffectsEnabled = true;
    this.ambientNodes = {};
    this.activeTracks = {};
    this.currentAudioElement = null;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.muted = this.isMuted;
    }
    return this.isMuted;
  }

  toggleSoundEffects() {
    this.soundEffectsEnabled = !this.soundEffectsEnabled;
    return this.soundEffectsEnabled;
  }

  // Play short tactile UI sound
  playUiSound(type = 'click') {
    if (!this.soundEffectsEnabled || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.045);
      } else if (type === 'tap') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.06);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.065);
      } else if (type === 'tingle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.22);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, t);
        osc.frequency.exponentialRampToValueAtTime(650, t + 0.05);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.085);
      }
    } catch (e) {
      console.warn("UI sound error:", e);
    }
  }

  // Create White/Pink Noise Buffer
  createNoiseBuffer(type = 'pink', duration = 5) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    if (type === 'pink') {
      let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
      let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b3L = 0.86650 * b3L + whiteL * 0.3104856;
        b4L = 0.55000 * b4L + whiteL * 0.5329522;
        b5L = -0.7616 * b5L - whiteL * 0.0168980;
        left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.08;
        b6L = whiteL * 0.115926;

        const whiteR = Math.random() * 2 - 1;
        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        b3R = 0.86650 * b3R + whiteR * 0.3104856;
        b4R = 0.55000 * b4R + whiteR * 0.5329522;
        b5R = -0.7616 * b5R - whiteR * 0.0168980;
        right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.08;
        b6R = whiteR * 0.115926;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        left[i] = (Math.random() * 2 - 1) * 0.08;
        right[i] = (Math.random() * 2 - 1) * 0.08;
      }
    }
    return buffer;
  }

  // 3D Soundboard Channels Real-Time Synthesis
  setAmbientChannel(id, volume, pan = 0) {
    this.ensureContext();
    if (!this.ctx) return;

    if (volume <= 0.01) {
      if (this.ambientNodes[id]) {
        this.stopAmbientChannel(id);
      }
      return;
    }

    if (!this.ambientNodes[id]) {
      this.startAmbientChannel(id);
    }

    if (this.ambientNodes[id]) {
      const { gainNode, pannerNode } = this.ambientNodes[id];
      const t = this.ctx.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, t + 0.1);
      if (pannerNode && pannerNode.pan) {
        pannerNode.pan.setValueAtTime(pan, t);
      }
    }
  }

  startAmbientChannel(id) {
    if (!this.ctx || this.ambientNodes[id]) return;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);

    let pannerNode = null;
    if (this.ctx.createStereoPanner) {
      pannerNode = this.ctx.createStereoPanner();
      pannerNode.connect(this.masterGain);
      gainNode.connect(pannerNode);
    } else {
      gainNode.connect(this.masterGain);
    }

    const channelData = { gainNode, pannerNode, sources: [], interval: null };

    if (id === 'rain') {
      const noiseBuffer = this.createNoiseBuffer('pink', 6);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      channelData.sources.push(noiseSource);

      const dropletInterval = setInterval(() => {
        if (!this.ctx || !this.ambientNodes['rain']) return;
        if (Math.random() > 0.4) {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const dropGain = this.ctx.createGain();
          osc.type = 'sine';
          const freq = 1600 + Math.random() * 2200;
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.03);
          dropGain.gain.setValueAtTime(0.03, t);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
          osc.connect(dropGain);
          dropGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.04);
        }
      }, 90);
      channelData.interval = dropletInterval;

    } else if (id === 'waves') {
      const noiseBuffer = this.createNoiseBuffer('pink', 10);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      channelData.sources.push(noiseSource, lfo);

    } else if (id === 'tapping') {
      const tapInterval = setInterval(() => {
        if (!this.ctx || !this.ambientNodes['tapping']) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const tapGain = this.ctx.createGain();
        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

        osc.type = 'triangle';
        const baseFreq = 220 + Math.random() * 380;
        osc.frequency.setValueAtTime(baseFreq * 2.5, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.04);

        tapGain.gain.setValueAtTime(0.18 + Math.random() * 0.1, t);
        tapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        if (panner) {
          panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.85, t);
          osc.connect(tapGain);
          tapGain.connect(panner);
          panner.connect(gainNode);
        } else {
          osc.connect(tapGain);
          tapGain.connect(gainNode);
        }

        osc.start(t);
        osc.stop(t + 0.05);
      }, 260);
      channelData.interval = tapInterval;

    } else if (id === 'fire') {
      const noiseBuffer = this.createNoiseBuffer('pink', 6);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
      noiseSource.connect(lowFilter);
      lowFilter.connect(gainNode);
      noiseSource.start();
      channelData.sources.push(noiseSource);

      const crackleInterval = setInterval(() => {
        if (!this.ctx || !this.ambientNodes['fire']) return;
        if (Math.random() > 0.45) {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const cGain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1800 + Math.random() * 3000, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.015);
          cGain.gain.setValueAtTime(0.08, t);
          cGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
          osc.connect(cGain);
          cGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.025);
        }
      }, 120);
      channelData.interval = crackleInterval;

    } else if (id === 'whisper') {
      const noiseBuffer = this.createNoiseBuffer('pink', 8);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const breathLfo = this.ctx.createOscillator();
      const breathGain = this.ctx.createGain();
      breathLfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
      breathGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      breathLfo.connect(breathGain.gain);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      breathLfo.start();
      channelData.sources.push(noiseSource, breathLfo);

    } else if (id === 'bowl') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const bowlGain = this.ctx.createGain();

      osc1.frequency.setValueAtTime(432, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(864.5, this.ctx.currentTime);
      osc3.frequency.setValueAtTime(1296.2, this.ctx.currentTime);

      const bLfo = this.ctx.createOscillator();
      const bLfoG = this.ctx.createGain();
      bLfo.frequency.setValueAtTime(0.5, this.ctx.currentTime);
      bLfoG.gain.setValueAtTime(0.15, this.ctx.currentTime);
      bLfo.connect(bLfoG);
      bLfoG.connect(bowlGain.gain);
      bLfo.start();

      osc1.connect(bowlGain);
      osc2.connect(bowlGain);
      osc3.connect(bowlGain);
      bowlGain.connect(gainNode);

      osc1.start();
      osc2.start();
      osc3.start();
      channelData.sources.push(osc1, osc2, osc3, bLfo);
    }

    this.ambientNodes[id] = channelData;
  }

  stopAmbientChannel(id) {
    if (!this.ambientNodes[id]) return;
    const { sources, interval, gainNode } = this.ambientNodes[id];
    if (interval) clearInterval(interval);
    if (this.ctx && gainNode) {
      const t = this.ctx.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.linearRampToValueAtTime(0.0001, t + 0.1);
      setTimeout(() => {
        sources.forEach(s => {
          try { s.stop(); s.disconnect(); } catch (e) {}
        });
      }, 120);
    }
    delete this.ambientNodes[id];
  }

  stopAllAmbient() {
    Object.keys(this.ambientNodes).forEach(id => {
      this.stopAmbientChannel(id);
    });
  }

  // Play Real Audio Track or Fallback to Procedural Synthesis
  playTrack(track, onProgress, onEnd) {
    this.ensureContext();
    this.stopTrack();

    const trackId = typeof track === 'object' ? track.id : track;
    const audioUrl = typeof track === 'object' ? track.audioUrl : null;

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.muted = this.isMuted;
        this.currentAudioElement = audio;

        audio.addEventListener('timeupdate', () => {
          if (onProgress && audio.duration) {
            onProgress(audio.currentTime, audio.duration);
          }
        });

        audio.addEventListener('ended', () => {
          this.currentAudioElement = null;
          if (onEnd) onEnd();
        });

        audio.addEventListener('error', (e) => {
          console.warn("Real audio fallback to synthesized:", e);
          this.playSynthesizedTrack(trackId, onProgress, onEnd);
        });

        audio.play().catch(err => {
          console.warn("Audio play prevented, fallback to synth:", err);
          this.playSynthesizedTrack(trackId, onProgress, onEnd);
        });

        this.activeTracks[trackId] = {
          audioElement: audio,
          stop: () => {
            audio.pause();
            audio.currentTime = 0;
            this.currentAudioElement = null;
          }
        };
        return;
      } catch (err) {
        console.warn("Audio element failed, falling back to synth:", err);
      }
    }

    this.playSynthesizedTrack(trackId, onProgress, onEnd);
  }

  playSynthesizedTrack(trackId, onProgress, onEnd) {
    if (!this.ctx) return;

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    trackGain.connect(this.masterGain);

    let duration = 30;
    let startTime = this.ctx.currentTime;
    const sources = [];
    let isPlaying = true;

    const noiseBuffer = this.createNoiseBuffer('pink', 10);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(trackGain);
    noise.start();
    sources.push(noise);

    const triggerInterval = setInterval(() => {
      if (!isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      const freqs = [520, 840, 1100, 1450, 1920, 2400];
      const f = freqs[Math.floor(Math.random() * freqs.length)];
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.08);

      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      if (pan) {
        pan.pan.setValueAtTime(Math.sin(t * 1.5), t);
        osc.connect(g);
        g.connect(pan);
        pan.connect(trackGain);
      } else {
        osc.connect(g);
        g.connect(trackGain);
      }

      osc.start(t);
      osc.stop(t + 0.1);
    }, 280);

    const progressTimer = setInterval(() => {
      if (!this.ctx) return;
      const elapsed = this.ctx.currentTime - startTime;
      if (onProgress) onProgress(elapsed, duration);
      if (elapsed >= duration) {
        this.stopTrack();
        if (onEnd) onEnd();
      }
    }, 100);

    this.activeTracks[trackId] = {
      sources,
      gainNode: trackGain,
      interval: triggerInterval,
      progressTimer,
      stop: () => {
        isPlaying = false;
        clearInterval(triggerInterval);
        clearInterval(progressTimer);
        sources.forEach(s => {
          try { s.stop(); s.disconnect(); } catch (e) {}
        });
      }
    };
  }

  stopTrack() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    Object.keys(this.activeTracks).forEach(id => {
      if (this.activeTracks[id] && this.activeTracks[id].stop) {
        this.activeTracks[id].stop();
      }
      delete this.activeTracks[id];
    });
  }

  // Sleep Timer
  startSleepTimer(minutes, onTick, onComplete) {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
    }
    let totalSeconds = minutes * 60;
    let remaining = totalSeconds;

    this.sleepTimerInterval = setInterval(() => {
      remaining--;
      if (onTick) onTick(remaining);

      if (remaining <= 60 && this.masterGain && this.ctx) {
        const ratio = Math.max(0, remaining / 60);
        this.masterGain.gain.setValueAtTime(ratio * 0.8, this.ctx.currentTime);
      }

      if (remaining <= 0) {
        clearInterval(this.sleepTimerInterval);
        this.stopAllAmbient();
        this.stopTrack();
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  cancelSleepTimer() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
      if (this.masterGain && this.ctx && !this.isMuted) {
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      }
    }
  }
}

export const soundEngine = new ASMRSoundEngine();
