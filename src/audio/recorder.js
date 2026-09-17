// Cross-platform Audio Recorder for real human microphone recordings (iOS, Safari, Android, Chrome)

export class RealAudioRecorder {
  constructor() {
    this.stream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.isRecording = false;
    this.mimeType = '';
  }

  // Get optimal supported audio MIME type across all mobile and desktop browsers
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return ''; // fallback to browser default
  }

  async start(onAudioData) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("L'accès au microphone n'est pas supporté par ce navigateur.");
    }

    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    // Audio context for real-time visualizer
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source.connect(this.analyser);
    } catch (e) {
      console.warn("Analyser init:", e);
    }

    this.mimeType = this.getSupportedMimeType();
    const options = this.mimeType ? { mimeType: this.mimeType } : {};

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(200); // 200ms slices for reliable recording
    this.isRecording = true;
  }

  getFrequencyData() {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const type = this.mimeType || (this.audioChunks[0] ? this.audioChunks[0].type : 'audio/webm');
          const audioBlob = new Blob(this.audioChunks, { type: type || 'audio/webm' });
          const blobUrl = URL.createObjectURL(audioBlob);

          // Convert to Base64 for persistent storage
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = reader.result;

            // Stop all hardware tracks
            if (this.stream) {
              this.stream.getTracks().forEach(track => track.stop());
            }
            if (this.audioContext && this.audioContext.state !== 'closed') {
              try { this.audioContext.close(); } catch(e){}
            }

            this.isRecording = false;
            resolve({
              blob: audioBlob,
              blobUrl: blobUrl,
              base64: base64Data,
              mimeType: type
            });
          };
          reader.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch(e){}
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch(e){}
    }
    this.isRecording = false;
  }
}
