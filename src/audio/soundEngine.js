// Pure Human Audio Engine: plays real recordings and handles sleep timer (zero synth, zero fake sounds)

class ASMRSoundEngine {
  constructor() {
    this.currentAudioElement = null;
    this.isMuted = false;
    this.activeTrackId = null;
    this.sleepTimerInterval = null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentAudioElement) {
      this.currentAudioElement.muted = this.isMuted;
    }
    return this.isMuted;
  }

  // Play a REAL human-recorded vocal
  playTrack(track, onProgress, onEnd) {
    this.stopTrack();

    const trackId = typeof track === 'object' ? track.id : track;
    const audioUrl = typeof track === 'object' ? track.audioUrl : null;

    if (!audioUrl) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      audio.muted = this.isMuted;
      audio.preload = "auto";
      this.currentAudioElement = audio;
      this.activeTrackId = trackId;

      audio.addEventListener('timeupdate', () => {
        if (onProgress && audio.duration) {
          onProgress(audio.currentTime, audio.duration);
        }
      });

      audio.addEventListener('ended', () => {
        this.currentAudioElement = null;
        this.activeTrackId = null;
        if (onEnd) onEnd();
      });

      audio.addEventListener('error', (e) => {
        console.warn("Audio playback error:", e);
        this.currentAudioElement = null;
        this.activeTrackId = null;
        if (onEnd) onEnd();
      });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Autoplay blocked or playback error:", err);
        });
      }
    } catch (err) {
      console.warn("Audio element initialization error:", err);
      if (onEnd) onEnd();
    }
  }

  stopTrack() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    this.activeTrackId = null;
  }

  // Sleep Timer for real audio
  startSleepTimer(minutes, onTick, onComplete) {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
    }
    let totalSeconds = minutes * 60;
    let remaining = totalSeconds;

    this.sleepTimerInterval = setInterval(() => {
      remaining--;
      if (onTick) onTick(remaining);

      // Smooth volume fade out on last 60 seconds of real audio
      if (remaining <= 60 && this.currentAudioElement && !this.isMuted) {
        const ratio = Math.max(0, remaining / 60);
        this.currentAudioElement.volume = ratio;
      }

      if (remaining <= 0) {
        clearInterval(this.sleepTimerInterval);
        this.stopTrack();
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  cancelSleepTimer() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
      if (this.currentAudioElement && !this.isMuted) {
        this.currentAudioElement.volume = 1;
      }
    }
  }
}

export const soundEngine = new ASMRSoundEngine();
